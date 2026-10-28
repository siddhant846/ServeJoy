import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Coffee,
  UtensilsCrossed,
  ChefHat,
  Bell,
  Sun,
  Moon,
  Cloud,
  CloudOff,
  QrCode,
  Volume2,
  RefreshCw,
  LogOut,
} from 'lucide-react';

interface NavbarProps {
  onOpenQRModal?: () => void;
  onOpenSoundboxModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenQRModal, onOpenSoundboxModal }) => {
  const {
    cafeProfile,
    userRole,
    setUserRole,
    syncStatus,
    syncAll,
    isDarkMode,
    toggleDarkMode,
    waiterRequests,
    orders,
  } = useApp();

  const location = useLocation();
  const currentPath = location.pathname;

  const pendingRequestsCount = waiterRequests.filter((r) => r.status === 'pending').length;
  const activeOrdersCount = orders.filter(
    (o) => o.status === 'pending' || o.status === 'preparing'
  ).length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-card/80 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#372215] to-[#653520] text-amber-200 shadow-sm border border-amber-900/20">
            <Coffee className="h-5 w-5 text-amber-200" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display text-base sm:text-lg font-bold tracking-tight text-foreground">
                {cafeProfile.name}
              </span>
              <span className="hidden sm:inline-block rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent">
                POS
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground hidden sm:block truncate max-w-[180px]">
              {cafeProfile.tagLine}
            </p>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/"
            className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition ${
              currentPath === '/'
                ? 'bg-accent text-white shadow-sm'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            <Coffee className="h-4 w-4" />
            <span className="hidden md:inline">Billing POS</span>
          </Link>

          <Link
            to="/waiter"
            className={`relative flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition ${
              currentPath === '/waiter'
                ? 'bg-accent text-white shadow-sm'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            <UtensilsCrossed className="h-4 w-4" />
            <span className="hidden md:inline">Waiter Mode</span>
            {pendingRequestsCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white animate-badge-pulse">
                {pendingRequestsCount}
              </span>
            )}
          </Link>

          <Link
            to="/kitchen"
            className={`relative flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition ${
              currentPath === '/kitchen'
                ? 'bg-accent text-white shadow-sm'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            <ChefHat className="h-4 w-4" />
            <span className="hidden md:inline">Kitchen KOT</span>
            {activeOrdersCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[9px] font-bold text-white">
                {activeOrdersCount}
              </span>
            )}
          </Link>
        </nav>

        {/* Quick Tools & Settings */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Table Standee QR button */}
          {onOpenQRModal && (
            <button
              onClick={onOpenQRModal}
              title="Table Standee QR Generator"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground transition"
            >
              <QrCode className="h-4 w-4" />
            </button>
          )}

          {/* Soundbox audio settings */}
          {onOpenSoundboxModal && (
            <button
              onClick={onOpenSoundboxModal}
              title="Audio Soundbox Announcements"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground transition"
            >
              <Volume2 className="h-4 w-4" />
            </button>
          )}

          {/* Cloud Sync Status */}
          <button
            onClick={syncAll}
            title={syncStatus.isOnline ? 'Cloud Synced (Click to Refresh)' : 'Offline Mode'}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-2 py-1 text-xs text-muted-foreground hover:bg-secondary transition"
          >
            {syncStatus.isOnline ? (
              <Cloud className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <CloudOff className="h-3.5 w-3.5 text-amber-500" />
            )}
            <span className="hidden lg:inline text-[11px] font-medium">
              {syncStatus.isSyncing ? 'Syncing...' : syncStatus.isOnline ? 'Online' : 'Offline'}
            </span>
          </button>

          {/* Dark Mode toggle */}
          <button
            onClick={toggleDarkMode}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground transition"
          >
            {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-neutral-600" />}
          </button>

          {/* Role badge */}
          <select
            value={userRole}
            onChange={(e) => setUserRole(e.target.value as any)}
            className="rounded-xl border border-border bg-secondary/80 px-2 py-1 text-[11px] font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="owner">👑 Owner</option>
            <option value="cashier">💼 Cashier</option>
            <option value="waiter">🍽️ Waiter</option>
            <option value="kitchen">🍳 Kitchen</option>
          </select>
        </div>
      </div>
    </header>
  );
};

