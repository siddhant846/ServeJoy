import { SubscriptionDetails, SubscriptionStatus, SubscriptionTier, BillingCycle } from '../types';
import { storage } from './storage';

export interface PlanPricing {
  tier: SubscriptionTier;
  name: string;
  badge?: string;
  monthlyPrice: number;
  annualPrice: number;
  annualSavings: number;
  description: string;
  maxBills: string;
  maxDevices: string;
  features: string[];
  ctaLabel: string;
}

export const PLANS: Record<SubscriptionTier, PlanPricing> = {
  starter: {
    tier: 'starter',
    name: 'Starter Trial',
    badge: '7 Days Free Trial',
    monthlyPrice: 0,
    annualPrice: 0,
    annualSavings: 0,
    description: 'Perfect for testing ServeJoy at your counter before commercial launch.',
    maxBills: '100 bills / month',
    maxDevices: '1 Active Counter Terminal',
    features: [
      '7 Days Full Access Free Trial',
      'Maximum 100 bills per month',
      '1 active device (Counter POS)',
      'Basic Dynamic UPI QR & Thermal Printing',
      'English Voice Announcements',
      'Basic Billing & Category Management',
      'Community & Email Support',
    ],
    ctaLabel: 'Start 7-Day Free Trial',
  },
  pro: {
    tier: 'pro',
    name: 'Pro Café',
    badge: 'Best Value • Most Popular',
    monthlyPrice: 499,
    annualPrice: 4999,
    annualSavings: 1000,
    description: 'For busy cafés, bakeries, and quick-service diners needing speed & voice alerts.',
    maxBills: 'Unlimited Bills',
    maxDevices: 'Up to 3 Active Devices (Counter + Waiter + KOT)',
    features: [
      'Unlimited Bills & Orders',
      'Up to 3 Active Devices (Counter + Waiter + KOT)',
      'Dynamic UPI QR & Thermal ESC/POS Printing',
      'Custom Merchant QR Upload on Bills',
      'ServeJoy Voice Soundbox Synthesizer',
      'English, Hindi & Marathi Announcements',
      'Individual Sound Enable/Disable Controls',
      'Complete Sales History & Analytics',
      'Weekly Data Backup Export',
      'Dedicated WhatsApp Support (10 AM - 10 PM)',
    ],
    ctaLabel: 'Upgrade to Pro Café',
  },
  business: {
    tier: 'business',
    name: 'Business & Multi-Table',
    badge: 'Full Automation Suite',
    monthlyPrice: 999,
    annualPrice: 8999,
    annualSavings: 3000,
    description: 'Full-featured operational command for multi-table restaurants & dining halls.',
    maxBills: 'Unlimited Bills',
    maxDevices: 'Unlimited Active Devices',
    features: [
      'Unlimited Bills & Unlimited Terminals',
      'Visual Floor Plan & Live Table Timers',
      'Customer Table Standee QR Ordering',
      'Customer Loyalty & Phone CRM Registry',
      'Kitchen Display System (KDS)',
      'Custom Merchant QR & Dynamic UPI QR',
      'English, Hindi & Marathi Soundbox Voice Alerts',
      'Automated Real-Time Cloud Backup & Sync',
      'Staff Role Management (Owner, Manager, Waiter, Kitchen)',
      '24/7 Priority Dedicated Support',
    ],
    ctaLabel: 'Upgrade to Business Plan',
  },
};

class SubscriptionService {
  /**
   * Check status and remaining days of the business subscription
   */
  getSubscriptionInfo(businessId?: string): {
    subscription: SubscriptionDetails;
    isTrial: boolean;
    isExpired: boolean;
    daysRemaining: number;
    hoursRemaining: number;
    canBill: boolean;
  } {
    const subscription = storage.getSubscription(businessId);
    const now = Date.now();
    const trialExpiry = new Date(subscription.trialExpiresAt).getTime();
    const periodEnd = new Date(subscription.currentPeriodEnd).getTime();

    let isExpired = false;
    let daysRemaining = 0;
    let hoursRemaining = 0;

    if (subscription.tier === 'starter' || subscription.status.startsWith('trial')) {
      const msLeft = trialExpiry - now;
      if (msLeft <= 0) {
        isExpired = true;
        if (subscription.status !== 'trial_expired') {
          subscription.status = 'trial_expired';
          storage.saveSubscription(subscription, businessId);
        }
      } else {
        daysRemaining = Math.max(1, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
        hoursRemaining = Math.max(1, Math.ceil(msLeft / (1000 * 60 * 60)));
      }
    } else {
      const msLeft = periodEnd - now;
      if (msLeft <= 0) {
        isExpired = true;
        if (subscription.status !== 'subscription_expired') {
          subscription.status = 'subscription_expired';
          storage.saveSubscription(subscription, businessId);
        }
      } else {
        daysRemaining = Math.max(1, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
        hoursRemaining = Math.max(1, Math.ceil(msLeft / (1000 * 60 * 60)));
      }
    }

    const isPaidPlan = subscription.tier === 'pro' || subscription.tier === 'business';
    const isTrial = subscription.tier === 'starter';

    // Auto-heal serialized null values from JSON
    if (isPaidPlan) {
      if (!subscription.maxBillsPerMonth || subscription.maxBillsPerMonth < 99999) {
        subscription.maxBillsPerMonth = 999999;
      }
      if (!subscription.maxDevices || subscription.maxDevices < 3) {
        subscription.maxDevices = subscription.tier === 'business' ? 999999 : 3;
      }
      // If a paid subscription period is still in the future, ensure it's not marked as expired
      if (periodEnd > now && (subscription.status === 'trial_expired' || subscription.status === 'subscription_expired')) {
        subscription.status = 'active';
        storage.saveSubscription(subscription, businessId);
      }
    } else {
      if (!subscription.maxBillsPerMonth) {
        subscription.maxBillsPerMonth = 100;
      }
      if (!subscription.maxDevices) {
        subscription.maxDevices = 1;
      }
    }

    const isUnlimitedBills = isPaidPlan || !subscription.maxBillsPerMonth || subscription.maxBillsPerMonth >= 99999;
    const billLimit = subscription.maxBillsPerMonth || (isPaidPlan ? 999999 : 100);
    const canBill = !isExpired && (isPaidPlan || isUnlimitedBills || (subscription.billsThisMonth || 0) < billLimit);

    return {
      subscription,
      isTrial,
      isExpired,
      daysRemaining,
      hoursRemaining,
      canBill,
    };
  }

  /**
   * Activate or upgrade subscription after verified payment
   */
  activatePlan(
    tier: SubscriptionTier,
    cycle: BillingCycle,
    paymentRef: string,
    businessId?: string
  ): SubscriptionDetails {
    const now = new Date();
    const durationDays = cycle === 'annual' ? 365 : 30;
    const periodEnd = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const updated: SubscriptionDetails = {
      tier,
      status: 'active',
      billingCycle: cycle,
      trialStartedAt: now.toISOString(),
      trialExpiresAt: now.toISOString(), // Trial ended, real subscription active
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: periodEnd.toISOString(),
      billsThisMonth: 0,
      maxBillsPerMonth: tier === 'starter' ? 100 : 999999, // Use safe numeric upper bound instead of Infinity so JSON.stringify preserves it
      maxDevices: tier === 'starter' ? 1 : tier === 'pro' ? 3 : 999999,
    };

    storage.saveSubscription(updated, businessId);

    // Also update cafeProfile subscription tier
    const profile = storage.getCafeProfile(businessId);
    if (profile) {
      profile.subscriptionTier = tier;
      storage.saveCafeProfile(profile, businessId);
    }

    // Trigger instant UI re-render across listening components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('servejoy_sync'));
      window.dispatchEvent(new Event('servejoy_subscription_updated'));
    }

    return updated;
  }

  /**
   * Record a new bill generation towards monthly limit
   */
  incrementBillCount(businessId?: string): boolean {
    const sub = storage.getSubscription(businessId);
    const isUnlimited = sub.tier === 'pro' || sub.tier === 'business' || !sub.maxBillsPerMonth || sub.maxBillsPerMonth >= 99999;
    if (!isUnlimited && sub.billsThisMonth >= sub.maxBillsPerMonth) {
      return false;
    }
    sub.billsThisMonth = (sub.billsThisMonth || 0) + 1;
    storage.saveSubscription(sub, businessId);
    return true;
  }
}

export const subscriptionService = new SubscriptionService();

