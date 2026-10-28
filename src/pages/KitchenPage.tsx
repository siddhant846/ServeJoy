import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Navbar } from '../../components/common/Navbar';
import { ChefHat, Clock, CheckCircle2, Flame, AlertTriangle, Volume2 } from 'lucide-react';
import { OrderStatus } from '../../types';

export const KitchenPage: React.FC = () => {
  const { orders, updateOrderStatus, cafeProfile } = useApp();
  const [filter, setFilter] = useState<'active' | 'preparing' | 'ready' | 'all'>('active');

  const filteredOrders = orders.filter((o) => {
    if (filter === 'active') return o.status === 'pending' || o.status === 'preparing';
    if (filter === 'preparing') return o.status === 'preparing';
    if (filter === 'ready') return o.status === 'ready';
    return true; // all
  });

  const getElapsedTime = (isoString: string) => {
    const elapsedMinutes = Math.floor((Date.now() - new Date(isoString).getTime()) / 60000);
    if (elapsedMinutes < 1) return 'Just now';
    if (elapsedMinutes === 1) return '1 min ago';
    return `${elapsedMinutes} mins ago`;
  };

  const isDelayed = (isoString: string) => {
    const elapsedMinutes = Math.floor((Date.now() - new Date(isoString).getTime()) / 60000);
    return elapsedMinutes >= 15;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-3 sm:px-6 py-4 space-y-4">
        {/* Top Header & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-600">
              <ChefHat className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">
                Kitchen Order Tickets (KOT)
              </h2>
              <p className="text-xs text-muted-foreground">Live real-time order cooking queue</p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {(['active', 'preparing', 'ready', 'all'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold capitalize transition ${
                  filter === tab
                    ? 'bg-accent text-white shadow-sm'
                    : 'bg-card border border-border text-muted-foreground hover:bg-secondary'
                }`}
              >
                {tab === 'active' ? '🔥 Active Queue' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* KOT Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredOrders.map((order) => {
            const delayed = isDelayed(order.createdAt);
            return (
              <div
                key={order.id}
                className={`flex flex-col justify-between rounded-3xl border bg-card p-4 shadow-card transition ${
                  order.status === 'ready'
                    ? 'border-emerald-500/40 bg-emerald-500/5'
                    : order.status === 'preparing'
                    ? 'border-orange-500/40 bg-orange-500/5'
                    : delayed
                    ? 'border-red-500/50 bg-red-500/5 animate-pulse'
                    : 'border-border'
                }`}
              >
                {/* Header */}
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-border/60">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-base font-extrabold text-foreground">
                        {order.tableNumber}
                      </span>
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                        KOT #{order.kotNumber}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-bold">
                      <Clock className={`h-3.5 w-3.5 ${delayed ? 'text-red-500' : 'text-muted-foreground'}`} />
                      <span className={delayed ? 'text-red-600 font-extrabold' : 'text-muted-foreground'}>
                        {getElapsedTime(order.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Customer Special Note */}
                  {order.customerNote && (
                    <div className="my-2 rounded-2xl bg-amber-500/10 p-2.5 text-xs text-amber-800 dark:text-amber-200 border border-amber-500/30 flex items-start gap-1.5">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                      <div>
                        <span className="font-bold">Chef Note: </span>
                        <span>{order.customerNote}</span>
                      </div>
                    </div>
                  )}

                  {/* Items Checklist */}
                  <div className="mt-3 space-y-2">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs py-1 border-b border-border/30 last:border-0"
                      >
                        <span className="font-semibold text-foreground">
                          {item.name}
                        </span>
                        <span className="font-display text-sm font-extrabold text-accent">
                          x{item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Actions */}
                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ${
                      order.status === 'ready'
                        ? 'bg-emerald-500/20 text-emerald-600'
                        : order.status === 'preparing'
                        ? 'bg-orange-500/20 text-orange-600'
                        : order.status === 'served'
                        ? 'bg-secondary text-muted-foreground'
                        : 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'
                    }`}
                  >
                    {order.status}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                        className="flex items-center gap-1 rounded-xl bg-orange-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-orange-700 transition"
                      >
                        <Flame className="h-3.5 w-3.5" />
                        <span>Start Cooking</span>
                      </button>
                    )}

                    {order.status === 'preparing' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                        className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Mark Ready</span>
                      </button>
                    )}

                    {order.status === 'ready' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'served')}
                        className="flex items-center gap-1 rounded-xl bg-secondary px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted transition"
                      >
                        <span>Mark Served</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredOrders.length === 0 && (
          <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card text-center">
            <ChefHat className="h-10 w-10 text-muted-foreground/60 mb-2" />
            <h3 className="font-display text-sm font-bold text-foreground">All Orders Prepared!</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              The kitchen queue is completely clear.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

