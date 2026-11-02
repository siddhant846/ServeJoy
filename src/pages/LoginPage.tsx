import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { storage, DEFAULT_BUSINESS_ACCOUNT } from '../services/storage';
import { subscriptionService } from '../services/subscriptionService';
import { Coffee, KeyRound, ArrowRight, ShieldCheck, Sparkles, Store, Lock, Mail, User, Phone, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Mode: 'owner' vs 'staff'
  const [authMode, setAuthMode] = useState<'owner' | 'staff'>('owner');

  // Owner tab: 'signin' vs 'signup'
  const [ownerTab, setOwnerTab] = useState<'signin' | 'signup'>('signin');

  // Form states
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [ownerName, setOwnerName] = useState<string>('');
  const [businessName, setBusinessName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');

  // Staff terminal states
  const [selectedBizId, setSelectedBizId] = useState<string>(() => storage.getActiveBusinessId());
  const [staffPin, setStaffPin] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const registeredBusinesses = storage.getAllBusinesses();

  // Handle Google OAuth Sign-In / Sign-Up
  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      const googleMockUser = {
        email: email || 'owner@restaurant.com',
        displayName: ownerName || 'Restaurant Owner',
        googleUid: `google_uid_${Date.now()}`,
        photoURL: 'https://lh3.googleusercontent.com/a/default-user',
      };

      const res = await authService.loginOwner(
        googleMockUser.email,
        googleMockUser.googleUid,
        googleMockUser.photoURL,
        googleMockUser.displayName
      );

      if (res.success) {
        toast.success(`Welcome to ServeJoy, ${res.user?.displayName}!`, { icon: '🎉' });
        navigate('/');
      } else {
        toast.error(res.error || 'Google authentication failed.');
      }
    } catch (err: any) {
      toast.error('Google Sign-In error: ' + (err.message || String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Owner Email Login / Sign-Up
  const handleOwnerAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your business email.');
      return;
    }

    setIsLoading(true);
    try {
      if (ownerTab === 'signup') {
        if (!businessName.trim()) {
          toast.error('Please enter your Restaurant or Café Name.');
          setIsLoading(false);
          return;
        }

        const res = await authService.registerOwner({
          email,
          ownerName,
          businessName,
          phone,
          password,
        });

        if (res.success) {
          toast.success(`🎉 7-Day Free Trial Activated for ${businessName}!`, { icon: '🚀' });
          navigate('/');
        } else {
          toast.error(res.error || 'Registration failed.');
        }
      } else {
        // Sign-In
        const res = await authService.loginOwner(email);
        if (res.success) {
          toast.success(`Welcome back, ${res.user?.displayName}!`, { icon: '👋' });
          navigate('/');
        } else {
          toast.error(res.error || 'Account not found.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Staff Terminal PIN Login
  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffPin.trim() || staffPin.length < 4) {
      toast.error('Please enter your 4-digit staff PIN.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.loginStaff(selectedBizId, staffPin);
      if (res.success) {
        toast.success(`Terminal unlocked as ${res.user?.displayName}!`, { icon: '🔓' });
        navigate('/');
      } else {
        toast.error(res.error || 'Invalid staff PIN.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 1-Click Demo Login for Prospective Clients
  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      const res = await authService.loginOwner(
        'siddhant@chaipoint.com',
        'demo_siddhant',
        undefined,
        'Siddhant (Demo)'
      );
      if (res.success) {
        toast.success('Loaded Chai Point commercial demo terminal!', { icon: '☕' });
        navigate('/');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md rounded-[2.5rem] border border-border bg-card p-6 sm:p-8 shadow-elevated text-center space-y-5">
        {/* Logo */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-[#372215] to-[#653520] text-amber-200 shadow-md">
          <Coffee className="h-7 w-7 text-amber-200" />
        </div>

        <div>
          <h1 className="font-display text-2xl font-black text-foreground">ServeJoy POS</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Commercial Restaurant & Café Management Software
          </p>
        </div>

        {/* Portal Switcher: Owner Account vs Staff Terminal */}
        <div className="flex items-center rounded-2xl bg-secondary p-1 border border-border text-xs font-bold">
          <button
            type="button"
            onClick={() => setAuthMode('owner')}
            className={`flex-1 py-2 rounded-xl transition ${
              authMode === 'owner'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            👑 Owner Login / Sign Up
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('staff')}
            className={`flex-1 py-2 rounded-xl transition ${
              authMode === 'staff'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            💼 Staff PIN Terminal
          </button>
        </div>

        {/* ================= MODE 1: OWNER PORTAL ================= */}
        {authMode === 'owner' && (
          <div className="space-y-4">
            {/* Sub-tab: Sign In vs 7-Day Trial Sign Up */}
            <div className="flex items-center justify-center gap-4 text-xs font-bold border-b border-border/80 pb-2">
              <button
                type="button"
                onClick={() => setOwnerTab('signin')}
                className={`pb-1 border-b-2 transition ${
                  ownerTab === 'signin'
                    ? 'border-accent text-accent'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Log In to Business
              </button>
              <button
                type="button"
                onClick={() => setOwnerTab('signup')}
                className={`flex items-center gap-1 pb-1 border-b-2 transition ${
                  ownerTab === 'signup'
                    ? 'border-accent text-accent'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                <span>Start 7-Day Free Trial</span>
              </button>
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 rounded-2xl border border-border bg-secondary py-3 px-4 text-xs font-bold text-foreground hover:bg-secondary/80 transition active:scale-98 shadow-sm"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{ownerTab === 'signup' ? 'Sign Up with Google (7-Day Trial)' : 'Continue with Google'}</span>
            </button>

            <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-mono">
              <span className="flex-1 border-b border-border" />
              <span>Or with email</span>
              <span className="flex-1 border-b border-border" />
            </div>

            {/* Email & Password Form */}
            <form onSubmit={handleOwnerAuth} className="space-y-3 text-left">
              {ownerTab === 'signup' && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-foreground mb-1">
                      Restaurant / Café Name *
                    </label>
                    <div className="relative">
                      <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <input
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. Chai Point, Spice Garden"
                        className="w-full rounded-xl border border-input bg-secondary/40 pl-9 pr-3 py-2 text-xs text-foreground focus:outline-none focus:border-accent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-foreground mb-1">
                      Your Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <input
                        type="text"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        placeholder="e.g. Siddhant Ramteke"
                        className="w-full rounded-xl border border-input bg-secondary/40 pl-9 pr-3 py-2 text-xs text-foreground focus:outline-none focus:border-accent"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-[11px] font-bold text-foreground mb-1">
                  Business Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="owner@chaipoint.com"
                    className="w-full rounded-xl border border-input bg-secondary/40 pl-9 pr-3 py-2 text-xs text-foreground focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-foreground mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-input bg-secondary/40 pl-9 pr-3 py-2 text-xs text-foreground focus:outline-none focus:border-accent font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-accent py-3 text-xs font-bold text-white shadow-md hover:bg-accent/90 transition active:scale-98 mt-2"
              >
                <span>{ownerTab === 'signup' ? 'Start 7-Day Free Trial' : 'Sign In as Owner'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}

        {/* ================= MODE 2: STAFF TERMINAL PIN ================= */}
        {authMode === 'staff' && (
          <form onSubmit={handleStaffLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-[11px] font-bold text-foreground mb-1">
                Select Your Restaurant Outlet
              </label>
              <select
                value={selectedBizId}
                onChange={(e) => setSelectedBizId(e.target.value)}
                className="w-full rounded-xl border border-input bg-secondary/50 px-3 py-2.5 text-xs text-foreground focus:outline-none focus:border-accent font-medium"
              >
                {registeredBusinesses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.businessName} ({b.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-foreground mb-1 flex items-center justify-between">
                <span>Enter 4-Digit Staff PIN</span>
                <span className="text-[10px] text-muted-foreground">Assigned by Owner</span>
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  maxLength={4}
                  required
                  placeholder="••••"
                  value={staffPin}
                  onChange={(e) => setStaffPin(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-secondary/50 pl-10 pr-4 py-3 text-center text-lg tracking-widest font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-accent py-3 text-xs font-bold text-white shadow-md hover:bg-accent/90 transition active:scale-98"
            >
              <span>Unlock Staff Terminal</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <p className="text-[10px] text-center text-muted-foreground">
              Waiters, cashiers, and kitchen staff receive their 4-digit PIN directly from the restaurant owner.
            </p>
          </form>
        )}

        {/* Quick Demo & Pricing Links */}
        <div className="pt-2 border-t border-border flex flex-col gap-2">
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full py-2 text-xs font-bold text-accent hover:underline rounded-xl bg-accent/10 border border-accent/20 transition"
          >
            ⚡ 1-Click Client Demo (Explore Chai Point)
          </button>

          <Link
            to="/pricing"
            className="text-xs text-muted-foreground hover:text-foreground font-semibold inline-flex items-center justify-center gap-1"
          >
            <span>View All Plans & Pricing</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};
