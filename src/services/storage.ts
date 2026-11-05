import {
  CafeProfile,
  MenuItem,
  Bill,
  Order,
  Staff,
  Printer,
  SoundboxSettings,
  AiCredits,
  WaiterRequest,
  BusinessAccount,
  SubscriptionDetails,
  AuthUser,
  SubscriptionTier,
  RestaurantTable,
} from '../types';

export const STORAGE_KEYS = {
  CAFE: 'servejoy_cafe_profile',
  MENU: 'servejoy_menu_items',
  TABLES: 'servejoy_tables',
  BILLS: 'servejoy_bills',
  ORDERS: 'servejoy_orders',
  STAFF: 'servejoy_staff',
  PRINTERS: 'servejoy_printers',
  ROLE: 'servejoy_user_role',
  THEME: 'servejoy_theme',
  AI_CREDITS: 'servejoy_ai_credits',
  SOUNDBOX: 'servejoy_soundbox_settings',
  WAITER_REQUESTS: 'servejoy_waiter_requests',
  NETWORK_HOST: 'servejoy_network_host',
  AUTH_USER: 'servejoy_auth_user',
  ACTIVE_BIZ: 'servejoy_active_business_id',
  BUSINESSES: 'servejoy_business_registry',
};

export const DEFAULT_CAFE_PROFILE: CafeProfile = {
  id: 'cafe_chai_point_01',
  name: 'Chai Point',
  tagLine: 'Authentic Chai, Snacks & Desi Delights',
  ownerName: 'Siddhant',
  address: 'Shop 12, Indiranagar 100ft Road, Bengaluru',
  phone: '+91 98765 43210',
  email: 'siddhant@chaipoint.com',
  gstin: '29ABCDE1234F1Z5',
  businessType: 'cafe',
  upiId: 'chaipoint@icici',
  currency: '₹',
  taxRate: 0,
  subscriptionTier: 'business',
  logoUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=150&auto=format&fit=crop&q=80',
  customQrUrl: '',
  customQrEnabled: false,
  invoiceNote: 'Thank you for visiting! Scan to Pay or share feedback.',
};

export const DEFAULT_TABLES: RestaurantTable[] = [
  { id: 't1', name: 'Table 1', section: 'Main Hall', capacity: 4, shape: 'square', isActive: true },
  { id: 't2', name: 'Table 2', section: 'Main Hall', capacity: 4, shape: 'square', isActive: true },
  { id: 't3', name: 'Table 3', section: 'Main Hall', capacity: 2, shape: 'round', isActive: true },
  { id: 't4', name: 'Table 4', section: 'Main Hall', capacity: 4, shape: 'square', isActive: true },
  { id: 't5', name: 'Table 5', section: 'Main Hall', capacity: 6, shape: 'rect', isActive: true },
  { id: 't6', name: 'Table 6', section: 'Main Hall', capacity: 4, shape: 'square', isActive: true },
  { id: 'p1', name: 'Patio 1', section: 'Outdoor Patio', capacity: 4, shape: 'round', isActive: true },
  { id: 'p2', name: 'Patio 2', section: 'Outdoor Patio', capacity: 4, shape: 'round', isActive: true },
  { id: 'p3', name: 'Terrace A', section: 'Outdoor Patio', capacity: 6, shape: 'rect', isActive: true },
  { id: 'v1', name: 'VIP Lounge 1', section: 'VIP Lounge', capacity: 8, shape: 'rect', isActive: true },
  { id: 'v2', name: 'VIP Lounge 2', section: 'VIP Lounge', capacity: 6, shape: 'rect', isActive: true },
  { id: 'c1', name: 'Takeaway', section: 'Counter', capacity: 2, shape: 'square', isActive: true },
];

export const DEFAULT_MENU_ITEMS: MenuItem[] = [
  {
    id: 'item_pav_bhaji',
    name: 'Pav Bhaji',
    category: 'Snacks',
    price: 120,
    cost: 45,
    emoji: '🍲',
    imageUrl: '/dishes/pav_bhaji.jpg',
    isAvailable: true,
    sortOrder: 1,
    description: 'Sizzling spicy buttery bhaji topped with a melting square of butter, served with 2 warm toasted pavs and onions.',
  },
  {
    id: 'item_dal_baati',
    name: 'Dal batti [4 pc] with Chaas',
    category: 'Snacks',
    price: 180,
    cost: 70,
    emoji: '🥣',
    imageUrl: '/dishes/dal_baati.jpg',
    isAvailable: true,
    sortOrder: 2,
    description: 'Authentic Rajasthani baked wheat baatis dipped in pure desi ghee, served with panchmel dal & chilled spiced chaas.',
  },
  {
    id: 'item_chole_puri',
    name: 'Chole puri',
    category: 'Snacks',
    price: 140,
    cost: 50,
    emoji: '🍛',
    imageUrl: '/dishes/chole_puri.jpg',
    isAvailable: true,
    sortOrder: 3,
    description: 'Puffed golden balloon puris served with slow-cooked Punjabi spiced Amritsari chole and pickled ginger.',
  },
  {
    id: 'item_dhokla',
    name: 'Rava Dhokla [1 kg]',
    category: 'Snacks',
    price: 300,
    cost: 110,
    emoji: '🥪',
    imageUrl: '/dishes/dhokla.jpg',
    isAvailable: true,
    sortOrder: 4,
    description: 'Spongy, moist golden-yellow steamed dhokla squares tempered with mustard seeds, green chillies & fresh coconut.',
  },
  {
    id: 'item_masala_chai',
    name: 'Kadak Masala Chai',
    category: 'Beverages',
    price: 30,
    cost: 8,
    emoji: '☕',
    imageUrl: '/dishes/masala_chai.jpg',
    isAvailable: true,
    sortOrder: 5,
    description: 'Brewed with Assam CTC tea leaves, crushed ginger, green cardamom, cloves, and whole creamy milk.',
  },
  {
    id: 'item_filter_coffee',
    name: 'South Indian Filter Coffee',
    category: 'Beverages',
    price: 45,
    cost: 12,
    emoji: '☕',
    imageUrl: '/dishes/filter_coffee.jpg',
    isAvailable: true,
    sortOrder: 6,
    description: 'Fresh aromatic decoction served frothy in traditional South Indian polished brass davarah and tumbler.',
  },
  {
    id: 'item_paneer_roll',
    name: 'Paneer Tikka Kathi Roll',
    category: 'Snacks',
    price: 160,
    cost: 65,
    emoji: '🌯',
    imageUrl: '/dishes/paneer_roll.jpg',
    isAvailable: true,
    sortOrder: 7,
    description: 'Charred tandoori paneer tikka cubes, crunchy sliced peppers, and mint chutney wrapped in a flaky laccha paratha.',
  },
  {
    id: 'item_gulab_jamun',
    name: 'Gulab Jamun [2 pc]',
    category: 'Desserts',
    price: 60,
    cost: 20,
    emoji: '🍮',
    imageUrl: '/dishes/gulab_jamun.jpg',
    isAvailable: true,
    sortOrder: 8,
    description: 'Soft melt-in-mouth mawa dumplings soaked in cardamom-saffron infused warm sugar syrup with silver vark.',
  },
  {
    id: 'item_grilled_sandwich',
    name: 'Bombay Grilled Sandwich',
    category: 'Snacks',
    price: 130,
    cost: 45,
    emoji: '🥪',
    imageUrl: '/dishes/grilled_sandwich.jpg',
    isAvailable: true,
    sortOrder: 9,
    description: 'Toasted golden panini stuffed with spicy potatoes, cucumber, beetroot, mint chutney, and molten melted cheese pull.',
  },
  {
    id: 'item_bun_maska',
    name: 'Bun Maska & Chai Combo',
    category: 'Beverages',
    price: 75,
    cost: 22,
    emoji: '🥯',
    imageUrl: '/dishes/bun_maska.jpg',
    isAvailable: true,
    sortOrder: 10,
    description: 'Soft warm Irani bakery bun with a generous melting slab of butter, served beside a hot cutting chai.',
  },
];

export const DEFAULT_BILLS: Bill[] = [
  {
    id: 'bill_043',
    billNumber: 'Bill #043',
    date: new Date(Date.now() - 900000).toISOString(),
    items: [
      { menuItemId: 'item_pav_bhaji', name: 'Pav Bhaji', price: 120, cost: 45, quantity: 1 },
      { menuItemId: 'item_dal_baati', name: 'Dal batti [4 pc] with Chaas', price: 180, cost: 70, quantity: 1 },
    ],
    subtotal: 300,
    discountAmount: 0,
    total: 300,
    profit: 185,
    paymentMode: 'cash',
    customerName: 'Aarav Gupta',
    customerPhone: '+91 98200 12345',
    status: 'paid',
  },
  {
    id: 'bill_042',
    billNumber: 'Bill #042',
    date: new Date(Date.now() - 3900000).toISOString(),
    items: [
      { menuItemId: 'item_chole_puri', name: 'Chole puri', price: 140, cost: 50, quantity: 2 },
      { menuItemId: 'item_masala_chai', name: 'Kadak Masala Chai', price: 30, cost: 8, quantity: 2 },
    ],
    subtotal: 340,
    discountAmount: 0,
    total: 340,
    profit: 224,
    paymentMode: 'upi',
    customerName: 'Pooja Verma',
    customerPhone: '+91 98450 78901',
    status: 'paid',
  },
  {
    id: 'bill_041',
    billNumber: 'Bill #041',
    date: new Date(Date.now() - 8400000).toISOString(),
    items: [
      { menuItemId: 'item_dhokla', name: 'Rava Dhokla [1 kg]', price: 300, cost: 110, quantity: 1 },
      { menuItemId: 'item_filter_coffee', name: 'South Indian Filter Coffee', price: 45, cost: 12, quantity: 2 },
    ],
    subtotal: 390,
    discountAmount: 20,
    discountCode: 'WELCOME20',
    total: 370,
    profit: 236,
    paymentMode: 'upi',
    customerName: 'Karan Mehra',
    customerPhone: '+91 98111 22334',
    status: 'paid',
  },
];

export const DEFAULT_ORDERS: Order[] = [
  {
    id: 'ord_101',
    tableNumber: 'Table 4',
    kotNumber: '044',
    status: 'pending',
    items: [
      { menuItemId: 'item_pav_bhaji', name: 'Pav Bhaji', price: 120, quantity: 1 },
      { menuItemId: 'item_masala_chai', name: 'Kadak Masala Chai', price: 30, quantity: 2 },
    ],
    total: 180,
    customerNote: 'Please make chai extra ginger, pav butter toasted crisp!',
    customerName: 'Rohan Sharma',
    customerPhone: '+91 99887 66554',
    publicToken: 'token_ord_101',
    createdAt: new Date(Date.now() - 240000).toISOString(),
    updatedAt: new Date(Date.now() - 240000).toISOString(),
  },
  {
    id: 'ord_102',
    tableNumber: 'Table 2',
    kotNumber: '045',
    status: 'preparing',
    items: [
      { menuItemId: 'item_dal_baati', name: 'Dal batti [4 pc] with Chaas', price: 180, quantity: 1 },
      { menuItemId: 'item_gulab_jamun', name: 'Gulab Jamun [2 pc]', price: 60, quantity: 1 },
    ],
    total: 240,
    customerNote: 'Keep chaas cold without extra salt',
    customerName: 'Ananya Roy',
    customerPhone: '+91 97123 45678',
    publicToken: 'token_ord_102',
    createdAt: new Date(Date.now() - 660000).toISOString(),
    updatedAt: new Date(Date.now() - 360000).toISOString(),
  },
  {
    id: 'ord_103',
    tableNumber: 'Table 7',
    kotNumber: '046',
    status: 'ready',
    items: [
      { menuItemId: 'item_chole_puri', name: 'Chole puri', price: 140, quantity: 2 },
    ],
    total: 280,
    customerNote: '',
    customerName: 'Vikram',
    publicToken: 'token_ord_103',
    createdAt: new Date(Date.now() - 1080000).toISOString(),
    updatedAt: new Date(Date.now() - 120000).toISOString(),
  },
];

export const DEFAULT_STAFF: Staff[] = [
  {
    id: 'staff_01',
    businessId: 'cafe_chai_point_01',
    name: 'Rahul Sharma',
    email: 'rahul@chaipoint.com',
    role: 'cashier',
    pin: '1234',
    active: true,
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'staff_02',
    businessId: 'cafe_chai_point_01',
    name: 'Amit Patel',
    email: 'amit@chaipoint.com',
    role: 'waiter',
    pin: '5678',
    active: true,
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'staff_03',
    businessId: 'cafe_chai_point_01',
    name: 'Chef Ramesh',
    email: 'ramesh@chaipoint.com',
    role: 'kitchen',
    pin: '9999',
    active: true,
    createdAt: '2026-09-01T10:00:00Z',
  },
];

export const createDefaultSubscription = (tier: SubscriptionTier = 'starter'): SubscriptionDetails => {
  const now = new Date();
  const trialExpiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  return {
    tier,
    status: tier === 'starter' ? 'trial_active' : 'active',
    billingCycle: 'monthly',
    trialStartedAt: now.toISOString(),
    trialExpiresAt: trialExpiry.toISOString(),
    currentPeriodStart: now.toISOString(),
    currentPeriodEnd: periodEnd.toISOString(),
    billsThisMonth: 0,
    maxBillsPerMonth: tier === 'starter' ? 100 : 999999,
    maxDevices: tier === 'starter' ? 1 : tier === 'pro' ? 3 : 999999,
  };
};

export const DEFAULT_BUSINESS_ACCOUNT: BusinessAccount = {
  id: 'cafe_chai_point_01',
  ownerId: 'owner_siddhant_01',
  ownerEmail: 'siddhant@chaipoint.com',
  ownerName: 'Siddhant',
  businessName: 'Chai Point',
  createdAt: '2026-09-01T09:00:00Z',
  subscription: createDefaultSubscription('pro'),
};

export const DEFAULT_PRINTERS: Printer[] = [
  {
    id: 'bt_printer_peripage',
    name: 'PeriPage A6 58mm',
    paperWidth: '58mm',
    isDefault: true,
    connected: false,
  },
];

export const DEFAULT_SOUNDBOX: SoundboxSettings = {
  enabled: true,
  language: 'en-IN',
  volume: 1,
  speechRate: 1,
  announcePayments: true,
  announcePaidBills: true,
  announceUpiConfirmation: true,
  announceOrders: true,
  announceReady: true,
  announceWaiterCalls: true,
};

export const storage = {
  getActiveBusinessId(): string {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_BIZ) || 'cafe_chai_point_01';
  },
  setActiveBusinessId(id: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_BIZ, id);
  },

  getScopedKey(baseKey: string, businessId?: string): string {
    const bizId = businessId || this.getActiveBusinessId();
    return `servejoy_${bizId}_${baseKey}`;
  },

  getAuthUser(): AuthUser | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  saveAuthUser(user: AuthUser | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    }
  },

  getAllBusinesses(): BusinessAccount[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BUSINESSES);
      const list: BusinessAccount[] = data ? JSON.parse(data) : [];
      if (!list.some((b) => b.id === DEFAULT_BUSINESS_ACCOUNT.id)) {
        list.unshift(DEFAULT_BUSINESS_ACCOUNT);
      }
      return list;
    } catch {
      return [DEFAULT_BUSINESS_ACCOUNT];
    }
  },

  getBusinessAccount(businessId?: string): BusinessAccount | null {
    const bizId = businessId || this.getActiveBusinessId();
    const list = this.getAllBusinesses();
    return list.find((b) => b.id === bizId) || null;
  },

  saveBusinessAccount(account: BusinessAccount): void {
    const list = this.getAllBusinesses();
    const idx = list.findIndex((b) => b.id === account.id);
    if (idx >= 0) {
      list[idx] = account;
    } else {
      list.push(account);
    }
    localStorage.setItem(STORAGE_KEYS.BUSINESSES, JSON.stringify(list));
  },

  deleteBusinessAccount(businessId: string): void {
    if (businessId === DEFAULT_BUSINESS_ACCOUNT.id) return; // protect default demo account
    const list = this.getAllBusinesses().filter((b) => b.id !== businessId);
    localStorage.setItem(STORAGE_KEYS.BUSINESSES, JSON.stringify(list));
  },

  getSubscription(businessId?: string): SubscriptionDetails {
    const bizId = businessId || this.getActiveBusinessId();
    try {
      const scopedKey = this.getScopedKey('subscription', bizId);
      const data = localStorage.getItem(scopedKey);
      if (data) {
        const parsed = JSON.parse(data);
        // Auto-heal serialized null values from JSON
        if (parsed.tier === 'pro' || parsed.tier === 'business') {
          let healed = false;
          if (parsed.maxBillsPerMonth === null || parsed.maxBillsPerMonth === undefined) {
            parsed.maxBillsPerMonth = 999999;
            healed = true;
          }
          if (parsed.tier === 'business' && (parsed.maxDevices === null || parsed.maxDevices === undefined)) {
            parsed.maxDevices = 999999;
            healed = true;
          }
          if (parsed.tier === 'pro' && (parsed.maxDevices === null || parsed.maxDevices === undefined)) {
            parsed.maxDevices = 3;
            healed = true;
          }
          if (healed) {
            this.saveSubscription(parsed, bizId);
          }
        }
        return parsed;
      }

      const acc = this.getBusinessAccount(bizId);
      if (acc?.subscription) {
        this.saveSubscription(acc.subscription, bizId);
        return acc.subscription;
      }
      const def = createDefaultSubscription(bizId === 'cafe_chai_point_01' ? 'pro' : 'starter');
      this.saveSubscription(def, bizId);
      return def;
    } catch {
      return createDefaultSubscription('starter');
    }
  },

  saveSubscription(sub: SubscriptionDetails, businessId?: string): void {
    const bizId = businessId || this.getActiveBusinessId();
    localStorage.setItem(this.getScopedKey('subscription', bizId), JSON.stringify(sub));
    const acc = this.getBusinessAccount(bizId);
    if (acc) {
      acc.subscription = sub;
      this.saveBusinessAccount(acc);
    }
  },

  getCafeProfile(businessId?: string): CafeProfile {
    try {
      const bizId = businessId || this.getActiveBusinessId();
      const scopedKey = this.getScopedKey('cafe_profile', bizId);
      const data = localStorage.getItem(scopedKey);
      if (data) {
        return { ...DEFAULT_CAFE_PROFILE, ...JSON.parse(data), id: bizId, businessId: bizId };
      }

      // Legacy fallback for default business
      if (bizId === 'cafe_chai_point_01') {
        const legacy = localStorage.getItem(STORAGE_KEYS.CAFE);
        if (legacy) {
          const parsed = JSON.parse(legacy);
          localStorage.setItem(scopedKey, JSON.stringify(parsed));
          return { ...DEFAULT_CAFE_PROFILE, ...parsed, id: bizId, businessId: bizId };
        }
        return DEFAULT_CAFE_PROFILE;
      }

      // For newly registered businesses
      const bizAcc = this.getBusinessAccount(bizId);
      const newProfile: CafeProfile = {
        ...DEFAULT_CAFE_PROFILE,
        id: bizId,
        businessId: bizId,
        name: bizAcc?.businessName || 'New Restaurant',
        ownerName: bizAcc?.ownerName || 'Business Owner',
        email: bizAcc?.ownerEmail || '',
        subscriptionTier: bizAcc?.subscription.tier || 'starter',
      };
      localStorage.setItem(scopedKey, JSON.stringify(newProfile));
      return newProfile;
    } catch {
      return DEFAULT_CAFE_PROFILE;
    }
  },

  saveCafeProfile(profile: CafeProfile, businessId?: string): void {
    const bizId = businessId || profile.businessId || this.getActiveBusinessId();
    const updated = { ...profile, id: bizId, businessId: bizId };
    localStorage.setItem(this.getScopedKey('cafe_profile', bizId), JSON.stringify(updated));
    if (bizId === 'cafe_chai_point_01') {
      localStorage.setItem(STORAGE_KEYS.CAFE, JSON.stringify(updated));
    }
  },

  getMenuItems(businessId?: string): MenuItem[] {
    try {
      const bizId = businessId || this.getActiveBusinessId();
      const scopedKey = this.getScopedKey('menu_items', bizId);
      const data = localStorage.getItem(scopedKey);
      if (data) return JSON.parse(data);

      if (bizId === 'cafe_chai_point_01') {
        const legacy = localStorage.getItem(STORAGE_KEYS.MENU);
        if (legacy) {
          const parsed = JSON.parse(legacy);
          localStorage.setItem(scopedKey, JSON.stringify(parsed));
          return parsed;
        }
        return DEFAULT_MENU_ITEMS;
      }

      // Initial standard sample items for new restaurants
      const initialItems = DEFAULT_MENU_ITEMS.map((item) => ({
        ...item,
        businessId: bizId,
      }));
      localStorage.setItem(scopedKey, JSON.stringify(initialItems));
      return initialItems;
    } catch {
      return DEFAULT_MENU_ITEMS;
    }
  },

  saveMenuItems(items: MenuItem[], businessId?: string): void {
    const bizId = businessId || this.getActiveBusinessId();
    localStorage.setItem(this.getScopedKey('menu_items', bizId), JSON.stringify(items));
    if (bizId === 'cafe_chai_point_01') {
      localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(items));
    }
  },

  getBills(businessId?: string): Bill[] {
    try {
      const bizId = businessId || this.getActiveBusinessId();
      const scopedKey = this.getScopedKey('bills', bizId);
      const data = localStorage.getItem(scopedKey);
      if (data) return JSON.parse(data);

      if (bizId === 'cafe_chai_point_01') {
        const legacy = localStorage.getItem(STORAGE_KEYS.BILLS);
        if (legacy) {
          const parsed = JSON.parse(legacy);
          localStorage.setItem(scopedKey, JSON.stringify(parsed));
          return parsed;
        }
        return DEFAULT_BILLS;
      }
      return [];
    } catch {
      return [];
    }
  },

  saveBills(bills: Bill[], businessId?: string): void {
    const bizId = businessId || this.getActiveBusinessId();
    localStorage.setItem(this.getScopedKey('bills', bizId), JSON.stringify(bills));
    if (bizId === 'cafe_chai_point_01') {
      localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(bills));
    }
  },

  getOrders(businessId?: string): Order[] {
    try {
      const bizId = businessId || this.getActiveBusinessId();
      const scopedKey = this.getScopedKey('orders', bizId);
      const data = localStorage.getItem(scopedKey);
      if (data) return JSON.parse(data);

      if (bizId === 'cafe_chai_point_01') {
        const legacy = localStorage.getItem(STORAGE_KEYS.ORDERS);
        if (legacy) {
          const parsed = JSON.parse(legacy);
          localStorage.setItem(scopedKey, JSON.stringify(parsed));
          return parsed;
        }
        return DEFAULT_ORDERS;
      }
      return [];
    } catch {
      return [];
    }
  },

  saveOrders(orders: Order[], businessId?: string): void {
    const bizId = businessId || this.getActiveBusinessId();
    localStorage.setItem(this.getScopedKey('orders', bizId), JSON.stringify(orders));
    if (bizId === 'cafe_chai_point_01') {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    }
  },

  getStaff(businessId?: string): Staff[] {
    try {
      const bizId = businessId || this.getActiveBusinessId();
      const scopedKey = this.getScopedKey('staff', bizId);
      const data = localStorage.getItem(scopedKey);
      if (data) return JSON.parse(data);

      if (bizId === 'cafe_chai_point_01') {
        const legacy = localStorage.getItem(STORAGE_KEYS.STAFF);
        if (legacy) {
          const parsed = JSON.parse(legacy);
          localStorage.setItem(scopedKey, JSON.stringify(parsed));
          return parsed;
        }
        return DEFAULT_STAFF;
      }
      return [];
    } catch {
      return [];
    }
  },

  saveStaff(staff: Staff[], businessId?: string): void {
    const bizId = businessId || this.getActiveBusinessId();
    localStorage.setItem(this.getScopedKey('staff', bizId), JSON.stringify(staff));
    if (bizId === 'cafe_chai_point_01') {
      localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staff));
    }
  },

  getPrinters(businessId?: string): Printer[] {
    try {
      const bizId = businessId || this.getActiveBusinessId();
      const scopedKey = this.getScopedKey('printers', bizId);
      const data = localStorage.getItem(scopedKey);
      return data ? JSON.parse(data) : DEFAULT_PRINTERS;
    } catch {
      return DEFAULT_PRINTERS;
    }
  },

  savePrinters(printers: Printer[], businessId?: string): void {
    const bizId = businessId || this.getActiveBusinessId();
    localStorage.setItem(this.getScopedKey('printers', bizId), JSON.stringify(printers));
    if (bizId === 'cafe_chai_point_01') {
      localStorage.setItem(STORAGE_KEYS.PRINTERS, JSON.stringify(printers));
    }
  },

  getAiCredits(businessId?: string): AiCredits {
    try {
      const bizId = businessId || this.getActiveBusinessId();
      const scopedKey = this.getScopedKey('ai_credits', bizId);
      const data = localStorage.getItem(scopedKey);
      return data ? JSON.parse(data) : { used: 3, total: 10 };
    } catch {
      return { used: 3, total: 10 };
    }
  },

  saveAiCredits(credits: AiCredits, businessId?: string): void {
    const bizId = businessId || this.getActiveBusinessId();
    localStorage.setItem(this.getScopedKey('ai_credits', bizId), JSON.stringify(credits));
  },

  getSoundboxSettings(businessId?: string): SoundboxSettings {
    try {
      const bizId = businessId || this.getActiveBusinessId();
      const scopedKey = this.getScopedKey('soundbox', bizId);
      const data = localStorage.getItem(scopedKey);
      return data ? { ...DEFAULT_SOUNDBOX, ...JSON.parse(data) } : DEFAULT_SOUNDBOX;
    } catch {
      return DEFAULT_SOUNDBOX;
    }
  },

  saveSoundboxSettings(settings: SoundboxSettings, businessId?: string): void {
    const bizId = businessId || this.getActiveBusinessId();
    localStorage.setItem(this.getScopedKey('soundbox', bizId), JSON.stringify(settings));
    if (bizId === 'cafe_chai_point_01') {
      localStorage.setItem(STORAGE_KEYS.SOUNDBOX, JSON.stringify(settings));
    }
  },

  getTheme(): 'light' | 'dark' | 'system' {
    return (localStorage.getItem(STORAGE_KEYS.THEME) as any) || 'system';
  },

  saveTheme(theme: 'light' | 'dark' | 'system'): void {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  },

  getWaiterRequests(businessId?: string): WaiterRequest[] {
    try {
      const bizId = businessId || this.getActiveBusinessId();
      const scopedKey = this.getScopedKey('waiter_requests', bizId);
      const data = localStorage.getItem(scopedKey);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveWaiterRequests(requests: WaiterRequest[], businessId?: string): void {
    const bizId = businessId || this.getActiveBusinessId();
    localStorage.setItem(this.getScopedKey('waiter_requests', bizId), JSON.stringify(requests));
  },

  getNetworkHost(): string {
    return localStorage.getItem(STORAGE_KEYS.NETWORK_HOST) || '';
  },

  saveNetworkHost(host: string): void {
    localStorage.setItem(STORAGE_KEYS.NETWORK_HOST, host);
  },

  getTables(businessId?: string): RestaurantTable[] {
    try {
      const bizId = businessId || this.getActiveBusinessId();
      const scopedKey = this.getScopedKey('tables', bizId);
      const data = localStorage.getItem(scopedKey);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return DEFAULT_TABLES;
    } catch {
      return DEFAULT_TABLES;
    }
  },

  saveTables(tables: RestaurantTable[], businessId?: string): void {
    const bizId = businessId || this.getActiveBusinessId();
    localStorage.setItem(this.getScopedKey('tables', bizId), JSON.stringify(tables));
    if (bizId === 'cafe_chai_point_01') {
      localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
    }
  },
};

