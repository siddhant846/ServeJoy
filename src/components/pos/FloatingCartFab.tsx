import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShoppingCart } from 'lucide-react';

interface FloatingCartFabProps {
  onClick: () => void;
}

export const FloatingCartFab: React.FC<FloatingCartFabProps> = ({ onClick }) => {
  const { cartCount } = useApp();

  if (cartCount === 0) return null;

  return (
    <div
      id="mobile-cart-target"
      className="fixed bottom-24 right-5 sm:right-8 lg:right-10 z-50"
    >
      <button
        id="pos-cart-target"
        onClick={onClick}
        aria-label={`View Cart (${cartCount} items)`}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-[#ea580c] to-[#f97316] text-white shadow-[0_12px_28px_rgba(234,88,12,0.4)] transition-all hover:scale-105 hover:shadow-[0_16px_36px_rgba(234,88,12,0.5)] active:scale-95 focus-visible:ring-4 focus-visible:ring-accent/40 focus:outline-none select-none"
      >
        <ShoppingCart className="h-6 w-6 stroke-[2.3] transition-transform group-hover:scale-110" />
        <span className="absolute -top-1 -right-1 flex h-6 min-w-[24px] px-1 items-center justify-center rounded-full bg-[#221008] text-white font-receipt text-[11px] font-extrabold shadow-md border-2 border-white dark:border-zinc-900 animate-badge-pulse">
          {cartCount}
        </span>
      </button>
    </div>
  );
};

