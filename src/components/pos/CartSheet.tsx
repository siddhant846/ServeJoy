import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { ShoppingBag, Trash2, Plus, Minus, ChefHat, Receipt, Tag, User, Phone, X } from 'lucide-react';
import { toast } from 'sonner';

interface CartSheetProps {
  onGenerateBill: (table: string, customer: { name?: string; phone?: string; note?: string }) => void;
  onClose?: () => void;
}

export const CartSheet: React.FC<CartSheetProps> = ({ onGenerateBill, onClose }) => {
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
  const [isBouncing, setIsBouncing] = useState<boolean>(false);
  const prevCountRef = useRef(cartCount);

  useEffect(() => {
    if (cartCount > prevCountRef.current) {
      setIsBouncing(true);
      const timer = setTimeout(() => setIsBouncing(false), 500);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = cartCount;
  }, [cartCount]);

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
    if (onClose) onClose();
  };

  const handleGenerateBill = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty!');
      return;
    }
    if (onClose) onClose();
    onGenerateBill(selectedTable, {
      name: customerName,
      phone: customerPhone,
      note: customerNote,
    });
  };

  return (
    <div id="cart-sheet-section" className="flex h-full flex-col rounded-3xl border border-border bg-card p-4 shadow-card scroll-mt-20">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div
            id="pos-cart-target"
            className={`flex h-8 w-8 items-center justify-center rounded-xl bg-accent/10 text-accent transition-transform duration-300 ${
              isBouncing ? 'animate-cart-bounce' : ''
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-display text-sm font-bold text-foreground">Current Order</h2>
            <p className="text-[10px] text-muted-foreground">{cartCount} items selected</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="flex items-center gap-1 text-[11px] font-bold text-destructive hover:underline"
            >
              <Trash2 className="h-3 w-3" />
              <span>Clear</span>
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:bg-muted transition active:scale-90"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
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
                  <p className="font-receipt text-[11px] font-bold text-accent mt-0.5">
                    {cafeProfile.currency}
                    {item.price * quantity}
                  </p>
                </div>
              </div>

              {/* Stepper */}
              <div className="flex items-center gap-1 rounded-xl bg-card px-1 py-0.5 border border-border">
                <button
                  type="button"
                  aria-label={`Decrease ${item.name}`}
                  onClick={() => updateCartQuantity(item.id, quantity - 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition active:scale-90"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="font-receipt text-xs font-bold min-w-4 text-center select-none">{quantity}</span>
                <button
                  type="button"
                  aria-label={`Increase ${item.name}`}
                  onClick={() => updateCartQuantity(item.id, quantity + 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition active:scale-90"
                >
                  <Plus className="h-3.5 w-3.5" />
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
          className="w-full rounded-xl border border-border bg-secondary/50 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent input-glow-orange"
        />
      </div>

      {/* Subtotal & Actions */}
      <div className="mt-3 border-t border-border/60 pt-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-muted-foreground">Order Total:</span>
          <span className="font-receipt text-lg font-extrabold text-foreground">
            {cafeProfile.currency}
            {cartTotal}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={handlePunchKot}
            disabled={cart.length === 0}
            className="flex items-center justify-center gap-1.5 rounded-2xl bg-secondary py-3 min-h-[44px] text-xs font-bold text-foreground border border-border/60 hover:bg-muted transition active:scale-98 disabled:opacity-40"
          >
            <ChefHat className="h-4 w-4 text-orange-600" />
            <span>Punch KOT</span>
          </button>

          <button
            onClick={handleGenerateBill}
            disabled={cart.length === 0}
            className="flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-[#ea580c] to-[#f97316] py-3 min-h-[44px] text-xs font-bold text-white shadow-[0_8px_20px_rgba(234,88,12,0.3)] hover:brightness-105 transition active:scale-98 disabled:opacity-40"
          >
            <Receipt className="h-4 w-4" />
            <span>Bill & Pay</span>
          </button>
        </div>
      </div>
    </div>
  );
};

