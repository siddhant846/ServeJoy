import { AuthUser, BusinessAccount, UserRole, Staff } from '../types';
import { storage, createDefaultSubscription, DEFAULT_BUSINESS_ACCOUNT } from './storage';

export interface LoginResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

export interface RegisterBusinessParams {
  ownerName: string;
  email: string;
  businessName: string;
  businessType?: string;
  phone?: string;
  password?: string;
  googleUid?: string;
  photoURL?: string;
}

class AuthService {
  private currentUser: AuthUser | null = null;
  private listeners = new Set<(user: AuthUser | null) => void>();

  constructor() {
    this.currentUser = storage.getAuthUser();
  }

  getCurrentUser(): AuthUser | null {
    if (!this.currentUser) {
      this.currentUser = storage.getAuthUser();
    }
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }

  subscribe(listener: (user: AuthUser | null) => void): () => void {
    this.listeners.add(listener);
    listener(this.currentUser);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const user = this.currentUser;
    this.listeners.forEach((fn) => fn(user));
  }

  /**
   * Register a new Restaurant Owner & Business with a 7-day free trial.
   */
  async registerOwner(params: RegisterBusinessParams): Promise<LoginResult> {
    try {
      const cleanEmail = params.email.trim().toLowerCase();
      if (!cleanEmail || !params.businessName.trim()) {
        return { success: false, error: 'Email and Business Name are required.' };
      }

      // Check if business already registered with this email
      const allBiz = storage.getAllBusinesses();
      const existing = allBiz.find((b) => b.ownerEmail.toLowerCase() === cleanEmail);
      if (existing) {
        return {
          success: false,
          error: 'An account with this email already exists. Please log in instead.',
        };
      }

      // Generate secure unique business ID
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const cleanBizSlug = params.businessName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .slice(0, 16);
      const businessId = `biz_${cleanBizSlug}_${randomSuffix}`;
      const ownerUid = params.googleUid || `owner_${Date.now()}_${randomSuffix}`;

      // Start 7-day free trial automatically
      const subscription = createDefaultSubscription('starter');

      const newAccount: BusinessAccount = {
        id: businessId,
        ownerId: ownerUid,
        ownerEmail: cleanEmail,
        ownerName: params.ownerName.trim() || 'Owner',
        businessName: params.businessName.trim(),
        createdAt: new Date().toISOString(),
        subscription,
      };

      // Save business account & set active business
      storage.saveBusinessAccount(newAccount);
      storage.setActiveBusinessId(businessId);
      storage.saveSubscription(subscription, businessId);

      // Create initial cafe profile
      storage.saveCafeProfile(
        {
          id: businessId,
          businessId: businessId,
          name: params.businessName.trim(),
          tagLine: 'Serving joy with every order',
          ownerName: params.ownerName.trim() || 'Owner',
          address: '',
          phone: params.phone || '',
          email: cleanEmail,
          upiId: '',
          currency: '₹',
          taxRate: 0,
          subscriptionTier: 'starter',
          logoUrl: params.photoURL || '',
          invoiceNote: 'Thank you for your visit!',
        },
        businessId
      );

      // Authenticate user session
      const authUser: AuthUser = {
        uid: ownerUid,
        email: cleanEmail,
        displayName: params.ownerName || 'Restaurant Owner',
        photoURL: params.photoURL,
        businessId,
        role: 'owner',
        isOwner: true,
        token: `jwt_sim_${Date.now()}_${randomSuffix}`,
      };

      this.currentUser = authUser;
      storage.saveAuthUser(authUser);
      this.notify();

      return { success: true, user: authUser };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed' };
    }
  }

  /**
   * Login Owner via Google OAuth / Email
   */
  async loginOwner(email: string, googleUid?: string, photoURL?: string, displayName?: string): Promise<LoginResult> {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const allBiz = storage.getAllBusinesses();
      let account = allBiz.find((b) => b.ownerEmail.toLowerCase() === cleanEmail);

      // If logging in via Google for the first time and not found, automatically register them with 7-day trial
      if (!account && googleUid) {
        return this.registerOwner({
          email: cleanEmail,
          ownerName: displayName || cleanEmail.split('@')[0],
          businessName: `${displayName || 'My'} Café`,
          googleUid,
          photoURL,
        });
      }

      if (!account) {
        // Fallback check for demo Chai Point account
        if (cleanEmail.includes('siddhant') || cleanEmail.includes('chaipoint')) {
          account = DEFAULT_BUSINESS_ACCOUNT;
        } else {
          return {
            success: false,
            error: 'No business found with this email. Please click "Sign Up" to create your restaurant account.',
          };
        }
      }

      storage.setActiveBusinessId(account.id);

      const authUser: AuthUser = {
        uid: googleUid || account.ownerId,
        email: cleanEmail,
        displayName: displayName || account.ownerName,
        photoURL: photoURL,
        businessId: account.id,
        role: 'owner',
        isOwner: true,
        token: `jwt_sess_${Date.now()}`,
      };

      this.currentUser = authUser;
      storage.saveAuthUser(authUser);
      this.notify();

      return { success: true, user: authUser };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    }
  }

  /**
   * Staff Terminal PIN Login (Managers, Cashiers, Waiters, Kitchen Staff)
   * Strictly verifies staff PIN under the specified business ID.
   */
  async loginStaff(businessId: string, pin: string): Promise<LoginResult> {
    try {
      const cleanBizId = businessId.trim();
      const cleanPin = pin.trim();

      if (!cleanBizId || !cleanPin) {
        return { success: false, error: 'Please enter both Business ID and 4-digit PIN.' };
      }

      // Check if business exists
      const allBiz = storage.getAllBusinesses();
      const biz = allBiz.find(
        (b) => b.id.toLowerCase() === cleanBizId.toLowerCase() || b.businessName.toLowerCase() === cleanBizId.toLowerCase()
      );

      if (!biz) {
        return {
          success: false,
          error: `Restaurant "${cleanBizId}" not found. Please verify the Business ID with your owner.`,
        };
      }

      // Look up staff registry for this business
      const staffList = storage.getStaff(biz.id);
      const staffMember = staffList.find((s) => s.pin === cleanPin && s.active);

      if (!staffMember) {
        // Allow default 1234 PIN only for the demo account
        if (biz.id === 'cafe_chai_point_01' && cleanPin === '1234') {
          storage.setActiveBusinessId(biz.id);
          const demoUser: AuthUser = {
            uid: 'staff_demo_01',
            email: 'staff@chaipoint.com',
            displayName: 'Rahul Sharma (Cashier)',
            businessId: biz.id,
            role: 'cashier',
            isOwner: false,
            staffId: 'staff_01',
          };
          this.currentUser = demoUser;
          storage.saveAuthUser(demoUser);
          this.notify();
          return { success: true, user: demoUser };
        }

        return {
          success: false,
          error: 'Incorrect staff PIN or inactive employee account.',
        };
      }

      // Log in as assigned staff role (cannot escalate to owner)
      storage.setActiveBusinessId(biz.id);
      const authUser: AuthUser = {
        uid: `staff_${staffMember.id}`,
        email: staffMember.email || `${staffMember.name.toLowerCase().replace(/\s+/g, '_')}@${biz.id}.local`,
        displayName: `${staffMember.name} (${staffMember.role})`,
        businessId: biz.id,
        role: staffMember.role,
        isOwner: false,
        staffId: staffMember.id,
      };

      this.currentUser = authUser;
      storage.saveAuthUser(authUser);
      this.notify();

      return { success: true, user: authUser };
    } catch (err: any) {
      return { success: false, error: err.message || 'Staff login failed' };
    }
  }

  logout(): void {
    this.currentUser = null;
    storage.saveAuthUser(null);
    this.notify();
  }
}

export const authService = new AuthService();
