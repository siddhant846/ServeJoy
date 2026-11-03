import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { RestaurantTable } from '../../types';
import { AddTableModal } from './AddTableModal';
import {
  Users,
  Clock,
  Sparkles,
  Utensils,
  Receipt,
  Bell,
  CheckCircle2,
  Plus,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

interface FloorPlanProps {
  onStartOrderForTable: (tableName: string) => void;
}

export const FloorPlan: React.FC<FloorPlanProps> = ({ onStartOrderForTable }) => {
  const { tables, deleteTable, orders, waiterRequests, convertOrderToBill, updateWaiterRequestStatus, cafeProfile } = useApp();
  const [activeSection, setActiveSection] = useState<string>('all');
  const [selectedTableData, setSelectedTableData] = useState<RestaurantTable | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Dynamic sections derived from existing tables
  const sections = useMemo(() => {
    const set = new Set<string>();
    tables.forEach((t) => {
      if (t.section) set.add(t.section);
    });
    return ['all', ...Array.from(set)];
  }, [tables]);

  // Map each table to its live state
  const tableStateMap = useMemo(() => {
    const map = new Map<
      string,
      {
        activeOrder: any;
        waiterRequest: any;
        status: 'available' | 'cooking' | 'dining' | 'bill_requested' | 'waiter_called';
        durationMinutes: number;
      }
    >();

    tables.forEach((table) => {
      const activeOrder =
        orders.find(
          (o) =>
            o.tableNumber.toLowerCase() === table.name.toLowerCase() &&
            o.status !== 'served' &&
            o.status !== 'cancelled'
        ) || null;

      const waiterRequest =
        waiterRequests.find(
          (r) =>
            r.tableNumber.toLowerCase() === table.name.toLowerCase() &&
            r.status !== 'completed'
        ) || null;

      let status: 'available' | 'cooking' | 'dining' | 'bill_requested' | 'waiter_called' = 'available';
      let durationMinutes = 0;

      if (waiterRequest && waiterRequest.type === 'bill') {
        status = 'bill_requested';
      } else if (waiterRequest && waiterRequest.status === 'pending') {
        status = 'waiter_called';
      } else if (activeOrder) {
        if (activeOrder.status === 'pending' || activeOrder.status === 'preparing') {
          status = 'cooking';
        } else if (activeOrder.status === 'ready' || activeOrder.status === 'served') {
          status = 'dining';
        }
        durationMinutes = Math.max(
          1,
          Math.floor((Date.now() - new Date(activeOrder.createdAt).getTime()) / 60000)
        );
      }

      map.set(table.name, { activeOrder, waiterRequest, status, durationMinutes });
    });

    return map;
  }, [tables, orders, waiterRequests]);

  // Status counts
  const counts = useMemo(() => {
    let available = 0;
    let cooking = 0;
    let dining = 0;
    let billReq = 0;
    let waiterCall = 0;

    tableStateMap.forEach((info) => {
      if (info.status === 'available') available++;
      else if (info.status === 'cooking') cooking++;
      else if (info.status === 'dining') dining++;
      else if (info.status === 'bill_requested') billReq++;
      else if (info.status === 'waiter_called') waiterCall++;
    });

    return { available, cooking, dining, billReq, waiterCall };
  }, [tableStateMap]);

  const filteredTables = useMemo(() => {
    if (activeSection === 'all') return tables;
    return tables.filter((t) => t.section === activeSection);
  }, [tables, activeSection]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'cooking':
        return { label: 'Cooking', bg: 'bg-amber-500/15 text-amber-600 border-amber-500/30' };
      case 'dining':
        return { label: 'Dining', bg: 'bg-blue-500/15 text-blue-600 border-blue-500/30' };
      case 'bill_requested':
        return { label: 'Bill Req', bg: 'bg-red-500/15 text-red-600 border-red-500/30 animate-pulse' };
      case 'waiter_called':
        return { label: 'Calling Waiter', bg: 'bg-purple-500/15 text-purple-600 border-purple-500/30 animate-pulse' };
      default:
        return { label: 'Available', bg: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30' };
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="rounded-3xl border border-border/80 bg-card p-4 shadow-card">
        {/* Header & Filter Pills & Add Table Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl font-bold text-foreground">Table Floor Plan</h2>
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Floor ({tables.length} Tables)
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live status, shift tables, timers & front-of-house operations
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {sections.map((sec) => (
                <button
                  key={sec}
                  onClick={() => setActiveSection(sec)}
                  className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                    activeSection === sec
                      ? 'bg-accent text-white shadow-sm'
                      : 'bg-secondary text-foreground hover:bg-muted'
                  }`}
                >
                  {sec === 'all' ? 'All Tables' : sec}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-accent px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:opacity-95 transition active:scale-95 shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Table</span>
            </button>
          </div>
        </div>

        {/* Quick Stat Counters */}
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
          <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 p-2.5 border border-emerald-500/20">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-600 font-bold text-xs">
              {counts.available}
            </span>
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">Available</span>
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-amber-500/10 p-2.5 border border-amber-500/20">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600 font-bold text-xs">
              {counts.cooking}
            </span>
            <span className="font-semibold text-amber-700 dark:text-amber-400">Cooking</span>
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-blue-500/10 p-2.5 border border-blue-500/20">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/20 text-blue-600 font-bold text-xs">
              {counts.dining}
            </span>
            <span className="font-semibold text-blue-700 dark:text-blue-400">Dining</span>
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-red-500/10 p-2.5 border border-red-500/20">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-red-500/20 text-red-600 font-bold text-xs">
              {counts.billReq}
            </span>
            <span className="font-semibold text-red-700 dark:text-red-400">Bill Req</span>
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-purple-500/10 p-2.5 border border-purple-500/20">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-500/20 text-purple-600 font-bold text-xs">
              {counts.waiterCall}
            </span>
            <span className="font-semibold text-purple-700 dark:text-purple-400">Waiter Call</span>
          </div>
        </div>

        {/* Floor Grid */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredTables.map((table) => {
            const info = tableStateMap.get(table.name) || {
              activeOrder: null,
              waiterRequest: null,
              status: 'available',
              durationMinutes: 0,
            };
            const badge = getStatusBadge(info.status);

            return (
              <div
                key={table.id}
                onClick={() => {
                  if (info.status === 'available') {
                    onStartOrderForTable(table.name);
                    toast.info(`Selected ${table.name} for billing`);
                  } else {
                    setSelectedTableData(table);
                  }
                }}
                className={`group relative flex flex-col justify-between rounded-2xl border p-3.5 transition-all cursor-pointer hover:shadow-elevated active:scale-98 ${
                  info.status === 'available'
                    ? 'border-emerald-500/30 bg-card hover:border-emerald-500/60'
                    : info.status === 'cooking'
                    ? 'border-amber-500/40 bg-amber-500/5 hover:border-amber-500'
                    : info.status === 'dining'
                    ? 'border-blue-500/40 bg-blue-500/5 hover:border-blue-500'
                    : 'border-red-500/50 bg-red-500/5 hover:border-red-500'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-base text-foreground">
                      {table.name}
                    </h3>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {table.capacity}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{table.section}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${badge.bg}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  {info.durationMinutes > 0 && (
                    <div className="mt-1.5 flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{info.durationMinutes}m active</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between text-xs">
                  {info.activeOrder ? (
                    <div className="truncate">
                      <p className="font-receipt font-bold text-foreground">
                        {cafeProfile.currency}
                        {info.activeOrder.total}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {info.activeOrder.items.length} items
                      </p>
                    </div>
                  ) : (
                    <span className="text-[11px] font-medium text-emerald-600">
                      Tap to Book / Order
                    </span>
                  )}
                  <Utensils className="h-3.5 w-3.5 text-muted-foreground group-hover:text-accent transition" />
                </div>
              </div>
            );
          })}

          {/* Quick inline Add Table Card */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border/80 bg-secondary/20 p-6 hover:bg-secondary/40 hover:border-accent/50 transition active:scale-98 text-muted-foreground hover:text-foreground min-h-[120px]"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Plus className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold">+ Add Table</span>
          </button>
        </div>
      </div>

      {/* Table Detail Modal */}
      {selectedTableData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-5 shadow-elevated animate-slide-up">
            <h3 className="font-display text-lg font-bold text-foreground">
              {selectedTableData.name} Details
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {selectedTableData.section} • Capacity {selectedTableData.capacity} guests
            </p>

            {(() => {
              const info = tableStateMap.get(selectedTableData.name);
              if (!info) return null;
              return (
                <div className="mt-4 space-y-3">
                  {info.activeOrder && (
                    <div className="rounded-2xl bg-secondary/50 p-3 text-xs space-y-2 border border-border/60">
                      <div className="flex justify-between font-bold">
                        <span>Active KOT: #{info.activeOrder.kotNumber}</span>
                        <span className="font-receipt text-accent">
                          {cafeProfile.currency}{info.activeOrder.total}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {info.activeOrder.items.map((i: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-muted-foreground">
                            <span>{i.name}</span>
                            <span>x{i.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      onClick={() => {
                        onStartOrderForTable(selectedTableData.name);
                        setSelectedTableData(null);
                      }}
                      className="rounded-xl bg-accent px-3 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-accent/90"
                    >
                      Add Items
                    </button>
                    {info.activeOrder && (
                      <button
                        onClick={() => {
                          const bill = convertOrderToBill(info.activeOrder.id, 'upi');
                          if (bill) {
                            toast.success(`Bill generated for ${selectedTableData.name}!`, { icon: '🧾' });
                          }
                          setSelectedTableData(null);
                        }}
                        className="rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-500"
                      >
                        Settle Bill
                      </button>
                    )}
                  </div>

                  {!info.activeOrder && (
                    <button
                      type="button"
                      onClick={() => {
                        deleteTable(selectedTableData.id);
                        setSelectedTableData(null);
                      }}
                      className="w-full mt-2 flex items-center justify-center gap-1.5 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 py-2 text-xs font-bold transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete {selectedTableData.name}</span>
                    </button>
                  )}
                </div>
              );
            })()}

            <button
              onClick={() => setSelectedTableData(null)}
              className="mt-3 w-full rounded-xl bg-secondary py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Add Table Modal */}
      <AddTableModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        defaultSection={activeSection !== 'all' ? activeSection : 'Main Hall'}
      />
    </div>
  );
};

