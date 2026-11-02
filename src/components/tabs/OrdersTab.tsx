import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';
import {
  ClipboardList,
  Clock,
  Printer,
  CheckCircle2,
  ChefHat,
  Utensils,
  AlertTriangle,
  Receipt,
} from 'lucide-react';
import { toast } from 'sonner';

interface OrdersTabProps {
  onOpenReceipt?: (orderId: string) => void;
}

export const OrdersTab: React.FC<OrdersTabProps> = ({ onOpenReceipt }) => {
  const { orders, updateOrderStatus, cafeProfile, convertOrderToBill } = useApp();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredOrders = orders.filter((o) => {
    if (selectedStatus === 'all') return true;
    return o.status === selectedStatus;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return { label: 'Pending', bg: 'bg-amber-500/15 text-amber-600 border-amber-500/30' };
      case 'preparing':
        return { label: 'Preparing', bg: 'bg-blue-500/15 text-blue-600 border-blue-500/30' };
      case 'ready':
        return { label: 'Ready', bg: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30' };
      case 'served':
        return { label: 'Served', bg: 'bg-purple-500/15 text-purple-600 border-purple-500/30' };
      case 'cancelled':
        return { label: 'Cancelled', bg: 'bg-red-500/15 text-red-600 border-red-500/30' };
      default:
        return { label: status, bg: 'bg-secondary text-muted-foreground border-border' };
    }
  };

  const handleNextStatus = (order: Order) => {
    if (order.status === 'pending') {
      updateOrderStatus(order.id, 'preparing');
      toast.info(`KOT #${order.kotNumber} moved to Preparing`, { icon: '🍳' });
    } else if (order.status === 'preparing') {
      updateOrderStatus(order.id, 'ready');
      toast.success(`KOT #${order.kotNumber} is Ready for pickup!`, { icon: '🔔' });
    } else if (order.status === 'ready') {
      updateOrderStatus(order.id, 'served');
      toast.success(`KOT #${order.kotNumber} marked as Served!`, { icon: '🍽️' });
    }
  };

  const handleReprint = (order: Order) => {
    toast.success(`Reprinted KOT ticket #${order.kotNumber} to thermal printer!`, { icon: '🖨️' });
  };

  return (
    <div className="mx-auto max-w-md px-3.5 py-4 lg:max-w-4xl pb-24 space-y-4 animate-fade-in">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Live Orders
          </h2>
          <p className="text-xs text-muted-foreground">
            QR Table Orders & Counter Queue ({orders.length} total)
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
        {[
          { id: 'all', label: 'All Orders' },
          { id: 'pending', label: 'Pending' },
          { id: 'preparing', label: 'Preparing' },
          { id: 'ready', label: 'Ready' },
          { id: 'served', label: 'Served' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedStatus(tab.id)}
            className={`shrink-0 rounded-2xl px-3.5 py-1.5 text-xs font-semibold transition ${
              selectedStatus === tab.id
                ? 'bg-accent text-white shadow-sm'
                : 'bg-secondary text-foreground hover:bg-muted'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Order Cards */}
      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/40 p-12 text-center">
          <ClipboardList className="h-10 w-10 text-muted-foreground/60 mb-2" />
          <p className="font-semibold text-foreground">No orders in this state</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Incoming QR scans and customer orders will appear here in real time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {filteredOrders.map((order) => {
            const isDelayed = Date.now() - new Date(order.createdAt).getTime() > 15 * 60 * 1000;
            const badge = getStatusBadge(order.status);

            return (
              <div
                key={order.id}
                className={`flex flex-col justify-between rounded-3xl border p-4 shadow-card transition-all ${
                  order.status === 'ready'
                    ? 'border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/20'
                    : order.status === 'preparing'
                    ? 'border-blue-500/40 bg-blue-50/20 dark:bg-blue-950/20'
                    : 'border-border bg-card'
                }`}
              >
                <div>
                  {/* Header: KOT and Table */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-receipt text-lg font-bold text-accent">
                        #KOT-{order.kotNumber}
                      </span>
                      <span className="rounded-lg bg-secondary px-2 py-0.5 text-xs font-bold text-foreground">
                        {order.tableNumber}
                      </span>
                    </div>

                    <button
                      onClick={() => handleReprint(order)}
                      title="Reprint KOT Ticket"
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary text-muted-foreground hover:bg-muted active:scale-90 transition"
                    >
                      <Printer className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Timing & Delay Status */}
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground font-receipt">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {isDelayed && (
                        <span className="flex items-center gap-0.5 text-[10px] font-bold text-destructive">
                          <AlertTriangle className="h-3 w-3" /> Delayed
                        </span>
                      )}
                    </div>

                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase border ${badge.bg}`}>
                      {badge.label}
                    </span>
                  </div>

                  {/* Customer Note / Chef Instructions */}
                  {order.customerNote && (
                    <div className="mt-2.5 rounded-xl bg-amber-500/10 p-2 text-xs text-amber-900 dark:text-amber-200 border border-amber-500/20">
                      <p className="font-semibold text-[10px] uppercase tracking-wide">Chef Note:</p>
                      <p className="italic text-xs">{order.customerNote}</p>
                    </div>
                  )}

                  {/* Items List */}
                  <div className="mt-3 divide-y divide-border/60 border-t border-b border-border/80 py-1 text-xs">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-1.5">
                        <span className="font-medium text-foreground">
                          {item.name} <span className="font-bold text-accent">×{item.quantity}</span>
                        </span>
                        <span className="font-receipt text-muted-foreground">
                          {cafeProfile.currency}{item.price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="font-semibold text-muted-foreground">Order Total</span>
                    <span className="font-receipt font-extrabold text-sm text-foreground">
                      {cafeProfile.currency}{order.total}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex gap-2">
                  {order.status !== 'served' && (
                    <button
                      onClick={() => handleNextStatus(order)}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-accent py-2.5 text-xs font-bold text-white shadow-sm hover:bg-accent/90 active:scale-95 transition"
                    >
                      {order.status === 'pending' && (
                        <>
                          <ChefHat className="h-3.5 w-3.5" />
                          <span>Start Preparing</span>
                        </>
                      )}
                      {order.status === 'preparing' && (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Mark Ready</span>
                        </>
                      )}
                      {order.status === 'ready' && (
                        <>
                          <Utensils className="h-3.5 w-3.5" />
                          <span>Mark Served</span>
                        </>
                      )}
                    </button>
                  )}

                  <button
                    onClick={() => {
                      const bill = convertOrderToBill(order.id, 'upi');
                      if (bill) {
                        toast.success(`Bill generated for ${order.tableNumber}!`, { icon: '🧾' });
                      }
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-2.5 text-xs font-bold text-foreground hover:bg-muted active:scale-95 transition"
                  >
                    <Receipt className="h-3.5 w-3.5" />
                    <span>Bill</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

