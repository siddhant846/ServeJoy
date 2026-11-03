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
import { SettingsModal } from '../components/pos/SettingsModal';
import { PosSidebar } from '../components/pos/PosSidebar';
import { PosSidebarDrawer } from '../components/pos/PosSidebarDrawer';
import { AddDishModal } from '../components/pos/AddDishModal';
import { AddTableModal } from '../components/pos/AddTableModal';
import { Bill } from '../types';
import { subscriptionService } from '../services/subscriptionService';
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

  // Modals & Drawers
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isDesktopSidebarPinned, setIsDesktopSidebarPinned] = useState<boolean>(() => {
    try {
      return localStorage.getItem('servejoy_desktop_sidebar_pinned') === 'true';
    } catch {
      return false;
    }
  });
  const [isCartModalOpen, setIsCartModalOpen] = useState<boolean>(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState<boolean>(false);
  const [isSoundboxModalOpen, setIsSoundboxModalOpen] = useState<boolean>(false);
  const [isAiDishModalOpen, setIsAiDishModalOpen] = useState<boolean>(false);
  const [isPrinterModalOpen, setIsPrinterModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isAddDishModalOpen, setIsAddDishModalOpen] = useState<boolean>(false);
  const [isAddTableModalOpen, setIsAddTableModalOpen] = useState<boolean>(false);
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

    const subInfo = subscriptionService.getSubscriptionInfo(bill.businessId);
    if (!subInfo.canBill) {
      toast.error('Monthly bill limit reached on Starter Plan (100 bills). Please upgrade to Pro for unlimited billing.');
      setIsSettingsModalOpen(true);
      return;
    }
    subscriptionService.incrementBillCount(bill.businessId);

    setSelectedBillForPrint(bill);
    toast.success(`${bill.billNumber} generated! Scan to Pay UPI QR is ready`, { icon: '🧾' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      {/* Espresso Mobile Header */}
      <AppHeader
        onToggleSidebar={() => setIsDrawerOpen((prev) => !prev)}
        onOpenQRModal={() => setIsQRModalOpen(true)}
        onOpenSoundboxModal={() => setIsSoundboxModalOpen(true)}
        onOpenPrinterModal={() => setIsPrinterModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
      />

      <main className="mx-auto max-w-[1720px] px-3.5 sm:px-6 lg:px-10 py-4">
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          {/* Left Desktop Sidebar - if pinned to screen, it sits inline in the layout */}
          {userRole !== 'waiter' && userRole !== 'kitchen' && isDesktopSidebarPinned && (
            <aside className="hidden lg:block w-72 xl:w-80 shrink-0 sticky top-[4.75rem] self-start z-10 max-h-[calc(100vh-5.5rem)] overflow-y-auto overscroll-contain pr-1.5 pb-10 sidebar-scroll animate-fade-in">
              <PosSidebar
                onOpenAddDish={() => setIsAddDishModalOpen(true)}
                onOpenAddTable={() => setIsAddTableModalOpen(true)}
                onOpenAiScan={() => setIsAiDishModalOpen(true)}
                onOpenTableQR={() => setIsQRModalOpen(true)}
                onOpenSoundbox={() => setIsSoundboxModalOpen(true)}
                onOpenPrinter={() => setIsPrinterModalOpen(true)}
                onOpenSettings={() => setIsSettingsModalOpen(true)}
                homeSubTab={homeSubTab}
                onHomeSubTabChange={(sub) => {
                  setCurrentTab('home');
                  setHomeSubTab(sub);
                }}
              />
            </aside>
          )}

          {/* Main Content Area */}
          <div className="flex-1 min-w-0 w-full">
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
                      <MenuGrid
                        onOpenAiDishModal={() => setIsAiDishModalOpen(true)}
                        onOpenAddDishModal={() => setIsAddDishModalOpen(true)}
                      />
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
          </div>
        </div>
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

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      {/* Slide-out Hamburger Sidebar Drawer (All Screens) */}
      <PosSidebarDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onOpenAddDish={() => setIsAddDishModalOpen(true)}
        onOpenAddTable={() => setIsAddTableModalOpen(true)}
        onOpenAiScan={() => setIsAiDishModalOpen(true)}
        onOpenTableQR={() => setIsQRModalOpen(true)}
        onOpenSoundbox={() => setIsSoundboxModalOpen(true)}
        onOpenPrinter={() => setIsPrinterModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        homeSubTab={homeSubTab}
        onHomeSubTabChange={(sub) => {
          setCurrentTab('home');
          setHomeSubTab(sub);
        }}
        isPinned={isDesktopSidebarPinned}
        onTogglePin={() => {
          const next = !isDesktopSidebarPinned;
          setIsDesktopSidebarPinned(next);
          try {
            localStorage.setItem('servejoy_desktop_sidebar_pinned', String(next));
          } catch {}
          if (next) {
            toast.success('Sidebar pinned to desktop layout', { icon: '📌' });
          } else {
            toast.success('Sidebar unpinned (tap hamburger menu anytime)', { icon: '🍔' });
          }
        }}
      />

      <AddDishModal
        isOpen={isAddDishModalOpen}
        onClose={() => setIsAddDishModalOpen(false)}
        onOpenAiScan={() => {
          setIsAddDishModalOpen(false);
          setIsAiDishModalOpen(true);
        }}
      />

      <AddTableModal
        isOpen={isAddTableModalOpen}
        onClose={() => setIsAddTableModalOpen(false)}
      />
    </div>
  );
};
