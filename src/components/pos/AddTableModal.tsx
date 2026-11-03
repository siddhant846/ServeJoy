import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Plus, Layers, Users, Sparkles, Check, Hash } from 'lucide-react';
import { toast } from 'sonner';

interface AddTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSection?: string;
}

export const AddTableModal: React.FC<AddTableModalProps> = ({
  isOpen,
  onClose,
  defaultSection = 'Main Hall',
}) => {
  const { tables, addTable, addMultipleTables } = useApp();

  const [mode, setMode] = useState<'single' | 'bulk'>('single');

  // Single table state
  const [tableName, setTableName] = useState<string>('');
  const [section, setSection] = useState<string>(defaultSection);
  const [customSection, setCustomSection] = useState<string>('');
  const [capacity, setCapacity] = useState<number>(4);
  const [shape, setShape] = useState<'square' | 'round' | 'rect'>('square');

  // Bulk add state
  const [bulkCount, setBulkCount] = useState<number>(5);
  const [bulkPrefix, setBulkPrefix] = useState<string>('Table');
  const [bulkSection, setBulkSection] = useState<string>(defaultSection);

  // Existing sections
  const existingSections = useMemo(() => {
    const set = new Set<string>(['Main Hall', 'Outdoor Patio', 'VIP Lounge', 'Rooftop', 'AC Dining', 'Counter']);
    tables.forEach((t) => {
      if (t.section) set.add(t.section);
    });
    return Array.from(set);
  }, [tables]);

  // Compute next suggested table number
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

  if (!isOpen) return null;

  const effectiveSection = section === 'CUSTOM' ? (customSection.trim() || 'Main Hall') : section;

  const handleQuickAdd = () => {
    try {
      addTable({
        name: `Table ${nextTableNumber}`,
        section: effectiveSection,
        capacity: 4,
        shape: 'square',
      });
      onClose();
    } catch {
      // handled in addTable
    }
  };

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = tableName.trim() || `Table ${nextTableNumber}`;
    try {
      addTable({
        name: finalName,
        section: effectiveSection,
        capacity,
        shape,
      });
      setTableName('');
      onClose();
    } catch {
      // Handled in addTable
    }
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkCount <= 0 || bulkCount > 100) {
      toast.error('Please enter a count between 1 and 100');
      return;
    }
    addMultipleTables(bulkCount, bulkSection, bulkPrefix.trim() || 'Table');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-5 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-[2.5rem] border border-border bg-card p-5 sm:p-6 shadow-elevated max-h-[92vh] flex flex-col overflow-hidden text-left">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-border/80">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-accent/15 text-accent border border-accent/25">
              🪑
            </span>
            <div>
              <h3 className="font-display text-base sm:text-lg font-bold text-foreground">
                Add Tables
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Add as many dining tables or takeaway counters as you need
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

        {/* 1-Click Quick Add Next Table Banner */}
        <div className="my-3.5 rounded-2xl border border-accent/25 bg-accent/10 p-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              <span>Next in sequence: Table {nextTableNumber}</span>
            </p>
            <p className="text-[10px] text-muted-foreground">
              Add Table {nextTableNumber} to {effectiveSection} instantly
            </p>
          </div>
          <button
            type="button"
            onClick={handleQuickAdd}
            className="shrink-0 flex items-center gap-1 rounded-xl bg-accent px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:opacity-95 transition active:scale-95"
          >
            <Plus className="h-3 w-3" />
            <span>Quick Add</span>
          </button>
        </div>

        {/* Mode Toggle: Single Table vs Bulk Add */}
        <div className="flex rounded-xl bg-secondary/80 p-1 border border-border/80 mb-3.5">
          <button
            type="button"
            onClick={() => setMode('single')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition ${
              mode === 'single'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Single Table</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('bulk')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition ${
              mode === 'bulk'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Bulk Add Tables</span>
          </button>
        </div>

        {/* Modal Form */}
        <div className="flex-1 overflow-y-auto pr-1">
          {mode === 'single' ? (
            <form onSubmit={handleSingleSubmit} className="space-y-3.5">
              {/* Table Name */}
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Table Name or Number *
                </label>
                <input
                  type="text"
                  placeholder={`e.g. Table ${nextTableNumber}, Rooftop 3, VIP Lounge`}
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-secondary/30 px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent input-glow-orange"
                />
              </div>

              {/* Section */}
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Floor Section / Zone
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full rounded-2xl border border-border bg-secondary/30 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    {existingSections.map((sec) => (
                      <option key={sec} value={sec}>
                        {sec}
                      </option>
                    ))}
                    <option value="CUSTOM">+ New Custom Section</option>
                  </select>

                  {section === 'CUSTOM' && (
                    <input
                      type="text"
                      placeholder="e.g. Poolside, 2nd Floor"
                      value={customSection}
                      onChange={(e) => setCustomSection(e.target.value)}
                      className="w-full rounded-2xl border border-border bg-secondary/30 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      autoFocus
                    />
                  )}
                </div>
              </div>

              {/* Capacity */}
              <div>
                <label className="text-xs font-bold text-foreground block mb-1.5 flex items-center justify-between">
                  <span>Seating Capacity</span>
                  <span className="text-muted-foreground font-normal">{capacity} persons</span>
                </label>
                <div className="flex gap-2">
                  {[2, 4, 6, 8, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCapacity(num)}
                      className={`flex-1 py-1.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1 ${
                        capacity === num
                          ? 'border-accent bg-accent text-white shadow-sm'
                          : 'border-border bg-secondary/30 text-muted-foreground hover:bg-secondary'
                      }`}
                    >
                      <Users className="h-3 w-3" />
                      <span>{num}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Shape */}
              <div>
                <label className="text-xs font-bold text-foreground block mb-1.5">
                  Table Shape
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'square', label: 'Square' },
                    { id: 'round', label: 'Round' },
                    { id: 'rect', label: 'Rectangle' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setShape(s.id as any)}
                      className={`py-2 rounded-xl border text-xs font-bold transition ${
                        shape === s.id
                          ? 'border-accent bg-accent/15 text-accent shadow-sm'
                          : 'border-border bg-secondary/30 text-muted-foreground hover:bg-secondary'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-accent hover:opacity-95 text-white py-2.5 px-4 text-xs font-bold shadow-md transition active:scale-98"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add {tableName.trim() || `Table ${nextTableNumber}`}</span>
                </button>
              </div>
            </form>
          ) : (
            /* Bulk Add Mode */
            <form onSubmit={handleBulkSubmit} className="space-y-3.5">
              <div className="rounded-2xl border border-border bg-secondary/25 p-3 text-xs text-muted-foreground">
                Quickly add 5, 10, or 20 tables at once. Table numbers will increment automatically.
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  How many tables do you want to add?
                </label>
                <div className="flex items-center gap-2">
                  {[5, 10, 15, 20].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setBulkCount(n)}
                      className={`flex-1 py-1.5 rounded-xl border text-xs font-bold transition ${
                        bulkCount === n
                          ? 'border-accent bg-accent text-white'
                          : 'border-border bg-secondary/30 text-muted-foreground'
                      }`}
                    >
                      +{n}
                    </button>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Custom count:</span>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={bulkCount}
                    onChange={(e) => setBulkCount(parseInt(e.target.value, 10) || 1)}
                    className="w-24 rounded-xl border border-border bg-secondary/30 px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-accent font-bold"
                  />
                  <span className="text-xs text-muted-foreground">tables</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Table Name Prefix
                </label>
                <input
                  type="text"
                  placeholder="e.g. Table, Booth, Rooftop, Patio"
                  value={bulkPrefix}
                  onChange={(e) => setBulkPrefix(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-secondary/30 px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Section / Zone
                </label>
                <select
                  value={bulkSection}
                  onChange={(e) => setBulkSection(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-secondary/30 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  {existingSections.map((sec) => (
                    <option key={sec} value={sec}>
                      {sec}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-accent hover:opacity-95 text-white py-2.5 px-4 text-xs font-bold shadow-md transition active:scale-98"
                >
                  <Plus className="h-4 w-4" />
                  <span>
                    Add {bulkCount} Tables ({bulkPrefix} {nextTableNumber} to {bulkPrefix} {nextTableNumber + bulkCount - 1})
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
