import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Bill } from '../../types';
import { Search, Receipt, ArrowRight, Printer, Share2 } from 'lucide-react';

interface HistoryTabProps {
  onSelectBillForReceipt: (bill: Bill) => void;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ onSelectBillForReceipt }) => {
  const { bills, cafeProfile } = useApp();
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredBills = bills.filter((b) => {
    const q = searchQuery.toLowerCase();
    const matchNumber = b.billNumber.toLowerCase().includes(q);
    const matchCustomer =
      (b.customerName && b.customerName.toLowerCase().includes(q)) ||
      (b.customerPhone && b.customerPhone.includes(q)) ||
      (b.tableNumber && b.tableNumber.toLowerCase().includes(q));
    return matchNumber || matchCustomer;
  });

  return (
    <div className="w-full pb-36 space-y-4 animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
          Bills History
        </h2>
        <p className="text-xs text-muted-foreground">
          Recent Invoices & Transactions ({bills.length} total)
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Bill #, customer name, phone or table..."
          className="w-full rounded-2xl border border-border bg-card py-2.5 pl-10 pr-4 text-xs text-foreground placeholder:text-muted-foreground/70 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent shadow-sm"
        />
      </div>

      {/* Bills List */}
      {filteredBills.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/40 p-12 text-center">
          <Receipt className="h-10 w-10 text-muted-foreground/60 mb-2" />
          <p className="font-semibold text-foreground">No bills match your search</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Try adjusting search terms or generate a new bill from Home POS.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filteredBills.map((bill) => (
            <div
              key={bill.id}
              onClick={() => onSelectBillForReceipt(bill)}
              className="flex items-center justify-between rounded-2xl border border-border bg-card p-3.5 shadow-card hover:border-accent/60 transition cursor-pointer active:scale-98"
            >
              {/* Left Info */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-accent font-receipt font-bold text-xs">
                  #{bill.billNumber.replace(/[^0-9]/g, '').slice(-3)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-receipt font-bold text-sm text-foreground">
                      {bill.billNumber}
                    </p>
                    <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] uppercase font-semibold text-muted-foreground">
                      {bill.tableNumber || 'Takeaway'}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                        bill.status === 'paid'
                          ? 'bg-emerald-500/15 text-emerald-600'
                          : 'bg-amber-500/15 text-amber-600'
                      }`}
                    >
                      {bill.paymentMode}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(bill.date).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {bill.customerName ? ` • ${bill.customerName}` : ''}
                  </p>
                </div>
              </div>

              {/* Right Total & Arrow */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-receipt font-bold text-sm text-accent">
                    {cafeProfile.currency}
                    {bill.total}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {bill.items.length} {bill.items.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground/60" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

