import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Bill } from '../../types';
import { X, Trash2, Plus, Minus, Receipt, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBillGenerated: (bill: Bill) => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  onBillGenerated,
}) => {
  const { cart, updateCartQuantity, clearCart, createBill, cafeProfile, cartTotal, cartCount } = useApp();

  const [selectedTable, setSelectedTable] = useState<string>('Table 1');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerNote, setCustomerNote] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<'upi' | 'cash' | 'card'>('upi');

  const tables = ['Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5', 'Table 6', 'Takeaway'];

  if (!isOpen) return null;

  const handleGenerateBill = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty!');
      return;
    }

    const items = cart.map((ci) => ({
      menuItemId: ci.item.id,
      name: ci.item.name,
      price: ci.item.price,
      cost: ci.item.cost,
      quantity: ci.quantity,
    }));

    const bill = createBill({
      items,
      paymentMode,
      status: 'pending',
      customerName,
      customerPhone,
      tableNumber: selectedTable,
    });

    clearCart();
    onClose();
    onBillGenerated(bill);
    toast.success(`${bill.billNumber} created! Scan-to-pay QR code ready`, { icon: '🧾' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4 animate-fade-in">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-t-[2rem] bg-card shadow-elevated border border-border sm:rounded-3xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/80 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-display text-base sm:text-lg font-bold tracking-tight text-foreground">
                Current Order
              </h2>
              <p className="text-[10px] text-muted-foreground">{cartCount} items selected</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="flex items-center gap-1 text-[11px] font-bold text-destructive hover:underline mr-2"
              >
                <Trash2 className="h-3 w-3" />
                <span>Clear</span>
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Close cart"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:bg-muted active:scale-95 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Table Selector */}
          <div>
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Select Dining Table
            </label>
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {tables.map((t) => (
                <button
                  key={t}
                  type="button"
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
          <div className="space-y-2 max-h-56 overflow-y-auto divide-y divide-border/60">
            {cart.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <ShoppingBag className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                <p className="text-sm font-semibold">Your cart is empty.</p>
                <p className="text-xs mt-0.5">Add dishes from the menu to build a bill.</p>
              </div>
            ) : (
              cart.map((ci) => (
                <div key={ci.item.id} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span className="text-xl shrink-0">{ci.item.emoji || '🍽️'}</span>
                    <div className="min-w-0">
                      <p className="font-medium text-xs text-foreground truncate">{ci.item.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {cafeProfile.currency}{ci.item.price} each
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1.5 rounded-xl bg-secondary px-2 py-1">
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(ci.item.id, ci.quantity - 1)}
                        className="flex h-5 w-5 items-center justify-center rounded-lg hover:bg-muted text-foreground"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-xs font-bold min-w-3 text-center">{ci.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(ci.item.id, ci.quantity + 1)}
                        className="flex h-5 w-5 items-center justify-center rounded-lg hover:bg-muted text-foreground"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <span className="font-receipt font-bold text-xs text-foreground min-w-12 text-right">
                      {cafeProfile.currency}{ci.item.price * ci.quantity}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Customer Details Accordion / Inputs */}
          {cart.length > 0 && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60">
              <input
                type="text"
                placeholder="Customer Name (optional)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full rounded-xl border border-border bg-secondary/50 px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <input
                type="tel"
                placeholder="Phone (WhatsApp bill)"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                className="w-full rounded-xl border border-border bg-secondary/50 px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          )}
        </div>

        {/* Footer & Generate Bill Button */}
        {cart.length > 0 && (
          <div className="border-t border-border/80 bg-card p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-semibold">Total Payable</span>
              <span className="font-display text-lg font-extrabold text-foreground">
                {cafeProfile.currency}{cartTotal}
              </span>
            </div>

            <button
              type="button"
              onClick={handleGenerateBill}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-accent to-orange-500 py-3 text-xs font-bold text-white shadow-elevated hover:opacity-95 active:scale-95 transition"
            >
              <Receipt className="h-4 w-4" />
              <span>Generate Bill (1-Click UPI QR) →</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
