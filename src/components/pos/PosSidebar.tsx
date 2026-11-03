import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { MenuItem } from '../../types';
import {
  Plus,
  Sparkles,
  Camera,
  Layers,
  Flame,
  Utensils,
  MapPin,
  QrCode,
  Volume2,
  Printer,
  ShoppingBag,
  TrendingUp,
  Receipt,
  Users,
  Clock,
  ArrowRight,
  Coffee,
} from 'lucide-react';
import { toast } from 'sonner';

interface PosSidebarProps {
  onOpenAddDish: () => void;
  onOpenAddTable: () => void;
  onOpenAiScan: () => void;
  onOpenTableQR: () => void;
  onOpenSoundbox?: () => void;
  onOpenPrinter?: () => void;
  onOpenSettings?: () => void;
  homeSubTab?: 'pos' | 'floor';
  onHomeSubTabChange?: (subTab: 'pos' | 'floor') => void;
}

export const PosSidebar: React.FC<PosSidebarProps> = ({
  onOpenAddDish,
  onOpenAddTable,
  onOpenAiScan,
  onOpenTableQR,
  onOpenSoundbox,
  onOpenPrinter,
  onOpenSettings,
  homeSubTab = 'pos',
  onHomeSubTabChange,
}) => {
  const {
    menuItems,
    tables,
    orders,
    bills,
    todayBills,
    todayRevenue,
    addToCart,
    cafeProfile,
    soundboxSettings,
  } = useApp();

  // Compute live active tables and kitchen counts
  const activeOrders = useMemo(
    () => orders.filter((o) => o.status !== 'served' && o.status !== 'cancelled'),
    [orders]
  );

  const cookingOrdersCount = useMemo(
    () => orders.filter((o) => o.status === 'preparing' || o.status === 'pending').length,
    [orders]
  );

  const occupiedTableNames = useMemo(() => {
    const set = new Set<string>();
    activeOrders.forEach((o) => set.add(o.tableNumber.toLowerCase()));
    return set;
  }, [activeOrders]);

  const occupiedCount = useMemo(() => {
    return tables.filter((t) => occupiedTableNames.has(t.name.toLowerCase())).length;
  }, [tables, occupiedTableNames]);

  const availableCount = Math.max(0, tables.length - occupiedCount);

  // Compute top selling dishes (Favorites) from bills, or fallback to top menu items
  const favoriteDishes = useMemo(() => {
    const frequencyMap = new Map<string, number>();

    // Count frequency from bills
    bills.forEach((b) => {
      b.items?.forEach((i) => {
        frequencyMap.set(i.menuItemId, (frequencyMap.get(i.menuItemId) || 0) + i.quantity);
      });
    });

    // Sort menu items by frequency or take first 5
    const sorted = [...menuItems].sort((a, b) => {
      const freqA = frequencyMap.get(a.id) || 0;
      const freqB = frequencyMap.get(b.id) || 0;
      if (freqB !== freqA) return freqB - freqA;
      return a.sortOrder - b.sortOrder;
    });

    return sorted.slice(0, 4);
  }, [bills, menuItems]);

  return (
    <div className="space-y-3.5 select-none pb-8">
      {/* 1. PRIMARY ACTIONS: Add Dish & Add Table */}
      <div className="rounded-3xl border border-border/80 bg-card p-3.5 shadow-card space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            Quick Setup & Catalog
          </span>
          <span className="text-[10px] font-bold text-accent font-receipt">
            {menuItems.length} Dishes • {tables.length} Tables
          </span>
        </div>

        {/* Add Dish Card */}
        <div className="group rounded-2xl border border-accent/25 bg-gradient-to-br from-amber-600/10 via-orange-600/5 to-transparent p-3 transition hover:border-accent/40 shadow-xs">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white shadow-sm shrink-0">
                <Utensils className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Add Dish to Menu</h4>
                <p className="text-[10px] text-muted-foreground">Manual entry or AI Vision</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenAddDish}
              className="flex items-center gap-1 rounded-xl bg-accent px-2.5 py-1.5 text-xs font-bold text-white shadow-sm hover:opacity-95 active:scale-95 transition"
            >
              <Plus className="h-3 w-3" />
              <span>Add</span>
            </button>
          </div>

          <div className="mt-2.5 pt-2 border-t border-border/50 flex items-center justify-between">
            <button
              type="button"
              onClick={onOpenAiScan}
              className="flex items-center gap-1.5 text-[11px] font-bold text-accent hover:underline"
            >
              <Sparkles className="h-3 w-3" />
              <span>AI Menu Digitizer</span>
            </button>
            <span className="text-[9px] text-muted-foreground">Gemini 1.5 Flash</span>
          </div>
        </div>

        {/* Add Dining Tables Card */}
        <div className="group rounded-2xl border border-border bg-secondary/30 p-3 transition hover:border-accent/30 shadow-xs">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-foreground border border-border shrink-0">
                <span className="text-sm">🪑</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Add Dining Tables</h4>
                <p className="text-[10px] text-muted-foreground">
                  {tables.length} tables configured
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenAddTable}
              className="flex items-center gap-1 rounded-xl bg-card border border-border hover:border-accent text-foreground px-2.5 py-1.5 text-xs font-bold shadow-xs hover:bg-secondary active:scale-95 transition"
            >
              <Plus className="h-3 w-3 text-accent" />
              <span>Add</span>
            </button>
          </div>

          <div className="mt-2.5 pt-2 border-t border-border/50 flex items-center justify-between text-[11px]">
            <span className="text-[10px] text-muted-foreground">
              Single & Bulk Table Generator
            </span>
            <button
              type="button"
              onClick={onOpenAddTable}
              className="text-[10px] font-bold text-accent hover:underline"
            >
              + Bulk (5/10/20)
            </button>
          </div>
        </div>
      </div>

      {/* 2. FAVOURITE / MOST SELLING DISHES */}
      <div className="rounded-3xl border border-border/80 bg-card p-3.5 shadow-card space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Flame className="h-3.5 w-3.5 text-orange-500 fill-orange-500" />
            Top Selling Dishes
          </span>
          <span className="text-[9px] font-semibold text-muted-foreground">1-Tap Punch</span>
        </div>

        <div className="space-y-1.5">
          {favoriteDishes.map((dish) => (
            <div
              key={dish.id}
              className="flex items-center justify-between rounded-2xl border border-border/60 bg-secondary/20 p-2 hover:bg-secondary/40 hover:border-accent/30 transition group"
            >
              <div className="flex items-center gap-2 min-w-0 pr-1">
                <div className="relative h-10 w-10 rounded-xl overflow-hidden bg-secondary shrink-0 border border-border/50">
                  <img
                    src={dish.imageUrl}
                    alt={dish.name}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/dishes/pav_bhaji.jpg';
                    }}
                  />
                  {!dish.isAvailable && (
                    <div className="absolute inset-0 bg-black/65 flex items-center justify-center">
                      <span className="text-[8px] font-extrabold text-red-500 uppercase">Out</span>
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <h5 className="text-xs font-bold text-foreground truncate group-hover:text-accent transition">
                    {dish.name}
                  </h5>
                  <p className="font-receipt text-[11px] font-extrabold text-accent">
                    {cafeProfile.currency}
                    {dish.price}
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={!dish.isAvailable}
                onClick={() => {
                  addToCart(dish);
                  toast.success(`Added ${dish.name} to order!`, { icon: '🛒' });
                }}
                title={`Add ${dish.name} to order`}
                className="flex h-7 w-7 items-center justify-center rounded-xl bg-accent text-white shadow-xs hover:opacity-90 active:scale-90 transition disabled:opacity-30 disabled:pointer-events-none shrink-0"
              >
                <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. LIVE FLOOR & SHIFT PULSE */}
      <div className="rounded-3xl border border-border/80 bg-card p-3.5 shadow-card space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Floor Pulse
          </span>
          {onHomeSubTabChange && (
            <button
              type="button"
              onClick={() => onHomeSubTabChange(homeSubTab === 'floor' ? 'pos' : 'floor')}
              className="text-[10px] font-bold text-accent hover:underline"
            >
              {homeSubTab === 'floor' ? 'Switch to POS' : 'View Floor Plan'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-2.5">
            <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
              Free Tables
            </p>
            <p className="font-receipt text-base font-extrabold text-foreground mt-0.5">
              {availableCount} <span className="text-xs font-normal text-muted-foreground">/ {tables.length}</span>
            </p>
          </div>

          <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-2.5">
            <p className="text-[10px] font-semibold text-amber-700 dark:text-amber-400">
              Kitchen KOTs
            </p>
            <p className="font-receipt text-base font-extrabold text-foreground mt-0.5">
              {cookingOrdersCount} <span className="text-xs font-normal text-muted-foreground">cooking</span>
            </p>
          </div>
        </div>

        {/* Quick Shift Revenue */}
        <div className="rounded-2xl bg-secondary/30 p-2.5 flex items-center justify-between border border-border/50 text-xs">
          <div>
            <p className="text-[10px] text-muted-foreground font-semibold">Today's Shift Sales</p>
            <p className="font-receipt text-sm font-extrabold text-foreground">
              {cafeProfile.currency}
              {todayRevenue.toLocaleString('en-IN')}
            </p>
          </div>
          <span className="rounded-xl bg-accent/15 px-2 py-1 text-[10px] font-bold text-accent font-receipt">
            {todayBills.length} Bills
          </span>
        </div>
      </div>

      {/* 4. UTILITIES & QUICK HARDWARE LAUNCHERS */}
      <div className="rounded-3xl border border-border/80 bg-card p-3 shadow-card space-y-1.5">
        <button
          type="button"
          onClick={onOpenTableQR}
          className="w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition active:scale-98"
        >
          <div className="flex items-center gap-2">
            <QrCode className="h-3.5 w-3.5 text-accent" />
            <span>Table QR Standees</span>
          </div>
          <span className="text-[10px] font-bold text-accent font-receipt">Print A6</span>
        </button>

        {onOpenSoundbox && (
          <button
            type="button"
            onClick={onOpenSoundbox}
            className="w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition active:scale-98"
          >
            <div className="flex items-center gap-2">
              <Volume2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Smart Soundbox</span>
            </div>
            <span className={`text-[10px] font-bold ${soundboxSettings.enabled ? 'text-emerald-500' : 'text-muted-foreground'}`}>
              {soundboxSettings.enabled ? 'Active' : 'Off'}
            </span>
          </button>
        )}

        {onOpenPrinter && (
          <button
            type="button"
            onClick={onOpenPrinter}
            className="w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition active:scale-98"
          >
            <div className="flex items-center gap-2">
              <Printer className="h-3.5 w-3.5 text-sky-500" />
              <span>Receipt Printer</span>
            </div>
            <span className="text-[10px] text-muted-foreground">ESC/POS</span>
          </button>
        )}
      </div>
    </div>
  );
};

