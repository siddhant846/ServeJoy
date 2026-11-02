import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Eye, EyeOff, IndianRupee, Receipt, Award, TrendingUp, Share2 } from 'lucide-react';
import { toast } from 'sonner';

export const TodaySummary: React.FC = () => {
  const { todayRevenue, todayProfit, todayBills, bestSellerItem, cafeProfile } = useApp();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `📊 *${cafeProfile.name} Daily Summary*\n` +
        `📅 Date: ${new Date().toLocaleDateString('en-IN')}\n\n` +
        `💰 Total Sales: ${cafeProfile.currency}${todayRevenue}\n` +
        `🧾 Total Bills: ${todayBills.length}\n` +
        `📈 Net Profit: ${cafeProfile.currency}${todayProfit}\n` +
        `⭐ Top Seller: ${bestSellerItem ? `${bestSellerItem.name} (${bestSellerItem.count})` : 'N/A'}\n\n` +
        `Generated with ServeJoy Café POS`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
    toast.success('WhatsApp summary prepared!');
  };

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-card transition-all">
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">📊</span>
          <h2 className="text-xs font-bold uppercase tracking-wider text-foreground/80">
            Today's Summary
          </h2>
          <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[9px] font-bold text-accent">
            BUSINESS
          </span>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? 'Collapse summary' : 'Expand summary'}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground transition hover:bg-muted active:scale-95"
        >
          {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      {/* Card Body */}
      {isExpanded ? (
        <div className="mt-4 space-y-3 animate-fade-in">
          <div className="grid grid-cols-2 gap-2.5">
            {/* Today's Sales */}
            <div className="rounded-xl bg-secondary/50 p-2.5 border border-border/50">
              <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                <IndianRupee className="h-3.5 w-3.5 text-accent" />
                <span>Today's Sales</span>
              </div>
              <p className="mt-1 font-receipt text-lg font-bold text-foreground">
                {cafeProfile.currency}
                {todayRevenue}
              </p>
            </div>

            {/* Total Bills */}
            <div className="rounded-xl bg-secondary/50 p-2.5 border border-border/50">
              <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                <Receipt className="h-3.5 w-3.5 text-blue-500" />
                <span>Total Bills</span>
              </div>
              <p className="mt-1 font-receipt text-lg font-bold text-foreground">
                {todayBills.length}
              </p>
            </div>

            {/* Best Seller */}
            <div className="rounded-xl bg-secondary/50 p-2.5 border border-border/50">
              <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                <Award className="h-3.5 w-3.5 text-amber-500" />
                <span>Best Seller</span>
              </div>
              <p className="mt-1 truncate font-sans text-xs font-semibold text-foreground">
                {bestSellerItem ? `${bestSellerItem.name} (${bestSellerItem.count})` : 'Pav Bhaji'}
              </p>
            </div>

            {/* Net Profit */}
            <div className="rounded-xl bg-secondary/50 p-2.5 border border-border/50">
              <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                <span>Net Profit</span>
              </div>
              <p className="mt-1 font-receipt text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {cafeProfile.currency}
                {todayProfit}
              </p>
            </div>
          </div>

          <button
            onClick={handleShareWhatsApp}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600/10 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-600/20 dark:text-emerald-400"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Share Summary on WhatsApp</span>
          </button>
        </div>
      ) : (
        <div className="mt-2 text-xs text-muted-foreground leading-relaxed">
          {todayBills.length === 0 ? (
            <p>No sales yet today. Your summary will appear here as orders come in.</p>
          ) : (
            <div className="flex items-center justify-between pt-1">
              <span>
                Sales: <strong className="text-foreground">{cafeProfile.currency}{todayRevenue}</strong> ({todayBills.length} bills)
              </span>
              <span
                className="text-accent text-[11px] font-medium underline cursor-pointer"
                onClick={() => setIsExpanded(true)}
              >
                View details
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

