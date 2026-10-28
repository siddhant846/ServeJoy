import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Navbar } from '../../components/common/Navbar';
import { MenuGrid } from '../../components/pos/MenuGrid';
import { CartSheet } from '../../components/pos/CartSheet';
import { BillModal } from '../../components/pos/BillModal';
import { ThermalReceipt } from '../../components/pos/ThermalReceipt';
import { TableQRModal } from '../../components/pos/TableQRModal';
import { SoundboxModal } from '../../components/pos/SoundboxModal';
import { AiDishModal } from '../../components/pos/AiDishModal';
import { AnalyticsDashboard } from '../../components/pos/AnalyticsDashboard';
import { Bill } from '../../types';
import { Coffee, TrendingUp, History, Printer, Share2 } from 'lucide-react';

export const PosPage: React.FC = () => {
  const { bills, cafeProfile } = useApp();

  const [activeTab, setActiveTab] = useState<'menu' | 'analytics' | 'bills'>('menu');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [checkoutTable, setCheckoutTable] = useState<string>('Table 1');
  const [checkoutCustomer, setCheckoutCustomer] = useState<{ name?: string; phone?: string; note?: string }>({});

  const [isQRModalOpen, setIsQRModalOpen] = useState<boolean>(false);
  const [isSoundboxModalOpen, setIsSoundboxModalOpen] = useState<boolean>(false);
  const [isAiDishModalOpen, setIsAiDishModalOpen] = useState<boolean>(false);
  const [selectedBillForPrint, setSelectedBillForPrint] = useState<Bill | null>(null);

  const handleOpenCheckout = (
    table: string,
    customer: { name?: string; phone?: string; note?: string }
  ) => {
    setCheckoutTable(table);
    setCheckoutCustomer(customer);
    setIsCheckoutOpen(true);
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
    <div className="min-h-screen bg-background">
      <Navbar
        onOpenQRModal={() => setIsQRModalOpen(true)}
        onOpenSoundboxModal={() => setIsSoundboxModalOpen(true)}
      />

      <main className="mx-auto max-w-7xl px-3 sm:px-6 py-4">
        {/* Secondary Sub-Tabs (POS Menu, Analytics, Bills) */}
        <div className="flex items-center gap-2 mb-4 pb-1 border-b border-border/60">
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              activeTab === 'menu'
                ? 'bg-accent text-white shadow-sm'
                : 'bg-card border border-border text-muted-foreground hover:bg-secondary'
            }`}
          >
            <Coffee className="h-4 w-4" />
            <span>Menu & Billing</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              activeTab === 'analytics'
                ? 'bg-accent text-white shadow-sm'
                : 'bg-card border border-border text-muted-foreground hover:bg-secondary'
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            <span>Reports & Sales</span>
          </button>

          <button
            onClick={() => setActiveTab('bills')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              activeTab === 'bills'
                ? 'bg-accent text-white shadow-sm'
                : 'bg-card border border-border text-muted-foreground hover:bg-secondary'
            }`}
          >
            <History className="h-4 w-4" />
            <span>Recent Receipts</span>
          </button>
        </div>

        {/* Tab 1: Menu & Live Billing Layout */}
        {activeTab === 'menu' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column (Menu Grid) */}
            <div className="lg:col-span-8">
              <MenuGrid onOpenAiDishModal={() => setIsAiDishModalOpen(true)} />
            </div>

            {/* Right Column (Cart & Bill Puncher) */}
            <div className="lg:col-span-4 sticky top-20">
              <CartSheet onOpenCheckout={handleOpenCheckout} />
            </div>
          </div>
        )}

        {/* Tab 2: Analytics Dashboard */}
        {activeTab === 'analytics' && <AnalyticsDashboard />}

        {/* Tab 3: Recent Receipts */}
        {activeTab === 'bills' && (
          <div className="rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-card space-y-3">
            <h3 className="font-display text-base font-bold text-foreground pb-2 border-b border-border">
              Today's Completed Receipts ({bills.length})
            </h3>

            <div className="space-y-2.5 max-h-[600px] overflow-y-auto">
              {bills.map((b) => (
                <div
                  key={b.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl bg-secondary/50 p-3.5 border border-border"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-xs">{b.billNumber}</span>
                      <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent">
                        {b.tableNumber || 'Takeaway'}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(b.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {b.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="font-display text-sm font-extrabold text-foreground">
                      {cafeProfile.currency}
                      {b.total}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedBillForPrint(b)}
                        title="Thermal Print"
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-card border border-border text-foreground hover:bg-secondary"
                      >
                        <Printer className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => handleShareWhatsApp(b)}
                        title="Share on WhatsApp"
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <BillModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        tableNumber={checkoutTable}
        customer={checkoutCustomer}
        onPrintReceipt={(bill) => {
          setSelectedBillForPrint(bill);
        }}
      />

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
    </div>
  );
};

