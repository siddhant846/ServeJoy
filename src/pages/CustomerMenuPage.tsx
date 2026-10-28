import React, { useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { MenuItem } from '../../types';
import {
  Coffee,
  Plus,
  Minus,
  ShoppingBag,
  Bell,
  GlassWater,
  Receipt,
  UserCheck,
  CheckCircle2,
  X,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';

export const CustomerMenuPage: React.FC = () => {
  const { userId } = useParams();
  const [searchParams] = useSearchParams();
  const tableParam = searchParams.get('table') || 'Table 1';

  const {
    cafeProfile,
    menuItems,
    placeOrder,
    callWaiter,
  } = useApp();

  const [customerTable, setCustomerTable] = useState<string>(tableParam);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customerCart, setCustomerCart] = useState<{ [id: string]: number }>({});
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerNote, setCustomerNote] = useState<string>('');
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState<boolean>(false);
  const [placedOrderKot, setPlacedOrderKot] = useState<string>('');
  const [isCallWaiterOpen, setIsCallWaiterOpen] = useState<boolean>(false);

  const categories = useMemo(() => {
    const set = new Set<string>();
    menuItems.forEach((i) => set.add(i.category));
    return ['All', ...Array.from(set)];
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (!item.isAvailable) return false;
      const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  const handleAddItem = (id: string) => {
    setCustomerCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const handleRemoveItem = (id: string) => {
    setCustomerCart((prev) => {
      const cur = prev[id] || 0;
      if (cur <= 1) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: cur - 1 };
    });
  };

  const cartTotal = Object.entries(customerCart).reduce((sum, [id, qty]) => {
    const item = menuItems.find((m) => m.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const totalItemCount = Object.values(customerCart).reduce((sum, q) => sum + q, 0);

  const handlePlaceOrder = () => {
    if (totalItemCount === 0) {
      toast.error('Your cart is empty');
      return;
    }

    const items = Object.entries(customerCart).map(([id, qty]) => {
      const item = menuItems.find((m) => m.id === id)!;
      return {
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: qty,
      };
    });

    const order = placeOrder({
      tableNumber: customerTable,
      items,
      total: cartTotal,
      customerNote,
      customerName,
      customerPhone,
    });

    setPlacedOrderKot(order.kotNumber);
    setIsOrderPlaced(true);
    setIsCartOpen(false);
    setCustomerCart({});
    toast.success(`Order placed! Kitchen is preparing your dishes.`, { icon: '🍽️' });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Top Banner */}
      <div className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur-md px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#372215] to-[#653520] text-amber-200 shadow-sm">
              <Coffee className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-sm font-bold text-foreground">
                {cafeProfile.name}
              </h1>
              <span className="inline-block rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-extrabold text-accent">
                {customerTable}
              </span>
            </div>
          </div>

          {/* Call Waiter Button */}
          <button
            onClick={() => setIsCallWaiterOpen(true)}
            className="flex items-center gap-1.5 rounded-2xl bg-secondary px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted transition"
          >
            <Bell className="h-3.5 w-3.5 text-accent" />
            <span>Call Waiter</span>
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-md px-4 py-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tea, snacks, dessert..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-border bg-card pl-10 pr-4 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                selectedCategory === cat
                  ? 'bg-accent text-white shadow-sm'
                  : 'bg-card border border-border text-muted-foreground hover:bg-secondary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Items */}
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const qty = customerCart[item.id] || 0;
            return (
              <div
                key={item.id}
                className="flex gap-3 rounded-3xl border border-border bg-card p-3 shadow-card"
              >
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-secondary">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute bottom-1 right-1 rounded-full bg-black/60 px-1.5 py-0.2 text-[9px] font-bold text-white">
                    {item.emoji}
                  </span>
                </div>

                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <h3 className="font-display text-sm font-bold text-foreground leading-snug">
                      {item.name}
                    </h3>
                    <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-display text-sm font-extrabold text-foreground">
                      {cafeProfile.currency}
                      {item.price}
                    </span>

                    {qty > 0 ? (
                      <div className="flex items-center gap-2 rounded-xl bg-accent px-2 py-1 text-white shadow-sm">
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="h-5 w-5 flex items-center justify-center hover:bg-black/20 rounded"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs font-bold min-w-3 text-center">{qty}</span>
                        <button
                          onClick={() => handleAddItem(item.id)}
                          className="h-5 w-5 flex items-center justify-center hover:bg-black/20 rounded"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAddItem(item.id)}
                        className="flex items-center gap-1 rounded-xl bg-secondary px-3 py-1.5 text-xs font-bold text-foreground hover:bg-accent hover:text-white transition"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Floating Bottom Cart Bar */}
      {totalItemCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-md animate-slide-up">
          <div className="flex items-center justify-between rounded-3xl bg-neutral-900 p-3.5 text-white shadow-elevated border border-neutral-800">
            <div>
              <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">
                {totalItemCount} items in cart
              </p>
              <p className="font-display text-base font-extrabold text-white">
                {cafeProfile.currency}
                {cartTotal}
              </p>
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-1.5 rounded-2xl bg-accent px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-accent/90 transition"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Review & Order</span>
            </button>
          </div>
        </div>
      )}

      {/* Cart Review Sheet Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-border bg-card p-5 shadow-elevated max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-display text-base font-bold text-foreground">
                Confirm Order • {customerTable}
              </h3>
              <button
                onClick={() => setIsCartOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 space-y-2 max-h-[220px] overflow-y-auto">
              {Object.entries(customerCart).map(([id, qty]) => {
                const item = menuItems.find((m) => m.id === id);
                if (!item) return null;
                return (
                  <div
                    key={id}
                    className="flex items-center justify-between py-1.5 border-b border-border/40 text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-foreground">{item.name}</h4>
                      <p className="text-[11px] text-accent font-semibold">
                        {cafeProfile.currency}
                        {item.price * qty}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 rounded-xl bg-secondary px-1.5 py-0.5">
                      <button
                        onClick={() => handleRemoveItem(id)}
                        className="h-5 w-5 rounded hover:bg-black/10 flex items-center justify-center"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-xs font-bold min-w-3 text-center">{qty}</span>
                      <button
                        onClick={() => handleAddItem(id)}
                        className="h-5 w-5 rounded hover:bg-black/10 flex items-center justify-center"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 space-y-2">
              <input
                type="text"
                placeholder="Your Name (optional)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full rounded-xl border border-border bg-secondary/50 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <input
                type="text"
                placeholder="Kitchen note (e.g. less spicy, extra hot chai)"
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                className="w-full rounded-xl border border-border bg-secondary/50 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Total:</span>
                <p className="font-display text-lg font-extrabold text-foreground">
                  {cafeProfile.currency}
                  {cartTotal}
                </p>
              </div>

              <button
                onClick={handlePlaceOrder}
                className="flex items-center gap-1.5 rounded-2xl bg-accent px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-accent/90"
              >
                <span>Place Order to Kitchen</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Call Waiter Modal */}
      {isCallWaiterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-xs rounded-3xl border border-border bg-card p-5 shadow-elevated text-center space-y-3">
            <h3 className="font-display text-base font-bold text-foreground">Need Assistance?</h3>
            <p className="text-xs text-muted-foreground">Select your request for {customerTable}:</p>

            <div className="grid grid-cols-1 gap-2 pt-1">
              <button
                onClick={() => {
                  callWaiter(customerTable, 'water');
                  setIsCallWaiterOpen(false);
                }}
                className="flex items-center justify-center gap-2 rounded-2xl bg-secondary py-2.5 text-xs font-bold text-foreground hover:bg-muted"
              >
                <GlassWater className="h-4 w-4 text-sky-500" />
                <span>Request Water Refill</span>
              </button>

              <button
                onClick={() => {
                  callWaiter(customerTable, 'waiter');
                  setIsCallWaiterOpen(false);
                }}
                className="flex items-center justify-center gap-2 rounded-2xl bg-secondary py-2.5 text-xs font-bold text-foreground hover:bg-muted"
              >
                <UserCheck className="h-4 w-4 text-orange-500" />
                <span>Call Table Waiter</span>
              </button>

              <button
                onClick={() => {
                  callWaiter(customerTable, 'bill');
                  setIsCallWaiterOpen(false);
                }}
                className="flex items-center justify-center gap-2 rounded-2xl bg-secondary py-2.5 text-xs font-bold text-foreground hover:bg-muted"
              >
                <Receipt className="h-4 w-4 text-emerald-500" />
                <span>Request Bill & Payment</span>
              </button>
            </div>

            <button
              onClick={() => setIsCallWaiterOpen(false)}
              className="w-full text-xs text-muted-foreground pt-1"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Order Placed Success Modal */}
      {isOrderPlaced && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-elevated text-center space-y-3 animate-success-pop">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground">
              Order Placed Successfully!
            </h3>
            <p className="text-xs text-muted-foreground">
              Your order (KOT #{placedOrderKot}) has been sent directly to the kitchen. Please relax while we prepare your fresh meal!
            </p>
            <button
              onClick={() => setIsOrderPlaced(false)}
              className="w-full rounded-2xl bg-accent py-2.5 text-xs font-bold text-white shadow-md hover:bg-accent/90"
            >
              Back to Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

