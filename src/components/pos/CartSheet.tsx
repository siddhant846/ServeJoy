import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShoppingBag, Trash2, Plus, Minus, ChefHat, Receipt, Tag, User, Phone } from 'lucide-react';
import { toast } from 'sonner';

interface CartSheetProps {
  onOpenCheckout: (table: string, customer: { name?: string; phone?: string; note?: string }) => void;
}

export const CartSheet: React.FC<CartSheetProps> = ({ onOpenCheckout }) => {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartCount,
    cartTotal,
    cafeProfile,
    placeOrder,
  } = useApp();

  const [selectedTable, setSelectedTable] = useState<string>('Table 1');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerNote, setCustomerNote] = useState<string>('');
  const [discountCode, setDiscountCode] = useState<string>('');

  const tables = ['Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5', 'Table 6', 'Takeaway'];

  const handlePunchKot = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty!');
      return;
    }

    const orderItems = cart.map((ci) => ({
      menuItemId: ci.item.id,
      name: ci.item.name,
      price: ci.item.price,
      quantity: ci.quantity,
    }));

    placeOrder({
      tableNumber: selectedTable,
      items: orderItems,
      total: cartTotal,
      customerNote,
      customerName,
      customerPhone,
    });

    toast.success(`KOT sent to kitchen for ${selectedTable}!`, { icon: '🍳' });
    clearCart();
    setCustomerNote('');
  };

  const handleGenerateBill = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty!');
      return;
    }
    onOpenCheckout(selectedTable, {
      name: customerName,
      phone: customerPhone,
      note: customerNote,
    });
  };

  return (
    <div className="flex h-full flex-col rounded-3xl border border-border bg-card p-4 shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <ShoppingBag className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-display text-sm font-bold text-foreground">Current Order</h2>
            <p className="text-[10px] text-muted-foreground">{cartCount} items selected</p>
          </div>
        </div>

        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="flex items-center gap-1 text-[11px] font-bold text-destructive hover:underline"
          >
            <Trash2 className="h-3 w-3" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Table Selector */}
      <div className="mt-3">
        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
          Select Dining Table
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

      {/* Cart Items List */}
      <div className="mt-3 flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[320px]">
        {cart.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center text-center">
            <ShoppingBag className="h-7 w-7 text-muted-foreground/60 mb-1" />
            <p className="text-xs font-bold text-muted-foreground">Your cart is empty</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Click on any dish to start billing.
            </p>
          </div>
        ) : (
          cart.map(({ item, quantity }) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-2xl bg-secondary/50 p-2.5 border border-border/50"
            >
              <div className="flex items-center gap-2">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-10 w-10 rounded-xl object-cover"
                />
                <div>
                  <h4 className="text-xs font-bold text-foreground leading-tight line-clamp-1">
                    {item.name}
                  </h4>
                  <p className="text-[11px] font-bold text-accent mt-0.5">
                    {cafeProfile.currency}
                    {item.price * quantity}
                  </p>
                </div>
              </div>

              {/* Stepper */}
              <div className="flex items-center gap-1.5 rounded-xl bg-card px-1.5 py-0.5 border border-border">
                <button
                  onClick={() => updateCartQuantity(item.id, quantity - 1)}
                  className="flex h-5 w-5 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary transition"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="text-xs font-bold min-w-3 text-center">{quantity}</span>
                <button
                  onClick={() => updateCartQuantity(item.id, quantity + 1)}
                  className="flex h-5 w-5 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary transition"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Customer Info (Collapsible / Compact) */}
      <div className="mt-3 space-y-1.5 border-t border-border/60 pt-3">
        <input
          type="text"
          placeholder="Special Instructions / Chef note (optional)"
          value={customerNote}
          onChange={(e) => setCustomerNote(e.target.value)}
          className="w-full rounded-xl border border-border bg-secondary/50 px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      {/* Subtotal & Actions */}
      <div className="mt-3 border-t border-border/60 pt-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-muted-foreground">Order Total:</span>
          <span className="font-display text-base font-extrabold text-foreground">
            {cafeProfile.currency}
            {cartTotal}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handlePunchKot}
            disabled={cart.length === 0}
            className="flex items-center justify-center gap-1.5 rounded-2xl bg-secondary py-2.5 text-xs font-bold text-foreground hover:bg-muted transition active:scale-95 disabled:opacity-40"
          >
            <ChefHat className="h-4 w-4 text-orange-600" />
            <span>Punch KOT</span>
          </button>

          <button
            onClick={handleGenerateBill}
            disabled={cart.length === 0}
            className="flex items-center justify-center gap-1.5 rounded-2xl bg-accent py-2.5 text-xs font-bold text-white shadow-md hover:bg-accent/90 transition active:scale-95 disabled:opacity-40"
          >
            <Receipt className="h-4 w-4" />
            <span>Bill & Pay</span>
          </button>
        </div>
      </div>
    </div>
  );
};

