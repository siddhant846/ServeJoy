import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { MenuItem } from '../../types';
import { Search, Plus, Minus, Sparkles, AlertCircle } from 'lucide-react';

interface MenuGridProps {
  onOpenAiDishModal: () => void;
}

export const MenuGrid: React.FC<MenuGridProps> = ({ onOpenAiDishModal }) => {
  const { menuItems, cart, addToCart, updateCartQuantity, cafeProfile } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = useMemo(() => {
    const set = new Set<string>();
    menuItems.forEach((i) => set.add(i.category));
    return ['All', ...Array.from(set)];
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  const getCartQuantity = (itemId: string) => {
    const found = cart.find((ci) => ci.item.id === itemId);
    return found ? found.quantity : 0;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search chai, snacks, coffee, desserts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-border bg-card pl-10 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent input-glow-orange"
          />
        </div>

        <button
          onClick={onOpenAiDishModal}
          className="flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-500 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:opacity-95 transition"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI Add Dish</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              selectedCategory === cat
                ? 'bg-accent text-white shadow-sm'
                : 'bg-card border border-border text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Dish Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {filteredItems.map((item) => {
          const qty = getCartQuantity(item.id);
          return (
            <div
              key={item.id}
              className={`group flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card p-3 shadow-card transition hover:shadow-elevated hover:border-accent/40 ${
                !item.isAvailable ? 'opacity-60' : ''
              }`}
            >
              {/* Image & Badges */}
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-secondary">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&auto=format&fit=crop&q=80';
                  }}
                />
                <span className="absolute left-2.5 top-2.5 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                  {item.category}
                </span>
                {!item.isAvailable && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
                    <span className="rounded-full bg-red-600/90 px-3 py-1 text-xs font-extrabold text-white">
                      Sold Out
                    </span>
                  </div>
                )}
              </div>

              {/* Title & Description */}
              <div className="mt-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="font-display text-sm font-bold text-foreground leading-snug line-clamp-1">
                      {item.emoji} {item.name}
                    </h3>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Price & Add to Cart */}
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/50">
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-xs font-bold text-accent">{cafeProfile.currency}</span>
                    <span className="font-display text-base font-extrabold text-foreground">
                      {item.price}
                    </span>
                  </div>

                  {qty > 0 ? (
                    <div className="flex items-center gap-2 rounded-xl bg-accent px-2 py-1 text-white shadow-sm">
                      <button
                        onClick={() => updateCartQuantity(item.id, qty - 1)}
                        className="flex h-5 w-5 items-center justify-center rounded-lg hover:bg-black/20 transition"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-xs font-bold min-w-3 text-center">{qty}</span>
                      <button
                        onClick={() => updateCartQuantity(item.id, qty + 1)}
                        className="flex h-5 w-5 items-center justify-center rounded-lg hover:bg-black/20 transition"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      disabled={!item.isAvailable}
                      onClick={() => addToCart(item)}
                      className="flex items-center gap-1 rounded-xl bg-secondary px-3 py-1.5 text-xs font-bold text-foreground hover:bg-accent hover:text-white transition active:scale-95 disabled:pointer-events-none"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm font-semibold text-foreground">No dishes found</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Try searching with a different keyword or category.
          </p>
        </div>
      )}
    </div>
  );
};

