import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SoundboxSettings } from '../../types';
import { soundbox } from '../../services/soundbox';
import { X, Volume2, Bell, Check, Play } from 'lucide-react';

interface SoundboxModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SoundboxModal: React.FC<SoundboxModalProps> = ({ isOpen, onClose }) => {
  const { soundboxSettings, updateSoundboxSettings } = useApp();
  const [settings, setSettings] = useState<SoundboxSettings>(soundboxSettings);

  if (!isOpen) return null;

  const handleSave = () => {
    updateSoundboxSettings(settings);
    onClose();
  };

  const handleTestSpeech = () => {
    soundbox.playSuccessChime();
    setTimeout(() => {
      soundbox.speak('Payment received! 240 rupees received via UPI on Table 2.');
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-5 shadow-elevated">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Volume2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-foreground">Soundbox Voice Alerts</h3>
              <p className="text-[11px] text-muted-foreground">Audio announcements & TTS Chimes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="mt-3.5 space-y-3.5">
          {/* Master Toggle */}
          <div className="flex items-center justify-between rounded-2xl bg-secondary/50 p-3 border border-border">
            <div>
              <h4 className="text-xs font-bold text-foreground">Voice Soundbox</h4>
              <p className="text-[10px] text-muted-foreground">Speak orders & UPI payments aloud</p>
            </div>
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
              className="h-4 w-4 rounded accent-accent"
            />
          </div>

          {/* Language Selection */}
          <div>
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Accent / Language
            </label>
            <select
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value as any })}
              className="w-full rounded-xl border border-border bg-secondary/50 px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="en-IN">English (India - Indian Accent)</option>
              <option value="hi-IN">Hindi (हिंदी)</option>
            </select>
          </div>

          {/* Toggle Individual Announcements */}
          <div className="space-y-2 pt-1 border-t border-border/60">
            <label className="flex items-center justify-between text-xs font-semibold text-foreground cursor-pointer">
              <span>Announce UPI & Cash Payments</span>
              <input
                type="checkbox"
                checked={settings.announcePayments}
                onChange={(e) => setSettings({ ...settings, announcePayments: e.target.checked })}
                className="h-3.5 w-3.5 rounded accent-accent"
              />
            </label>

            <label className="flex items-center justify-between text-xs font-semibold text-foreground cursor-pointer">
              <span>Announce Incoming Table Orders</span>
              <input
                type="checkbox"
                checked={settings.announceOrders}
                onChange={(e) => setSettings({ ...settings, announceOrders: e.target.checked })}
                className="h-3.5 w-3.5 rounded accent-accent"
              />
            </label>

            <label className="flex items-center justify-between text-xs font-semibold text-foreground cursor-pointer">
              <span>Announce Kitchen KOT Ready</span>
              <input
                type="checkbox"
                checked={settings.announceReady}
                onChange={(e) => setSettings({ ...settings, announceReady: e.target.checked })}
                className="h-3.5 w-3.5 rounded accent-accent"
              />
            </label>
          </div>

          {/* Test Voice Button */}
          <button
            type="button"
            onClick={handleTestSpeech}
            className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-secondary py-2 text-xs font-bold text-foreground hover:bg-muted transition"
          >
            <Play className="h-3.5 w-3.5 text-accent" />
            <span>Test Soundbox Voice</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-2 pt-2 border-t border-border">
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl bg-secondary py-2.5 text-xs font-bold text-foreground hover:bg-muted"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 rounded-2xl bg-accent py-2.5 text-xs font-bold text-white shadow-md hover:bg-accent/90"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

