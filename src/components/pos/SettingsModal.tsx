import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { soundbox } from '../../services/soundbox';
import { storage } from '../../services/storage';
import { authService } from '../../services/authService';
import { subscriptionService, PLANS } from '../../services/subscriptionService';
import {
  CafeProfile,
  SoundboxSettings,
  BusinessType,
  AppTheme,
  AnnouncementLanguage,
  Staff,
  UserRole,
  SubscriptionTier,
  BillingCycle,
} from '../../types';
import {
  X,
  Store,
  QrCode,
  Volume2,
  Palette,
  ShieldAlert,
  Save,
  Upload,
  Trash2,
  RefreshCw,
  Sun,
  Moon,
  Laptop,
  LogOut,
  Download,
  AlertTriangle,
  Play,
  CheckCircle2,
  Building2,
  FileText,
  Phone,
  Mail,
  Receipt,
  Sparkles,
  Users,
  CreditCard,
  Plus,
  Check,
  Key,
  Clock,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'profile' | 'custom-qr' | 'soundbox' | 'appearance' | 'staff' | 'subscription' | 'account';
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'profile',
}) => {
  const {
    cafeProfile,
    updateCafeProfile,
    soundboxSettings,
    updateSoundboxSettings,
    userRole,
    setUserRole,
  } = useApp();

  const navigate = useNavigate();
  const authUser = authService.getCurrentUser();

  // Active tab inside settings modal
  const [activeTab, setActiveTab] = useState<
    'profile' | 'custom-qr' | 'soundbox' | 'appearance' | 'staff' | 'subscription' | 'account'
  >(initialTab);

  // Form states initialized with current profile
  const [profileForm, setProfileForm] = useState<CafeProfile>({ ...cafeProfile });
  const [soundForm, setSoundForm] = useState<SoundboxSettings>({ ...soundboxSettings });
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(() => storage.getTheme());

  // Staff management state
  const [staffList, setStaffList] = useState<Staff[]>(() => storage.getStaff(cafeProfile.id));
  const [newStaffName, setNewStaffName] = useState<string>('');
  const [newStaffRole, setNewStaffRole] = useState<UserRole>('waiter');
  const [newStaffPin, setNewStaffPin] = useState<string>('');
  const [newStaffPhone, setNewStaffPhone] = useState<string>('');
  const [isAddingStaff, setIsAddingStaff] = useState<boolean>(false);

  // Subscription state
  const subInfo = subscriptionService.getSubscriptionInfo(cafeProfile.id);

  // Logout confirmation state
  const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);

  if (!isOpen) return null;

  // Handle Logo Upload (PNG/JPG to Data URL)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (PNG, JPG, or WEBP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo image size should be less than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setProfileForm((prev) => ({ ...prev, logoUrl: result }));
      toast.success('Restaurant logo loaded! Click Save to apply.', { icon: '🖼️' });
    };
    reader.readAsDataURL(file);
  };

  // Handle Custom Bill QR Upload (PNG/JPG to Data URL)
  const handleCustomQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG or JPG).');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      toast.error('QR code image size should be less than 3MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setProfileForm((prev) => ({
        ...prev,
        customQrUrl: result,
        customQrEnabled: true,
      }));
      toast.success('Custom QR code loaded! Click Save to activate on bills.', { icon: '📱' });
    };
    reader.readAsDataURL(file);
  };

  // Save Business Profile
  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!profileForm.name.trim()) {
      toast.error('Restaurant name is required');
      return;
    }

    updateCafeProfile(profileForm);
    toast.success('Business profile updated successfully!', { icon: '✅' });
  };

  // Save Soundbox Settings
  const handleSaveSoundbox = () => {
    updateSoundboxSettings(soundForm);
    toast.success('Sound and announcement settings saved!', { icon: '🔊' });
  };

  // Test Announcement in selected language
  const handleTestAnnouncement = () => {
    soundbox.playSuccessChime();
    setTimeout(() => {
      const lang = soundForm.language;
      let text = `Welcome to ServeJoy! Payment received for ${profileForm.name}.`;
      if (lang === 'hi-IN') {
        text = `सर्वजॉय में आपका स्वागत है! ${profileForm.name} के लिए भुगतान प्राप्त हुआ।`;
      } else if (lang === 'mr-IN') {
        text = `सर्वजॉय मध्ये आपले स्वागत आहे! ${profileForm.name} साठी पेमेंट प्राप्त झाले.`;
      }
      soundbox.speak(text);
      toast.info(`Speaking test announcement in ${lang === 'hi-IN' ? 'Hindi' : lang === 'mr-IN' ? 'Marathi' : 'English'}...`, { icon: '📢' });
    }, 400);
  };

  // Theme Change Handler
  const handleThemeChange = (theme: AppTheme) => {
    setCurrentTheme(theme);
    storage.saveTheme(theme);

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System Default
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    toast.success(`Theme set to ${theme === 'system' ? 'System Default' : theme === 'dark' ? 'Dark Mode' : 'Light Mode'}`);
  };

  // Data Backup Export (JSON)
  const handleExportBackup = () => {
    const backupData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      cafeProfile: storage.getCafeProfile(),
      menuItems: storage.getMenuItems(),
      bills: storage.getBills(),
      orders: storage.getOrders(),
      printers: storage.getPrinters(),
      soundboxSettings: storage.getSoundboxSettings(),
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `servejoy_backup_${profileForm.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}.json`;
    a.click();
    toast.success('Complete business data backup downloaded!', { icon: '💾' });
  };

  // Staff Management Handlers
  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || newStaffPin.length !== 4) {
      toast.error('Please provide a staff name and a 4-digit PIN.');
      return;
    }
    const newStaff: Staff = {
      id: `staff_${Date.now()}`,
      businessId: cafeProfile.id,
      name: newStaffName.trim(),
      phone: newStaffPhone.trim(),
      role: newStaffRole,
      pin: newStaffPin.trim(),
      active: true,
      createdAt: new Date().toISOString(),
    };
    const updated = [...staffList, newStaff];
    setStaffList(updated);
    storage.saveStaff(updated, cafeProfile.id);
    setNewStaffName('');
    setNewStaffPin('');
    setNewStaffPhone('');
    setIsAddingStaff(false);
    toast.success(`Added ${newStaff.name} as ${newStaff.role.toUpperCase()}!`, { icon: '👤' });
  };

  const handleToggleStaff = (id: string) => {
    const updated = staffList.map((s) => (s.id === id ? { ...s, active: !s.active } : s));
    setStaffList(updated);
    storage.saveStaff(updated, cafeProfile.id);
  };

  const handleDeleteStaff = (id: string) => {
    const updated = staffList.filter((s) => s.id !== id);
    setStaffList(updated);
    storage.saveStaff(updated, cafeProfile.id);
    toast.info('Staff member removed.');
  };

  const handleUpgradePlan = (tier: SubscriptionTier) => {
    subscriptionService.activatePlan(tier, 'annual', `ref_${Date.now()}`, cafeProfile.id);
    toast.success(`Successfully upgraded to ServeJoy ${PLANS[tier].name}!`, { icon: '🎉' });
  };

  // Logout Handler
  const handleLogout = () => {
    setShowLogoutConfirm(false);
    authService.logout();
    onClose();
    toast.info('Shift ended. You have been logged out.');
    navigate('/login');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-5 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-[2rem] bg-background border border-border shadow-elevated overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header with Close */}
        <div className="flex items-center justify-between border-b border-border/80 bg-secondary/50 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white shadow-sm">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">
                Business Profile & Settings
              </h2>
              <p className="text-xs text-muted-foreground">
                {profileForm.name || 'ServeJoy POS'} • Commercial SaaS Control Center
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground active:scale-95 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-border/80 bg-secondary/30 px-4 py-2 text-xs scrollbar-none">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 font-bold transition active:scale-95 ${
              activeTab === 'profile'
                ? 'bg-card text-accent shadow-sm border border-border/60'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('custom-qr')}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 font-bold transition active:scale-95 ${
              activeTab === 'custom-qr'
                ? 'bg-card text-accent shadow-sm border border-border/60'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <QrCode className="h-3.5 w-3.5" />
            <span>Bill QR Code</span>
          </button>

          <button
            onClick={() => setActiveTab('soundbox')}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 font-bold transition active:scale-95 ${
              activeTab === 'soundbox'
                ? 'bg-card text-accent shadow-sm border border-border/60'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Volume2 className="h-3.5 w-3.5" />
            <span>Voice & Sound</span>
          </button>

          <button
            onClick={() => setActiveTab('appearance')}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 font-bold transition active:scale-95 ${
              activeTab === 'appearance'
                ? 'bg-card text-accent shadow-sm border border-border/60'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Palette className="h-3.5 w-3.5" />
            <span>Theme</span>
          </button>

          <button
            onClick={() => setActiveTab('staff')}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 font-bold transition active:scale-95 ${
              activeTab === 'staff'
                ? 'bg-card text-accent shadow-sm border border-border/60'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Staff & PINs</span>
          </button>

          <button
            onClick={() => setActiveTab('subscription')}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 font-bold transition active:scale-95 ${
              activeTab === 'subscription'
                ? 'bg-card text-accent shadow-sm border border-border/60'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <CreditCard className="h-3.5 w-3.5" />
            <span>Plan & Trial</span>
            {subInfo.isTrial && (
              <span className="rounded-full bg-accent/20 px-1.5 py-0.5 text-[9px] font-mono text-accent">
                {subInfo.daysRemaining}d left
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('account')}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 font-bold transition active:scale-95 ${
              activeTab === 'account'
                ? 'bg-card text-accent shadow-sm border border-border/60'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Account & Backup</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* ================= TAB 1: BUSINESS PROFILE ================= */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Logo & Basic Info */}
              <div className="flex flex-col sm:flex-row items-center gap-4 rounded-2xl border border-border/80 bg-card p-4">
                <div className="relative group shrink-0">
                  <div className="h-20 w-20 rounded-2xl border-2 border-dashed border-accent/40 bg-secondary flex items-center justify-center overflow-hidden">
                    {profileForm.logoUrl ? (
                      <img
                        src={profileForm.logoUrl}
                        alt="Logo"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Store className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white text-[10px] font-bold rounded-2xl opacity-0 group-hover:opacity-100 transition cursor-pointer">
                    <Upload className="h-4 w-4 mb-0.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex-1 min-w-0 w-full space-y-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-accent">
                      Restaurant Logo
                    </span>
                    {profileForm.logoUrl && (
                      <button
                        type="button"
                        onClick={() => setProfileForm((p) => ({ ...p, logoUrl: '' }))}
                        className="text-[10px] text-destructive hover:underline"
                      >
                        Remove Logo
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    PNG or JPG format (Max 2MB). Shown on invoices, customer digital receipts, and header.
                  </p>
                  <label className="inline-flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-1.5 text-xs font-bold text-foreground hover:bg-secondary/80 active:scale-95 transition cursor-pointer mt-1">
                    <Upload className="h-3.5 w-3.5 text-accent" />
                    <span>Browse Logo File</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Business Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Business Name */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Business / Outlet Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) =>
                      setProfileForm((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder="e.g. Chai Point, Spice Garden Cafe"
                    className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs text-foreground focus:border-accent focus:outline-none"
                  />
                </div>

                {/* Business Type */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Business Category / Type
                  </label>
                  <select
                    value={profileForm.businessType || 'cafe'}
                    onChange={(e) =>
                      setProfileForm((p) => ({
                        ...p,
                        businessType: e.target.value as BusinessType,
                      }))
                    }
                    className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs text-foreground focus:border-accent focus:outline-none"
                  >
                    <option value="cafe">☕ Café / Coffee Shop</option>
                    <option value="restaurant">🍽️ Restaurant / Fine Dine</option>
                    <option value="hotel">🏨 Hotel / Resort Dining</option>
                    <option value="canteen">🏢 Canteen / Mess</option>
                    <option value="bakery">🥐 Bakery / Confectionery</option>
                    <option value="fast_food">🍔 Fast Food / Quick Bites</option>
                    <option value="cloud_kitchen">📦 Cloud Kitchen / Takeaway</option>
                    <option value="other">🏪 Other Food Outlet</option>
                  </select>
                </div>

                {/* Owner / Manager Name */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Owner / Manager Name
                  </label>
                  <input
                    type="text"
                    value={profileForm.ownerName}
                    onChange={(e) =>
                      setProfileForm((p) => ({ ...p, ownerName: e.target.value }))
                    }
                    placeholder="e.g. Siddhant Ramteke"
                    className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs text-foreground focus:border-accent focus:outline-none"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) =>
                      setProfileForm((p) => ({ ...p, phone: e.target.value }))
                    }
                    placeholder="e.g. +91 98765 43210"
                    className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs text-foreground focus:border-accent focus:outline-none"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Business Email
                  </label>
                  <input
                    type="email"
                    value={profileForm.email || ''}
                    onChange={(e) =>
                      setProfileForm((p) => ({ ...p, email: e.target.value }))
                    }
                    placeholder="e.g. contact@chaipoint.in"
                    className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs text-foreground focus:border-accent focus:outline-none"
                  />
                </div>

                {/* GSTIN (Optional) */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1 flex items-center justify-between">
                    <span>GSTIN (GST Number)</span>
                    <span className="text-[10px] text-muted-foreground font-normal">Optional</span>
                  </label>
                  <input
                    type="text"
                    value={profileForm.gstin || ''}
                    onChange={(e) =>
                      setProfileForm((p) => ({ ...p, gstin: e.target.value.toUpperCase() }))
                    }
                    placeholder="e.g. 27AAAAA0000A1Z5"
                    className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs text-foreground focus:border-accent focus:outline-none uppercase font-mono"
                  />
                </div>

                {/* FSSAI License */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1 flex items-center justify-between">
                    <span>FSSAI License No.</span>
                    <span className="text-[10px] text-muted-foreground font-normal">Optional</span>
                  </label>
                  <input
                    type="text"
                    value={profileForm.fssaiNumber || ''}
                    onChange={(e) =>
                      setProfileForm((p) => ({ ...p, fssaiNumber: e.target.value }))
                    }
                    placeholder="e.g. 11521000000123"
                    className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs text-foreground focus:border-accent focus:outline-none font-mono"
                  />
                </div>

                {/* UPI VPA for Payments */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Merchant UPI ID (VPA) *
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.upiId}
                    onChange={(e) =>
                      setProfileForm((p) => ({ ...p, upiId: e.target.value }))
                    }
                    placeholder="e.g. yourname@icici or 9876543210@paytm"
                    className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs text-foreground focus:border-accent focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Full Address */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Business Address & Location
                </label>
                <textarea
                  rows={2}
                  value={profileForm.address}
                  onChange={(e) =>
                    setProfileForm((p) => ({ ...p, address: e.target.value }))
                  }
                  placeholder="Shop No. 4, Ground Floor, Food Street, Pune - 411001"
                  className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs text-foreground focus:border-accent focus:outline-none resize-none"
                />
              </div>

              {/* Invoice Footer Note */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1 flex items-center justify-between">
                  <span>Custom Invoice / Bill Footer Note</span>
                  <span className="text-[10px] text-muted-foreground font-normal">
                    Printed at bottom of receipt
                  </span>
                </label>
                <input
                  type="text"
                  value={profileForm.invoiceNote || ''}
                  onChange={(e) =>
                    setProfileForm((p) => ({ ...p, invoiceNote: e.target.value }))
                  }
                  placeholder="e.g. Thank you! Visit again • FSSAI Certified • Have a joyful day!"
                  className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs text-foreground focus:border-accent focus:outline-none"
                />
              </div>

              {/* Submit Save Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:opacity-95 active:scale-95 transition"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Business Profile</span>
                </button>
              </div>
            </form>
          )}

          {/* ================= TAB 2: CUSTOM QR CODE ON BILLS ================= */}
          {activeTab === 'custom-qr' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      Enable Custom QR on Printed & Digital Bills
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Print your personal merchant UPI QR, WhatsApp Business, or Google Review standee.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profileForm.customQrEnabled ?? false}
                      onChange={(e) =>
                        setProfileForm((p) => ({
                          ...p,
                          customQrEnabled: e.target.checked,
                        }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                  </label>
                </div>
              </div>

              {/* QR Code Upload & Live Bill Preview Frame */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Upload & Instructions */}
                <div className="space-y-3 rounded-2xl border border-border/80 bg-card p-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-accent block">
                    Upload Merchant QR Code
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Upload an image file (PNG, JPG) of your BharatPe, PhonePe, Paytm, Google Pay merchant QR, or website link.
                  </p>

                  <div className="border-2 border-dashed border-border rounded-2xl p-4 text-center space-y-2 bg-secondary/30">
                    <QrCode className="h-8 w-8 text-muted-foreground mx-auto" />
                    <p className="text-xs font-medium text-foreground">
                      Click to choose file or drag & drop
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      High contrast black & white recommended for thermal printers.
                    </p>
                    <label className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-bold text-white hover:opacity-90 active:scale-95 transition cursor-pointer mt-1">
                      <Upload className="h-3.5 w-3.5" />
                      <span>Select QR Image</span>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleCustomQrUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {profileForm.customQrUrl && (
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> QR Code Uploaded
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setProfileForm((p) => ({
                            ...p,
                            customQrUrl: '',
                            customQrEnabled: false,
                          }))
                        }
                        className="text-xs text-destructive hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove QR
                      </button>
                    </div>
                  )}
                </div>

                {/* Simulated Bill Slip Preview */}
                <div className="rounded-2xl border border-dashed border-border bg-white text-zinc-900 p-4 shadow-sm flex flex-col items-center justify-center text-center">
                  <span className="font-receipt text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
                    Thermal Slip Preview
                  </span>
                  <p className="font-display text-sm font-black text-zinc-900">{profileForm.name}</p>
                  <p className="font-mono text-[10px] text-zinc-500">
                    {profileForm.address ? profileForm.address.slice(0, 30) : 'Food Street, Pune'}
                  </p>
                  <div className="w-full border-b border-dashed border-zinc-300 my-2" />

                  {/* QR Box in simulated bill */}
                  <div className="h-32 w-32 border-2 border-zinc-900 rounded-xl p-2 bg-white flex items-center justify-center my-1 shadow-inner">
                    {profileForm.customQrUrl ? (
                      <img
                        src={profileForm.customQrUrl}
                        alt="Custom QR Preview"
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-zinc-400 text-xs">
                        <QrCode className="h-10 w-10 text-zinc-400 mb-1" />
                        <span className="text-[10px] font-receipt">No Custom QR</span>
                      </div>
                    )}
                  </div>

                  <p className="font-receipt text-[10px] font-bold text-zinc-800 mt-1 uppercase">
                    Scan to Pay via Any UPI App
                  </p>
                  <p className="font-mono text-[9px] text-zinc-500">
                    {profileForm.upiId || 'merchant@upi'}
                  </p>
                  <div className="w-full border-b border-dashed border-zinc-300 my-2" />
                  <p className="font-receipt text-[9px] text-zinc-500">
                    {profileForm.invoiceNote || 'Thank you! Visit again 😊'}
                  </p>
                </div>
              </div>

              {/* Save Button for QR */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => handleSaveProfile()}
                  className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:opacity-95 active:scale-95 transition"
                >
                  <Save className="h-4 w-4" />
                  <span>Save QR Settings</span>
                </button>
              </div>
            </div>
          )}

          {/* ================= TAB 3: SOUND & ANNOUNCEMENTS ================= */}
          {activeTab === 'soundbox' && (
            <div className="space-y-4">
              {/* Master Soundbox Switch */}
              <div className="flex items-center justify-between rounded-2xl border border-border/80 bg-card p-4">
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Master Voice Soundbox Switch
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Synthesize spoken voice announcements through connected speaker or device.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={soundForm.enabled}
                    onChange={(e) =>
                      setSoundForm((s) => ({ ...s, enabled: e.target.checked }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Announcement Language Selection */}
              <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-2">
                <label className="block text-xs font-bold text-foreground">
                  Voice Announcement Language
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { code: 'en-IN', label: 'English', sub: 'Indian Accent' },
                    { code: 'hi-IN', label: 'हिंदी (Hindi)', sub: 'शुद्ध हिंदी' },
                    { code: 'mr-IN', label: 'मराठी (Marathi)', sub: 'मराठी आवाज' },
                  ].map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() =>
                        setSoundForm((s) => ({
                          ...s,
                          language: l.code as AnnouncementLanguage,
                        }))
                      }
                      className={`rounded-xl p-2.5 text-center border transition active:scale-95 ${
                        soundForm.language === l.code
                          ? 'border-accent bg-accent/10 text-accent font-bold shadow-sm'
                          : 'border-border bg-secondary/50 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <p className="text-xs font-bold">{l.label}</p>
                      <p className="text-[10px] opacity-75">{l.sub}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Granular Event Toggles */}
              <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-accent">
                  Granular Voice Notification Controls
                </h4>

                <div className="space-y-2.5 divide-y divide-border/40">
                  {/* Bill Payment Confirmation */}
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <p className="text-xs font-semibold text-foreground">Bill Payment Confirmation</p>
                      <p className="text-[11px] text-muted-foreground">Announce payment mode and amount received</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={soundForm.announcePayments}
                      onChange={(e) =>
                        setSoundForm((s) => ({ ...s, announcePayments: e.target.checked }))
                      }
                      className="h-4 w-4 rounded accent-accent"
                    />
                  </div>

                  {/* Paid Bill Announcements */}
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <p className="text-xs font-semibold text-foreground">Paid Bill Announcements</p>
                      <p className="text-[11px] text-muted-foreground">Announce when a bill is settled or marked paid</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={soundForm.announcePaidBills}
                      onChange={(e) =>
                        setSoundForm((s) => ({ ...s, announcePaidBills: e.target.checked }))
                      }
                      className="h-4 w-4 rounded accent-accent"
                    />
                  </div>

                  {/* UPI Payment Confirmation */}
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <p className="text-xs font-semibold text-foreground">UPI Payment Confirmation</p>
                      <p className="text-[11px] text-muted-foreground">Special audio chime and vocal alert for UPI transactions</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={soundForm.announceUpiConfirmation}
                      onChange={(e) =>
                        setSoundForm((s) => ({ ...s, announceUpiConfirmation: e.target.checked }))
                      }
                      className="h-4 w-4 rounded accent-accent"
                    />
                  </div>

                  {/* New Order Notifications */}
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <p className="text-xs font-semibold text-foreground">New Order Notifications (KOT)</p>
                      <p className="text-[11px] text-muted-foreground">Announce incoming table orders and KOT numbers</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={soundForm.announceOrders}
                      onChange={(e) =>
                        setSoundForm((s) => ({ ...s, announceOrders: e.target.checked }))
                      }
                      className="h-4 w-4 rounded accent-accent"
                    />
                  </div>

                  {/* Food Ready Alert */}
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <p className="text-xs font-semibold text-foreground">Food Ready for Serving Alerts</p>
                      <p className="text-[11px] text-muted-foreground">Alert waiters when kitchen marks order ready</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={soundForm.announceReady}
                      onChange={(e) =>
                        setSoundForm((s) => ({ ...s, announceReady: e.target.checked }))
                      }
                      className="h-4 w-4 rounded accent-accent"
                    />
                  </div>

                  {/* Waiter Call Alerts */}
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <p className="text-xs font-semibold text-foreground">Customer Table Assistance Calls</p>
                      <p className="text-[11px] text-muted-foreground">Chime when guests press 'Call Waiter' or 'Water' from table QR</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={soundForm.announceWaiterCalls}
                      onChange={(e) =>
                        setSoundForm((s) => ({ ...s, announceWaiterCalls: e.target.checked }))
                      }
                      className="h-4 w-4 rounded accent-accent"
                    />
                  </div>
                </div>
              </div>

              {/* Sliders: Volume & Speed */}
              <div className="grid grid-cols-2 gap-3.5 rounded-2xl border border-border/80 bg-card p-4">
                <div>
                  <label className="flex items-center justify-between text-xs font-bold text-foreground mb-1">
                    <span>Speaker Volume</span>
                    <span className="font-mono text-accent">{Math.round(soundForm.volume * 100)}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={soundForm.volume}
                    onChange={(e) =>
                      setSoundForm((s) => ({ ...s, volume: parseFloat(e.target.value) }))
                    }
                    className="w-full accent-accent cursor-pointer"
                  />
                </div>

                <div>
                  <label className="flex items-center justify-between text-xs font-bold text-foreground mb-1">
                    <span>Speech Rate</span>
                    <span className="font-mono text-accent">{soundForm.speechRate}x</span>
                  </label>
                  <input
                    type="range"
                    min="0.8"
                    max="1.4"
                    step="0.1"
                    value={soundForm.speechRate}
                    onChange={(e) =>
                      setSoundForm((s) => ({ ...s, speechRate: parseFloat(e.target.value) }))
                    }
                    className="w-full accent-accent cursor-pointer"
                  />
                </div>
              </div>

              {/* Action Buttons: Test Voice & Save */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleTestAnnouncement}
                  className="flex items-center gap-1.5 rounded-xl border border-border bg-secondary px-3.5 py-2 text-xs font-bold text-foreground hover:bg-secondary/80 active:scale-95 transition"
                >
                  <Play className="h-3.5 w-3.5 text-accent" />
                  <span>Test Voice Announcement</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveSoundbox}
                  className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2 text-xs font-bold text-white shadow-sm hover:opacity-95 active:scale-95 transition"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Sound Settings</span>
                </button>
              </div>
            </div>
          )}

          {/* ================= TAB 4: APPEARANCE & THEME ================= */}
          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-1">
                <h3 className="text-sm font-bold text-foreground">Theme & Display Settings</h3>
                <p className="text-xs text-muted-foreground">
                  Select your preferred interface appearance. Theme applies instantly and stays saved across restarts.
                </p>
              </div>

              {/* 3 Theme Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Light Mode */}
                <div
                  onClick={() => handleThemeChange('light')}
                  className={`rounded-2xl border p-4 text-center cursor-pointer transition active:scale-98 ${
                    currentTheme === 'light'
                      ? 'border-accent bg-accent/10 shadow-sm ring-2 ring-accent/30'
                      : 'border-border bg-card hover:border-accent/40'
                  }`}
                >
                  <div className="h-10 w-10 mx-auto rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-2 shadow-sm">
                    <Sun className="h-5 w-5" />
                  </div>
                  <h4 className="text-xs font-bold text-foreground">Light Mode</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Clean warm day layout</p>
                  {currentTheme === 'light' && (
                    <span className="inline-block mt-2 rounded-full bg-accent px-2 py-0.5 text-[9px] font-bold text-white">
                      Active
                    </span>
                  )}
                </div>

                {/* Dark Mode */}
                <div
                  onClick={() => handleThemeChange('dark')}
                  className={`rounded-2xl border p-4 text-center cursor-pointer transition active:scale-98 ${
                    currentTheme === 'dark'
                      ? 'border-accent bg-accent/10 shadow-sm ring-2 ring-accent/30'
                      : 'border-border bg-card hover:border-accent/40'
                  }`}
                >
                  <div className="h-10 w-10 mx-auto rounded-xl bg-zinc-800 text-amber-400 flex items-center justify-center mb-2 shadow-sm">
                    <Moon className="h-5 w-5" />
                  </div>
                  <h4 className="text-xs font-bold text-foreground">Dark Mode</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Espresso night theme</p>
                  {currentTheme === 'dark' && (
                    <span className="inline-block mt-2 rounded-full bg-accent px-2 py-0.5 text-[9px] font-bold text-white">
                      Active
                    </span>
                  )}
                </div>

                {/* System Default */}
                <div
                  onClick={() => handleThemeChange('system')}
                  className={`rounded-2xl border p-4 text-center cursor-pointer transition active:scale-98 ${
                    currentTheme === 'system'
                      ? 'border-accent bg-accent/10 shadow-sm ring-2 ring-accent/30'
                      : 'border-border bg-card hover:border-accent/40'
                  }`}
                >
                  <div className="h-10 w-10 mx-auto rounded-xl bg-secondary text-foreground flex items-center justify-center mb-2 shadow-sm">
                    <Laptop className="h-5 w-5" />
                  </div>
                  <h4 className="text-xs font-bold text-foreground">System Default</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Follows OS settings</p>
                  {currentTheme === 'system' && (
                    <span className="inline-block mt-2 rounded-full bg-accent px-2 py-0.5 text-[9px] font-bold text-white">
                      Active
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 5: STAFF & TEAM ACCESS ================= */}
          {activeTab === 'staff' && (
            <div className="space-y-4">
              {/* Outlet Business ID Banner for Staff Terminal */}
              <div className="rounded-2xl border border-accent/30 bg-accent/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="space-y-0.5 text-center sm:text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
                    Restaurant Terminal Outlet ID
                  </span>
                  <p className="font-mono text-sm font-black text-foreground">{cafeProfile.id}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Staff enter this Business ID + their assigned 4-digit PIN on the Login screen.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddingStaff(!isAddingStaff)}
                  className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-95 active:scale-95 transition shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{isAddingStaff ? 'Cancel' : 'Add Employee'}</span>
                </button>
              </div>

              {/* Add New Staff Form */}
              {isAddingStaff && (
                <form
                  onSubmit={handleAddStaff}
                  className="rounded-2xl border border-border bg-card p-4 space-y-3 shadow-sm animate-fade-in"
                >
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    New Staff Member Setup
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1">
                        Employee Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={newStaffName}
                        onChange={(e) => setNewStaffName(e.target.value)}
                        placeholder="e.g. Ramesh Kumar"
                        className="w-full rounded-xl border border-input bg-secondary/50 px-3 py-2 text-xs text-foreground focus:outline-none focus:border-accent"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1">
                        Staff Role *
                      </label>
                      <select
                        value={newStaffRole}
                        onChange={(e) => setNewStaffRole(e.target.value as UserRole)}
                        className="w-full rounded-xl border border-input bg-secondary/50 px-3 py-2 text-xs text-foreground focus:outline-none focus:border-accent"
                      >
                        <option value="manager">🛡️ Manager (Daily Operations & Menu)</option>
                        <option value="cashier">💼 Cashier (Billing & Counter POS)</option>
                        <option value="waiter">🍽️ Waiter (Table Ordering & Floor Plan)</option>
                        <option value="kitchen">🍳 Kitchen Staff (KDS Cooking & KOTs)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1">
                        4-Digit Secret Login PIN *
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        required
                        value={newStaffPin}
                        onChange={(e) => setNewStaffPin(e.target.value)}
                        placeholder="e.g. 5678"
                        className="w-full rounded-xl border border-input bg-secondary/50 px-3 py-2 text-xs font-mono text-center tracking-widest text-foreground focus:outline-none focus:border-accent"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1">
                        Phone Number (Optional)
                      </label>
                      <input
                        type="tel"
                        value={newStaffPhone}
                        onChange={(e) => setNewStaffPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full rounded-xl border border-input bg-secondary/50 px-3 py-2 text-xs text-foreground focus:outline-none focus:border-accent"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-95 active:scale-95 transition"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Save & Activate Staff PIN</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Staff Member List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Active Team Members ({staffList.length})
                </h4>

                {staffList.length === 0 ? (
                  <div className="rounded-2xl border border-border/80 bg-card p-6 text-center text-xs text-muted-foreground">
                    No staff members added yet. Click "+ Add Employee" to generate terminal PINs.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {staffList.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between rounded-2xl border border-border/80 bg-card p-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-foreground font-bold">
                            {member.role === 'manager'
                              ? '🛡️'
                              : member.role === 'cashier'
                              ? '💼'
                              : member.role === 'waiter'
                              ? '🍽️'
                              : '🍳'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-foreground">{member.name}</span>
                              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-muted-foreground uppercase">
                                {member.role}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground font-mono">
                              PIN: •••• {member.phone ? `• Ph: ${member.phone}` : ''}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleStaff(member.id)}
                            className={`rounded-lg px-2 py-1 text-[10px] font-bold transition ${
                              member.active
                                ? 'bg-emerald-500/15 text-emerald-600'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {member.active ? 'Active' : 'Disabled'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteStaff(member.id)}
                            className="p-1.5 text-muted-foreground hover:text-destructive transition"
                            title="Remove staff member"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 6: SUBSCRIPTION & 7-DAY TRIAL ================= */}
          {activeTab === 'subscription' && (
            <div className="space-y-4">
              {/* Active Plan Status Banner */}
              <div className="rounded-2xl border border-accent/30 bg-gradient-to-r from-accent/10 via-card to-card p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
                      Current Subscription
                    </span>
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2 mt-0.5">
                      <Sparkles className="h-4 w-4 text-accent" />
                      <span>{PLANS[subInfo.subscription.tier].name}</span>
                      <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold text-accent uppercase">
                        {subInfo.subscription.status.replace(/_/g, ' ')}
                      </span>
                    </h3>
                  </div>

                  <Link
                    to="/pricing"
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs font-bold text-accent hover:underline"
                  >
                    <span>Full Feature Matrix</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-border/50 text-xs">
                  <div className="p-2.5 rounded-xl bg-secondary/50">
                    <p className="text-[10px] text-muted-foreground">Trial Countdown</p>
                    <p className="font-bold text-foreground">
                      {subInfo.isTrial ? `${subInfo.daysRemaining} Days Left` : 'Active Plan'}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-secondary/50">
                    <p className="text-[10px] text-muted-foreground">Monthly Bills</p>
                    <p className="font-bold text-foreground">
                      {subInfo.subscription.billsThisMonth} /{' '}
                      {subInfo.subscription.maxBillsPerMonth === Infinity
                        ? 'Unlimited'
                        : subInfo.subscription.maxBillsPerMonth}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-secondary/50 col-span-2 sm:col-span-1">
                    <p className="text-[10px] text-muted-foreground">Active Terminals</p>
                    <p className="font-bold text-foreground">
                      {subInfo.subscription.maxDevices === Infinity
                        ? 'Unlimited Devices'
                        : `Up to ${subInfo.subscription.maxDevices} Devices`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Upgrade Quick Cards */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Available Commercial Upgrades
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Pro Cafe */}
                  <div className="rounded-2xl border border-border bg-card p-4 flex flex-col justify-between space-y-3 hover:border-accent/50 transition">
                    <div>
                      <div className="flex items-center justify-between">
                        <h5 className="font-bold text-foreground">Pro Café</h5>
                        <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent">
                          Best Value
                        </span>
                      </div>
                      <p className="font-receipt text-lg font-bold text-foreground mt-1">
                        ₹4,999 <span className="text-[10px] font-normal text-muted-foreground">/ year (Save ₹1,000)</span>
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Unlimited bills, 3 devices, multi-lingual soundbox & custom QR.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleUpgradePlan('pro')}
                      className="w-full rounded-xl bg-accent py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 active:scale-95 transition"
                    >
                      Upgrade to Pro Café
                    </button>
                  </div>

                  {/* Business Plan */}
                  <div className="rounded-2xl border border-border bg-card p-4 flex flex-col justify-between space-y-3 hover:border-accent/50 transition">
                    <div>
                      <div className="flex items-center justify-between">
                        <h5 className="font-bold text-foreground">Business & Multi-Table</h5>
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                          Full Automation
                        </span>
                      </div>
                      <p className="font-receipt text-lg font-bold text-foreground mt-1">
                        ₹8,999 <span className="text-[10px] font-normal text-muted-foreground">/ year (Save ₹3,000)</span>
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Unlimited terminals, visual floor plan, table QR ordering & CRM.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleUpgradePlan('business')}
                      className="w-full rounded-xl bg-secondary border border-border py-2 text-xs font-bold text-foreground hover:bg-secondary/80 active:scale-95 transition"
                    >
                      Upgrade to Business
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 7: ACCOUNT & BACKUP ================= */}
          {activeTab === 'account' && (
            <div className="space-y-4">
              {/* Active Role & SaaS Subscription Status */}
              <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
                      Active SaaS Tier
                    </span>
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 mt-0.5">
                      <Sparkles className="h-4 w-4 text-accent" /> ServeJoy PRO Plan (Commercial Edition)
                    </h3>
                  </div>
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    Active Subscription
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-border/40 text-xs">
                  <div className="p-2 rounded-xl bg-secondary/50">
                    <p className="text-[10px] text-muted-foreground">User / Role</p>
                    <p className="font-bold text-foreground capitalize truncate">
                      {authUser?.displayName || userRole}
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-secondary/50">
                    <p className="text-[10px] text-muted-foreground">Outlet ID</p>
                    <p className="font-bold text-emerald-600 font-mono truncate">{cafeProfile.id}</p>
                  </div>
                  <div className="p-2 rounded-xl bg-secondary/50">
                    <p className="text-[10px] text-muted-foreground">Data Isolation</p>
                    <p className="font-bold text-foreground">Active Tenant</p>
                  </div>
                </div>
              </div>

              {/* Data Backup & Recovery (One-Click JSON Export) */}
              <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Data Backup & Business Security
                </h4>
                <p className="text-xs text-muted-foreground">
                  Export your complete restaurant data including all past bills, customer loyalty records, menu items, and business configuration into an offline JSON backup file.
                </p>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleExportBackup}
                    className="flex items-center gap-2 rounded-xl bg-secondary border border-border px-4 py-2 text-xs font-bold text-foreground hover:bg-secondary/80 active:scale-95 transition"
                  >
                    <Download className="h-4 w-4 text-accent" />
                    <span>Download Complete Backup (.json)</span>
                  </button>
                </div>
              </div>

              {/* Shift Logout Section */}
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-destructive flex items-center gap-1.5">
                  <LogOut className="h-3.5 w-3.5" /> End Shift & Logout
                </h4>
                <p className="text-xs text-muted-foreground">
                  Logging out will securely lock this POS terminal. Your sales records and orders remain safely saved.
                </p>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowLogoutConfirm(true)}
                    className="flex items-center gap-2 rounded-xl bg-destructive px-5 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 active:scale-95 transition"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>End Shift & Logout</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Accidental Logout Confirmation Dialog Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-[2rem] bg-card border border-border p-5 text-center shadow-elevated space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-destructive/15 text-destructive flex items-center justify-center mx-auto">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div>
              <h3 className="font-display text-base font-bold text-foreground">
                Confirm Shift Logout?
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Are you sure you want to log out from <span className="font-semibold text-foreground">{profileForm.name}</span>? Current shift data and all completed bills are saved securely.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="rounded-xl border border-border bg-secondary py-2 text-xs font-bold text-foreground hover:bg-secondary/80 active:scale-95 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl bg-destructive py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 active:scale-95 transition"
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

