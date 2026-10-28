import React from 'react';
import { Bill } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, Printer } from 'lucide-react';

interface ThermalReceiptProps {
  bill: Bill | null;
  onClose: () => void;
}

export const ThermalReceipt: React.FC<ThermalReceiptProps> = ({ bill, onClose }) => {
  const { cafeProfile } = useApp();

  if (!bill) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocked. Please allow pop-ups to print the thermal receipt.');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${bill.billNumber} - ${cafeProfile.name}</title>
          <style>
            @page { margin: 0; size: 58mm auto; }
            body {
              font-family: 'Courier New', Courier, monospace;
              width: 58mm;
              margin: 0;
              padding: 6px;
              font-size: 11px;
              line-height: 1.25;
              color: #000;
              background: #fff;
            }
            .center { text-align: center; }
            .right { text-align: right; }
            .bold { font-weight: bold; }
            .title { font-size: 14px; font-weight: bold; margin-bottom: 2px; }
            .divider { border-bottom: 1px dashed #000; margin: 5px 0; }
            .item-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
            .footer { margin-top: 8px; font-size: 9px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="center title">${cafeProfile.name}</div>
          <div class="center">${cafeProfile.address}</div>
          <div class="center">Ph: ${cafeProfile.phone}</div>
          <div class="divider"></div>
          <div class="item-row">
            <span>${bill.billNumber}</span>
            <span>${bill.tableNumber || 'Takeaway'}</span>
          </div>
          <div class="item-row">
            <span>Date: ${new Date(bill.date).toLocaleDateString()}</span>
            <span>${new Date(bill.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div class="divider"></div>
          <div class="item-row bold">
            <span>ITEM [QTY]</span>
            <span>AMT</span>
          </div>
          <div class="divider"></div>
          ${bill.items
            .map(
              (i) => `
            <div class="item-row">
              <span>${i.name} x${i.quantity}</span>
              <span>${cafeProfile.currency}${i.price * i.quantity}</span>
            </div>
          `
            )
            .join('')}
          <div class="divider"></div>
          <div class="item-row">
            <span>Subtotal:</span>
            <span>${cafeProfile.currency}${bill.subtotal}</span>
          </div>
          ${
            bill.discountAmount > 0
              ? `
            <div class="item-row">
              <span>Discount:</span>
              <span>-${cafeProfile.currency}${bill.discountAmount}</span>
            </div>
          `
              : ''
          }
          <div class="item-row bold" style="font-size: 13px; margin-top: 3px;">
            <span>TOTAL:</span>
            <span>${cafeProfile.currency}${bill.total}</span>
          </div>
          <div class="item-row">
            <span>Payment Mode:</span>
            <span class="bold">${bill.paymentMode.toUpperCase()}</span>
          </div>
          <div class="divider"></div>
          <div class="footer">
            Thank you for visiting ${cafeProfile.name}!<br />
            Powered by ServeJoy POS
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-5 shadow-elevated">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <h3 className="font-display text-base font-bold text-foreground">Thermal Receipt Preview</h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 58mm Thermal Preview Container */}
        <div className="my-3 max-h-[360px] overflow-y-auto rounded-2xl bg-white p-4 font-mono text-neutral-900 shadow-inner border border-neutral-300 text-xs">
          <div className="text-center font-bold text-sm tracking-wide">{cafeProfile.name}</div>
          <div className="text-center text-[10px] text-neutral-600">{cafeProfile.address}</div>
          <div className="text-center text-[10px] text-neutral-600">Ph: {cafeProfile.phone}</div>
          <div className="my-2 border-b border-dashed border-neutral-400" />
          <div className="flex justify-between text-[11px]">
            <span>{bill.billNumber}</span>
            <span className="font-bold">{bill.tableNumber || 'Takeaway'}</span>
          </div>
          <div className="flex justify-between text-[10px] text-neutral-500">
            <span>{new Date(bill.date).toLocaleDateString()}</span>
            <span>{new Date(bill.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="my-2 border-b border-dashed border-neutral-400" />
          <div className="space-y-1">
            {bill.items.map((i) => (
              <div key={i.menuItemId} className="flex justify-between text-[11px]">
                <span>{i.name} x{i.quantity}</span>
                <span>{cafeProfile.currency}{i.price * i.quantity}</span>
              </div>
            ))}
          </div>
          <div className="my-2 border-b border-dashed border-neutral-400" />
          <div className="flex justify-between text-[11px]">
            <span>Subtotal:</span>
            <span>{cafeProfile.currency}{bill.subtotal}</span>
          </div>
          {bill.discountAmount > 0 && (
            <div className="flex justify-between text-[11px] text-red-600">
              <span>Discount:</span>
              <span>-{cafeProfile.currency}{bill.discountAmount}</span>
            </div>
          )}
          <div className="mt-1 flex justify-between font-bold text-xs pt-1 border-t border-neutral-300">
            <span>TOTAL:</span>
            <span>{cafeProfile.currency}{bill.total}</span>
          </div>
          <div className="flex justify-between text-[10px] text-neutral-600 mt-0.5">
            <span>Payment Mode:</span>
            <span className="font-bold uppercase">{bill.paymentMode}</span>
          </div>
          <div className="mt-3 text-center text-[9px] text-neutral-500">
            Thank you for dining with us!
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-2.5 text-xs font-bold text-white shadow-md hover:bg-accent/90 transition"
        >
          <Printer className="h-4 w-4" />
          <span>Print on 58mm Thermal Printer</span>
        </button>
      </div>
    </div>
  );
};

