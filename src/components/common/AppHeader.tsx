import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { subscriptionService } from '../../services/subscriptionService';
import { authService } from '../../services/authService';
import {
  Coffee,
  RefreshCw,
  Volume2,
  QrCode,
  Printer,
  Sparkles,
  Settings,
  Clock,
  ShieldAlert,
} from 'lucide-react';

interface AppHeaderProps {
  onOpenQRModal?: () => void;
  onOpenSoundboxModal?: () => void;
  onOpenPrinterModal?: () => void;
  onOpenSettingsModal?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onOpenQRModal,
  onOpenSoundboxModal,
  onOpenPrinterModal,
  onOpenSettingsModal,
}) => {
  const { cafeProfile, userRole, syncStatus, syncAll, soundboxSettings } = useApp();
  const subInfo = subscriptionService.getSubscriptionInfo(cafeProfile.id);

  return (
    <header className="sticky top-0 z-30 w-full bg-gradient-to-r from-[#221008] via-[#33170c] to-[#221008] text-white border-b border-amber-950/60 shadow-md backdrop-blur-md pt-[max(env(safe-area-inset-top,0px),0.5rem)] pb-2.5">
      <div className="mx-auto flex max-w-[1720px] items-center justify-between px-3.5 sm:px-6 lg:px-10">
        {/* Left: Logo & Cafe Profile */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4e2514] to-[#2a1309] border border-amber-500/25 shadow-inner text-amber-300 shrink-0">
            <Coffee className="h-5 w-5 sm:h-6 sm:w-6 text-amber-300 drop-shadow-sm" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="font-display text-base sm:text-lg font-black tracking-tight text-white drop-shadow-sm truncate">
                {cafeProfile.name}
              </h1>
              {subInfo.isTrial ? (
                <Link
                  to="/pricing"
                  title={`${subInfo.daysRemaining} days remaining on 7-Day Free Trial. Click to view plans.`}
                  className="flex items-center gap-1 rounded-full bg-amber-500/25 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-amber-300 border border-amber-500/35 shrink-0 hover:bg-amber-500/35 transition"
                >
                  <Clock className="h-2.5 w-2.5" />
                  <span>Trial: {subInfo.daysRemaining}d</span>
                </Link>
              ) : (
                <span className="flex items-center gap-0.5 rounded-full bg-amber-500/25 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-amber-300 border border-amber-500/35 shrink-0">
                  <Sparkles className="h-2.5 w-2.5" /> {cafeProfile.subscriptionTier.toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-amber-200/80">
              <span className="font-medium truncate">
                Hi, {cafeProfile.ownerName || 'Siddhant'}
              </span>
              {userRole !== 'owner' && (
                <span className="rounded bg-black/40 px-1.5 py-0.5 text-[9px] uppercase font-bold text-amber-400 border border-amber-500/20 shrink-0">
                  {userRole}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Cloud Sync */}
          <button
            onClick={() => syncAll()}
            aria-label="Cloud Sync"
            title={syncStatus.isSyncing ? 'Syncing...' : syncStatus.isOnline ? 'Online (Click to sync)' : 'Offline'}
            className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-300 border border-sky-500/30 hover:bg-sky-500/25 active:scale-95 transition"
          >
            <RefreshCw className={`h-4 w-4 text-sky-400 ${syncStatus.isSyncing ? 'animate-spin' : ''}`} />
          </button>

          {/* Soundbox Voice Alerts */}
          {onOpenSoundboxModal && (
            <button
              onClick={onOpenSoundboxModal}
              aria-label="Soundbox Settings"
              title="ServeJoy Smart Soundbox voice payment alerts"
              className={`relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl transition active:scale-95 ${
                soundboxSettings.enabled
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              <Volume2 className="h-4 w-4" />
              {soundboxSettings.enabled && (
                <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>
          )}

          {/* Table Standee QR */}
          {onOpenQRModal && (
            <button
              onClick={onOpenQRModal}
              aria-label="Table QR Code"
              title="Table Standee QR Generator & Ordering"
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20 active:scale-95"
            >
              <QrCode className="h-4 w-4" />
            </button>
          )}

          {/* Thermal Printer Manager / Settings */}
          {onOpenPrinterModal && (
            <button
              onClick={onOpenPrinterModal}
              aria-label="Thermal Printers & Settings"
              title="Thermal Printer Manager & ESC/POS settings"
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20 active:scale-95"
            >
              <Printer className="h-4 w-4" />
            </button>
          )}

          {/* Super Admin Master Console (Visible only to Platform Owner) */}
          {authService.isSuperAdmin() && (
            <Link
              to="/admin"
              aria-label="Super Admin Console"
              title="ServeJoy Super Admin Platform Console"
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/35 transition active:scale-95"
            >
              <ShieldAlert className="h-4 w-4 text-amber-400" />
            </Link>
          )}

          {/* Business Profile, Soundbox, Theme & System Settings */}
          {onOpenSettingsModal && (
            <button
              onClick={onOpenSettingsModal}
              aria-label="Business Profile & Settings"
              title="Business Profile, Soundbox, Theme & System Settings"
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20 active:scale-95"
            >
              <Settings className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

