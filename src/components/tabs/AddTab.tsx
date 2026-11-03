import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, Camera, Plus, Check, Users, Layers, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface AddTabProps {
  onOpenAiDishModal: () => void;
}

export const AddTab: React.FC<AddTabProps> = ({ onOpenAiDishModal }) => {
  const { addMenuItem, cafeProfile, tables, addTable, addMultipleTables, deleteTable } = useApp();

  const [activeTab, setActiveTab] = useState<'dish' | 'table'>('dish');

  // Dish state
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<string>('Snacks');
  const [price, setPrice] = useState<string>('');
  const [cost, setCost] = useState<string>('');
  const [emoji, setEmoji] = useState<string>('🥘');
  const [imageUrl, setImageUrl] = useState<string>('/dishes/grilled_sandwich.jpg');
  const [description, setDescription] = useState<string>('');

  // Table state
  const [tableName, setTableName] = useState<string>('');
  const [tableSection, setTableSection] = useState<string>('Main Hall');
  const [customSection, setCustomSection] = useState<string>('');
  const [tableCapacity, setTableCapacity] = useState<number>(4);
  const [tableShape, setTableShape] = useState<'square' | 'round' | 'rect'>('square');
  const [bulkCount, setBulkCount] = useState<number>(5);
  const [bulkPrefix, setBulkPrefix] = useState<string>('Table');

  const existingSections = useMemo(() => {
    const set = new Set<string>(['Main Hall', 'Outdoor Patio', 'VIP Lounge', 'Rooftop', 'AC Dining', 'Counter']);
    tables.forEach((t) => {
      if (t.section) set.add(t.section);
    });
    return Array.from(set);
  }, [tables]);

  const nextTableNumber = useMemo(() => {
    let max = 0;
    tables.forEach((t) => {
      const match = t.name.match(/Table\s*(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > max) max = num;
      }
    });
    return max + 1;
  }, [tables]);

  const sampleImages = [
    { name: 'Pav Bhaji', url: '/dishes/pav_bhaji.jpg', emoji: '🥘' },
    { name: 'Chai', url: '/dishes/masala_chai.jpg', emoji: '☕' },
    { name: 'Sandwich', url: '/dishes/grilled_sandwich.jpg', emoji: '🥪' },
    { name: 'Filter Coffee', url: '/dishes/filter_coffee.jpg', emoji: '☕' },
    { name: 'Chole Puri', url: '/dishes/chole_puri.jpg', emoji: '🍛' },
    { name: 'Gulab Jamun', url: '/dishes/gulab_jamun.jpg', emoji: '🍮' },
  ];

  const handleDishSubmit = (e: React.FormEvent) => {
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

  const handleTableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = tableName.trim() || `Table ${nextTableNumber}`;
    const effectiveSection = tableSection === 'CUSTOM' ? (customSection.trim() || 'Main Hall') : tableSection;
    try {
      addTable({
        name: finalName,
        section: effectiveSection,
        capacity: tableCapacity,
        shape: tableShape,
      });
      setTableName('');
    } catch {
      // Handled
    }
  };

  const handleBulkTableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkCount <= 0 || bulkCount > 100) {
      toast.error('Count must be between 1 and 100');
      return;
    }
    const effectiveSection = tableSection === 'CUSTOM' ? (customSection.trim() || 'Main Hall') : tableSection;
    addMultipleTables(bulkCount, effectiveSection, bulkPrefix.trim() || 'Table');
  };

  return (
    <div className="w-full max-w-4xl mx-auto pb-36 space-y-5 animate-fade-in">
      {/* Sub-Tab Navigation Switcher */}
      <div className="flex rounded-2xl bg-secondary/80 p-1 border border-border/80 shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab('dish')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-bold transition active:scale-98 ${
            activeTab === 'dish'
              ? 'bg-card text-foreground shadow-sm border border-border/60'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <span>🍲</span>
          <span>Add Dish to Menu</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('table')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-bold transition active:scale-98 ${
            activeTab === 'table'
              ? 'bg-card text-foreground shadow-sm border border-border/60'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <span>🪑</span>
          <span>Add Dining Tables ({tables.length})</span>
        </button>
      </div>

      {activeTab === 'dish' ? (
        <>
          {/* AI Assistant Banner */}
          <div className="rounded-3xl bg-gradient-to-r from-[#3a1e12] via-[#592b18] to-[#3a1e12] p-5 sm:p-6 text-white shadow-elevated border border-amber-500/25">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-accent text-white shadow-sm">
                <Sparkles className="h-4 w-4" />
              </span>
              <h2 className="font-display text-xl font-bold tracking-tight">AI Menu Digitizer & Studio</h2>
            </div>
            <p className="mt-1.5 text-xs text-amber-200/90 leading-relaxed max-w-xl">
              Take a photo of your physical printed menu, counter board, or laminated card. Google Gemini 1.5 Flash Vision AI will parse all dishes, prices, and categories into ServeJoy with AI culinary photography.
            </p>

            <div className="mt-4 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={onOpenAiDishModal}
                className="flex items-center gap-2 rounded-2xl bg-accent px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-accent/90 transition active:scale-95"
              >
                <Camera className="h-4 w-4" />
                <span>Scan Menu Photo with AI Vision</span>
              </button>
            </div>
          </div>

          {/* Manual Add Dish Form */}
          <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
            <h3 className="font-display text-lg font-bold text-foreground">Add New Dish</h3>
            <p className="text-xs text-muted-foreground">Fill in item details and pricing</p>

            <form onSubmit={handleDishSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Dish Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Kadak Masala Chai, Pav Bhaji..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-border bg-card px-3.5 py-2.5 text-xs text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-border bg-card px-3.5 py-2.5 text-xs text-foreground focus:border-accent focus:outline-none"
                  >
                    <option value="Snacks">Snacks</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Meals">Meals</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Combos">Combos</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Selling Price (₹) *</label>
                  <input
                    type="number"
                    placeholder="120"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-border bg-card px-3.5 py-2.5 text-xs text-foreground focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Item Cost (₹)</label>
                  <input
                    type="number"
                    placeholder="45"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-border bg-card px-3.5 py-2.5 text-xs text-foreground focus:border-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Dish Emoji</label>
                  <input
                    type="text"
                    value={emoji}
                    onChange={(e) => setEmoji(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-border bg-card px-3.5 py-2.5 text-xs text-foreground focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Description</label>
                <textarea
                  placeholder="Appetizing description for customer QR menu..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="mt-1 w-full rounded-2xl border border-border bg-card px-3.5 py-2 text-xs text-foreground focus:border-accent focus:outline-none"
                />
              </div>

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
        </>
      ) : (
        /* ================= ADD TABLES TAB ================= */
        <div className="space-y-4">
          {/* Quick Table Addition Box */}
          <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between pb-3 border-b border-border/80">
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  Add Dining Table
                </h3>
                <p className="text-xs text-muted-foreground">
                  Create single or multiple tables with custom sections and seating capacity
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  addTable({
                    name: `Table ${nextTableNumber}`,
                    section: 'Main Hall',
                    capacity: 4,
                  });
                }}
                className="flex items-center gap-1.5 rounded-2xl bg-accent px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-95 transition active:scale-95"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Quick Add Table {nextTableNumber}</span>
              </button>
            </div>

            <form onSubmit={handleTableSubmit} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Table Name *</label>
                  <input
                    type="text"
                    placeholder={`e.g. Table ${nextTableNumber}, Rooftop 1`}
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-border bg-secondary/30 px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Section / Zone</label>
                  <select
                    value={tableSection}
                    onChange={(e) => setTableSection(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-border bg-secondary/30 px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    {existingSections.map((sec) => (
                      <option key={sec} value={sec}>
                        {sec}
                      </option>
                    ))}
                    <option value="CUSTOM">+ New Section</option>
                  </select>
                  {tableSection === 'CUSTOM' && (
                    <input
                      type="text"
                      placeholder="e.g. Garden, Terrace"
                      value={customSection}
                      onChange={(e) => setCustomSection(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-border bg-secondary/30 px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Capacity (Seats)</label>
                  <div className="mt-1 flex gap-1.5">
                    {[2, 4, 6, 8].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setTableCapacity(num)}
                        className={`flex-1 py-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1 ${
                          tableCapacity === num
                            ? 'border-accent bg-accent text-white shadow-sm'
                            : 'border-border bg-secondary/30 text-muted-foreground'
                        }`}
                      >
                        <Users className="h-3 w-3" />
                        <span>{num}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-2xl bg-accent px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:opacity-95 transition active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add {tableName.trim() || `Table ${nextTableNumber}`}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Bulk Table Generator */}
          <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center gap-2 pb-2 border-b border-border/80">
              <Layers className="h-4 w-4 text-accent" />
              <h3 className="font-display text-base font-bold text-foreground">
                Bulk Add Tables (Add As Many As You Want)
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Need to add 10, 20, or 50 tables at once? Choose count and prefix to generate instantly.
            </p>

            <form onSubmit={handleBulkTableSubmit} className="mt-4 flex flex-wrap items-end gap-3">
              <div>
                <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                  Prefix
                </label>
                <input
                  type="text"
                  value={bulkPrefix}
                  onChange={(e) => setBulkPrefix(e.target.value)}
                  placeholder="Table"
                  className="w-32 rounded-2xl border border-border bg-secondary/30 px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                  Count to Add
                </label>
                <div className="flex items-center gap-1.5">
                  {[5, 10, 20].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setBulkCount(n)}
                      className={`px-3 py-2 rounded-xl border text-xs font-bold transition ${
                        bulkCount === n
                          ? 'border-accent bg-accent text-white'
                          : 'border-border bg-secondary/30 text-muted-foreground'
                      }`}
                    >
                      +{n}
                    </button>
                  ))}
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={bulkCount}
                    onChange={(e) => setBulkCount(parseInt(e.target.value, 10) || 1)}
                    className="w-20 rounded-xl border border-border bg-secondary/30 px-2.5 py-2 text-xs text-foreground font-bold focus:outline-none focus:ring-2 focus:ring-accent text-center"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-500 px-5 py-2 text-xs font-bold text-white shadow-sm hover:opacity-95 transition active:scale-95"
              >
                <Layers className="h-4 w-4" />
                <span>
                  Generate {bulkCount} Tables ({bulkPrefix} {nextTableNumber} to {bulkPrefix} {nextTableNumber + bulkCount - 1})
                </span>
              </button>
            </form>
          </div>

          {/* Current Tables List */}
          <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between pb-3 border-b border-border/80">
              <h3 className="font-display text-base font-bold text-foreground">
                All Active Tables ({tables.length})
              </h3>
              <span className="text-xs text-muted-foreground">
                Visible in Floor Plan, POS Billing & Waiter terminals
              </span>
            </div>

            <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
              {tables.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-2xl border border-border bg-secondary/30 p-3 shadow-xs hover:border-accent/40 transition"
                >
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{t.name}</h4>
                    <p className="text-[10px] text-muted-foreground">{t.section}</p>
                    <p className="text-[9px] text-muted-foreground/80 flex items-center gap-1 mt-0.5">
                      <Users className="h-2.5 w-2.5" />
                      <span>{t.capacity} seats</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteTable(t.id)}
                    title={`Delete ${t.name}`}
                    className="h-7 w-7 flex items-center justify-center rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
