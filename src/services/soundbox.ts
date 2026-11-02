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
    const langCode = settings.language || 'en-IN';
    const preferredVoice = voices.find(
      (v) => v.lang === langCode || v.lang.startsWith(langCode.slice(0, 2)) || v.lang.includes('IN')
    );
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
    if (!settings.enabled || !settings.announceOrders) return;
    this.playChime();

    setTimeout(() => {
      let phrase = `New order received! ${tableNumber}, KOT number ${kotNumber}, amount rupees ${total}`;
      if (settings.language === 'hi-IN') {
        phrase = `नया ऑर्डर मिला है! ${tableNumber}, केओटी नंबर ${kotNumber}, कुल राशि ${total} रुपये`;
      } else if (settings.language === 'mr-IN') {
        phrase = `नवीन ऑर्डर आली आहे! ${tableNumber}, केओटी क्रमांक ${kotNumber}, एकूण रक्कम ${total} रुपये`;
      }
      this.speak(phrase);
    }, 400);
  }

  announceOrderReady(kotNumber: string, tableNumber: string): void {
    const settings = storage.getSoundboxSettings();
    if (!settings.enabled || !settings.announceReady) return;
    this.playChime();

    setTimeout(() => {
      let phrase = `Order alert! KOT number ${kotNumber} for ${tableNumber} is ready for serving!`;
      if (settings.language === 'hi-IN') {
        phrase = `ऑर्डर तैयार है! केओटी नंबर ${kotNumber}, ${tableNumber} का खाना तैयार है!`;
      } else if (settings.language === 'mr-IN') {
        phrase = `ऑर्डर तयार आहे! केओटी क्रमांक ${kotNumber}, ${tableNumber} ची ऑर्डर तयार आहे!`;
      }
      this.speak(phrase);
    }, 400);
  }

  announcePayment(total: number, paymentMode: string, reference: string): void {
    const settings = storage.getSoundboxSettings();
    if (!settings.enabled || !settings.announcePayments) return;
    this.playSuccessChime();

    setTimeout(() => {
      const modeText = paymentMode.toUpperCase();
      let phrase = `Payment successful! Received rupees ${total} via ${modeText} for ${reference}`;
      if (settings.language === 'hi-IN') {
        phrase = `भुगतान सफल रहा! ${reference} के लिए ${modeText} द्वारा ${total} रुपये प्राप्त हुए`;
      } else if (settings.language === 'mr-IN') {
        phrase = `पेमेंट यशस्वी झाले! ${reference} साठी ${modeText} द्वारे ${total} रुपये प्राप्त झाले`;
      }
      this.speak(phrase);
    }, 400);
  }

  announceUpiConfirmation(total: number, reference: string): void {
    const settings = storage.getSoundboxSettings();
    if (!settings.enabled || !settings.announceUpiConfirmation) return;
    this.playSuccessChime();

    setTimeout(() => {
      let phrase = `UPI Payment received! Rupees ${total} confirmed for ${reference}`;
      if (settings.language === 'hi-IN') {
        phrase = `यूपीआई भुगतान सफल! ${reference} के लिए ${total} रुपये प्राप्त हुए`;
      } else if (settings.language === 'mr-IN') {
        phrase = `यूपीआय पेमेंट कन्फर्म झाले! ${reference} साठी ${total} रुपये प्राप्त झाले`;
      }
      this.speak(phrase);
    }, 400);
  }

  announcePaidBill(billNumber: string, total: number): void {
    const settings = storage.getSoundboxSettings();
    if (!settings.enabled || !settings.announcePaidBills) return;
    this.playSuccessChime();

    setTimeout(() => {
      let phrase = `Bill ${billNumber} marked paid, amount rupees ${total}`;
      if (settings.language === 'hi-IN') {
        phrase = `बिल ${billNumber} चुकता हुआ, कुल राशि ${total} रुपये`;
      } else if (settings.language === 'mr-IN') {
        phrase = `बिल ${billNumber} भरले गेले, एकूण रक्कम ${total} रुपये`;
      }
      this.speak(phrase);
    }, 400);
  }

  announceWaiterCall(tableNumber: string, type: string): void {
    const settings = storage.getSoundboxSettings();
    if (!settings.enabled || !settings.announceWaiterCalls) return;
    this.playChime();

    setTimeout(() => {
      let typeLabel = type === 'water' ? 'water refill' : type === 'bill' ? 'the bill' : 'waiter assistance';
      let phrase = `Attention! ${tableNumber} is requesting ${typeLabel}`;
      if (settings.language === 'hi-IN') {
        const typeHi = type === 'water' ? 'पानी' : type === 'bill' ? 'बिल' : 'सहायता';
        phrase = `ध्यान दें! ${tableNumber} ने ${typeHi} के लिए बुलाया है`;
      } else if (settings.language === 'mr-IN') {
        const typeMr = type === 'water' ? 'पाणी' : type === 'bill' ? 'बिल' : 'मदत';
        phrase = `लक्ष द्या! ${tableNumber} ने ${typeMr} साठी बोलावले आहे`;
      }
      this.speak(phrase);
    }, 400);
  }
}

export const soundbox = new SoundboxService();

