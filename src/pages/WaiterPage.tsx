import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Navbar } from '../../components/common/Navbar';
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
} from 'lucide-react';
import { toast } from 'sonner';

export const WaiterPage: React.FC = () => {
  const {
    cafeProfile,
    menuItems,
    waiterRequests,
    updateWaiterRequestStatus,
    placeOrder,
  } = useApp();

  const [selectedTable, setSelectedTable] = useState<string>('Table 2');
  const [waiterCart, setWaiterCart] = useState<{ [id: string]: number }>({});
  const [search, setSearch] = useState<string>('');
  const [note, setNote] = useState<string>('');

  const tables = ['Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5', 'Table 6', 'Takeaway'];

  const pendingRequests = waiterRequests.filter((r) => r.status === 'pending');

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

  const cartTotal = Object.entries(waiterCart).reduce((sum, [id, qty]) => {
    const item = menuItems.find((m) => m.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const totalItemsCount = Object.values(waiterCart).reduce((sum, q) => sum + q, 0);

  const handlePunchOrder = () => {
    if (totalItemsCount === 0) {
      toast.error('Select at least one dish');
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

    toast.success(`Order placed for ${selectedTable}! KOT sent to Kitchen.`, { icon: '🍳' });
    setWaiterCart({});
    setNote('');
  };

  const filteredMenu = menuItems.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-3 sm:px-6 py-4 space-y-4">
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Menu Selection (Left 7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search menu item to punch..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-border bg-card pl-10 pr-4 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            {/* Menu List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[580px] overflow-y-auto pr-1">
              {filteredMenu.map((item) => {
                const qty = waiterCart[item.id] || 0;
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-2xl border border-border bg-card p-2.5 shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-10 w-10 rounded-xl object-cover"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-foreground line-clamp-1">
                          {item.name}
                        </h4>
                        <span className="text-[11px] font-bold text-accent">
                          {cafeProfile.currency}
                          {item.price}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 rounded-xl bg-secondary px-1.5 py-0.5">
                      {qty > 0 ? (
                        <>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="h-5 w-5 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-black/10"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-xs font-bold min-w-3 text-center">{qty}</span>
                          <button
                            onClick={() => handleAddItem(item.id)}
                            className="h-5 w-5 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-black/10"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleAddItem(item.id)}
                          className="flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-foreground hover:text-accent"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Add</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Table Punch-in Form (Right 5 cols) */}
          <div className="lg:col-span-5 rounded-3xl border border-border bg-card p-4 shadow-card flex flex-col justify-between">
            <div>
              <h3 className="font-display text-sm font-bold text-foreground pb-2 border-b border-border">
                Table Order Summary
              </h3>

              {/* Table Selector */}
              <div className="mt-3">
                <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">
                  Target Table
                </label>
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  {tables.map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedTable(t)}
                      className={`shrink-0 rounded-xl px-2.5 py-1 text-xs font-semibold transition ${
                        selectedTable === t
                          ? 'bg-accent text-white shadow-sm'
                          : 'bg-secondary text-foreground hover:bg-muted'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Punch-in items list */}
              <div className="mt-3 space-y-1.5 max-h-[220px] overflow-y-auto">
                {totalItemsCount === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">
                    Tap dishes to add to this order.
                  </p>
                ) : (
                  Object.entries(waiterCart).map(([id, qty]) => {
                    const item = menuItems.find((m) => m.id === id);
                    if (!item) return null;
                    return (
                      <div
                        key={id}
                        className="flex justify-between items-center text-xs py-1 border-b border-border/40"
                      >
                        <span className="font-medium text-foreground">
                          {item.name} <span className="font-bold text-accent">x{qty}</span>
                        </span>
                        <span className="font-bold text-foreground">
                          {cafeProfile.currency}
                          {item.price * qty}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Note */}
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Chef instruction (e.g. less oil, spicy)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full rounded-xl border border-border bg-secondary/50 px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>

            {/* Total & Action */}
            <div className="mt-4 pt-3 border-t border-border space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-muted-foreground">Order Total:</span>
                <span className="font-display text-base font-extrabold text-foreground">
                  {cafeProfile.currency}
                  {cartTotal}
                </span>
              </div>

              <button
                onClick={handlePunchOrder}
                disabled={totalItemsCount === 0}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-accent py-3 text-xs font-bold text-white shadow-md hover:bg-accent/90 transition active:scale-98 disabled:opacity-40"
              >
                <ChefHat className="h-4 w-4" />
                <span>Send {selectedTable} Order to Kitchen</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

