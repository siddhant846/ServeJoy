import React, { useState } from 'react';
import { Bill } from '../../types';
import { useApp } from '../../context/AppContext';
import { thermalPrinter } from '../../services/printerService';
import { PrinterManagerModal } from './PrinterManagerModal';
import {
  X,
  Printer,
  Bluetooth,
  Share2,
  Copy,
  Check,
  Send,
  Eye,
  FileText,
  Loader2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

interface ThermalReceiptProps {
  bill: Bill | null;
  onClose: () => void;
}

export const ThermalReceipt: React.FC<ThermalReceiptProps> = ({ bill, onClose }) => {
  const { cafeProfile, activePrinter } = useApp();

  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [showHexDump, setShowHexDump] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [phoneNumber, setPhoneNumber] = useState<string>(
    bill?.customerPhone ? bill.customerPhone.replace(/[^0-9]/g, '').slice(-10) : ''
  );
  const [isPrinterModalOpen, setIsPrinterModalOpen] = useState<boolean>(false);

  if (!bill) return null;

  const paperWidth = activePrinter?.paperWidth || '58mm';
  const escPosBytes = thermalPrinter.buildReceiptEscPos(bill, cafeProfile, paperWidth);

  // Generate text version for WhatsApp & .txt export
  const buildReceiptText = () => {
    const itemsList = bill.items
      .map((i) => `• ${i.name} x${i.quantity} — ${cafeProfile.currency}${i.price * i.quantity}`)
      .join('\n');

    const paymentText =
      bill.paymentMode === 'cash'
        ? '💵 Cash'
        : bill.paymentMode === 'upi'
        ? '📱 UPI (Online)'
        : '💳 Card';

    return (
      `🧾 *${cafeProfile.name.toUpperCase()}* — Digital Receipt\n` +
      `────────────────────────────\n` +
      `*Bill No:* ${bill.billNumber}\n` +
      `*Date:* ${new Date(bill.date).toLocaleString()}\n` +
      (bill.tableNumber ? `*Table / Order:* ${bill.tableNumber}\n` : '') +
      (bill.customerName ? `*Customer:* ${bill.customerName}\n` : '') +
      `────────────────────────────\n` +
      `*ITEMS ORDERED:*\n` +
      `${itemsList}\n` +
      `────────────────────────────\n` +
      (bill.discountAmount > 0
        ? `*Subtotal:* ${cafeProfile.currency}${bill.subtotal}\n*Discount:* -${cafeProfile.currency}${bill.discountAmount}\n`
        : '') +
      `*GRAND TOTAL:* *${cafeProfile.currency}${bill.total}*\n` +
      `*Payment:* ${paymentText}\n` +
      `────────────────────────────\n` +
      `✨ *Thank you for dining at ${cafeProfile.name}!* 😊\n` +
      (cafeProfile.address ? `📍 ${cafeProfile.address}\n` : '') +
      (cafeProfile.phone ? `📞 ${cafeProfile.phone}\n` : '') +
      `Visit again soon!`
    );
  };

  const handleSendWhatsApp = () => {
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(buildReceiptText());

    if (cleanPhone.length >= 10) {
      const fullNumber = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
      window.open(`https://wa.me/${fullNumber}?text=${text}`, '_blank');
      toast.success(`Opening WhatsApp for +${fullNumber}...`, { icon: '💬' });
    } else {
      window.open(`https://wa.me/?text=${text}`, '_blank');
      toast.info('Opening WhatsApp share chooser...', { icon: '💬' });
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(buildReceiptText());
      setIsCopied(true);
      toast.success('WhatsApp receipt copied to clipboard!', { icon: '📋' });
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error('Could not copy to clipboard');
    }
  };

  const handleShareSystem = async () => {
    const text = buildReceiptText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${cafeProfile.name} - ${bill.billNumber}`,
          text,
        });
        toast.success('Shared successfully!');
      } catch {}
    } else {
      handleCopyText();
    }
  };

  // Direct Bluetooth Print via ESC/POS
  const handleBtPrint = async () => {
    setIsPrinting(true);
    try {
      const printerName = activePrinter ? activePrinter.name : 'Thermal ESC/POS 58mm';
      const res = await thermalPrinter.printEscPosBytes(escPosBytes, printerName);

      if (res.success) {
        toast.success(res.message, { icon: '📶' });
      } else {
        toast.error(res.errorReason || res.message || 'Bluetooth print failed.');
        if (!thermalPrinter.isBluetoothSupported()) {
          setIsPrinterModalOpen(true);
        }
      }
    } catch (err: any) {
      toast.error('Bluetooth error: ' + (err.message || String(err)));
    } finally {
      setIsPrinting(false);
    }
  };

  // Save .txt file
  const handleSaveTxt = () => {
    const blob = new Blob([buildReceiptText()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${bill.billNumber.replace(/[^a-zA-Z0-9]/g, '_')}_receipt.txt`;
    a.click();
    toast.success('Receipt text file downloaded');
  };

  // System Print (PDF / AirPrint / Laser / Bluetooth via OS)
  const handleSystemPrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${bill.billNumber} - ${cafeProfile.name}</title>
          <style>
            @page { margin: 0; size: ${paperWidth} auto; }
            body {
              font-family: 'Courier New', Courier, monospace;
              width: ${paperWidth};
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
          <div class="center">${cafeProfile.address || ''}</div>
          <div class="center">Ph: ${cafeProfile.phone || ''}</div>
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

  // Convert escPosBytes to Hex preview string
  const hexPreview = Array.from(escPosBytes.slice(0, 160))
    .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
    .join(' ');

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4 backdrop-blur-sm overflow-y-auto animate-fade-in">
        <div className="w-full max-w-sm rounded-[2rem] bg-background p-4 shadow-elevated border border-border my-auto max-h-[95vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-3">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 text-xs font-semibold text-foreground/80 hover:text-foreground active:scale-95 transition"
            >
              <X className="h-4 w-4" />
              <span>Back</span>
            </button>
            <span className="font-receipt text-xs font-bold text-muted-foreground">{bill.billNumber}</span>
          </div>

          {/* Printable Receipt Card */}
          <div id="printable-receipt" className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm text-foreground space-y-3 font-sans">
            <div className="text-center space-y-1">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-accent">
                <Printer className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-bold tracking-tight text-foreground">{cafeProfile.name}</h3>
              <p className="font-receipt text-[11px] text-muted-foreground">
                {new Date(bill.date).toLocaleDateString()} •{' '}
                {new Date(bill.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="font-receipt text-sm font-bold tracking-wider text-foreground">{bill.billNumber}</p>
            </div>

            <div className="border-b border-dashed border-border" />

            {/* Items Table */}
            <div className="grid grid-cols-12 text-[11px] font-medium text-muted-foreground uppercase font-receipt">
              <span className="col-span-7">ITEM</span>
              <span className="col-span-2 text-center">QTY</span>
              <span className="col-span-3 text-right">AMOUNT</span>
            </div>

            <div className="space-y-2 font-receipt text-xs">
              {bill.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 items-start text-foreground">
                  <span className="col-span-7 font-sans font-medium line-clamp-2 leading-tight">{item.name}</span>
                  <span className="col-span-2 text-center text-muted-foreground">{item.quantity}</span>
                  <span className="col-span-3 text-right font-bold text-foreground">
                    {cafeProfile.currency}
                    {item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-b border-dashed border-border" />

            {/* Totals */}
            <div className="space-y-1.5 font-receipt">
              {bill.discountAmount > 0 && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Discount</span>
                  <span className="text-destructive">
                    -{cafeProfile.currency}
                    {bill.discountAmount}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-base font-bold text-foreground">
                <span>TOTAL</span>
                <span className="text-accent text-lg">
                  {cafeProfile.currency}
                  {bill.total}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-0.5">
                <span>Payment</span>
                <span className="font-semibold text-foreground flex items-center gap-1">
                  {bill.paymentMode === 'cash' && '💵 Cash'}
                  {bill.paymentMode === 'upi' && '📱 UPI'}
                  {bill.paymentMode === 'card' && '💳 Card'}
                </span>
              </div>
            </div>

            <div className="border-b border-dashed border-border" />
            <p className="text-center text-xs text-muted-foreground font-sans">Thank you! Visit again 😊</p>
          </div>

          {/* WhatsApp Digital Bill Section */}
          <div className="mt-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-sm">
                  <Share2 className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-bold text-foreground">WhatsApp Digital Bill</span>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                <Sparkles className="h-2.5 w-2.5" />
                Zero SMS Cost
              </span>
            </div>

            <div className="flex items-center gap-1.5 rounded-xl border border-border/80 bg-background px-2.5 py-1.5 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/30 transition">
              <span className="text-xs font-bold text-muted-foreground select-none">+91</span>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                placeholder="Enter 10-digit mobile number"
                className="w-full bg-transparent text-xs font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none font-receipt tracking-wider"
              />
              {phoneNumber && (
                <button
                  type="button"
                  onClick={() => setPhoneNumber('')}
                  className="text-[10px] font-bold text-muted-foreground hover:text-foreground px-1"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="col-span-3 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 px-3 text-xs font-bold text-white shadow-sm active:scale-98 transition"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Send WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleCopyText}
                className="col-span-1 flex items-center justify-center rounded-xl border border-border bg-card py-2 text-xs font-semibold text-foreground hover:bg-muted active:scale-95 transition"
                title="Copy formatted receipt text"
              >
                {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
              </button>

              <button
                type="button"
                onClick={handleShareSystem}
                className="col-span-1 flex items-center justify-center rounded-xl border border-border bg-card py-2 text-xs font-semibold text-foreground hover:bg-muted active:scale-95 transition"
                title="Share via other apps"
              >
                <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground/80 leading-tight">
              Sends itemized invoice, tax summary, and cafe address directly to customer's WhatsApp.
            </p>
          </div>

          {/* Bluetooth Active Printer & Manager Bar */}
          <div className="mt-2.5 flex flex-col gap-1 rounded-2xl bg-secondary/60 px-3.5 py-2.5 text-xs border border-border/60">
            <div className="flex items-center justify-between">
              <div
                onClick={() => setIsPrinterModalOpen(true)}
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition flex-1"
                title="Click to view all available printers"
              >
                <Bluetooth className={`h-4 w-4 ${activePrinter ? 'text-emerald-600' : 'text-accent'}`} />
                <div className="flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-foreground font-semibold line-clamp-1">
                    {activePrinter ? activePrinter.name : 'No printer selected'}
                  </span>
                  <span className="text-[10px] text-muted-foreground">({paperWidth})</span>
                </div>
              </div>

              <button
                onClick={() => setIsPrinterModalOpen(true)}
                className="text-xs font-bold text-accent hover:underline active:scale-95 flex items-center gap-0.5 shrink-0 ml-2"
              >
                <span>Change / Pair</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Action Buttons: PDF, BT Print, Save .txt */}
          <div className="mt-2.5 grid grid-cols-3 gap-2">
            <button
              onClick={handleSystemPrint}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-secondary/80 py-2.5 text-xs font-bold text-foreground hover:bg-muted active:scale-95 transition border border-border/50"
            >
              <Printer className="h-3.5 w-3.5 text-foreground/80" />
              <span>PDF</span>
            </button>

            <button
              onClick={handleBtPrint}
              disabled={isPrinting}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-accent/15 py-2.5 text-xs font-bold text-accent hover:bg-accent/25 active:scale-95 transition border border-accent/30 disabled:opacity-50"
            >
              {isPrinting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
                  <span>...</span>
                </>
              ) : (
                <>
                  <Bluetooth className="h-3.5 w-3.5 text-accent" />
                  <span>BT Print</span>
                </>
              )}
            </button>

            <button
              onClick={handleSaveTxt}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-secondary/80 py-2.5 text-xs font-bold text-foreground hover:bg-muted active:scale-95 transition border border-border/50"
            >
              <FileText className="h-3.5 w-3.5 text-foreground/80" />
              <span>Save .txt</span>
            </button>
          </div>

          {/* Thermal Roll Preview & Hex Dump Toggle */}
          <button
            onClick={() => setShowHexDump(!showHexDump)}
            className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-2xl bg-neutral-900 py-2.5 text-xs font-bold text-amber-300 hover:bg-neutral-800 transition active:scale-98 shadow-sm"
          >
            <Eye className="h-3.5 w-3.5 text-amber-400" />
            <span>Thermal Roll {paperWidth} Feed Preview & Hex Dump</span>
          </button>

          {showHexDump && (
            <div className="mt-2 rounded-2xl bg-neutral-950 p-3 text-neutral-300 border border-neutral-800 space-y-2 animate-fade-in text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Buffer: {escPosBytes.length} bytes ready
                </span>
                <span className="font-mono text-neutral-500">ESC/POS (Standard)</span>
              </div>
              <div className="max-h-20 overflow-y-auto rounded-xl bg-black p-2 font-mono text-[10px] text-neutral-400 border border-neutral-900 leading-relaxed break-all">
                {hexPreview} ...
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleSystemPrint}
                  className="flex-1 rounded-xl bg-amber-500 py-2 text-xs font-bold text-neutral-950 hover:bg-amber-400 transition"
                >
                  Print {paperWidth} Roll
                </button>
                <button
                  onClick={() => setShowHexDump(false)}
                  className="rounded-xl bg-neutral-800 px-3 py-2 text-xs font-semibold text-neutral-300 hover:bg-neutral-700"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Printer Manager Modal */}
      <PrinterManagerModal
        isOpen={isPrinterModalOpen}
        onClose={() => setIsPrinterModalOpen(false)}
      />
    </>
  );
};
