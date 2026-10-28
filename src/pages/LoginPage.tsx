import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Coffee, Lock, KeyRound, ArrowRight, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { userRole, setUserRole, cafeProfile, updateCafeProfile } = useApp();

  const [pin, setPin] = useState<string>('');
  const [isEditingCafe, setIsEditingCafe] = useState<boolean>(false);
  const [cafeName, setCafeName] = useState<string>(cafeProfile.name);
  const [cafeUpi, setCafeUpi] = useState<string>(cafeProfile.upiId);
  const [cafePhone, setCafePhone] = useState<string>(cafeProfile.phone);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '1234' || pin.length === 4) {
      toast.success(`Authenticated as ${userRole.toUpperCase()}!`);
      navigate('/');
    } else {
      toast.error('Invalid PIN! (Use default PIN: 1234)');
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCafeProfile({
      ...cafeProfile,
      name: cafeName,
      upiId: cafeUpi,
      phone: cafePhone,
    });
    setIsEditingCafe(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-sm rounded-[2.5rem] border border-border bg-card p-6 shadow-elevated text-center space-y-4">
        {/* Logo */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-[#372215] to-[#653520] text-amber-200 shadow-md">
          <Coffee className="h-7 w-7 text-amber-200" />
        </div>

        <div>
          <h2 className="font-display text-xl font-bold text-foreground">{cafeProfile.name}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Staff POS & Terminal Authentication</p>
        </div>

        {/* Role Selector */}
        <div>
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
            Select Role
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {(['owner', 'cashier', 'waiter', 'kitchen'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setUserRole(r)}
                className={`rounded-xl py-2 text-xs font-bold capitalize transition ${
                  userRole === r
                    ? 'bg-accent text-white shadow-sm'
                    : 'bg-secondary text-foreground hover:bg-muted'
                }`}
              >
                {r === 'owner' ? '👑 Owner' : r === 'cashier' ? '💼 Cashier' : r === 'waiter' ? '🍽️ Waiter' : '🍳 Kitchen'}
              </button>
            ))}
          </div>
        </div>

        {/* PIN Form */}
        <form onSubmit={handleLogin} className="space-y-3 pt-1">
          <div className="relative">
            <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="password"
              maxLength={4}
              placeholder="Enter 4-digit staff PIN (1234)"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full rounded-2xl border border-border bg-secondary/50 pl-10 pr-4 py-2.5 text-center text-sm tracking-widest font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-accent py-3 text-xs font-bold text-white shadow-md hover:bg-accent/90 transition active:scale-98"
          >
            <span>Unlock Terminal</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Cafe Profile Quick Editor Toggle */}
        <div className="pt-2 border-t border-border">
          <button
            type="button"
            onClick={() => setIsEditingCafe(!isEditingCafe)}
            className="text-xs text-muted-foreground hover:text-foreground font-semibold"
          >
            {isEditingCafe ? 'Hide Cafe Profile Settings' : 'Edit Cafe Name & UPI ID'}
          </button>

          {isEditingCafe && (
            <form onSubmit={handleSaveProfile} className="mt-3 space-y-2 text-left animate-fade-in">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Cafe Name</label>
                <input
                  type="text"
                  value={cafeName}
                  onChange={(e) => setCafeName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-secondary/50 px-2.5 py-1.5 text-xs text-foreground focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase">UPI ID</label>
                <input
                  type="text"
                  value={cafeUpi}
                  onChange={(e) => setCafeUpi(e.target.value)}
                  className="w-full rounded-xl border border-border bg-secondary/50 px-2.5 py-1.5 text-xs text-foreground focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-secondary py-2 text-xs font-bold text-foreground hover:bg-muted"
              >
                Save Profile
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

