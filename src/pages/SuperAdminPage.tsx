import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminService, TenantSummary, PlatformStats } from '../services/adminService';
import { authService } from '../services/authService';
import { storage } from '../services/storage';
import { SubscriptionTier, BillingCycle } from '../types';
import {
  ShieldAlert,
  Crown,
  Search,
  Plus,
  ArrowRight,
  Download,
  Calendar,
  Building2,
  Phone,
  Mail,
  ExternalLink,
  MessageCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Receipt,
  Users,
  Store,
  ChevronRight,
  X,
  Eye,
  Ban,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

export const SuperAdminPage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  const [tenants, setTenants] = useState<TenantSummary[]>(() => adminService.getAllTenants());
  const [stats, setStats] = useState<PlatformStats>(() => adminService.getPlatformStats());

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'trial' | 'paid' | 'expired' | 'suspended'>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [selectedTenantForUpgrade, setSelectedTenantForUpgrade] = useState<TenantSummary | null>(null);
  const [upgradeTier, setUpgradeTier] = useState<SubscriptionTier>('pro');
  const [upgradeCycle, setUpgradeCycle] = useState<BillingCycle>('annual');
  const [upgradeNote, setUpgradeNote] = useState('');

  // New Tenant Form state
  const [newBizName, setNewBizName] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newTier, setNewTier] = useState<SubscriptionTier>('starter');
  const [newTrialDays, setNewTrialDays] = useState<number>(7);

  // Snapshot modal state
  const [snapshotTenant, setSnapshotTenant] = useState<TenantSummary | null>(null);

  const refreshData = () => {
    setTenants(adminService.getAllTenants());
    setStats(adminService.getPlatformStats());
  };

  // Filtered tenants list
  const filteredTenants = useMemo(() => {
    return tenants.filter((t) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.profile.name.toLowerCase().includes(q) ||
        t.account.ownerName.toLowerCase().includes(q) ||
        t.account.ownerEmail.toLowerCase().includes(q) ||
        t.account.id.toLowerCase().includes(q) ||
        (t.profile.phone && t.profile.phone.includes(q));

      if (!matchesSearch) return false;

      if (selectedFilter === 'trial') {
        return t.subInfo.isTrial && !t.subInfo.isExpired && !t.account.suspended;
      }
      if (selectedFilter === 'paid') {
        return !t.subInfo.isTrial && !t.subInfo.isExpired && !t.account.suspended;
      }
      if (selectedFilter === 'expired') {
        return t.subInfo.isExpired && !t.account.suspended;
      }
      if (selectedFilter === 'suspended') {
        return !!t.account.suspended;
      }

      return true;
    });
  }, [tenants, searchQuery, selectedFilter]);

  // Handle Extend Trial
  const handleExtendTrial = (tenant: TenantSummary) => {
    adminService.extendTrial(tenant.account.id, 7);
    toast.success(`+7 days added to ${tenant.profile.name}'s trial!`, { icon: '⏳' });
    refreshData();
  };

  // Handle Upgrade Plan
  const handleSaveUpgrade = () => {
    if (!selectedTenantForUpgrade) return;
    adminService.updatePlan(
      selectedTenantForUpgrade.account.id,
      upgradeTier,
      upgradeCycle,
      upgradeNote || 'Super Admin Override'
    );
    toast.success(`${selectedTenantForUpgrade.profile.name} upgraded to ${upgradeTier.toUpperCase()}!`, { icon: '🚀' });
    setIsUpgradeModalOpen(false);
    refreshData();
  };

  // Handle Toggle Suspension
  const handleToggleSuspend = (tenant: TenantSummary) => {
    const isNowSuspended = adminService.toggleSuspension(tenant.account.id);
    toast.info(`${tenant.profile.name} is now ${isNowSuspended ? 'Suspended' : 'Active'}.`);
    refreshData();
  };

  // Handle Switch / Impersonate View
  const handleOpenTenantPos = (tenant: TenantSummary) => {
    adminService.impersonateTenant(tenant.account.id);
    toast.success(`Active outlet switched to ${tenant.profile.name}`, { icon: '🏪' });
    navigate('/');
  };

  // Handle Add New Tenant
  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBizName.trim() || !newEmail.trim()) {
      toast.error('Restaurant name and owner email are required.');
      return;
    }

    try {
      adminService.createTenant({
        businessName: newBizName,
        ownerName: newOwnerName || 'Owner',
        email: newEmail,
        phone: newPhone,
        tier: newTier,
        trialDays: newTrialDays,
      });

      toast.success(`Restaurant "${newBizName}" provisioned successfully!`, { icon: '🎉' });
      setIsAddModalOpen(false);
      setNewBizName('');
      setNewOwnerName('');
      setNewEmail('');
      setNewPhone('');
      refreshData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create restaurant.');
    }
  };

  // Handle Export Platform JSON
  const handleExportData = () => {
    const json = adminService.exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `servejoy_platform_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast.success('Platform database exported successfully!', { icon: '💾' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground antialiased pb-20">
      {/* Top Super Admin Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-card/95 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-600 to-orange-700 text-white shadow-md">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-lg font-black tracking-tight text-foreground">
                  ServeJoy Master Admin
                </h1>
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Platform
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground font-mono">
                Admin: {currentUser?.email || 'siddhant'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportData}
              title="Download entire platform JSON snapshot"
              className="hidden sm:flex items-center gap-1.5 rounded-xl border border-border bg-secondary/80 px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition active:scale-95"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Backup JSON</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-accent px-3 py-2 text-xs font-bold text-white shadow hover:bg-accent/90 transition active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Restaurant</span>
              <span className="sm:hidden">Add</span>
            </button>

            <Link
              to="/"
              className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs font-bold text-accent hover:bg-amber-500/20 transition active:scale-95"
            >
              <Store className="h-3.5 w-3.5" />
              <span>POS View</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
        {/* KPI Platform Overview Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {/* Card 1: Total Cafes */}
          <div className="rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-card">
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span className="font-semibold">Registered Outlets</span>
              <Building2 className="h-4 w-4 text-accent" />
            </div>
            <p className="mt-2 font-display text-2xl sm:text-3xl font-black text-foreground">
              {stats.totalTenants}
            </p>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
              <CheckCircle2 className="h-3 w-3" />
              <span>{stats.activeTenants} active restaurants</span>
            </div>
          </div>

          {/* Card 2: Estimated MRR */}
          <div className="rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-card">
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span className="font-semibold">Estimated MRR</span>
              <Crown className="h-4 w-4 text-amber-500" />
            </div>
            <p className="mt-2 font-display text-2xl sm:text-3xl font-black text-foreground">
              ₹{stats.mrr.toLocaleString('en-IN')}
            </p>
            <div className="mt-1 text-[11px] text-muted-foreground">
              ARR: <span className="font-semibold text-foreground">₹{stats.arr.toLocaleString('en-IN')}</span> ({stats.paidTenants} paid)
            </div>
          </div>

          {/* Card 3: 7-Day Free Trials */}
          <div className="rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-card">
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span className="font-semibold">Active Trials</span>
              <Clock className="h-4 w-4 text-blue-500" />
            </div>
            <p className="mt-2 font-display text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">
              {stats.trialTenants}
            </p>
            <div className="mt-1 text-[11px] text-muted-foreground">
              {stats.expiredTenants} expired trials
            </div>
          </div>

          {/* Card 4: Total Platform Bills & Volume */}
          <div className="rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-card">
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span className="font-semibold">Platform Volume</span>
              <Receipt className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="mt-2 font-display text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              ₹{stats.totalGmv.toLocaleString('en-IN')}
            </p>
            <div className="mt-1 text-[11px] text-muted-foreground">
              Across <span className="font-semibold text-foreground">{stats.totalBills} bills</span>
            </div>
          </div>
        </div>

        {/* Search, Filter & Quick Action Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by restaurant name, owner, phone, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-border bg-card pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-secondary/80 p-1 text-xs">
            {(
              [
                { id: 'all', label: `All (${tenants.length})` },
                { id: 'trial', label: `Trials (${stats.trialTenants})` },
                { id: 'paid', label: `Paid (${stats.paidTenants})` },
                { id: 'expired', label: `Expired (${stats.expiredTenants})` },
                { id: 'suspended', label: 'Suspended' },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                className={`rounded-xl px-3 py-1.5 font-bold transition ${
                  selectedFilter === f.id
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tenant Accounts Table */}
        <div className="rounded-3xl border border-border bg-card shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-secondary/40 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5 sm:px-6">Restaurant & ID</th>
                  <th className="px-4 py-3.5">Owner & Contact</th>
                  <th className="px-4 py-3.5">Plan / Subscription</th>
                  <th className="px-4 py-3.5">Activity & Sales</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right sm:px-6">Super Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredTenants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground">
                      No restaurant accounts found matching your query.
                    </td>
                  </tr>
                ) : (
                  filteredTenants.map((t) => {
                    const isTrial = t.subInfo.isTrial;
                    const isExpired = t.subInfo.isExpired;
                    const isSuspended = t.account.suspended;

                    const cleanPhone = (t.profile.phone || '').replace(/[^0-9]/g, '');

                    return (
                      <tr
                        key={t.account.id}
                        className="hover:bg-secondary/30 transition group"
                      >
                        {/* 1. Restaurant info */}
                        <td className="px-4 py-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-accent font-black font-display text-base border border-amber-500/25">
                              {t.profile.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-display text-sm font-bold text-foreground">
                                {t.profile.name}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="font-mono text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                                  {t.account.id}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  Joined {new Date(t.account.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Owner & Contact */}
                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            <p className="font-semibold text-foreground">
                              {t.account.ownerName}
                            </p>
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
                              <a
                                href={`mailto:${t.account.ownerEmail}`}
                                className="flex items-center gap-1 hover:text-accent transition"
                              >
                                <Mail className="h-3 w-3" />
                                <span>{t.account.ownerEmail}</span>
                              </a>
                              {t.profile.phone && (
                                <div className="flex items-center gap-1.5">
                                  <span>•</span>
                                  <a
                                    href={`tel:${t.profile.phone}`}
                                    className="flex items-center gap-1 hover:text-accent transition"
                                  >
                                    <Phone className="h-3 w-3" />
                                    <span>{t.profile.phone}</span>
                                  </a>
                                  {cleanPhone && (
                                    <a
                                      href={`https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      title="Message Owner on WhatsApp"
                                      className="rounded-full bg-emerald-500/15 p-1 text-emerald-600 hover:bg-emerald-500/25 transition"
                                    >
                                      <MessageCircle className="h-3 w-3" />
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* 3. Plan & Subscription */}
                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            {isTrial ? (
                              <div className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2.5 py-0.5 font-bold text-blue-600 dark:text-blue-400 text-[11px]">
                                <Clock className="h-3 w-3" />
                                <span>Starter Trial</span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 font-bold text-accent text-[11px]">
                                <Crown className="h-3 w-3" />
                                <span>
                                  {t.subscription.tier === 'pro' ? 'Pro Café' : 'Business Suite'} ({t.subscription.billingCycle})
                                </span>
                              </div>
                            )}

                            <p className="text-[10px] text-muted-foreground">
                              {isTrial
                                ? isExpired
                                  ? 'Trial expired on Day 8'
                                  : `${t.subInfo.daysRemaining} days left on trial`
                                : `Renews ${new Date(t.subscription.currentPeriodEnd).toLocaleDateString('en-IN')}`}
                            </p>
                          </div>
                        </td>

                        {/* 4. Activity & Sales */}
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-bold text-foreground text-sm font-receipt">
                              ₹{t.totalGmv.toLocaleString('en-IN')}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {t.billCount} bills • {t.menuCount} dishes • {t.staffCount} staff
                            </p>
                          </div>
                        </td>

                        {/* 5. Status Badge */}
                        <td className="px-4 py-4">
                          {isSuspended ? (
                            <span className="rounded-full bg-rose-500/15 px-2.5 py-0.5 text-[10px] font-bold text-rose-600">
                              Suspended
                            </span>
                          ) : isExpired ? (
                            <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold text-amber-600">
                              Trial Expired
                            </span>
                          ) : isTrial ? (
                            <span className="rounded-full bg-blue-500/15 px-2.5 py-0.5 text-[10px] font-bold text-blue-600">
                              In 7-Day Trial
                            </span>
                          ) : (
                            <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600">
                              Active Paid
                            </span>
                          )}
                        </td>

                        {/* 6. Admin Actions */}
                        <td className="px-4 py-4 text-right sm:px-6">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {/* Extend trial button */}
                            {isTrial && (
                              <button
                                onClick={() => handleExtendTrial(t)}
                                title="Add 7 extra days to trial"
                                className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-[11px] font-bold text-blue-600 hover:bg-blue-500/20 transition active:scale-95"
                              >
                                +7d Trial
                              </button>
                            )}

                            {/* Upgrade plan button */}
                            <button
                              onClick={() => {
                                setSelectedTenantForUpgrade(t);
                                setUpgradeTier(t.subscription.tier === 'starter' ? 'pro' : t.subscription.tier);
                                setUpgradeCycle(t.subscription.billingCycle);
                                setIsUpgradeModalOpen(true);
                              }}
                              title="Upgrade or change subscription plan"
                              className="rounded-xl border border-accent/30 bg-accent/10 px-2.5 py-1 text-[11px] font-bold text-accent hover:bg-accent/20 transition active:scale-95"
                            >
                              Plan
                            </button>

                            {/* View Snapshot */}
                            <button
                              onClick={() => setSnapshotTenant(t)}
                              title="View cafe snapshot details"
                              className="rounded-xl border border-border bg-secondary p-1 text-muted-foreground hover:text-foreground transition active:scale-95"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>

                            {/* Impersonate POS button */}
                            <button
                              onClick={() => handleOpenTenantPos(t)}
                              title="Open POS as this outlet"
                              className="rounded-xl border border-border bg-secondary p-1 text-muted-foreground hover:text-foreground transition active:scale-95"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </button>

                            {/* Suspend toggle button */}
                            <button
                              onClick={() => handleToggleSuspend(t)}
                              title={isSuspended ? 'Reactivate account' : 'Suspend account'}
                              className={`rounded-xl border p-1 transition active:scale-95 ${
                                isSuspended
                                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600'
                                  : 'border-rose-500/30 bg-rose-500/10 text-rose-600'
                              }`}
                            >
                              {isSuspended ? <Check className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODAL 1: Upgrade / Change Plan */}
      {isUpgradeModalOpen && selectedTenantForUpgrade && (
        <div
          onClick={() => setIsUpgradeModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-elevated space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-bold text-foreground">
                  Update Subscription Plan
                </h3>
                <p className="text-xs text-muted-foreground">
                  {selectedTenantForUpgrade.profile.name} ({selectedTenantForUpgrade.account.id})
                </p>
              </div>
              <button
                onClick={() => setIsUpgradeModalOpen(false)}
                className="rounded-xl p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Choose Plan Tier
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {(['starter', 'pro', 'business'] as const).map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setUpgradeTier(tier)}
                      className={`p-3 rounded-2xl border text-center transition ${
                        upgradeTier === tier
                          ? 'border-accent bg-accent/15 text-accent font-bold'
                          : 'border-border bg-secondary/50 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <p className="capitalize font-bold">{tier}</p>
                      <p className="text-[10px] mt-0.5">
                        {tier === 'starter' ? '₹0' : tier === 'pro' ? '₹499/mo' : '₹999/mo'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Billing Cycle
                </label>
                <div className="flex rounded-2xl bg-secondary p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setUpgradeCycle('monthly')}
                    className={`flex-1 py-1.5 rounded-xl font-bold transition ${
                      upgradeCycle === 'monthly' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setUpgradeCycle('annual')}
                    className={`flex-1 py-1.5 rounded-xl font-bold transition ${
                      upgradeCycle === 'annual' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                    }`}
                  >
                    Annual (Save 20%)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Payment Reference / Admin Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paid ₹4,999 via Google Pay UPI reference #12345"
                  value={upgradeNote}
                  onChange={(e) => setUpgradeNote(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-secondary/50 px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsUpgradeModalOpen(false)}
                className="flex-1 rounded-2xl border border-border py-2.5 text-xs font-bold text-muted-foreground hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveUpgrade}
                className="flex-1 rounded-2xl bg-accent py-2.5 text-xs font-bold text-white shadow hover:bg-accent/90"
              >
                Apply Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Add New Restaurant Manually */}
      {isAddModalOpen && (
        <div
          onClick={() => setIsAddModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-elevated space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Store className="h-5 w-5 text-accent" />
                <h3 className="font-display text-base font-bold text-foreground">
                  Provision New Restaurant
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-xl p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Restaurant / Café Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chai Shai Express"
                  value={newBizName}
                  onChange={(e) => setNewBizName(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-secondary/50 px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Owner / Manager Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rohan Sharma"
                  value={newOwnerName}
                  onChange={(e) => setNewOwnerName(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-secondary/50 px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Owner Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="owner@cafe.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full rounded-2xl border border-border bg-secondary/50 px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Phone (WhatsApp)
                  </label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full rounded-2xl border border-border bg-secondary/50 px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Initial Plan
                  </label>
                  <select
                    value={newTier}
                    onChange={(e) => setNewTier(e.target.value as SubscriptionTier)}
                    className="w-full rounded-2xl border border-border bg-secondary/50 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    <option value="starter">Starter (Free Trial)</option>
                    <option value="pro">Pro Café (Paid)</option>
                    <option value="business">Business (Paid)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Trial Days
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={90}
                    value={newTrialDays}
                    onChange={(e) => setNewTrialDays(Number(e.target.value))}
                    className="w-full rounded-2xl border border-border bg-secondary/50 px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 rounded-2xl border border-border py-2.5 text-xs font-bold text-muted-foreground hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-2xl bg-accent py-2.5 text-xs font-bold text-white shadow hover:bg-accent/90"
                >
                  Create Outlet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Tenant Snapshot Drawer */}
      {snapshotTenant && (
        <div
          onClick={() => setSnapshotTenant(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-elevated space-y-4"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/15 text-accent font-bold font-display">
                  {snapshotTenant.profile.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-foreground">
                    {snapshotTenant.profile.name}
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono">
                    ID: {snapshotTenant.account.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSnapshotTenant(null)}
                className="rounded-xl p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-2xl bg-secondary/50 p-3">
                <p className="text-muted-foreground">Owner Name</p>
                <p className="font-bold text-foreground mt-0.5">{snapshotTenant.account.ownerName}</p>
              </div>
              <div className="rounded-2xl bg-secondary/50 p-3">
                <p className="text-muted-foreground">Owner Email</p>
                <p className="font-bold text-foreground mt-0.5">{snapshotTenant.account.ownerEmail}</p>
              </div>
              <div className="rounded-2xl bg-secondary/50 p-3">
                <p className="text-muted-foreground">Contact Phone</p>
                <p className="font-bold text-foreground mt-0.5">{snapshotTenant.profile.phone || 'Not configured'}</p>
              </div>
              <div className="rounded-2xl bg-secondary/50 p-3">
                <p className="text-muted-foreground">Subscription Plan</p>
                <p className="font-bold text-accent mt-0.5 capitalize">{snapshotTenant.subscription.tier} ({snapshotTenant.subscription.billingCycle})</p>
              </div>
              <div className="rounded-2xl bg-secondary/50 p-3">
                <p className="text-muted-foreground">Total Sales Generated</p>
                <p className="font-bold text-emerald-600 font-receipt mt-0.5">₹{snapshotTenant.totalGmv.toLocaleString('en-IN')}</p>
              </div>
              <div className="rounded-2xl bg-secondary/50 p-3">
                <p className="text-muted-foreground">Catalog & Staff</p>
                <p className="font-bold text-foreground mt-0.5">{snapshotTenant.menuCount} dishes • {snapshotTenant.staffCount} staff</p>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  handleOpenTenantPos(snapshotTenant);
                  setSnapshotTenant(null);
                }}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-accent py-2.5 text-xs font-bold text-white shadow hover:bg-accent/90"
              >
                <span>Launch POS Terminal for this Cafe</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

