import React, { useState, useEffect, useRef } from 'react';
import { MenuItem } from '../../types';
import { useApp } from '../../context/AppContext';
import { matchLocalDishImage } from '../../services/aiService';
import {
  X,
  Camera,
  Trash2,
  Check,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Ban,
} from 'lucide-react';
import { toast } from 'sonner';

interface EditDishModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem | null;
}

export const EditDishModal: React.FC<EditDishModalProps> = ({
  isOpen,
  onClose,
  item,
}) => {
  const { updateMenuItem, deleteMenuItem, cafeProfile } = useApp();

  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<string>('Snacks');
  const [price, setPrice] = useState<string>('');
  const [cost, setCost] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [emoji, setEmoji] = useState<string>('🍽️');
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setCategory(item.category);
      setPrice(String(item.price));
      setCost(String(item.cost || Math.round(item.price * 0.4)));
      setDescription(item.description || '');
      setImageUrl(item.imageUrl || '');
      setEmoji(item.emoji || '🍽️');
      setIsAvailable(item.isAvailable !== false);
      setShowDeleteConfirm(false);
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  // Handle uploading real photo from phone/computer
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        // Compress to max 800px dimension and 85% JPEG quality for fast syncing
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

  // Generate fresh AI photography variation
  const handleRegenerateAiImage = () => {
    const newImage = matchLocalDishImage(name || item.name, category, Date.now() + Math.random());
    setImageUrl(newImage);
    toast.success('Generated new AI photo variation!', { icon: '✨' });
  };

  // Save changes
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Dish name is required');
      return;
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    const updatedItem: MenuItem = {
      ...item,
      name: name.trim(),
      category,
      price: numPrice,
      cost: parseFloat(cost) || Math.round(numPrice * 0.4),
      description: description.trim(),
      imageUrl: imageUrl.trim() || item.imageUrl,
      emoji: emoji.trim() || '🍽️',
      isAvailable,
    };

    updateMenuItem(updatedItem);
    onClose();
  };

  // Delete item
  const handleDelete = () => {
    deleteMenuItem(item.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-5 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-[2.5rem] border border-border bg-card p-5 sm:p-6 shadow-elevated max-h-[92vh] flex flex-col overflow-hidden text-left">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-border/80">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-accent/15 text-accent border border-accent/25">
              {emoji}
            </span>
            <div>
              <h3 className="font-display text-base sm:text-lg font-bold text-foreground">
                Edit Dish
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Update dish details, real photo, pricing, or sold out status
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

        {/* Modal Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Photo Management Section */}
          <div className="rounded-2xl border border-border bg-secondary/25 p-3.5 space-y-3">
            <label className="text-xs font-bold text-foreground block">
              Dish Image (Real Photo or AI Photography)
            </label>

            <div className="flex items-center gap-3.5">
              {/* Image Preview Thumbnail */}
              <div className="relative h-20 w-20 rounded-2xl overflow-hidden border border-border bg-secondary shrink-0 shadow-sm">
                <img
                  src={imageUrl || item.imageUrl}
                  alt={name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/dishes/pav_bhaji.jpg';
                  }}
                />
                {!isAvailable && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-[9px] font-extrabold text-red-500 bg-black/80 px-1 rounded uppercase">
                      Sold Out
                    </span>
                  </div>
                )}
              </div>

              {/* Upload & Regenerate Buttons */}
              <div className="flex-1 space-y-2">
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
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-secondary hover:bg-secondary/80 border border-border py-2 px-3 text-xs font-bold text-foreground transition active:scale-98"
                >
                  <Camera className="h-3.5 w-3.5 text-accent" />
                  <span>Upload Real Photo</span>
                </button>

                <button
                  type="button"
                  onClick={handleRegenerateAiImage}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-accent/10 hover:bg-accent/20 border border-accent/25 py-2 px-3 text-xs font-bold text-accent transition active:scale-98"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Generate AI Variation</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sold Out / In Stock Toggle Button */}
          <div className="rounded-2xl border border-border bg-secondary/25 p-3.5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-foreground">Dish Availability Status</p>
              <p className="text-[11px] text-muted-foreground">
                {isAvailable
                  ? 'In Stock — Customers can order this dish on QR menu'
                  : 'Sold Out — Displayed as Sold Out on QR menu'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAvailable(!isAvailable)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition shadow-sm ${
                isAvailable
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {isAvailable ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>In Stock</span>
                </>
              ) : (
                <>
                  <Ban className="h-3.5 w-3.5" />
                  <span>Sold Out</span>
                </>
              )}
            </button>
          </div>

          {/* Dish Name */}
          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              Dish Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chicken Popcorn, Kadak Masala Chai..."
              className="w-full rounded-2xl border border-border bg-card px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent font-semibold"
            />
          </div>

          {/* Category & Emoji */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="col-span-2">
              <label className="text-xs font-bold text-foreground block mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-2xl border border-border bg-card px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent font-semibold"
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
                Emoji
              </label>
              <input
                type="text"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                className="w-full rounded-2xl border border-border bg-card px-3.5 py-2 text-center text-sm focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          {/* Price & Cost */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Selling Price ({cafeProfile.currency}) *
              </label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="120"
                className="w-full rounded-2xl border border-border bg-card px-3.5 py-2.5 text-xs text-foreground font-receipt font-bold focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Kitchen Cost ({cafeProfile.currency})
              </label>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="45"
                className="w-full rounded-2xl border border-border bg-card px-3.5 py-2.5 text-xs text-foreground font-receipt font-bold focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Freshly prepared with authentic herbs and served hot..."
              className="w-full rounded-2xl border border-border bg-card p-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* Delete Section */}
          <div className="pt-2 border-t border-border/70">
            {!showDeleteConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600 transition"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Dish from Menu</span>
              </button>
            ) : (
              <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/25 space-y-2 animate-fade-in">
                <div className="flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Are you sure you want to delete &quot;{name}&quot;?</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex-1 py-1.5 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition"
                  >
                    Yes, Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-1.5 rounded-xl bg-secondary text-foreground font-bold text-xs hover:bg-secondary/80 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl border border-border bg-secondary py-3 text-xs font-bold text-foreground hover:bg-secondary/80 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-accent py-3 text-xs font-bold text-white shadow hover:bg-accent/90 transition active:scale-98"
            >
              <Check className="h-4 w-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
