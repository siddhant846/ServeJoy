import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { MenuItem } from '../../types';
import { Search, Plus, Minus, Sparkles, AlertCircle, ShoppingBag } from 'lucide-react';

interface MenuGridProps {
  onOpenAiDishModal: () => void;
}

interface FlyingItem {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  emoji: string;
  imageUrl?: string;
}

export const MenuGrid: React.FC<MenuGridProps> = ({ onOpenAiDishModal }) => {
  const { menuItems, cart, addToCart, updateCartQuantity, cafeProfile } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);

  const triggerFlyAnimation = (e: React.MouseEvent, item: MenuItem) => {
    let startX = e.clientX;
    let startY = e.clientY;

    if (!startX || !startY) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      startX = rect.left + rect.width / 2;
      startY = rect.top + rect.height / 2;
    }

    // Determine target coordinates (floating cart FAB button or bottom-right corner)
    let endX = window.innerWidth - 60;
    let endY = window.innerHeight - 80;

    const fabTarget = document.getElementById('mobile-cart-target') || document.getElementById('pos-cart-target');
    if (fabTarget) {
      const rect = fabTarget.getBoundingClientRect();
      endX = rect.left + rect.width / 2;
      endY = rect.top + rect.height / 2;
    }

    const flyId = `${item.id}-${Date.now()}-${Math.random()}`;
    const newFly: FlyingItem = {
      id: flyId,
      startX,
      startY,
      endX,
      endY,
      emoji: item.emoji || '🍽️',
      imageUrl: item.imageUrl,
    };

    setFlyingItems((prev) => [...prev, newFly]);

    setTimeout(() => {
      setFlyingItems((prev) => prev.filter((f) => f.id !== flyId));
    }, 700);
  };

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
          title="Scan physical printed menu photo with Google Gemini Vision AI"
          className="flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-500 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:opacity-95 transition active:scale-95 shrink-0"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI Scan Menu</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <h3 className="font-display text-base font-bold text-foreground pr-1 shrink-0">Menu</h3>
        {categories.map((cat) => {
          let emoji = '🍽️';
          if (cat === 'Snacks') emoji = '🍲';
          else if (cat === 'Beverages') emoji = '☕';
          else if (cat === 'Desserts') emoji = '🍮';
          else if (cat === 'Meals') emoji = '🍛';
          else if (cat === 'Combos') emoji = '🍱';
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                selectedCategory === cat
                  ? 'bg-accent text-white shadow-sm'
                  : 'bg-card border border-border text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <span>{emoji}</span>
              <span>{cat === 'All' ? 'All Items' : cat}</span>
            </button>
          );
        })}
      </div>

      {/* Dish Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3.5 sm:gap-4.5">
        {filteredItems.map((item) => {
          const qty = getCartQuantity(item.id);
          return (
            <div
              key={item.id}
              onClick={(e) => {
                if (item.isAvailable) {
                  triggerFlyAnimation(e, item);
                  addToCart(item);
                }
              }}
              className={`group flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card p-3 shadow-card transition hover:shadow-elevated hover:border-accent/40 cursor-pointer active:scale-[0.98] select-none ${
                !item.isAvailable ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              {/* Image & Badges - Expanded aspect ratio filling space without expanding card */}
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-secondary">
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

              {/* Title (Description removed to maximize image area) */}
              <div className="mt-2.5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="font-display text-sm font-bold text-foreground leading-snug line-clamp-1">
                      {item.emoji} {item.name}
                    </h3>
                  </div>
                </div>

                {/* Price & Add to Cart */}
                <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-border/50">
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-xs font-bold text-accent">{cafeProfile.currency}</span>
                    <span className="font-receipt text-base font-bold text-foreground">
                      {item.price}
                    </span>
                  </div>

                  {qty > 0 ? (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#ea580c] to-[#f97316] px-1 py-1 text-white shadow-sm"
                    >
                      <button
                        type="button"
                        aria-label={`Decrease quantity of ${item.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateCartQuantity(item.id, qty - 1);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-black/20 transition active:scale-90"
                      >
                        <Minus className="h-3.5 w-3.5 stroke-[2.5]" />
                      </button>
                      <span className="font-receipt text-xs font-bold min-w-4 text-center select-none">{qty}</span>
                      <button
                        type="button"
                        aria-label={`Increase quantity of ${item.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerFlyAnimation(e, item);
                          updateCartQuantity(item.id, qty + 1);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-black/20 transition active:scale-90"
                      >
                        <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={!item.isAvailable}
                      aria-label={`Add ${item.name} to order`}
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerFlyAnimation(e, item);
                        addToCart(item);
                      }}
                      className="flex items-center gap-1.5 rounded-full bg-secondary px-3.5 py-1.5 min-h-[32px] text-xs font-bold text-foreground hover:bg-accent hover:text-white transition active:scale-95 disabled:pointer-events-none"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
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

      {/* Flying Dishes Animation Overlay */}
      {flyingItems.map((flying) => (
        <div
          key={flying.id}
          className="flying-cart-item pointer-events-none rounded-full border-2 border-white bg-accent shadow-elevated overflow-hidden flex items-center justify-center"
          style={
            {
              '--start-x': `${flying.startX}px`,
              '--start-y': `${flying.startY}px`,
              '--end-x': `${flying.endX}px`,
              '--end-y': `${flying.endY}px`,
              width: '46px',
              height: '46px',
            } as React.CSSProperties
          }
        >
          {flying.imageUrl ? (
            <img
              src={flying.imageUrl}
              alt="Item flying to cart"
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <span className="text-lg select-none">{flying.emoji}</span>
          )}
        </div>
      ))}
    </div>
  );
};

