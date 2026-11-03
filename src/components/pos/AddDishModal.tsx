import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { matchLocalDishImage } from '../../services/aiService';
import {
  X,
  Plus,
  Camera,
  Sparkles,
  Upload,
  Check,
  Utensils,
  DollarSign,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

interface AddDishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAiScan?: () => void;
}

export const AddDishModal: React.FC<AddDishModalProps> = ({
  isOpen,
  onClose,
  onOpenAiScan,
}) => {
  const { addMenuItem, cafeProfile } = useApp();

  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<string>('Snacks');
  const [price, setPrice] = useState<string>('');
  const [cost, setCost] = useState<string>('');
  const [emoji, setEmoji] = useState<string>('🍽️');
  const [imageUrl, setImageUrl] = useState<string>('/dishes/pav_bhaji.jpg');
  const [description, setDescription] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const sampleImages = [
    { name: 'Pav Bhaji', url: '/dishes/pav_bhaji.jpg', emoji: '🍲' },
    { name: 'Chai', url: '/dishes/masala_chai.jpg', emoji: '☕' },
    { name: 'Sandwich', url: '/dishes/grilled_sandwich.jpg', emoji: '🥪' },
    { name: 'Filter Coffee', url: '/dishes/filter_coffee.jpg', emoji: '☕' },
    { name: 'Chole Puri', url: '/dishes/chole_puri.jpg', emoji: '🍛' },
    { name: 'Gulab Jamun', url: '/dishes/gulab_jamun.jpg', emoji: '🍮' },
  ];

  if (!isOpen) return null;

  // Auto-match image when typing name
  const handleNameChange = (val: string) => {
    setName(val);
    if (val.trim().length >= 3) {
      const matched = matchLocalDishImage(val, category);
      setImageUrl(matched);
    }
  };

  // Real Photo Upload with client-side canvas compression
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const maxDim = 800;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          setImageUrl(compressed);
          toast.success('Real photo uploaded!', { icon: '📸' });
        } else {
          setImageUrl(dataUrl);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Dish name is required');
      return;
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      toast.error('Please enter a valid selling price');
      return;
    }

    addMenuItem({
      name: name.trim(),
      category: category.trim(),
      price: numPrice,
      cost: parseFloat(cost) || Math.round(numPrice * 0.4),
      emoji: emoji.trim() || '🍽️',
      imageUrl: imageUrl.trim() || '/dishes/pav_bhaji.jpg',
      description: description.trim(),
      isAvailable: true,
    });

    toast.success(`Added ${name} to your menu!`, { icon: '🍲' });
    setName('');
    setPrice('');
    setCost('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-5 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-[2.5rem] border border-border bg-card p-5 sm:p-6 shadow-elevated max-h-[92vh] flex flex-col overflow-hidden text-left">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-border/80">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-accent/15 text-accent border border-accent/25">
              🍲
            </span>
            <div>
              <h3 className="font-display text-base sm:text-lg font-bold text-foreground">
                Add Dish to Menu
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Enter dish details or use Google Gemini Vision to scan physical menu
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* AI Scanner Banner */}
        {onOpenAiScan && (
          <div className="my-3.5 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-600/15 via-orange-600/10 to-amber-600/15 p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-white shadow-sm shrink-0">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">
                  Scan Physical Menu Photo with AI
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Parses dishes, prices & generates 4K photos automatically
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAiScan();
              }}
              className="shrink-0 flex items-center gap-1.5 rounded-xl bg-accent px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:opacity-95 transition active:scale-95"
            >
              <Camera className="h-3 w-3" />
              <span>Scan Photo</span>
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-2 space-y-3.5 pr-1">
          {/* Dish Name */}
          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              Dish Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Kadak Masala Chai, Peri Peri Fries, Veg Burger..."
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full rounded-2xl border border-border bg-secondary/30 px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent input-glow-orange"
              autoFocus
            />
          </div>

          {/* Category & Pricing */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-2xl border border-border bg-secondary/30 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="Snacks">Snacks</option>
                <option value="Beverages">Beverages</option>
                <option value="Meals">Meals</option>
                <option value="Desserts">Desserts</option>
                <option value="Combos">Combos</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Selling Price ({cafeProfile.currency}) *
              </label>
              <input
                type="number"
                placeholder="120"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-2xl border border-border bg-secondary/30 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs font-bold text-foreground block mb-1">
                Cost Margin ({cafeProfile.currency})
              </label>
              <input
                type="number"
                placeholder="45"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full rounded-2xl border border-border bg-secondary/30 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          {/* Photo Management */}
          <div className="rounded-2xl border border-border bg-secondary/25 p-3 space-y-2.5">
            <label className="text-xs font-bold text-foreground block">
              Dish Photography
            </label>

            <div className="flex items-center gap-3">
              <div className="relative h-16 w-16 rounded-xl overflow-hidden border border-border bg-secondary shrink-0 shadow-xs">
                <img
                  src={imageUrl}
                  alt={name || 'Dish'}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/dishes/pav_bhaji.jpg';
                  }}
                />
              </div>

              <div className="flex-1 space-y-1.5">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-secondary hover:bg-secondary/80 border border-border py-1.5 px-3 text-xs font-bold text-foreground transition active:scale-98"
                >
                  <Camera className="h-3 w-3 text-accent" />
                  <span>Upload Real Photo</span>
                </button>

                {/* Preset quick choices */}
                <div className="flex gap-1 overflow-x-auto no-scrollbar py-0.5">
                  {sampleImages.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setImageUrl(s.url);
                        setEmoji(s.emoji);
                      }}
                      className={`relative h-7 w-7 rounded-lg overflow-hidden border transition shrink-0 ${
                        imageUrl === s.url ? 'ring-2 ring-accent border-accent' : 'opacity-70 hover:opacity-100'
                      }`}
                      title={s.name}
                    >
                      <img src={s.url} alt={s.name} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              Description (shown on Customer QR Menu)
            </label>
            <textarea
              placeholder="Freshly prepared, sizzling hot and served with delicious dips..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-2xl border border-border bg-secondary/30 px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-accent hover:opacity-95 text-white py-3 px-4 text-xs font-bold shadow-md transition active:scale-98"
            >
              <Plus className="h-4 w-4" />
              <span>Add {name.trim() || 'Dish'} to Menu</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

