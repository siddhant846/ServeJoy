import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Home,
  UtensilsCrossed,
  ChefHat,
  ClipboardList,
  Plus,
  BarChart3,
  History,
} from 'lucide-react';

export type MainTabType = 'home' | 'waiter' | 'kitchen' | 'orders' | 'add' | 'insights' | 'history';

interface BottomNavProps {
  currentTab: MainTabType;
  onTabChange: (tab: MainTabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const { userRole, orders, waiterRequests } = useApp();

  const pendingWaiterCount = waiterRequests.filter((r) => r.status === 'pending').length;
  const activeKitchenCount = orders.filter((o) => o.status === 'preparing' || o.status === 'pending').length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;

  const tabs: {
    id: MainTabType;
    label: string;
    icon: React.ElementType;
    badge?: number;
    visible: boolean;
  }[] = [
    { id: 'home' as MainTabType, label: 'Home', icon: Home, visible: userRole !== 'waiter' && userRole !== 'kitchen' },
    {
      id: 'waiter' as MainTabType,
      label: 'Waiter',
      icon: UtensilsCrossed,
      badge: pendingWaiterCount,
      visible: userRole === 'owner' || userRole === 'waiter' || userRole === 'cashier',
    },
    {
      id: 'kitchen' as MainTabType,
      label: 'Kitchen',
      icon: ChefHat,
      badge: activeKitchenCount,
      visible: userRole === 'owner' || userRole === 'kitchen' || userRole === 'cashier',
    },
    {
      id: 'orders' as MainTabType,
      label: 'Orders',
      icon: ClipboardList,
      badge: pendingOrdersCount,
      visible: userRole === 'owner' || userRole === 'cashier',
    },
    { id: 'add' as MainTabType, label: 'Add', icon: Plus, visible: userRole === 'owner' },
    { id: 'insights' as MainTabType, label: 'Insights', icon: BarChart3, visible: userRole === 'owner' },
    { id: 'history' as MainTabType, label: 'History', icon: History, visible: userRole === 'owner' },
  ].filter((t) => t.visible);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/80 bg-card/95 backdrop-blur-md pb-[max(0.25rem,env(safe-area-inset-bottom))] shadow-elevated">
      <div className="mx-auto flex max-w-md items-center justify-around px-1 py-1 sm:px-4 sm:py-2 lg:max-w-5xl xl:max-w-6xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              aria-label={tab.label}
              onClick={() => onTabChange(tab.id)}
              className={`group relative flex flex-1 flex-col items-center justify-center py-1.5 transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded-xl ${
                isActive ? 'text-accent font-bold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`h-5 w-5 sm:h-5.5 sm:w-5.5 transition-transform ${
                    isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />
                {!!(tab.badge && tab.badge > 0) && (
                  <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 font-receipt text-[9px] font-bold text-white shadow-sm animate-badge-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] leading-tight truncate max-w-[48px] sm:max-w-none text-center">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

