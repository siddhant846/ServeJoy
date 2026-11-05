import React, { useEffect } from 'react';
import { PosSidebar } from './PosSidebar';
import { X, Coffee, Pin, PinOff } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface PosSidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddDish: () => void;
  onOpenAddTable: () => void;
  onOpenAiScan: () => void;
  onOpenTableQR: () => void;
  onOpenSoundbox?: () => void;
  onOpenPrinter?: () => void;
  onOpenSettings?: () => void;
  homeSubTab?: 'pos' | 'floor';
  onHomeSubTabChange?: (subTab: 'pos' | 'floor') => void;
  isPinned?: boolean;
  onTogglePin?: () => void;
}

export const PosSidebarDrawer: React.FC<PosSidebarDrawerProps> = ({
  isOpen,
  onClose,
  onOpenAddDish,
  onOpenAddTable,
  onOpenAiScan,
  onOpenTableQR,
  onOpenSoundbox,
  onOpenPrinter,
  onOpenSettings,
  homeSubTab,
  onHomeSubTabChange,
  isPinned,
  onTogglePin,
}) => {
  const { cafeProfile } = useApp();

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Drawer Panel */}
      <div className="relative z-10 w-full max-w-[340px] sm:max-w-sm bg-background border-r border-border h-full shadow-2xl flex flex-col animate-slide-right">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white shadow-xs">
              <Coffee className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-sm font-bold text-foreground">
                {cafeProfile.name}
              </h3>
              <p className="text-[10px] text-muted-foreground font-semibold">
                Quick Setup & POS Actions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onTogglePin && (
              <button
                type="button"
                onClick={onTogglePin}
                title={isPinned ? 'Unpin sidebar from desktop layout' : 'Pin sidebar to desktop screen'}
                className={`hidden lg:flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-[11px] font-bold border transition ${
                  isPinned
                    ? 'bg-accent/15 border-accent text-accent'
                    : 'bg-secondary border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {isPinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                <span>{isPinned ? 'Unpin' : 'Pin'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-xl flex items-center justify-center bg-secondary hover:bg-muted text-muted-foreground hover:text-foreground transition active:scale-90"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Drawer Content: PosSidebar with all options */}
        <div className="flex-1 overflow-y-auto p-4 sidebar-scroll">
          <PosSidebar
            onOpenAddDish={() => {
              onClose();
              onOpenAddDish();
            }}
            onOpenAddTable={() => {
              onClose();
              onOpenAddTable();
            }}
            onOpenAiScan={() => {
              onClose();
              onOpenAiScan();
            }}
            onOpenTableQR={() => {
              onClose();
              onOpenTableQR();
            }}
            onOpenSoundbox={() => {
              onClose();
              onOpenSoundbox?.();
            }}
            onOpenPrinter={() => {
              onClose();
              onOpenPrinter?.();
            }}
            onOpenSettings={() => {
              onClose();
              onOpenSettings?.();
            }}
            homeSubTab={homeSubTab}
            onHomeSubTabChange={(tab) => {
              onHomeSubTabChange?.(tab);
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
};

