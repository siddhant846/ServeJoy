import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  CafeProfile,
  MenuItem,
  CartItem,
  Bill,
  Order,
  Staff,
  Printer,
  SoundboxSettings,
  AiCredits,
  WaiterRequest,
  UserRole,
  OrderStatus,
  PaymentMode,
  CloudSyncStatus,
} from '../types';
import { storage } from '../services/storage';
import { cloudSync } from '../services/cloudSync';
import { soundbox } from '../services/soundbox';
import { matchLocalDishImage } from '../services/aiService';
import { toast } from 'sonner';

interface AppContextType {
  cafeProfile: CafeProfile;
  updateCafeProfile: (profile: CafeProfile) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  menuItems: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, 'id' | 'sortOrder'>) => void;
  updateMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (id: string) => void;
  toggleItemAvailability: (id: string) => void;

  cart: CartItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;

  bills: Bill[];
  createBill: (data: {
    items: { menuItemId: string; name: string; price: number; cost: number; quantity: number }[];
    paymentMode: PaymentMode;
    customerName?: string;
    customerPhone?: string;
    tableNumber?: string;
    discountAmount?: number;
    discountCode?: string;
  }) => Bill;
  todayBills: Bill[];
  todayRevenue: number;
  todayProfit: number;
  bestSellerItem: { name: string; count: number } | null;
  recentBill: Bill | null;
  setRecentBill: (bill: Bill | null) => void;

  orders: Order[];
  placeOrder: (data: {
    tableNumber: string;
    items: { menuItemId: string; name: string; price: number; quantity: number }[];
    total: number;
    customerNote?: string;
    customerName?: string;
    customerPhone?: string;
  }) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  convertOrderToBill: (orderId: string, paymentMode: PaymentMode) => Bill | null;

  waiterRequests: WaiterRequest[];
  callWaiter: (tableNumber: string, type: 'water' | 'bill' | 'waiter') => void;
  updateWaiterRequestStatus: (id: string, status: 'pending' | 'completed') => void;

  syncStatus: CloudSyncStatus;
  syncAll: () => Promise<void>;

  networkHost: string;
  setNetworkHost: (host: string) => void;

  soundboxSettings: SoundboxSettings;
  updateSoundboxSettings: (settings: SoundboxSettings) => void;

  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cafeProfile, setCafeProfile] = useState<CafeProfile>(() => storage.getCafeProfile());
  const [userRole, setUserRole] = useState<UserRole>('owner');
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => storage.getMenuItems());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [bills, setBills] = useState<Bill[]>(() => storage.getBills());
  const [orders, setOrders] = useState<Order[]>(() => storage.getOrders());
  const [waiterRequests, setWaiterRequests] = useState<WaiterRequest[]>(() => storage.getWaiterRequests());
  const [soundboxSettings, setSoundboxSettings] = useState<SoundboxSettings>(() => storage.getSoundboxSettings());
  const [recentBill, setRecentBill] = useState<Bill | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('servejoy_theme') === 'dark' : false;
  });
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>(() => cloudSync.getStatus());

  const [networkHost, setNetworkHostState] = useState<string>(() => {
    const saved = storage.getNetworkHost();
    if (saved) return saved;
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      return hostname === 'localhost' || hostname === '127.0.0.1'
        ? 'http://192.168.1.14:5173'
        : window.location.origin;
    }
    return 'http://192.168.1.14:5173';
  });

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('servejoy_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('servejoy_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // Persistence effects
  useEffect(() => storage.saveCafeProfile(cafeProfile), [cafeProfile]);
  useEffect(() => storage.saveMenuItems(menuItems), [menuItems]);
  useEffect(() => storage.saveBills(bills), [bills]);
  useEffect(() => storage.saveOrders(orders), [orders]);
  useEffect(() => storage.saveWaiterRequests(waiterRequests), [waiterRequests]);
  useEffect(() => storage.saveNetworkHost(networkHost), [networkHost]);
  useEffect(() => storage.saveSoundboxSettings(soundboxSettings), [soundboxSettings]);

  // Cloud Sync setup
  useEffect(() => {
    const unsubStatus = cloudSync.subscribeStatus(setSyncStatus);
    const unsubNewData = cloudSync.subscribeNewData(({ newOrders, newRequests }) => {
      if (newOrders.length > 0) {
        const first = newOrders[0];
        soundbox.announceOrder(first.kotNumber, first.tableNumber, first.total);
        toast.success(`Cloud Order: ${first.tableNumber} (KOT #${first.kotNumber})`, { icon: '☁️' });
      }
      if (newRequests.length > 0) {
        const first = newRequests[0];
        soundbox.playChime();
        toast.info(`🔔 ${first.tableNumber}: ${first.type.toUpperCase()}`, { icon: '🛎️' });
      }
    });

    cloudSync.start(4500);

    const onSyncEvent = () => {
      setOrders(storage.getOrders());
      setWaiterRequests(storage.getWaiterRequests());
      setBills(storage.getBills());
    };
    window.addEventListener('servejoy_sync', onSyncEvent);

    return () => {
      unsubStatus();
      unsubNewData();
      cloudSync.stop();
      window.removeEventListener('servejoy_sync', onSyncEvent);
    };
  }, []);

  const syncAll = async () => {
    await cloudSync.syncAll();
    toast.success('Live cloud sync completed!', { icon: '☁️' });
  };

  // Cafe Profile
  const updateCafeProfile = (newProfile: CafeProfile) => {
    setCafeProfile(newProfile);
    toast.success('Cafe profile updated!');
  };

  // Menu management
  const addMenuItem = (item: Omit<MenuItem, 'id' | 'sortOrder'>) => {
    let imageUrl = item.imageUrl;
    if (!imageUrl || imageUrl.includes('unsplash.com')) {
      imageUrl = matchLocalDishImage(item.name, item.category);
    }
    const newItem: MenuItem = {
      ...item,
      imageUrl,
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      sortOrder: menuItems.length + 1,
    };
    setMenuItems((prev) => [...prev, newItem]);
    toast.success(`Added ${newItem.name} to menu!`);
  };

  const updateMenuItem = (item: MenuItem) => {
    setMenuItems((prev) => prev.map((i) => (i.id === item.id ? item : i)));
    toast.success(`Updated ${item.name}!`);
  };

  const deleteMenuItem = (id: string) => {
    setMenuItems((prev) => prev.filter((i) => i.id !== id));
    removeFromCart(id);
    toast.info('Item removed from menu');
  };

  const toggleItemAvailability = (id: string) => {
    setMenuItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, isAvailable: !i.isAvailable } : i))
    );
  };

  // Cart Management
  const addToCart = (item: MenuItem) => {
    if (!item.isAvailable) {
      toast.error(`${item.name} is currently sold out!`);
      return;
    }
    setCart((prev) => {
      const existing = prev.find((ci) => ci.item.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.item.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((ci) => ci.item.id !== itemId));
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((ci) => (ci.item.id === itemId ? { ...ci, quantity } : ci))
    );
  };

  const clearCart = () => setCart([]);

  const cartCount = useMemo(() => cart.reduce((sum, ci) => sum + ci.quantity, 0), [cart]);
  const cartTotal = useMemo(
    () => cart.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0),
    [cart]
  );

  // Billing
  const createBill = (data: {
    items: { menuItemId: string; name: string; price: number; cost: number; quantity: number }[];
    paymentMode: PaymentMode;
    customerName?: string;
    customerPhone?: string;
    tableNumber?: string;
    discountAmount?: number;
    discountCode?: string;
  }): Bill => {
    const subtotal = data.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const totalCost = data.items.reduce((sum, i) => sum + i.cost * i.quantity, 0);
    const discount = data.discountAmount || 0;
    const finalTotal = Math.max(0, subtotal - discount);
    const profit = finalTotal - totalCost;

    const nextBillNum = String(bills.length + 44).padStart(3, '0');
    const newBill: Bill = {
      id: `bill_${Date.now()}`,
      billNumber: `Bill #${nextBillNum}`,
      date: new Date().toISOString(),
      items: data.items,
      subtotal,
      discountAmount: discount,
      discountCode: data.discountCode,
      total: finalTotal,
      profit,
      paymentMode: data.paymentMode,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      tableNumber: data.tableNumber,
      status: 'paid',
    };

    setBills((prev) => [newBill, ...prev]);
    setRecentBill(newBill);
    soundbox.announcePayment(newBill.total, newBill.paymentMode, newBill.tableNumber || newBill.billNumber);
    cloudSync.pushBill(newBill);
    clearCart();
    return newBill;
  };

  // Analytics Helpers
  const todayBills = useMemo(() => {
    const todayStr = new Date().toDateString();
    return bills.filter((b) => new Date(b.date).toDateString() === todayStr);
  }, [bills]);

  const todayRevenue = useMemo(
    () => todayBills.reduce((sum, b) => sum + b.total, 0),
    [todayBills]
  );

  const todayProfit = useMemo(
    () => todayBills.reduce((sum, b) => sum + b.profit, 0),
    [todayBills]
  );

  const bestSellerItem = useMemo(() => {
    const counts: Record<string, number> = {};
    todayBills.forEach((b) => {
      b.items.forEach((item) => {
        counts[item.name] = (counts[item.name] || 0) + item.quantity;
      });
    });
    let topName = '';
    let topCount = 0;
    Object.entries(counts).forEach(([name, count]) => {
      if (count > topCount) {
        topCount = count;
        topName = name;
      }
    });
    return topName ? { name: topName, count: topCount } : null;
  }, [todayBills]);

  // Order Management
  const placeOrder = (data: {
    tableNumber: string;
    items: { menuItemId: string; name: string; price: number; quantity: number }[];
    total: number;
    customerNote?: string;
    customerName?: string;
    customerPhone?: string;
  }): Order => {
    const nextKot = String(orders.length + 47).padStart(2, '0');
    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      tableNumber: data.tableNumber,
      kotNumber: nextKot,
      status: 'pending',
      items: data.items,
      total: data.total,
      customerNote: data.customerNote || '',
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      publicToken: `token_${Math.random().toString(36).substr(2, 8)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);
    soundbox.announceOrder(newOrder.kotNumber, newOrder.tableNumber, newOrder.total);
    cloudSync.pushOrder(newOrder);
    window.dispatchEvent(new Event('servejoy_sync'));
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const target = orders.find((o) => o.id === orderId);
    if (!target) return;

    const updated: Order = { ...target, status, updatedAt: new Date().toISOString() };
    setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    cloudSync.pushOrder(updated);
    window.dispatchEvent(new Event('servejoy_sync'));

    if (status === 'ready') {
      soundbox.announceOrderReady(target.kotNumber, target.tableNumber);
    }
  };

  const convertOrderToBill = (orderId: string, paymentMode: PaymentMode): Bill | null => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return null;

    const itemsWithCost = order.items.map((oi) => {
      const match = menuItems.find((mi) => mi.id === oi.menuItemId);
      return {
        menuItemId: oi.menuItemId,
        name: oi.name,
        price: oi.price,
        cost: match ? match.cost : Math.round(oi.price * 0.4),
        quantity: oi.quantity,
      };
    });

    const bill = createBill({
      items: itemsWithCost,
      paymentMode,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      tableNumber: order.tableNumber,
    });

    updateOrderStatus(orderId, 'served');
    return bill;
  };

  // Waiter Requests
  const callWaiter = (tableNumber: string, type: 'water' | 'bill' | 'waiter') => {
    const newReq: WaiterRequest = {
      id: `req_${Date.now()}`,
      tableNumber,
      type,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setWaiterRequests((prev) => [newReq, ...prev]);
    cloudSync.pushWaiterRequest(newReq);
    soundbox.playChime();
    toast.success(`Request sent to waiter for ${tableNumber}!`, { icon: '🔔' });
  };

  const updateWaiterRequestStatus = (id: string, status: 'pending' | 'completed') => {
    setWaiterRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
    const updated = waiterRequests.find((r) => r.id === id);
    if (updated) {
      cloudSync.pushWaiterRequest({ ...updated, status });
    }
  };

  const setNetworkHost = (host: string) => {
    let clean = host.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = `http://${clean}`;
    }
    setNetworkHostState(clean);
    toast.success('Wi-Fi network host address updated!');
  };

  const updateSoundboxSettings = (settings: SoundboxSettings) => {
    setSoundboxSettings(settings);
    toast.success('Soundbox settings saved!');
  };

  return (
    <AppContext.Provider
      value={{
        cafeProfile,
        updateCafeProfile,
        userRole,
        setUserRole,
        menuItems,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        toggleItemAvailability,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartCount,
        cartTotal,
        bills,
        createBill,
        todayBills,
        todayRevenue,
        todayProfit,
        bestSellerItem,
        recentBill,
        setRecentBill,
        orders,
        placeOrder,
        updateOrderStatus,
        convertOrderToBill,
        waiterRequests,
        callWaiter,
        updateWaiterRequestStatus,
        syncStatus,
        syncAll,
        networkHost,
        setNetworkHost,
        soundboxSettings,
        updateSoundboxSettings,
        isDarkMode,
        toggleDarkMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

