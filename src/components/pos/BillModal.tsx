import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Bill, PaymentMode } from '../../types';
import { X, QrCode, Banknote, CreditCard, CheckCircle2, Printer, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface BillModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber: string;
  customer: { name?: string; phone?: string; note?: string };
  onPrintReceipt: (bill: Bill) => void;
}

export const BillModal: React.FC<BillModalProps> = ({
  isOpen,
  onClose,
  tableNumber,
  customer,
  onPrintReceipt,
}) => {
  const { cart, cartTotal, cafeProfile, createBill } = useApp();
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('upi');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [completedBill, setCompletedBill] = useState<Bill | null>(null);

  if (!isOpen) return null;

  const finalAmount = Math.max(0, cartTotal - discountAmount);

  // Dynamic UPI string
  const upiString = `upi://pay?pa=${cafeProfile.upiId}&pn=${encodeURIComponent(
    cafeProfile.name
  )}&am=${finalAmount}&cu=INR&tn=${encodeURIComponent(`${tableNumber} Bill`)}`;

  const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    upiString
  )}`;

  const handleConfirmPayment = () => {
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
      customerName: customer.name,
      customerPhone: customer.phone,
      tableNumber,
      discountAmount,
    });

    setCompletedBill(bill);
    toast.success(`Bill generated successfully for ${tableNumber}!`, { icon: '🧾' });
  };

  const handleShareWhatsApp = (bill: Bill) => {
    const phone = bill.customerPhone?.replace(/\D/g, '') || '';
    const text = encodeURIComponent(
      `🧾 *${cafeProfile.name}* - Order Receipt\n` +
        `Bill: ${bill.billNumber} | Table: ${bill.tableNumber}\n` +
        `Date: ${new Date(bill.date).toLocaleString()}\n\n` +
        bill.items.map((i) => `• ${i.name} x${i.quantity} = ${cafeProfile.currency}${i.price * i.quantity}`).join('\n') +
        `\n\n*Total: ${cafeProfile.currency}${bill.total}* [Paid via ${bill.paymentMode.toUpperCase()}]\n` +
        `Thank you for visiting ${cafeProfile.name}!`
    );

    const url = phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-5 shadow-elevated">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <h3 className="font-display text-base font-bold text-foreground">
              {completedBill ? 'Receipt & Payment Done' : 'Complete Checkout'}
            </h3>
            <p className="text-[11px] text-muted-foreground">{tableNumber} • ServeJoy POS</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {completedBill ? (
          /* Post Payment Success View */
          <div className="py-4 text-center space-y-4 animate-success-pop">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div>
              <h4 className="font-display text-lg font-bold text-foreground">
                Payment Completed!
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                {completedBill.billNumber} • {cafeProfile.currency}
                {completedBill.total} received via {completedBill.paymentMode.toUpperCase()}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => onPrintReceipt(completedBill)}
                className="flex items-center justify-center gap-1.5 rounded-2xl bg-secondary py-2.5 text-xs font-bold text-foreground hover:bg-muted transition"
              >
                <Printer className="h-4 w-4" />
                <span>Print Bill</span>
              </button>

              <button
                onClick={() => handleShareWhatsApp(completedBill)}
                className="flex items-center justify-center gap-1.5 rounded-2xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
              >
                <Share2 className="h-4 w-4" />
                <span>WhatsApp</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full rounded-2xl bg-accent py-2.5 text-xs font-bold text-white shadow-md hover:bg-accent/90 transition"
            >
              Start Next Order
            </button>
          </div>
        ) : (
          /* Payment Mode & Confirmation View */
          <div className="mt-3 space-y-3.5">
            {/* Amount Summary */}
            <div className="flex items-center justify-between rounded-2xl bg-secondary/50 p-3 border border-border">
              <span className="text-xs font-bold text-muted-foreground">Bill Payable:</span>
              <span className="font-display text-xl font-extrabold text-foreground">
                {cafeProfile.currency}
                {finalAmount}
              </span>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Choose Payment Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMode('upi')}
                  className={`flex flex-col items-center gap-1.5 rounded-2xl p-2.5 border transition ${
                    paymentMode === 'upi'
                      ? 'border-accent bg-accent/10 text-accent font-bold'
                      : 'border-border bg-card text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  <QrCode className="h-5 w-5" />
                  <span className="text-xs">UPI QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMode('cash')}
                  className={`flex flex-col items-center gap-1.5 rounded-2xl p-2.5 border transition ${
                    paymentMode === 'cash'
                      ? 'border-accent bg-accent/10 text-accent font-bold'
                      : 'border-border bg-card text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  <Banknote className="h-5 w-5" />
                  <span className="text-xs">Cash</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMode('card')}
                  className={`flex flex-col items-center gap-1.5 rounded-2xl p-2.5 border transition ${
                    paymentMode === 'card'
                      ? 'border-accent bg-accent/10 text-accent font-bold'
                      : 'border-border bg-card text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  <CreditCard className="h-5 w-5" />
                  <span className="text-xs">Card / POS</span>
                </button>
              </div>
            </div>

            {/* UPI QR Display */}
            {paymentMode === 'upi' && (
              <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-3 text-neutral-900 border border-neutral-200">
                <p className="text-[10px] font-bold tracking-wider uppercase text-neutral-500 mb-1">
                  Scan with GPay / PhonePe / Paytm
                </p>
                <img
                  src={upiQrUrl}
                  alt="UPI Payment QR"
                  className="h-36 w-36 object-contain rounded-xl"
                />
                <p className="text-[11px] font-bold text-neutral-800 mt-1">
                  UPI ID: {cafeProfile.upiId}
                </p>
              </div>
            )}

            {/* Confirm Payment Button */}
            <button
              onClick={handleConfirmPayment}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-accent py-3 text-xs font-bold text-white shadow-md hover:bg-accent/90 transition active:scale-98"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Confirm Received • {cafeProfile.currency}{finalAmount}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

