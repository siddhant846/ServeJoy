import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AppHeader } from '../components/common/AppHeader';
import { BottomNav, MainTabType } from '../components/common/BottomNav';
import { TodaySummary } from '../components/pos/TodaySummary';
import { FloorPlan } from '../components/pos/FloorPlan';
import { MenuGrid } from '../components/pos/MenuGrid';
import { CartSheet } from '../components/pos/CartSheet';
import { FloatingCartFab } from '../components/pos/FloatingCartFab';
import { OrdersTab } from '../components/tabs/OrdersTab';
import { AddTab } from '../components/tabs/AddTab';
import { HistoryTab } from '../components/tabs/HistoryTab';
import { AnalyticsDashboard } from '../components/pos/AnalyticsDashboard';
import { WaiterPage } from './WaiterPage';
import { KitchenPage } from './KitchenPage';
import { ThermalReceipt } from '../components/pos/ThermalReceipt';
import { TableQRModal } from '../components/pos/TableQRModal';
import { SoundboxModal } from '../components/pos/SoundboxModal';
import { AiDishModal } from '../components/pos/AiDishModal';
import { PrinterManagerModal } from '../components/pos/PrinterManagerModal';
import { Bill } from '../types';
import { Utensils, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export const PosPage: React.FC = () => {
  const { cart, createBill, orders, userRole } = useApp();

  // Primary 7 tabs navigation state
  const [currentTab, setCurrentTab] = useState<MainTabType>(() => {
    if (userRole === 'waiter') return 'waiter';
    if (userRole === 'kitchen') return 'kitchen';
    return 'home';
  });

  // Sub-tabs on Home screen: 'pos' (Menu & Billing) vs 'floor' (Visual Floor Plan)
  const [homeSubTab, setHomeSubTab] = useState<'pos' | 'floor'>('pos');

  // Modals
  const [isCartModalOpen, setIsCartModalOpen] = useState<boolean>(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState<boolean>(false);
  const [isSoundboxModalOpen, setIsSoundboxModalOpen] = useState<boolean>(false);
  const [isAiDishModalOpen, setIsAiDishModalOpen] = useState<boolean>(false);
  const [isPrinterModalOpen, setIsPrinterModalOpen] = useState<boolean>(false);
  const [selectedBillForPrint, setSelectedBillForPrint] = useState<Bill | null>(null);

  const activeOrdersCount = orders.filter(
    (o) => o.status !== 'served' && o.status !== 'cancelled'
  ).length;

  const handleGenerateBill = (
    table: string,
    customer: { name?: string; phone?: string; note?: string }
  ) => {
    if (cart.length === 0) return;
    const items = cart.map((ci) => ({
      menuItemId: ci.item.id,
      name: ci.item.name,
      price: ci.item.price,
      cost: ci.item.cost,
      quantity: ci.quantity,
    }));

    const bill = createBill({
      items,
      paymentMode: 'upi',
      status: 'pending',
      customerName: customer.name,
      customerPhone: customer.phone,
      tableNumber: table,
    });

    setSelectedBillForPrint(bill);
    toast.success(`${bill.billNumber} generated! Scan to Pay UPI QR is ready`, { icon: '🧾' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      {/* Espresso Mobile Header */}
      <AppHeader
        onOpenQRModal={() => setIsQRModalOpen(true)}
        onOpenSoundboxModal={() => setIsSoundboxModalOpen(true)}
        onOpenPrinterModal={() => setIsPrinterModalOpen(true)}
      />

      <main className="mx-auto max-w-7xl px-3 sm:px-6 py-3.5">
        {/* ================= TAB 1: HOME ================= */}
        {currentTab === 'home' && (
          <div className="space-y-4 pb-36">
            {/* Top Sub-Tab Switcher: POS Menu & Fast Billing vs Visual Floor Plan */}
            <div className="flex items-center justify-between rounded-2xl bg-secondary/80 p-1 border border-border/80 shadow-sm">
              <button
                type="button"
                onClick={() => setHomeSubTab('pos')}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-bold transition active:scale-98 ${
                  homeSubTab === 'pos'
                    ? 'bg-card text-foreground shadow-sm border border-border/60'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Utensils className="h-3.5 w-3.5 text-accent" />
                <span>POS Menu & Fast Billing</span>
              </button>

              <button
                type="button"
                onClick={() => setHomeSubTab('floor')}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-bold transition active:scale-98 ${
                  homeSubTab === 'floor'
                    ? 'bg-card text-foreground shadow-sm border border-border/60'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <MapPin className="h-3.5 w-3.5 text-accent" />
                <span>Visual Floor Plan</span>
                {activeOrdersCount > 0 && (
                  <span className="flex h-5 items-center justify-center rounded-full bg-accent px-1.5 font-receipt text-[10px] font-bold text-white animate-badge-pulse">
                    {activeOrdersCount}
                  </span>
                )}
              </button>
            </div>

            {/* Sub-view: Visual Floor Plan */}
            {homeSubTab === 'floor' ? (
              <FloorPlan
                onStartOrderForTable={(tableName) => {
                  setHomeSubTab('pos');
                  setIsCartModalOpen(true);
                }}
              />
            ) : (
              /* Sub-view: POS Menu & Fast Billing */
              <div className="space-y-4">
                {/* Today's Summary Collapsible Business Card */}
                <TodaySummary />

                {/* Full-width Menu Grid */}
                <div className="w-full">
                  <MenuGrid onOpenAiDishModal={() => setIsAiDishModalOpen(true)} />
                </div>

                {/* Floating Cart Button (Appears only when items are in cart) */}
                <FloatingCartFab onClick={() => setIsCartModalOpen(true)} />
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: WAITER ================= */}
        {currentTab === 'waiter' && <WaiterPage hideNavbar={true} />}

        {/* ================= TAB 3: KITCHEN ================= */}
        {currentTab === 'kitchen' && <KitchenPage hideNavbar={true} />}

        {/* ================= TAB 4: ORDERS ================= */}
        {currentTab === 'orders' && <OrdersTab />}

        {/* ================= TAB 5: ADD DISH ================= */}
        {currentTab === 'add' && <AddTab onOpenAiDishModal={() => setIsAiDishModalOpen(true)} />}

        {/* ================= TAB 6: INSIGHTS ================= */}
        {currentTab === 'insights' && (
          <div className="pb-24">
            <AnalyticsDashboard />
          </div>
        )}

        {/* ================= TAB 7: HISTORY ================= */}
        {currentTab === 'history' && (
          <HistoryTab onSelectBillForReceipt={(bill) => setSelectedBillForPrint(bill)} />
        )}
      </main>

      {/* Persistent Bottom Navigation Bar (7 Tabs) */}
      <BottomNav currentTab={currentTab} onTabChange={(tab) => setCurrentTab(tab)} />

      {/* Current Order Modal / Sheet - Appears ONLY after clicking the Cart FAB */}
      {isCartModalOpen && (
        <div
          onClick={() => setIsCartModalOpen(false)}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg max-h-[92vh] overflow-y-auto animate-slide-up"
          >
            <CartSheet
              onGenerateBill={handleGenerateBill}
              onClose={() => setIsCartModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Global Modals */}

      <ThermalReceipt
        bill={selectedBillForPrint}
        onClose={() => setSelectedBillForPrint(null)}
      />

      <TableQRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
      />

      <SoundboxModal
        isOpen={isSoundboxModalOpen}
        onClose={() => setIsSoundboxModalOpen(false)}
      />

      <AiDishModal
        isOpen={isAiDishModalOpen}
        onClose={() => setIsAiDishModalOpen(false)}
      />

      <PrinterManagerModal
        isOpen={isPrinterModalOpen}
        onClose={() => setIsPrinterModalOpen(false)}
      />
    </div>
  );
};
