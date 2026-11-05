import React, { useState, useEffect } from 'react';
import { X, Apple, Smartphone, Share, PlusSquare, Check, Copy, ExternalLink, Sparkles, MessageCircle } from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'ios' | 'android'>('ios');
  const [copied, setCopied] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detect if already installed as standalone PWA
    const isRunningStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    setIsStandalone(!!isRunningStandalone);

    // Auto-detect iOS vs Android
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setActiveTab('ios');
    } else if (/android/.test(ua)) {
      setActiveTab('android');
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const appUrl = window.location.origin;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setDeferredPrompt(null);
        onClose();
      }
    }
  };

  const shareText = encodeURIComponent(
    `☕ Open ServeJoy POS on your iPhone/Android: ${appUrl} - Add to Home Screen for 1-tap full-screen POS!`
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-card border border-border shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-gradient-to-r from-[#221008] to-[#3a1e12] text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-300">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">
                Install ServeJoy App
              </h3>
              <p className="text-[11px] text-amber-200/80">
                1-Tap Native App Experience on iPhone & Android
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition active:scale-95"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Toggle: iPhone vs Android */}
        <div className="flex border-b border-border bg-secondary/30 p-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('ios')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl text-xs font-bold transition ${
              activeTab === 'ios'
                ? 'bg-card text-foreground shadow-sm border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Apple className="h-4 w-4 text-accent" />
            <span>iPhone / iPad (iOS)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('android')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl text-xs font-bold transition ${
              activeTab === 'android'
                ? 'bg-card text-foreground shadow-sm border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Smartphone className="h-4 w-4 text-emerald-500" />
            <span>Android Phone / Tablet</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {isStandalone && (
            <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-3 flex items-center gap-2.5 text-xs text-emerald-600 font-semibold">
              <Check className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>ServeJoy is already running in standalone app mode on this device!</span>
            </div>
          )}

          {activeTab === 'ios' ? (
            <div className="space-y-4">
              {/* iOS Explain Banner */}
              <div className="rounded-2xl bg-amber-500/10 border border-amber-500/25 p-3.5">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-foreground">
                      Can I install an APK on iPhone?
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      <strong className="text-foreground">No, APKs are strictly Android-only</strong> and cannot be opened by Apple iOS. However, ServeJoy is a modern <strong className="text-accent">Progressive Web App (PWA)</strong> that installs directly from Safari onto any iPhone in seconds — no App Store, no fees, no delays!
                    </p>
                  </div>
                </div>
              </div>

              {/* Step-by-Step for iPhone */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  3 Simple Steps to Install on iPhone:
                </h4>

                {/* Step 1 */}
                <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3 shadow-xs">
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-accent text-white font-bold text-xs shrink-0">
                    1
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-foreground">Open in Safari</p>
                    <p className="text-muted-foreground text-[11px] mt-0.5">
                      Open <strong className="text-foreground">Safari browser</strong> on your iPhone and visit:
                    </p>
                    <code className="inline-block mt-1 px-2 py-0.5 rounded-lg bg-secondary text-accent font-receipt text-[11px]">
                      {appUrl}
                    </code>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3 shadow-xs">
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-accent text-white font-bold text-xs shrink-0">
                    2
                  </div>
                  <div className="text-xs flex-1">
                    <p className="font-bold text-foreground flex items-center gap-1.5">
                      Tap the Share Button <Share className="h-3.5 w-3.5 text-sky-500" />
                    </p>
                    <p className="text-muted-foreground text-[11px] mt-0.5">
                      Tap the square icon with the upward arrow at the bottom toolbar of Safari.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3 shadow-xs">
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-accent text-white font-bold text-xs shrink-0">
                    3
                  </div>
                  <div className="text-xs flex-1">
                    <p className="font-bold text-foreground flex items-center gap-1.5">
                      Tap &quot;Add to Home Screen&quot; <PlusSquare className="h-3.5 w-3.5 text-accent" />
                    </p>
                    <p className="text-muted-foreground text-[11px] mt-0.5">
                      Scroll down the options list and select <strong className="text-foreground">&quot;Add to Home Screen&quot;</strong>, then tap <strong className="text-accent">&quot;Add&quot;</strong> in the top-right corner.
                    </p>
                  </div>
                </div>
              </div>

              {/* Benefits list */}
              <div className="rounded-2xl border border-border/60 bg-secondary/30 p-3 space-y-1.5 text-[11px]">
                <p className="font-bold text-foreground">✨ What happens next?</p>
                <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                  <li>ServeJoy appears with its official café app icon on your iPhone home screen.</li>
                  <li>Opens in full-screen standalone mode with no Safari address bar.</li>
                  <li>Receives instant live updates automatically whenever you update your POS.</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Android Section */}
              <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/25 p-3.5">
                <div className="flex items-start gap-2.5">
                  <Smartphone className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-foreground">
                      Fastest Option for Android Users
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      Android users can install ServeJoy directly in 1 click as a PWA, or use an APK package.
                    </p>
                  </div>
                </div>
              </div>

              {deferredPrompt && (
                <button
                  type="button"
                  onClick={handleNativeInstall}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 shadow-md transition active:scale-98 text-xs"
                >
                  <Smartphone className="h-4 w-4" />
                  <span>Click to Install ServeJoy on this Android Device</span>
                </button>
              )}

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  How to Install on Chrome / Android:
                </h4>

                <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3 shadow-xs">
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-xs shrink-0">
                    1
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-foreground">Open in Google Chrome</p>
                    <p className="text-muted-foreground text-[11px] mt-0.5">
                      Visit <strong className="text-foreground">{appUrl}</strong> on Android Chrome.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3 shadow-xs">
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-xs shrink-0">
                    2
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-foreground">Tap 3 Dots Menu (⋮)</p>
                    <p className="text-muted-foreground text-[11px] mt-0.5">
                      Tap the 3 dots in the top right of Chrome and select <strong className="text-foreground">&quot;Install app&quot;</strong> or <strong className="text-foreground">&quot;Add to Home screen&quot;</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Share with Staff */}
          <div className="pt-2 border-t border-border space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Send Link to iPhone Waiters / Staff:
            </h4>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary hover:bg-secondary/80 py-2.5 px-3 text-xs font-bold text-foreground transition active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-500" />
                    <span className="text-emerald-500">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-muted-foreground" />
                    <span>Copy Web App Link</span>
                  </>
                )}
              </button>

              <a
                href={`https://wa.me/?text=${shareText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 px-4 text-xs font-bold transition active:scale-95 shadow-sm"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp Staff</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border bg-card/60 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-secondary hover:bg-secondary/80 px-4 py-2 text-xs font-bold text-foreground transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

