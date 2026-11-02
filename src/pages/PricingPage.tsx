import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PLANS, PlanPricing } from '../services/subscriptionService';
import { useApp } from '../context/AppContext';
import { SubscriptionTier, BillingCycle } from '../types';
import {
  Coffee,
  Check,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  HelpCircle,
  Clock,
  ChevronRight,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';

interface PricingPageProps {
  onPlanSelected?: (tier: SubscriptionTier, cycle: BillingCycle) => void;
  isModal?: boolean;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onPlanSelected, isModal = false }) => {
  const navigate = useNavigate();
  const { cafeProfile, userRole } = useApp();

  const [billingCycle, setBillingCycle] = useState<BillingCycle>('annual');

  const handleSelectPlan = (tier: SubscriptionTier) => {
    if (onPlanSelected) {
      onPlanSelected(tier, billingCycle);
      return;
    }

    if (tier === 'starter') {
      toast.success('Starting your 7-Day Free Trial! No credit card needed.', { icon: '🎉' });
      navigate('/signup');
    } else {
      // For paid plans, navigate to signup or open checkout
      toast.info(`Selected ${PLANS[tier].name} (${billingCycle.toUpperCase()})`, { icon: '💳' });
      navigate(`/login?plan=${tier}&cycle=${billingCycle}`);
    }
  };

  return (
    <div className={`min-h-screen bg-background text-foreground transition-colors duration-200 ${isModal ? 'min-h-0 py-2' : 'py-10 px-4 sm:px-6 lg:px-8'}`}>
      <div className="mx-auto max-w-6xl space-y-10">
        {/* Header */}
        <div className="text-center space-y-3.5 max-w-2xl mx-auto">
          {!isModal && (
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-2xl bg-secondary px-3.5 py-1.5 text-xs font-bold text-foreground hover:bg-secondary/80 transition mb-2"
            >
              <Coffee className="h-4 w-4 text-accent" />
              <span>Back to ServeJoy POS</span>
            </Link>
          )}

          <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3.5 py-1 text-xs font-bold text-accent border border-accent/20">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Fair, Transparent Indian Restaurant Pricing</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground">
            Simple Plans for Every <span className="text-accent">Café & Restaurant</span>
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Start with our <strong>7-Day Full Feature Free Trial</strong>. No credit card required. Upgrade when you're ready to power your daily counter rush.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="pt-2 flex items-center justify-center">
            <div className="flex items-center rounded-2xl bg-secondary p-1 border border-border shadow-sm text-xs font-bold">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`rounded-xl px-4 py-2 transition ${
                  billingCycle === 'monthly'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 transition ${
                  billingCycle === 'annual'
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>Annual Billing</span>
                <span className="rounded-full bg-white/25 px-1.5 py-0.5 text-[10px] uppercase font-black tracking-wide">
                  Save up to ₹3,000
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 3 Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {(['starter', 'pro', 'business'] as SubscriptionTier[]).map((tierKey) => {
            const plan = PLANS[tierKey];
            const isPro = tierKey === 'pro';
            const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
            const savings = plan.annualSavings;

            return (
              <div
                key={tierKey}
                className={`relative flex flex-col justify-between rounded-3xl border bg-card p-6 sm:p-7 shadow-card transition duration-300 hover:shadow-elevated ${
                  isPro
                    ? 'border-accent ring-2 ring-accent/30 shadow-elevated bg-gradient-to-b from-card to-secondary/30'
                    : 'border-border'
                }`}
              >
                {/* Pro Top Badge */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider shadow-sm ${
                        isPro
                          ? 'bg-accent text-white'
                          : 'bg-secondary text-foreground border border-border'
                      }`}
                    >
                      {isPro && <Sparkles className="h-3 w-3" />}
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div>
                  {/* Plan Name & Tagline */}
                  <div className="pt-2">
                    <h3 className="font-display text-xl font-bold text-foreground">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 min-h-[32px]">
                      {plan.description}
                    </p>
                  </div>

                  {/* Price Tag */}
                  <div className="my-5 border-y border-border/60 py-4">
                    <div className="flex items-baseline gap-1">
                      <span className="font-receipt text-3xl sm:text-4xl font-extrabold text-foreground">
                        {price === 0 ? '₹0' : `₹${price.toLocaleString('en-IN')}`}
                      </span>
                      <span className="text-xs font-semibold text-muted-foreground">
                        {price === 0 ? '/ 7 days trial' : billingCycle === 'annual' ? '/ year' : '/ month'}
                      </span>
                    </div>

                    {billingCycle === 'annual' && savings > 0 && (
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                        🎉 Save ₹{savings.toLocaleString('en-IN')} with annual billing!
                      </p>
                    )}
                    {tierKey === 'starter' && (
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1">
                        Free for first 7 days • Subscription required Day 8
                      </p>
                    )}
                  </div>

                  {/* Highlights */}
                  <div className="space-y-2 mb-4 text-xs font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-accent shrink-0" />
                      <span>{plan.maxBills}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-accent shrink-0" />
                      <span>{plan.maxDevices}</span>
                    </div>
                  </div>

                  {/* Feature Bullets */}
                  <ul className="space-y-2.5 text-xs text-muted-foreground pt-1 pb-6">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                          <Check className="h-2.5 w-2.5" />
                        </div>
                        <span className="text-foreground/90">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Action */}
                <button
                  type="button"
                  onClick={() => handleSelectPlan(tierKey)}
                  className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3 px-4 text-xs font-bold transition active:scale-98 shadow-sm ${
                    isPro
                      ? 'bg-accent text-white hover:bg-accent/90 shadow-md'
                      : 'bg-secondary text-foreground hover:bg-secondary/80 border border-border'
                  }`}
                >
                  <span>{plan.ctaLabel}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-card">
          <h2 className="font-display text-xl font-bold text-foreground text-center mb-6">
            Detailed Feature Comparison
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-border/80 text-muted-foreground uppercase font-receipt text-[11px]">
                  <th className="py-3 px-3">Feature</th>
                  <th className="py-3 px-3 text-center">Starter (Trial)</th>
                  <th className="py-3 px-3 text-center text-accent font-bold">Pro Café</th>
                  <th className="py-3 px-3 text-center">Business</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-foreground">
                <tr>
                  <td className="py-3 px-3 font-medium">Monthly Bill Capacity</td>
                  <td className="py-3 px-3 text-center text-muted-foreground">100 bills / mo</td>
                  <td className="py-3 px-3 text-center font-bold text-accent">Unlimited</td>
                  <td className="py-3 px-3 text-center font-bold">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-medium">Active Devices & Terminals</td>
                  <td className="py-3 px-3 text-center text-muted-foreground">1 Device</td>
                  <td className="py-3 px-3 text-center font-bold text-accent">Up to 3 Devices</td>
                  <td className="py-3 px-3 text-center font-bold">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-medium">Multi-Lingual Voice Soundbox (EN/HI/MR)</td>
                  <td className="py-3 px-3 text-center text-muted-foreground">English Only</td>
                  <td className="py-3 px-3 text-center font-bold text-emerald-600">English + Hindi + Marathi</td>
                  <td className="py-3 px-3 text-center font-bold text-emerald-600">English + Hindi + Marathi</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-medium">Custom Merchant Bill QR Code</td>
                  <td className="py-3 px-3 text-center text-muted-foreground">—</td>
                  <td className="py-3 px-3 text-center font-bold text-emerald-600">✓ Included</td>
                  <td className="py-3 px-3 text-center font-bold text-emerald-600">✓ Included</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-medium">Visual Floor Plan & Table Timers</td>
                  <td className="py-3 px-3 text-center text-muted-foreground">—</td>
                  <td className="py-3 px-3 text-center text-muted-foreground">—</td>
                  <td className="py-3 px-3 text-center font-bold text-emerald-600">✓ Included</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-medium">Table Standee QR Customer Ordering</td>
                  <td className="py-3 px-3 text-center text-muted-foreground">—</td>
                  <td className="py-3 px-3 text-center text-muted-foreground">—</td>
                  <td className="py-3 px-3 text-center font-bold text-emerald-600">✓ Included</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-medium">Customer Loyalty & Phone CRM</td>
                  <td className="py-3 px-3 text-center text-muted-foreground">—</td>
                  <td className="py-3 px-3 text-center text-muted-foreground">—</td>
                  <td className="py-3 px-3 text-center font-bold text-emerald-600">✓ Included</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-medium">Staff Role Permissions (Manager/Waiter/KOT)</td>
                  <td className="py-3 px-3 text-center text-muted-foreground">Basic</td>
                  <td className="py-3 px-3 text-center font-bold">3 Staff Profiles</td>
                  <td className="py-3 px-3 text-center font-bold text-emerald-600">Unlimited Staff</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-medium">Automatic Cloud Backup & Data Retention</td>
                  <td className="py-3 px-3 text-center text-muted-foreground">7 Days Retention</td>
                  <td className="py-3 px-3 text-center">Weekly Manual Export</td>
                  <td className="py-3 px-3 text-center font-bold text-emerald-600">Real-Time Continuous</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-medium">Customer Support Channel</td>
                  <td className="py-3 px-3 text-center text-muted-foreground">Email</td>
                  <td className="py-3 px-3 text-center font-bold text-accent">WhatsApp (10AM-10PM)</td>
                  <td className="py-3 px-3 text-center font-bold text-emerald-600">24/7 Priority Dedicated</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 7-Day Trial Security & Data Retention Guarantee Box */}
        <div className="rounded-3xl border border-amber-500/30 bg-amber-500/5 p-6 sm:p-7 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-display text-base font-bold text-foreground">
              ServeJoy 100% Zero-Data-Loss Guarantee
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              When your 7-day free trial concludes on Day 8, <strong>your past bills, menu, customer phone registry, and financial reports are NEVER deleted</strong>. Your records remain safely stored in read-only mode until you choose to renew.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

