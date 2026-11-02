export type UserRole = 'owner' | 'manager' | 'cashier' | 'waiter' | 'kitchen';

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';

export type BusinessType =
  | 'cafe'
  | 'restaurant'
  | 'hotel'
  | 'canteen'
  | 'bakery'
  | 'fast_food'
  | 'cloud_kitchen'
  | 'other';

export type AppTheme = 'light' | 'dark' | 'system';

export type AnnouncementLanguage = 'en-IN' | 'hi-IN' | 'mr-IN';

export type SubscriptionTier = 'starter' | 'pro' | 'business';

export type SubscriptionStatus =
  | 'trial_active'
  | 'trial_expired'
  | 'active'
  | 'payment_pending'
  | 'subscription_expired'
  | 'cancelled';

export type BillingCycle = 'monthly' | 'annual';

export interface SubscriptionDetails {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  trialStartedAt: string;
  trialExpiresAt: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  billsThisMonth: number;
  maxBillsPerMonth: number;
  maxDevices: number;
}

export interface BusinessAccount {
  id: string; // unique businessId
  ownerId: string;
  ownerEmail: string;
  ownerName: string;
  businessName: string;
  createdAt: string;
  subscription: SubscriptionDetails;
  suspended?: boolean;
}

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  businessId: string;
  role: UserRole;
  isOwner: boolean;
  staffId?: string;
  token?: string;
}

export interface CafeProfile {
  id: string;
  businessId?: string;
  name: string;
  tagLine: string;
  ownerName: string;
  address: string;
  phone: string;
  email?: string;
  gstin?: string;
  businessType?: BusinessType;
  upiId: string;
  currency: string;
  taxRate: number;
  subscriptionTier: SubscriptionTier;
  logoUrl: string;
  customQrUrl?: string;
  customQrEnabled?: boolean;
  invoiceNote?: string;
  fssaiNumber?: string;
}

export interface MenuItem {
  id: string;
  businessId?: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  emoji: string;
  imageUrl: string;
  isAvailable: boolean;
  sortOrder: number;
  description: string;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  businessId?: string;
  tableNumber: string;
  kotNumber: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  customerNote: string;
  customerName?: string;
  customerPhone?: string;
  publicToken: string;
  createdAt: string;
  updatedAt: string;
}

export interface BillItem {
  menuItemId: string;
  name: string;
  price: number;
  cost: number;
  quantity: number;
}

export type PaymentMode = 'cash' | 'upi' | 'card';

export interface Bill {
  id: string;
  businessId?: string;
  billNumber: string;
  date: string;
  items: BillItem[];
  subtotal: number;
  discountAmount: number;
  discountCode?: string;
  total: number;
  profit: number;
  paymentMode: PaymentMode;
  customerName?: string;
  customerPhone?: string;
  tableNumber?: string;
  status: 'paid' | 'pending' | 'void';
}

export interface Staff {
  id: string;
  businessId: string;
  name: string;
  email?: string;
  phone?: string;
  role: UserRole;
  pin: string;
  active: boolean;
  createdAt: string;
}

export interface Printer {
  id: string;
  name: string;
  paperWidth: '58mm' | '80mm';
  isDefault: boolean;
  connected: boolean;
}

export interface WaiterRequest {
  id: string;
  businessId?: string;
  tableNumber: string;
  type: 'water' | 'bill' | 'waiter';
  status: 'pending' | 'completed';
  createdAt: string;
}

export interface SoundboxSettings {
  enabled: boolean;
  language: AnnouncementLanguage;
  volume: number;
  speechRate: number;
  announcePayments: boolean;
  announcePaidBills: boolean;
  announceUpiConfirmation: boolean;
  announceOrders: boolean;
  announceReady: boolean;
  announceWaiterCalls: boolean;
}

export interface AiCredits {
  used: number;
  total: number;
}

export interface CloudSyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  error: string | null;
}

