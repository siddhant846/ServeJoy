import { BusinessAccount, CafeProfile, SubscriptionDetails, SubscriptionTier, BillingCycle } from '../types';
import { storage, DEFAULT_BUSINESS_ACCOUNT, DEFAULT_MENU_ITEMS, createDefaultSubscription } from './storage';
import { subscriptionService, PLANS } from './subscriptionService';

export interface TenantSummary {
  account: BusinessAccount;
  profile: CafeProfile;
  subscription: SubscriptionDetails;
  subInfo: {
    isTrial: boolean;
    isExpired: boolean;
    daysRemaining: number;
    hoursRemaining: number;
    canBill: boolean;
  };
  billCount: number;
  totalGmv: number;
  staffCount: number;
  menuCount: number;
}

export interface PlatformStats {
  totalTenants: number;
  activeTenants: number;
  trialTenants: number;
  paidTenants: number;
  expiredTenants: number;
  totalBills: number;
  totalGmv: number;
  mrr: number;
  arr: number;
}

class AdminService {
  /**
   * Aggregate complete live summary of all registered cafes/tenants
   */
  getAllTenants(): TenantSummary[] {
    const businesses = storage.getAllBusinesses();

    return businesses.map((account) => {
      const profile = storage.getCafeProfile(account.id);
      const subscription = storage.getSubscription(account.id);
      const subInfo = subscriptionService.getSubscriptionInfo(account.id);
      const bills = storage.getBills(account.id);
      const staff = storage.getStaff(account.id);
      const menu = storage.getMenuItems(account.id);

      const totalGmv = bills.reduce((sum, b) => sum + (b.total || 0), 0);

      return {
        account,
        profile,
        subscription,
        subInfo,
        billCount: bills.length,
        totalGmv,
        staffCount: staff.length,
        menuCount: menu.length,
      };
    });
  }

  /**
   * Compute platform-wide SaaS financial and adoption KPIs
   */
  getPlatformStats(): PlatformStats {
    const tenants = this.getAllTenants();

    let trialCount = 0;
    let paidCount = 0;
    let expiredCount = 0;
    let totalBills = 0;
    let totalGmv = 0;
    let mrr = 0;

    tenants.forEach((t) => {
      totalBills += t.billCount;
      totalGmv += t.totalGmv;

      if (t.account.suspended) {
        // Suspended
      } else if (t.subInfo.isExpired) {
        expiredCount += 1;
      } else if (t.subInfo.isTrial) {
        trialCount += 1;
      } else {
        paidCount += 1;
        if (t.subscription.tier === 'pro') {
          mrr += t.subscription.billingCycle === 'annual' ? Math.round(4999 / 12) : 499;
        } else if (t.subscription.tier === 'business') {
          mrr += t.subscription.billingCycle === 'annual' ? Math.round(8999 / 12) : 999;
        }
      }
    });

    return {
      totalTenants: tenants.length,
      activeTenants: tenants.length - expiredCount,
      trialTenants: trialCount,
      paidTenants: paidCount,
      expiredTenants: expiredCount,
      totalBills,
      totalGmv,
      mrr,
      arr: mrr * 12,
    };
  }

  /**
   * Grant additional trial days to any tenant
   */
  extendTrial(businessId: string, extraDays = 7): SubscriptionDetails {
    const subscription = storage.getSubscription(businessId);
    const now = Date.now();
    const currentExpiry = new Date(subscription.trialExpiresAt).getTime();

    // Extend from current expiry if still in the future, or from today
    const baseTime = currentExpiry > now ? currentExpiry : now;
    const newExpiry = new Date(baseTime + extraDays * 24 * 60 * 60 * 1000).toISOString();

    subscription.trialExpiresAt = newExpiry;
    subscription.status = 'trial_active';
    storage.saveSubscription(subscription, businessId);

    // Sync account object
    const account = storage.getBusinessAccount(businessId);
    if (account) {
      account.subscription = subscription;
      storage.saveBusinessAccount(account);
    }

    return subscription;
  }

  /**
   * Manually upgrade or modify a tenant's plan
   */
  updatePlan(
    businessId: string,
    tier: SubscriptionTier,
    cycle: BillingCycle = 'monthly',
    referenceNote = 'Admin Manual Activation'
  ): SubscriptionDetails {
    const sub = subscriptionService.activatePlan(tier, cycle, referenceNote, businessId);
    const profile = storage.getCafeProfile(businessId);
    if (profile) {
      profile.subscriptionTier = tier;
      storage.saveCafeProfile(profile, businessId);
    }
    return sub;
  }

  /**
   * Toggle account suspension
   */
  toggleSuspension(businessId: string): boolean {
    const account = storage.getBusinessAccount(businessId);
    if (!account) return false;

    account.suspended = !account.suspended;
    storage.saveBusinessAccount(account);
    return account.suspended;
  }

  /**
   * Delete tenant account permanently
   */
  deleteTenant(businessId: string): void {
    storage.deleteBusinessAccount(businessId);
  }

  /**
   * Switch the active POS view to another tenant for troubleshooting
   */
  impersonateTenant(businessId: string): void {
    storage.setActiveBusinessId(businessId);
  }

  /**
   * Create a new tenant manually from the Super Admin Console
   */
  createTenant(params: {
    businessName: string;
    ownerName: string;
    email: string;
    phone?: string;
    tier?: SubscriptionTier;
    trialDays?: number;
  }): BusinessAccount {
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    const slug = params.businessName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .slice(0, 16);
    const businessId = `biz_${slug}_${randomSuffix}`;
    const cleanEmail = params.email.trim().toLowerCase();

    const tier = params.tier || 'starter';
    const trialDays = params.trialDays || 7;

    const sub = createDefaultSubscription(tier);
    if (tier === 'starter') {
      sub.trialExpiresAt = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toISOString();
    }

    const account: BusinessAccount = {
      id: businessId,
      ownerId: `owner_${Date.now()}`,
      ownerEmail: cleanEmail,
      ownerName: params.ownerName.trim(),
      businessName: params.businessName.trim(),
      createdAt: new Date().toISOString(),
      subscription: sub,
    };

    storage.saveBusinessAccount(account);
    storage.saveSubscription(sub, businessId);

    // Initial Cafe Profile
    storage.saveCafeProfile(
      {
        id: businessId,
        businessId,
        name: params.businessName.trim(),
        tagLine: 'Quality & Delight in Every Order',
        ownerName: params.ownerName.trim(),
        address: '',
        phone: params.phone || '',
        email: cleanEmail,
        upiId: '',
        currency: '₹',
        taxRate: 0,
        subscriptionTier: tier,
        logoUrl: '',
        invoiceNote: 'Thank you for your visit!',
      },
      businessId
    );

    // Seed default starter menu items
    storage.saveMenuItems(DEFAULT_MENU_ITEMS, businessId);

    return account;
  }

  /**
   * Full database export for backup
   */
  exportAllData(): string {
    const businesses = storage.getAllBusinesses();
    const payload = businesses.map((b) => ({
      business: b,
      profile: storage.getCafeProfile(b.id),
      subscription: storage.getSubscription(b.id),
      menu: storage.getMenuItems(b.id),
      bills: storage.getBills(b.id),
      staff: storage.getStaff(b.id),
    }));

    return JSON.stringify(payload, null, 2);
  }
}

export const adminService = new AdminService();

