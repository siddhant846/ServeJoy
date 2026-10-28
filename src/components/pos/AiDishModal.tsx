import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { matchLocalDishImage, generateDishDescriptionWithGemini } from '../../services/aiService';
import { X, Sparkles, Image as ImageIcon, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';

interface AiDishModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiDishModal: React.FC<AiDishModalProps> = ({ isOpen, onClose }) => {
  const { addMenuItem, cafeProfile } = useApp();

  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<string>('Snacks');
  const [price, setPrice] = useState<string>('120');
  const [cost, setCost] = useState<string>('40');
  const [emoji, setEmoji] = useState<string>('🍲');
  const [description, setDescription] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isGeneratingDesc, setIsGeneratingDesc] = useState<boolean>(false);
  const [isGeneratingImg, setIsGeneratingImg] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleGenerateDescription = async () => {
    if (!name.trim()) {
      toast.error('Please enter dish name first');
      return;
    }
    setIsGeneratingDesc(true);
    const desc = await generateDishDescriptionWithGemini(name, category);
    setDescription(desc);
    setIsGeneratingDesc(false);
  };

  const handleGenerateImage = () => {
    if (!name.trim()) {
      toast.error('Please enter dish name first');
      return;
    }
    setIsGeneratingImg(true);
    const matchedUrl = matchLocalDishImage(name, category);
    setImageUrl(matchedUrl);
    setTimeout(() => {
      setIsGeneratingImg(false);
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Dish name is required');
      return;
    }

    const finalImage = imageUrl || matchLocalDishImage(name, category);
    const finalDesc = description.trim() || `Freshly prepared chef's special authentic ${name}.`;

    addMenuItem({
      name: name.trim(),
      category,
      price: parseFloat(price) || 100,
      cost: parseFloat(cost) || 40,
      emoji: emoji || '🍲',
      imageUrl: finalImage,
      isAvailable: true,
      description: finalDesc,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-5 shadow-elevated max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-foreground">AI Menu Item Creator</h3>
              <p className="text-[11px] text-muted-foreground">Smart culinary photography & copywriting</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-3.5 space-y-3">
          <div>
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Dish / Beverage Name
            </label>
            <input
              type="text"
              placeholder="e.g. Kulhad Ginger Chai or Cheese Garlic Toast"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-border bg-secondary/50 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-border bg-secondary/50 px-2.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="Snacks">Snacks</option>
                <option value="Beverages">Beverages</option>
                <option value="Desserts">Desserts</option>
                <option value="Meals">Meals</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                Emoji Icon
              </label>
              <input
                type="text"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                className="w-full rounded-xl border border-border bg-secondary/50 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                Selling Price ({cafeProfile.currency})
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-xl border border-border bg-secondary/50 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                Food Cost ({cafeProfile.currency})
              </label>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full rounded-xl border border-border bg-secondary/50 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          {/* Description & AI Button */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Menu Description
              </label>
              <button
                type="button"
                onClick={handleGenerateDescription}
                disabled={isGeneratingDesc}
                className="flex items-center gap-1 text-[11px] font-bold text-accent hover:underline"
              >
                {isGeneratingDesc ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                <span>AI Generate</span>
              </button>
            </div>
            <textarea
              rows={2}
              placeholder="Sensory description of taste, ingredients, and texture..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-border bg-secondary/50 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* Image & AI Generation */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Photo Plating
              </label>
              <button
                type="button"
                onClick={handleGenerateImage}
                disabled={isGeneratingImg}
                className="flex items-center gap-1 text-[11px] font-bold text-orange-600 hover:underline"
              >
                {isGeneratingImg ? <Loader2 className="h-3 w-3 animate-spin" /> : <ImageIcon className="h-3 w-3" />}
                <span>Auto-Match Image</span>
              </button>
            </div>

            {imageUrl && (
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-secondary mb-2">
                <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="pt-2 flex gap-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl bg-secondary py-2.5 text-xs font-bold text-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-accent py-2.5 text-xs font-bold text-white shadow-md hover:bg-accent/90"
            >
              <Check className="h-4 w-4" />
              <span>Add to Menu</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

