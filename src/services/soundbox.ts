import { SoundboxSettings } from '../types';
import { storage } from './storage';

class SoundboxService {
  private isSpeaking = false;
  private queue: string[] = [];
  private audioCtx: AudioContext | null = null;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  playChime(): void {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  }

  playSuccessChime(): void {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
      osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.24); // C6

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  }

  speak(text: string): void {
    const settings: SoundboxSettings = storage.getSoundboxSettings();
    if (!settings.enabled) return;

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = settings.volume;
    utterance.rate = settings.speechRate;
    utterance.lang = settings.language || 'en-IN';

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find((v) => v.lang === settings.language || v.lang.includes('IN'));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => {
      this.isSpeaking = false;
      if (this.queue.length > 0) {
        const next = this.queue.shift();
        if (next) this.speak(next);
      }
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
    };

    if (this.isSpeaking) {
      this.queue.push(text);
    } else {
      this.isSpeaking = true;
      window.speechSynthesis.speak(utterance);
    }
  }

  announceOrder(kotNumber: string, tableNumber: string, total: number): void {
    const settings = storage.getSoundboxSettings();
    if (!settings.announceOrders) return;
    this.playChime();
    setTimeout(() => {
      this.speak(`New order received! ${tableNumber}, KOT number ${kotNumber}, amount rupees ${total}`);
    }, 400);
  }

  announceOrderReady(kotNumber: string, tableNumber: string): void {
    const settings = storage.getSoundboxSettings();
    if (!settings.announceReady) return;
    this.playChime();
    setTimeout(() => {
      this.speak(`Order alert! KOT number ${kotNumber} for ${tableNumber} is ready for serving!`);
    }, 400);
  }

  announcePayment(total: number, paymentMode: string, reference: string): void {
    const settings = storage.getSoundboxSettings();
    if (!settings.announcePayments) return;
    this.playSuccessChime();
    setTimeout(() => {
      const modeText = paymentMode.toUpperCase();
      this.speak(`Payment successful! Received rupees ${total} via ${modeText} for ${reference}`);
    }, 400);
  }
}

export const soundbox = new SoundboxService();

