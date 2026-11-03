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
  AppTheme,
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
  addMultipleMenuItems: (items: Omit<MenuItem, 'id' | 'sortOrder'>[]) => void;
  updateMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (id: string) => void;
  toggleItemAvailability: (id: string) => void;
  regenerateDishImage: (itemId: string) => void;
  regenerateAllDishImages: () => void;

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
    status?: 'paid' | 'pending' | 'void';
  }) => Bill;
  updateBillStatus: (billId: string, status: 'paid' | 'pending' | 'void', paymentMode?: PaymentMode) => void;
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

  printers: Printer[];
  activePrinter: Printer | null;
  setActivePrinter: (printer: Printer) => void;
  addPrinter: (name: string, paperWidth?: '58mm' | '80mm') => Printer;
  removePrinter: (id: string) => void;
  setDefaultPrinter: (id: string) => void;

  isDarkMode: boolean;
  toggleDarkMode: () => void;
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
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
  const [printers, setPrinters] = useState<Printer[]>(() => storage.getPrinters());
  const [activePrinter, setActivePrinter] = useState<Printer | null>(() => {
    const list = storage.getPrinters();
    return list.find((p) => p.isDefault) || list[0] || null;
  });
  const [recentBill, setRecentBill] = useState<Bill | null>(null);
  const [theme, setThemeState] = useState<AppTheme>(() => storage.getTheme());
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = storage.getTheme();
    if (savedTheme === 'dark') return true;
    if (savedTheme === 'light') return false;
    return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
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

  // Theme & Dark mode effect
  useEffect(() => {
    storage.saveTheme(theme);
    const applyTheme = (t: AppTheme) => {
      let dark = false;
      if (t === 'dark') {
        dark = true;
      } else if (t === 'light') {
        dark = false;
      } else {
        dark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      setIsDarkMode(dark);
      if (dark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme(theme);

    if (theme === 'system' && typeof window !== 'undefined') {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme('system');
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, [theme]);

  const setTheme = (t: AppTheme) => {
    setThemeState(t);
  };

  const toggleDarkMode = () => {
    const next: AppTheme = isDarkMode ? 'light' : 'dark';
    setTheme(next);
  };

  // Persistence effects
  useEffect(() => storage.saveCafeProfile(cafeProfile), [cafeProfile]);
  useEffect(() => storage.saveMenuItems(menuItems), [menuItems]);
  useEffect(() => storage.saveBills(bills), [bills]);
  useEffect(() => storage.saveOrders(orders), [orders]);
  useEffect(() => storage.saveWaiterRequests(waiterRequests), [waiterRequests]);
  useEffect(() => storage.saveNetworkHost(networkHost), [networkHost]);
  useEffect(() => storage.saveSoundboxSettings(soundboxSettings), [soundboxSettings]);
  useEffect(() => storage.savePrinters(printers), [printers]);

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

  // Auto-upgrade existing menu items that have generic mismatched images or pollinations rate-limit URLs
  useEffect(() => {
    setMenuItems((prev) => {
      let changed = false;
      const updated = prev.map((item) => {
        let cleanName = item.name.trim();
        // If name has trailing numbers from column OCR (e.g. "Chicken Wings 80 Veg....", "French Fries 50 Chicken...")
        const multiMatch = cleanName.match(/^(.*?)\s+\d{2,4}\b.*$/);
        if (multiMatch && multiMatch[1] && multiMatch[1].length >= 3) {
          cleanName = multiMatch[1].trim();
          changed = true;
        }

        const lowerName = cleanName.toLowerCase();
        const hasPollinations = item.imageUrl?.includes('pollinations.ai');
        const hasUnsplash = item.imageUrl?.includes('unsplash.com');
        const isMismatchedSandwich =
          item.imageUrl === '/dishes/grilled_sandwich.jpg' &&
          !lowerName.includes('sandwich') &&
          !lowerName.includes('toast') &&
          !lowerName.includes('panini');
        const isMismatchedMaggi =
          item.imageUrl === '/dishes/plain_maggi.jpg' &&
          lowerName.includes('chicken');

        if (hasPollinations || hasUnsplash || isMismatchedSandwich || isMismatchedMaggi || !item.imageUrl || cleanName !== item.name) {
          changed = true;
          return {
            ...item,
            name: cleanName,
            imageUrl: matchLocalDishImage(cleanName, item.category),
          };
        }
        return item;
      });

      if (changed) {
        storage.saveMenuItems(updated);
        return updated;
      }
      return prev;
    });
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
    const updated = [...menuItems, newItem];
    setMenuItems(updated);
    storage.saveMenuItems(updated);
    cloudSync.pushMenuItems(updated);
    toast.success(`Added ${newItem.name} to menu!`);
  };

  const addMultipleMenuItems = (newDishes: Omit<MenuItem, 'id' | 'sortOrder'>[]) => {
    const formatted = newDishes.map((item, index) => {
      let imageUrl = item.imageUrl;
      if (!imageUrl || imageUrl.includes('unsplash.com')) {
        imageUrl = matchLocalDishImage(item.name, item.category);
      }
      return {
        ...item,
        imageUrl,
        id: `item_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 4)}`,
        sortOrder: menuItems.length + index + 1,
      };
    });
    const updated = [...menuItems, ...formatted];
    setMenuItems(updated);
    storage.saveMenuItems(updated);
    cloudSync.pushMenuItems(updated);
    toast.success(`Successfully added ${formatted.length} dishes to menu!`, { icon: '🍽️' });
  };

  const updateMenuItem = (item: MenuItem) => {
    const updated = menuItems.map((i) => (i.id === item.id ? item : i));
    setMenuItems(updated);
    storage.saveMenuItems(updated);
    cloudSync.pushMenuItems(updated);
    toast.success(`Updated ${item.name}!`);
  };

  const deleteMenuItem = (id: string) => {
    const updated = menuItems.filter((i) => i.id !== id);
    setMenuItems(updated);
    storage.saveMenuItems(updated);
    cloudSync.pushMenuItems(updated);
    removeFromCart(id);
    toast.info('Item removed from menu');
  };

  const toggleItemAvailability = (id: string) => {
    const updated = menuItems.map((i) => (i.id === id ? { ...i, isAvailable: !i.isAvailable } : i));
    setMenuItems(updated);
    storage.saveMenuItems(updated);
    cloudSync.pushMenuItems(updated);
    const target = updated.find((i) => i.id === id);
    if (target) {
      if (target.isAvailable) {
        toast.success(`${target.name} is now Available in Stock!`, { icon: '🟢' });
      } else {
        toast.info(`${target.name} marked as Sold Out!`, { icon: '🔴' });
      }
    }
  };

  const regenerateDishImage = (itemId: string) => {
    const target = menuItems.find((i) => i.id === itemId);
    if (!target) return;
    const newImage = matchLocalDishImage(target.name, target.category, Date.now());
    const updated = menuItems.map((i) => (i.id === itemId ? { ...i, imageUrl: newImage } : i));
    setMenuItems(updated);
    storage.saveMenuItems(updated);
    cloudSync.pushMenuItems(updated);
    toast.success(`Generated unique AI photography for ${target.name}!`, { icon: '✨' });
  };

  const regenerateAllDishImages = () => {
    const updated = menuItems.map((item, idx) => ({
      ...item,
      imageUrl: matchLocalDishImage(item.name, item.category, Date.now() + idx * 7),
    }));
    setMenuItems(updated);
    storage.saveMenuItems(updated);
    cloudSync.pushMenuItems(updated);
    toast.success('Generated unique AI photography for all dishes!', { icon: '✨' });
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
    status?: 'paid' | 'pending' | 'void';
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
      paymentMode: data.paymentMode || 'upi',
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      tableNumber: data.tableNumber,
      status: data.status || 'pending',
    };

    setBills((prev) => [newBill, ...prev]);
    setRecentBill(newBill);
    if (newBill.status === 'paid') {
      soundbox.announcePayment(newBill.total, newBill.paymentMode, newBill.tableNumber || newBill.billNumber);
    }
    cloudSync.pushBill(newBill);
    clearCart();
    return newBill;
  };

  const updateBillStatus = (
    billId: string,
    status: 'paid' | 'pending' | 'void',
    paymentMode?: PaymentMode
  ) => {
    setBills((prev) =>
      prev.map((b) => {
        if (b.id === billId) {
          const updated: Bill = {
            ...b,
            status,
            paymentMode: paymentMode || b.paymentMode,
          };
          if (status === 'paid') {
            soundbox.announcePayment(
              updated.total,
              updated.paymentMode,
              updated.tableNumber || updated.billNumber
            );
          }
          cloudSync.pushBill(updated);
          return updated;
        }
        return b;
      })
    );
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

  const addPrinter = (name: string, paperWidth: '58mm' | '80mm' = '58mm'): Printer => {
    const newPrinter: Printer = {
      id: `bt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name,
      paperWidth,
      isDefault: printers.length === 0,
      connected: true,
    };
    setPrinters((prev) => [newPrinter, ...prev]);
    setActivePrinter(newPrinter);
    return newPrinter;
  };

  const removePrinter = (id: string) => {
    setPrinters((prev) => prev.filter((p) => p.id !== id));
    if (activePrinter?.id === id) {
      const remaining = printers.filter((p) => p.id !== id);
      setActivePrinter(remaining[0] || null);
    }
  };

  const setDefaultPrinter = (id: string) => {
    setPrinters((prev) =>
      prev.map((p) => ({ ...p, isDefault: p.id === id }))
    );
    const target = printers.find((p) => p.id === id);
    if (target) {
      setActivePrinter(target);
    }
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
        addMultipleMenuItems,
        updateMenuItem,
        deleteMenuItem,
        toggleItemAvailability,
        regenerateDishImage,
        regenerateAllDishImages,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartCount,
        cartTotal,
        bills,
        createBill,
        updateBillStatus,
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
        printers,
        activePrinter,
        setActivePrinter,
        addPrinter,
        removePrinter,
        setDefaultPrinter,
        isDarkMode,
        toggleDarkMode,
        theme,
        setTheme,
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

