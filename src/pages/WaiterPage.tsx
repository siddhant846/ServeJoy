import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Navbar } from '../components/common/Navbar';
import { RestaurantTable } from '../types';
import {
  UtensilsCrossed,
  Bell,
  CheckCircle2,
  Plus,
  Minus,
  ChefHat,
  Search,
  GlassWater,
  Receipt,
  UserCheck,
  Users,
  Layers,
  Trash2,
  Sparkles,
  ArrowLeft,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

interface WaiterPageProps {
  hideNavbar?: boolean;
}

export const WaiterPage: React.FC<WaiterPageProps> = ({ hideNavbar = false }) => {
  const {
    cafeProfile,
    menuItems,
    waiterRequests,
    updateWaiterRequestStatus,
    placeOrder,
    tables,
    addTable,
    addMultipleTables,
    deleteTable,
    orders,
  } = useApp();

  // Selected table for order punch
  const [selectedTable, setSelectedTable] = useState<string>(() => tables[0]?.name || 'Table 1');
  const [waiterCart, setWaiterCart] = useState<{ [id: string]: number }>({});
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [note, setNote] = useState<string>('');

  // Right side tab switcher: 'tables' (Active Tables & Order Punch) vs 'add' (Add & Bulk Tables from screenshot)
  const [rightTab, setRightTab] = useState<'tables' | 'add'>('tables');

  // Section / Floor filter for Active Tables
  const [activeSectionFilter, setActiveSectionFilter] = useState<string>('all');

  // Single Table Add form state
  const [tableName, setTableName] = useState<string>('');
  const [tableSection, setTableSection] = useState<string>('Main Hall');
  const [customSection, setCustomSection] = useState<string>('');
  const [tableCapacity, setTableCapacity] = useState<number>(4);

  // Bulk Table Add form state
  const [bulkCount, setBulkCount] = useState<number>(5);
  const [bulkPrefix, setBulkPrefix] = useState<string>('Table');
  const [bulkSection, setBulkSection] = useState<string>('Main Hall');

  // Synchronize selected table if deleted
  const tableNames = useMemo(() => tables.map((t) => t.name), [tables]);
  if (!tableNames.includes(selectedTable) && tableNames.length > 0) {
    setSelectedTable(tableNames[0]);
  }

  // Active table metadata
  const selectedTableObj = useMemo(
    () => tables.find((t) => t.name.toLowerCase() === selectedTable.toLowerCase()),
    [tables, selectedTable]
  );

  // Distinct categories from menu items
  const categories = useMemo(() => {
    const set = new Set<string>();
    menuItems.forEach((m) => {
      if (m.category) set.add(m.category);
    });
    return ['All', ...Array.from(set)];
  }, [menuItems]);

  // Distinct sections for tables
  const existingSections = useMemo(() => {
    const set = new Set<string>(['Main Hall', 'Outdoor Patio', 'VIP Lounge', 'Rooftop', 'AC Dining', 'Counter']);
    tables.forEach((t) => {
      if (t.section) set.add(t.section);
    });
    return Array.from(set);
  }, [tables]);

  const existingSectionsWithAll = useMemo(() => {
    const set = new Set<string>();
    tables.forEach((t) => {
      if (t.section) set.add(t.section);
    });
    return ['all', ...Array.from(set)];
  }, [tables]);

  // Next suggested table number
  const nextTableNumber = useMemo(() => {
    let max = 0;
    tables.forEach((t) => {
      const match = t.name.match(/Table\s*(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > max) max = num;
      }
    });
    return max + 1;
  }, [tables]);

  // Active cooking/dining orders for table state indicators
  const activeOrders = useMemo(
    () => orders.filter((o) => o.status !== 'served' && o.status !== 'cancelled'),
    [orders]
  );

  const selectedTableActiveOrder = useMemo(
    () => activeOrders.find((o) => o.tableNumber.toLowerCase() === selectedTable.toLowerCase()),
    [activeOrders, selectedTable]
  );

  const pendingRequests = waiterRequests.filter((r) => r.status === 'pending');

  // Filtered menu
  const filteredMenu = useMemo(() => {
    return menuItems.filter((i) => {
      const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || i.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [menuItems, search, selectedCategory]);

  // Filtered tables by section
  const filteredTables = useMemo(() => {
    if (activeSectionFilter === 'all') return tables;
    return tables.filter((t) => t.section === activeSectionFilter);
  }, [tables, activeSectionFilter]);

  // Cart operations
  const handleAddItem = (id: string) => {
    setWaiterCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const handleRemoveItem = (id: string) => {
    setWaiterCart((prev) => {
      const current = prev[id] || 0;
      if (current <= 1) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: current - 1 };
    });
  };

  const cartTotal = useMemo(() => {
    return Object.entries(waiterCart).reduce((sum, [id, qty]) => {
      const item = menuItems.find((m) => m.id === id);
      return sum + (item ? item.price * qty : 0);
    }, 0);
  }, [waiterCart, menuItems]);

  const totalItemsCount = useMemo(() => {
    return Object.values(waiterCart).reduce((sum, q) => sum + q, 0);
  }, [waiterCart]);

  const handlePunchOrder = () => {
    if (totalItemsCount === 0) {
      toast.error('Select at least one dish from the menu');
      return;
    }

    const items = Object.entries(waiterCart).map(([id, qty]) => {
      const item = menuItems.find((m) => m.id === id)!;
      return {
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: qty,
      };
    });

    placeOrder({
      tableNumber: selectedTable,
      items,
      total: cartTotal,
      customerNote: note,
    });

    toast.success(
      `Order placed for ${selectedTable} (${selectedTableObj?.section || 'Main Hall'})! KOT sent to Kitchen.`,
      { icon: '🍳' }
    );
    setWaiterCart({});
    setNote('');
  };

  // Single table addition
  const handleSingleTableSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalName = tableName.trim() || `Table ${nextTableNumber}`;
    const effectiveSection = tableSection === 'CUSTOM' ? (customSection.trim() || 'Main Hall') : tableSection;
    try {
      addTable({
        name: finalName,
        section: effectiveSection,
        capacity: tableCapacity,
      });
      setSelectedTable(finalName);
      setTableName('');
      toast.success(`${finalName} added in ${effectiveSection}!`, { icon: '🪑' });
      setRightTab('tables');
    } catch {
      // Handled
    }
  };

  // Bulk tables addition
  const handleBulkTableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkCount <= 0 || bulkCount > 100) {
      toast.error('Count must be between 1 and 100');
      return;
    }
    const effectiveSection = bulkSection === 'CUSTOM' ? (customSection.trim() || 'Main Hall') : bulkSection;
    const prefix = bulkPrefix.trim() || 'Table';
    try {
      addMultipleTables(bulkCount, effectiveSection, prefix);
      toast.success(`Generated ${bulkCount} tables (${prefix} in ${effectiveSection})!`, { icon: '📦' });
      setRightTab('tables');
    } catch {
      // Handled
    }
  };

  const handleDeleteTable = (table: RestaurantTable) => {
    const hasOrder = activeOrders.some((o) => o.tableNumber.toLowerCase() === table.name.toLowerCase());
    if (hasOrder) {
      toast.error(`Cannot delete ${table.name} because it has an active order cooking/dining.`);
      return;
    }
    if (confirm(`Are you sure you want to delete ${table.name}?`)) {
      deleteTable(table.id);
      toast.success(`Deleted ${table.name}`);
    }
  };

  return (
    <div className={hideNavbar ? 'pb-36 space-y-4' : 'min-h-screen bg-background pb-12'}>
      {!hideNavbar && <Navbar />}

      <main className="mx-auto max-w-[1720px] px-3 sm:px-6 lg:px-8 py-4 space-y-4">
        {/* Real-time Waiter Service Requests Alert Feed */}
        {pendingRequests.length > 0 && (
          <div className="rounded-3xl border border-red-500/30 bg-red-500/5 p-4 shadow-sm animate-fade-in">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="h-5 w-5 text-red-500 animate-bounce" />
              <h3 className="font-display text-sm font-bold text-foreground">
                Active Table Assistance Calls ({pendingRequests.length})
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between rounded-2xl bg-card p-3 border border-border shadow-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600">
                      {req.type === 'water' ? (
                        <GlassWater className="h-4 w-4 text-sky-500" />
                      ) : req.type === 'bill' ? (
                        <Receipt className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <UserCheck className="h-4 w-4 text-orange-500" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">{req.tableNumber}</h4>
                      <p className="text-[10px] text-muted-foreground capitalize">
                        Needs {req.type === 'water' ? 'Water Refill' : req.type === 'bill' ? 'Final Bill' : 'Waiter Assistance'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => updateWaiterRequestStatus(req.id, 'completed')}
                    className="flex items-center gap-1 rounded-xl bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-bold text-emerald-600 hover:bg-emerald-500 hover:text-white transition"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Attended</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* ================= LEFT SIDE: MENU & DISH SELECTION (6 COLS) ================= */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search dish to punch (e.g. Masala Chai, Burger)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-border bg-card pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent input-glow-orange"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition active:scale-95 ${
                    selectedCategory === cat
                      ? 'bg-accent text-white shadow-sm'
                      : 'bg-card border border-border text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Menu Dishes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[calc(100vh-16rem)] overflow-y-auto pr-1 sidebar-scroll">
              {filteredMenu.map((item) => {
                const qty = waiterCart[item.id] || 0;
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-2xl border border-border bg-card p-2.5 shadow-xs hover:border-accent/40 transition group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-1">
                      <div className="relative h-11 w-11 rounded-xl overflow-hidden bg-secondary shrink-0 border border-border/50">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/dishes/pav_bhaji.jpg';
                          }}
                        />
                        {!item.isAvailable && (
                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                            <span className="text-[8px] font-extrabold text-red-400 uppercase">Out</span>
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-foreground truncate group-hover:text-accent transition">
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-receipt text-xs font-black text-accent">
                            {cafeProfile.currency}
                            {item.price}
                          </span>
                          <span className="text-[10px] text-muted-foreground">({item.category})</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 rounded-full bg-secondary p-1 shrink-0">
                      {qty > 0 ? (
                        <>
                          <button
                            type="button"
                            aria-label={`Decrease ${item.name}`}
                            onClick={() => handleRemoveItem(item.id)}
                            className="h-7 w-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-black/10 transition active:scale-90"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="font-receipt text-xs font-bold min-w-4 text-center select-none">{qty}</span>
                          <button
                            type="button"
                            aria-label={`Increase ${item.name}`}
                            onClick={() => handleAddItem(item.id)}
                            className="h-7 w-7 rounded-full flex items-center justify-center text-accent hover:bg-accent/15 transition active:scale-90"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          aria-label={`Add ${item.name}`}
                          disabled={!item.isAvailable}
                          onClick={() => handleAddItem(item.id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-foreground hover:bg-accent hover:text-white rounded-full transition active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
                        >
                          <Plus className="h-3.5 w-3.5 text-accent" />
                          <span>Add</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ================= RIGHT SIDE: TABLE & FLOOR INTERFACE + ORDER PUNCH (6 COLS) ================= */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-4 max-h-[calc(100vh-6rem)] overflow-y-auto pr-1 pb-10 sidebar-scroll">
            {/* View Mode Switcher Pills */}
            <div className="flex items-center justify-between rounded-2xl bg-secondary/80 p-1 border border-border/80 shadow-xs">
              <button
                type="button"
                onClick={() => setRightTab('tables')}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-bold transition active:scale-98 ${
                  rightTab === 'tables'
                    ? 'bg-card text-foreground shadow-sm border border-border/60'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <UtensilsCrossed className="h-3.5 w-3.5 text-accent" />
                <span>Active Tables & Order ({tables.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setRightTab('add')}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-bold transition active:scale-98 ${
                  rightTab === 'add'
                    ? 'bg-card text-foreground shadow-sm border border-border/60'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Plus className="h-3.5 w-3.5 text-accent" />
                <span>Add & Bulk Tables</span>
              </button>
            </div>

            {/* Selected Target Table & KOT Punch Card */}
            <div className="rounded-3xl border-2 border-accent/40 bg-card p-4 shadow-card space-y-3">
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-border/80">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-white shadow-sm font-bold text-sm">
                    🪑
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                        Target Table:
                      </span>
                      <h4 className="text-sm font-black text-foreground font-display">
                        {selectedTable}
                      </h4>
                      <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent border border-accent/25">
                        {selectedTableObj?.section || 'Main Hall'}
                      </span>
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground border border-border flex items-center gap-1">
                        <Users className="h-2.5 w-2.5" />
                        {selectedTableObj?.capacity || 4} seats
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {selectedTableActiveOrder
                        ? `Table currently has active KOT #${selectedTableActiveOrder.kotNumber}`
                        : 'Ready to punch order for this table'}
                    </p>
                  </div>
                </div>

                {totalItemsCount > 0 && (
                  <div className="text-right">
                    <span className="font-receipt text-xs font-extrabold text-accent">
                      {totalItemsCount} {totalItemsCount === 1 ? 'dish' : 'dishes'}
                    </span>
                    <p className="font-display text-sm font-black text-foreground">
                      {cafeProfile.currency}
                      {cartTotal}
                    </p>
                  </div>
                )}
              </div>

              {/* Punch Item Details */}
              {totalItemsCount > 0 ? (
                <div className="space-y-2.5">
                  <div className="max-h-[160px] overflow-y-auto space-y-1.5 pr-1 sidebar-scroll">
                    {Object.entries(waiterCart).map(([id, qty]) => {
                      const item = menuItems.find((m) => m.id === id);
                      if (!item) return null;
                      return (
                        <div
                          key={id}
                          className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-secondary/40 border border-border/50"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-semibold text-foreground truncate">{item.name}</span>
                            <span className="font-bold text-accent font-receipt text-[11px]">x{qty}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-receipt font-bold text-foreground text-xs">
                              {cafeProfile.currency}
                              {item.price * qty}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(item.id)}
                                className="h-5 w-5 rounded-md flex items-center justify-center bg-card border border-border hover:bg-secondary text-muted-foreground"
                              >
                                <Minus className="h-2.5 w-2.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAddItem(item.id)}
                                className="h-5 w-5 rounded-md flex items-center justify-center bg-accent text-white"
                              >
                                <Plus className="h-2.5 w-2.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Chef Note Input */}
                  <input
                    type="text"
                    placeholder="Chef instruction (e.g. less oil, extra spicy, no onion)"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full rounded-xl border border-border bg-secondary/30 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                  />

                  {/* Send KOT Button */}
                  <button
                    onClick={handlePunchOrder}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-500 py-3 text-xs font-bold text-white shadow-md hover:opacity-95 active:scale-98 transition"
                  >
                    <ChefHat className="h-4 w-4" />
                    <span>
                      Send {selectedTable} Order to Kitchen ({cafeProfile.currency}
                      {cartTotal})
                    </span>
                  </button>
                </div>
              ) : (
                <div className="py-2.5 px-3 rounded-2xl bg-secondary/30 border border-dashed border-border/70 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span>👈</span>
                    <span>Tap dishes from the menu to punch order for <strong>{selectedTable}</strong></span>
                  </span>
                  <span className="text-[10px] font-semibold text-accent">0 items</span>
                </div>
              )}
            </div>

            {/* ================= TAB VIEW 1: ACTIVE TABLES BY ZONE & FLOOR ================= */}
            {rightTab === 'tables' && (
              <div className="rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-card space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/80">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-base font-bold text-foreground">
                        All Active Tables ({tables.length})
                      </h3>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        Tap table to order
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Visible in Floor Plan, POS Billing & Waiter terminals
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setRightTab('add')}
                    className="flex items-center gap-1.5 rounded-2xl bg-accent px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:opacity-95 active:scale-95 transition shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Table</span>
                  </button>
                </div>

                {/* Section / Floor / Hall Filter Pills */}
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  {existingSectionsWithAll.map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setActiveSectionFilter(sec)}
                      className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                        activeSectionFilter === sec
                          ? 'bg-accent text-white shadow-sm'
                          : 'bg-secondary text-foreground hover:bg-muted'
                      }`}
                    >
                      {sec === 'all' ? `All Zones (${tables.length})` : sec}
                    </button>
                  ))}
                </div>

                {/* Grid of Tables */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[380px] overflow-y-auto pr-1 sidebar-scroll">
                  {filteredTables.map((t) => {
                    const isSelected = selectedTable.toLowerCase() === t.name.toLowerCase();
                    const hasActiveOrder = activeOrders.some(
                      (o) => o.tableNumber.toLowerCase() === t.name.toLowerCase()
                    );
                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTable(t.name)}
                        className={`cursor-pointer rounded-2xl border p-3 transition shadow-xs flex flex-col justify-between relative group select-none ${
                          isSelected
                            ? 'border-accent bg-accent/15 ring-2 ring-accent/40 shadow-sm'
                            : 'border-border bg-secondary/30 hover:bg-secondary/60 hover:border-accent/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <h4 className="text-xs font-extrabold text-foreground truncate">{t.name}</h4>
                              {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-accent shrink-0" />}
                            </div>
                            <p className="text-[10px] font-semibold text-muted-foreground truncate">{t.section}</p>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTable(t);
                            }}
                            title={`Delete ${t.name}`}
                            className="opacity-0 group-hover:opacity-100 h-6 w-6 flex items-center justify-center rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition shrink-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-border/50 flex items-center justify-between text-[9px]">
                          <span className="text-muted-foreground flex items-center gap-1 font-semibold">
                            <Users className="h-2.5 w-2.5" />
                            <span>{t.capacity} seats</span>
                          </span>
                          {hasActiveOrder ? (
                            <span className="text-[9px] font-bold text-amber-500 bg-amber-500/15 px-1.5 py-0.5 rounded-full">
                              Active
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/15 px-1.5 py-0.5 rounded-full">
                              Free
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ================= TAB VIEW 2: ADD DINING TABLE & BULK GENERATOR (EXACT SCREENSHOT UI) ================= */}
            {rightTab === 'add' && (
              <div className="space-y-4 animate-fade-in">
                {/* Back Link */}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setRightTab('tables')}
                    className="flex items-center gap-1.5 text-xs font-bold text-accent hover:underline"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back to Active Tables & Ordering</span>
                  </button>
                </div>

                {/* 1. Add Dining Table Card */}
                <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
                  <div className="flex items-center justify-between pb-3 border-b border-border/80">
                    <div>
                      <h3 className="font-display text-base font-bold text-foreground">Add Dining Table</h3>
                      <p className="text-xs text-muted-foreground">
                        Create single or multiple tables with custom sections and seating capacity
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSingleTableSubmit()}
                      className="flex items-center gap-1.5 rounded-2xl bg-accent px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:opacity-95 transition active:scale-95 shrink-0"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>+ Quick Add Table {nextTableNumber}</span>
                    </button>
                  </div>

                  <form onSubmit={handleSingleTableSubmit} className="mt-4 space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Table Name *</label>
                        <input
                          type="text"
                          placeholder={`e.g. Table ${nextTableNumber}, Rooftop 1`}
                          value={tableName}
                          onChange={(e) => setTableName(e.target.value)}
                          className="mt-1 w-full rounded-2xl border border-border bg-secondary/30 px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Section / Zone</label>
                        <select
                          value={tableSection}
                          onChange={(e) => setTableSection(e.target.value)}
                          className="mt-1 w-full rounded-2xl border border-border bg-secondary/30 px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                        >
                          {existingSections.map((sec) => (
                            <option key={sec} value={sec}>
                              {sec}
                            </option>
                          ))}
                          <option value="CUSTOM">+ New Section</option>
                        </select>
                        {tableSection === 'CUSTOM' && (
                          <input
                            type="text"
                            placeholder="e.g. Garden, Terrace"
                            value={customSection}
                            onChange={(e) => setCustomSection(e.target.value)}
                            className="mt-2 w-full rounded-xl border border-border bg-secondary/30 px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                          />
                        )}
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Capacity (Seats)</label>
                        <div className="mt-1 flex gap-1.5">
                          {[2, 4, 6, 8].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => setTableCapacity(num)}
                              className={`flex-1 py-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1 ${
                                tableCapacity === num
                                  ? 'border-accent bg-accent text-white shadow-sm'
                                  : 'border-border bg-secondary/30 text-muted-foreground'
                              }`}
                            >
                              <Users className="h-3 w-3" />
                              <span>{num}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        className="flex items-center gap-2 rounded-2xl bg-accent px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:opacity-95 transition active:scale-95"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add {tableName.trim() || `Table ${nextTableNumber}`}</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* 2. Bulk Add Tables Card */}
                <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
                  <div className="flex items-center gap-2 pb-2 border-b border-border/80">
                    <Layers className="h-4 w-4 text-accent" />
                    <h3 className="font-display text-base font-bold text-foreground">
                      Bulk Add Tables (Add As Many As You Want)
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Need to add 10, 20, or 50 tables at once? Choose count and prefix to generate instantly.
                  </p>

                  <form onSubmit={handleBulkTableSubmit} className="mt-4 flex flex-wrap items-end gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground block mb-1">Prefix</label>
                      <input
                        type="text"
                        value={bulkPrefix}
                        onChange={(e) => setBulkPrefix(e.target.value)}
                        placeholder="Table"
                        className="w-28 rounded-2xl border border-border bg-secondary/30 px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground block mb-1">Zone / Section</label>
                      <select
                        value={bulkSection}
                        onChange={(e) => setBulkSection(e.target.value)}
                        className="rounded-2xl border border-border bg-secondary/30 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      >
                        {existingSections.map((sec) => (
                          <option key={sec} value={sec}>
                            {sec}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground block mb-1">Count to Add</label>
                      <div className="flex items-center gap-1.5">
                        {[5, 10, 20].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setBulkCount(n)}
                            className={`px-3 py-2 rounded-xl border text-xs font-bold transition ${
                              bulkCount === n
                                ? 'border-accent bg-accent text-white'
                                : 'border-border bg-secondary/30 text-muted-foreground'
                            }`}
                          >
                            +{n}
                          </button>
                        ))}
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={bulkCount}
                          onChange={(e) => setBulkCount(parseInt(e.target.value, 10) || 1)}
                          className="w-16 rounded-xl border border-border bg-secondary/30 px-2 py-2 text-xs text-foreground font-bold focus:outline-none focus:ring-2 focus:ring-accent text-center"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-500 px-5 py-2 text-xs font-bold text-white shadow-sm hover:opacity-95 transition active:scale-95"
                    >
                      <Layers className="h-4 w-4" />
                      <span>
                        Generate {bulkCount} Tables ({bulkPrefix} {nextTableNumber} to {bulkPrefix}{' '}
                        {nextTableNumber + bulkCount - 1})
                      </span>
                    </button>
                  </form>
                </div>

                {/* 3. All Active Tables Card Underneath */}
                <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
                  <div className="flex items-center justify-between pb-3 border-b border-border/80">
                    <h3 className="font-display text-base font-bold text-foreground">
                      All Active Tables ({tables.length})
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      Visible in Floor Plan, POS Billing & Waiter terminals
                    </span>
                  </div>

                  <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {tables.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between rounded-2xl border border-border bg-secondary/30 p-3 shadow-xs hover:border-accent/40 transition"
                      >
                        <div>
                          <h4 className="text-xs font-bold text-foreground">{t.name}</h4>
                          <p className="text-[10px] text-muted-foreground">{t.section}</p>
                          <p className="text-[9px] text-muted-foreground/80 flex items-center gap-1 mt-0.5">
                            <Users className="h-2.5 w-2.5" />
                            <span>{t.capacity} seats</span>
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteTable(t)}
                          title={`Delete ${t.name}`}
                          className="h-7 w-7 flex items-center justify-center rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
