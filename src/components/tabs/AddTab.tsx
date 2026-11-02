import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, Camera, Plus, Check } from 'lucide-react';
import { toast } from 'sonner';

interface AddTabProps {
  onOpenAiDishModal: () => void;
}

export const AddTab: React.FC<AddTabProps> = ({ onOpenAiDishModal }) => {
  const { addMenuItem, cafeProfile } = useApp();

  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<string>('Snacks');
  const [price, setPrice] = useState<string>('');
  const [cost, setCost] = useState<string>('');
  const [emoji, setEmoji] = useState<string>('🥘');
  const [imageUrl, setImageUrl] = useState<string>('/dishes/grilled_sandwich.jpg');
  const [description, setDescription] = useState<string>('');

  const sampleImages = [
    { name: 'Pav Bhaji', url: '/dishes/pav_bhaji.jpg', emoji: '🥘' },
    { name: 'Chai', url: '/dishes/masala_chai.jpg', emoji: '☕' },
    { name: 'Sandwich', url: '/dishes/grilled_sandwich.jpg', emoji: '🥪' },
    { name: 'Filter Coffee', url: '/dishes/filter_coffee.jpg', emoji: '☕' },
    { name: 'Chole Puri', url: '/dishes/chole_puri.jpg', emoji: '🍛' },
    { name: 'Gulab Jamun', url: '/dishes/gulab_jamun.jpg', emoji: '🍮' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter a dish name');
      return;
    }
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      toast.error('Please enter a valid selling price');
      return;
    }

    addMenuItem({
      name: name.trim(),
      category: category.trim(),
      price: numPrice,
      cost: Number(cost) || Math.round(numPrice * 0.4),
      emoji: emoji.trim() || '🍽️',
      imageUrl: imageUrl.trim() || '/dishes/pav_bhaji.jpg',
      description: description.trim(),
      isAvailable: true,
    });

    toast.success(`Added ${name} to menu!`, { icon: '✅' });
    setName('');
    setPrice('');
    setCost('');
    setDescription('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto pb-36 space-y-5 animate-fade-in">
      {/* AI Assistant Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#3a1e12] to-[#592b18] p-5 text-white shadow-elevated">
        <h2 className="font-display text-xl font-bold tracking-tight">Menu Manager</h2>
        <p className="mt-1 text-xs text-amber-200/80">
          Add single dishes manually or use AI Vision to generate high-profit dishes and pricing.
        </p>

        <div className="mt-4 flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={onOpenAiDishModal}
            className="flex items-center gap-1.5 rounded-2xl bg-accent px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-accent/90 transition active:scale-95"
          >
            <Sparkles className="h-4 w-4" />
            <span>AI Dish Studio & Assistant</span>
          </button>
        </div>
      </div>

      {/* Manual Add Dish Form */}
      <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
        <h3 className="font-display text-lg font-bold text-foreground">Add New Dish</h3>
        <p className="text-xs text-muted-foreground">Fill in item details and pricing</p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {/* Dish Name */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Dish Name *</label>
            <input
              type="text"
              placeholder="e.g. Kadak Masala Chai, Pav Bhaji..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-border bg-card px-3.5 py-2.5 text-xs text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              required
            />
          </div>

          {/* Category & Emoji */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-muted-foreground">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-border bg-card px-3.5 py-2.5 text-xs text-foreground focus:border-accent focus:outline-none"
              >
                <option value="Snacks">Snacks</option>
                <option value="Beverages">Beverages</option>
                <option value="Desserts">Desserts</option>
                <option value="Meals">Meals</option>
                <option value="Combos">Combos</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">Emoji</label>
              <input
                type="text"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-border bg-card px-3 py-2 text-center text-base focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          {/* Price & Cost */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">
                Selling Price ({cafeProfile.currency}) *
              </label>
              <input
                type="number"
                placeholder="120"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-border bg-card px-3.5 py-2.5 font-receipt text-xs text-foreground focus:border-accent focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">
                Kitchen Cost ({cafeProfile.currency})
              </label>
              <input
                type="number"
                placeholder="45"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-border bg-card px-3.5 py-2.5 font-receipt text-xs text-foreground focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Description (optional)</label>
            <textarea
              placeholder="Crispy, buttery, spicy..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-2xl border border-border bg-card px-3.5 py-2 text-xs text-foreground focus:border-accent focus:outline-none"
            />
          </div>

          {/* Quick Photo Presets */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Photo Preset</label>
            <div className="mt-1.5 grid grid-cols-3 sm:grid-cols-6 gap-2">
              {sampleImages.map((s, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => {
                    setImageUrl(s.url);
                    setEmoji(s.emoji);
                  }}
                  className={`relative aspect-square overflow-hidden rounded-xl border transition ${
                    imageUrl === s.url ? 'border-accent ring-2 ring-accent' : 'border-border opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={s.url} alt={s.name} className="h-full w-full object-cover" />
                  <span className="absolute bottom-1 right-1 text-xs">{s.emoji}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-3 text-xs font-bold text-white shadow-md hover:bg-accent/90 active:scale-95 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Add Dish to Menu</span>
          </button>
        </form>
      </div>
    </div>
  );
};

