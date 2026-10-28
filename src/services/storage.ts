import { CafeProfile, MenuItem, Bill, Order, Staff, Printer, SoundboxSettings, AiCredits, WaiterRequest } from '../types';

export const STORAGE_KEYS = {
  CAFE: 'servejoy_cafe_profile',
  MENU: 'servejoy_menu_items',
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
};

export const DEFAULT_CAFE_PROFILE: CafeProfile = {
  id: 'cafe_chai_point_01',
  name: 'Chai Point',
  tagLine: 'Authentic Chai, Snacks & Desi Delights',
  ownerName: 'Siddhant',
  address: 'Shop 12, Indiranagar 100ft Road, Bengaluru',
  phone: '+91 98765 43210',
  upiId: 'chaipoint@icici',
  currency: '₹',
  taxRate: 0,
  subscriptionTier: 'business',
  logoUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=150&auto=format&fit=crop&q=80',
};

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
    name: 'Rahul Sharma',
    email: 'rahul@chaipoint.com',
    role: 'cashier',
    pin: '1234',
    createdAt: '2026-09-01T10:00:00Z',
  },
];

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
  announceOrders: true,
  announceReady: true,
};

export const storage = {
  getCafeProfile(): CafeProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CAFE);
      return data ? JSON.parse(data) : DEFAULT_CAFE_PROFILE;
    } catch {
      return DEFAULT_CAFE_PROFILE;
    }
  },
  saveCafeProfile(profile: CafeProfile): void {
    localStorage.setItem(STORAGE_KEYS.CAFE, JSON.stringify(profile));
  },

  getMenuItems(): MenuItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MENU);
      return data ? JSON.parse(data) : DEFAULT_MENU_ITEMS;
    } catch {
      return DEFAULT_MENU_ITEMS;
    }
  },
  saveMenuItems(items: MenuItem[]): void {
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(items));
  },

  getBills(): Bill[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BILLS);
      return data ? JSON.parse(data) : DEFAULT_BILLS;
    } catch {
      return DEFAULT_BILLS;
    }
  },
  saveBills(bills: Bill[]): void {
    localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(bills));
  },

  getOrders(): Order[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return data ? JSON.parse(data) : DEFAULT_ORDERS;
    } catch {
      return DEFAULT_ORDERS;
    }
  },
  saveOrders(orders: Order[]): void {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  },

  getStaff(): Staff[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STAFF);
      return data ? JSON.parse(data) : DEFAULT_STAFF;
    } catch {
      return DEFAULT_STAFF;
    }
  },
  saveStaff(staff: Staff[]): void {
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staff));
  },

  getPrinters(): Printer[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRINTERS);
      return data ? JSON.parse(data) : DEFAULT_PRINTERS;
    } catch {
      return DEFAULT_PRINTERS;
    }
  },
  savePrinters(printers: Printer[]): void {
    localStorage.setItem(STORAGE_KEYS.PRINTERS, JSON.stringify(printers));
  },

  getAiCredits(): AiCredits {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AI_CREDITS);
      return data ? JSON.parse(data) : { used: 3, total: 10 };
    } catch {
      return { used: 3, total: 10 };
    }
  },
  saveAiCredits(credits: AiCredits): void {
    localStorage.setItem(STORAGE_KEYS.AI_CREDITS, JSON.stringify(credits));
  },

  getSoundboxSettings(): SoundboxSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SOUNDBOX);
      return data ? JSON.parse(data) : DEFAULT_SOUNDBOX;
    } catch {
      return DEFAULT_SOUNDBOX;
    }
  },
  saveSoundboxSettings(settings: SoundboxSettings): void {
    localStorage.setItem(STORAGE_KEYS.SOUNDBOX, JSON.stringify(settings));
  },

  getWaiterRequests(): WaiterRequest[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WAITER_REQUESTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveWaiterRequests(requests: WaiterRequest[]): void {
    localStorage.setItem(STORAGE_KEYS.WAITER_REQUESTS, JSON.stringify(requests));
  },

  getNetworkHost(): string {
    return localStorage.getItem(STORAGE_KEYS.NETWORK_HOST) || '';
  },
  saveNetworkHost(host: string): void {
    localStorage.setItem(STORAGE_KEYS.NETWORK_HOST, host);
  },
};

