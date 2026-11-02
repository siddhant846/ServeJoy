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
        aria-label="View Cart"
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-elevated transition-transform hover:scale-105 active:scale-95 animate-cart-bounce"
      >
        <ShoppingCart className="h-6 w-6 stroke-[2.2] transition-transform group-hover:scale-110" />
        <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white shadow-md border-2 border-white dark:border-black animate-badge-pulse">
          {cartCount}
        </span>
      </button>
    </div>
  );
};

