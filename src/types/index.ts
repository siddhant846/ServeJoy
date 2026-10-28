export type UserRole = 'owner' | 'cashier' | 'waiter' | 'kitchen';

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';

export interface CafeProfile {
  id: string;
  name: string;
  tagLine: string;
  ownerName: string;
  address: string;
  phone: string;
  upiId: string;
  currency: string;
  taxRate: number;
  subscriptionTier: 'starter' | 'pro' | 'business';
  logoUrl: string;
}

export interface MenuItem {
  id: string;
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
  name: string;
  email: string;
  role: UserRole;
  pin: string;
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
  tableNumber: string;
  type: 'water' | 'bill' | 'waiter';
  status: 'pending' | 'completed';
  createdAt: string;
}

export interface SoundboxSettings {
  enabled: boolean;
  language: 'en-IN' | 'hi-IN';
  volume: number;
  speechRate: number;
  announcePayments: boolean;
  announceOrders: boolean;
  announceReady: boolean;
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

