'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Building2,
    Camera,
    Coins,
    CreditCard,
    Globe,
    Key,
    Loader2,
    Save,
    ShieldCheck,
    User
} from 'lucide-react';

// Common currencies for international business
const CURRENCIES = [
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳' },
  { code: 'NPR', name: 'Nepalese Rupee', symbol: 'रू' },
  { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
];
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function SettingsPage() {
  const t = useTranslations('Settings');
  const { data: session, update: updateSession } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [tenant, setTenant] = useState<any>({
    name: '',
    businessType: '',
    gstNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    email: '',
    website: '',
    currency: 'INR',
    allowedCurrencies: ['INR'] as string[],
    upiId: '',
    bankName: '',
    accountNumber: '',
    ifscCode: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (session?.user) {
      setProfile(prev => ({
        ...prev,
        name: (session.user as any).name || '',
        email: (session.user as any).email || '',
        phone: (session.user as any).phone || '',
      }));
    }
  }, [session]);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/settings/tenant');
      const data = await res.json();
      if (data.tenant) setTenant(data.tenant);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // Validate passwords if changing
      if (profile.newPassword) {
        if (profile.newPassword !== profile.confirmPassword) {
          alert('New passwords do not match');
          setIsSaving(false);
          return;
        }
        if (!profile.currentPassword) {
          alert('Please enter your current password');
          setIsSaving(false);
          return;
        }
      }

      const res = await fetch('/api/settings/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          ...(profile.newPassword && {
            currentPassword: profile.currentPassword,
            newPassword: profile.newPassword,
          }),
        }),
      });

      if (res.ok) {
        alert('Profile updated successfully');
        setProfile(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
        await updateSession();
      } else {
        const data = await res.json();
        alert(data.error || 'Error updating profile');
      }
    } catch (error) {
      alert('Error updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (activeTab === 'profile') {
      return handleSaveProfile();
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/settings/tenant', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tenant),
      });
      if (res.ok) {
        alert('Settings updated successfully');
      }
    } catch (error) {
      alert('Error updating settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="h-40 flex items-center justify-center">Loading...</div>;

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black tracking-tight font-heading">{t('title')}</h1>
          <p className="text-foreground/50 font-bold">{t('subtitle')}</p>
        </div>
        <Button
          className="font-black px-8 rounded-full"
          size="lg"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
          {t('save')}
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="gap-6 w-full relative rounded-none p-0 border-b border-foreground/10 bg-transparent h-auto">
          <TabsTrigger
            value="profile"
            className="max-w-fit px-0 h-12 data-[state=active]:text-primary font-black uppercase text-[10px] tracking-widest rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none"
          >
            <div className="flex items-center space-x-2">
              <User size={18} />
              <span>Profile</span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="business"
            className="max-w-fit px-0 h-12 data-[state=active]:text-primary font-black uppercase text-[10px] tracking-widest rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none"
          >
            <div className="flex items-center space-x-2">
              <Building2 size={18} />
              <span>{t('tabs.business')}</span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="payments"
            className="max-w-fit px-0 h-12 data-[state=active]:text-primary font-black uppercase text-[10px] tracking-widest rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none"
          >
            <div className="flex items-center space-x-2">
              <CreditCard size={18} />
              <span>{t('tabs.payments')}</span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="max-w-fit px-0 h-12 data-[state=active]:text-primary font-black uppercase text-[10px] tracking-widest rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none"
          >
            <div className="flex items-center space-x-2">
              <ShieldCheck size={18} />
              <span>{t('tabs.security')}</span>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="mt-8 grid lg:grid-cols-2 gap-8">
            {/* Profile Info */}
            <Card className="bg-card border border-foreground/10 p-6 rounded-lg">
              <CardContent className="space-y-6 p-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-4 bg-primary rounded-full" />
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Personal Information</h4>
                </div>

                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-black">
                      {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg hover:scale-105 transition-transform">
                      <Camera size={14} />
                    </button>
                  </div>
                  <div>
                    <p className="font-bold">{profile.name || 'User'}</p>
                    <p className="text-xs text-foreground/50">{profile.email}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input
                    value={profile.email}
                    disabled
                    className="h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg opacity-60"
                  />
                  <p className="text-[10px] text-foreground/40">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Password Change */}
            <Card className="bg-card border border-foreground/10 p-6 rounded-lg">
              <CardContent className="space-y-6 p-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-4 bg-warning rounded-full" />
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-warning">Change Password</h4>
                </div>

                <div className="p-4 rounded-xl bg-warning/5 border border-warning/10 mb-4">
                  <div className="flex items-start gap-3">
                    <Key size={18} className="text-warning mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-warning mb-1">Password Security</p>
                      <p className="text-[10px] text-foreground/60 leading-relaxed">
                        Use a strong password with at least 8 characters, including uppercase, lowercase, numbers, and symbols.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input
                    type="password"
                    value={profile.currentPassword}
                    onChange={(e) => setProfile({ ...profile, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                    className="h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    value={profile.newPassword}
                    onChange={(e) => setProfile({ ...profile, newPassword: e.target.value })}
                    placeholder="Enter new password"
                    className="h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input
                    type="password"
                    value={profile.confirmPassword}
                    onChange={(e) => setProfile({ ...profile, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                    className="h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="business">
          <div className="mt-8 grid lg:grid-cols-2 gap-8">
            <Card className="bg-card border border-foreground/10 p-6 rounded-lg">
                <CardContent className="space-y-6 p-0">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-4 bg-primary rounded-full" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{t('identity')}</h4>
                    </div>
                    <div className="space-y-2">
                        <Label>Legal Business Name</Label>
                        <Input
                            value={tenant.name}
                            onChange={(e) => setTenant({...tenant, name: e.target.value})}
                            placeholder="Enter business name"
                            className="h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>GST Number</Label>
                            <Input
                                value={tenant.gstNumber || ''}
                                onChange={(e) => setTenant({...tenant, gstNumber: e.target.value})}
                                placeholder="27XXXXX..."
                                className="h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input
                                value={tenant.phone || ''}
                                onChange={(e) => setTenant({...tenant, phone: e.target.value})}
                                placeholder="+91..."
                                className="h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card border border-foreground/10 p-6 rounded-lg">
                <CardContent className="space-y-6 p-0">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-4 bg-primary rounded-full" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{t('location')}</h4>
                    </div>
                    <div className="space-y-2">
                        <Label>Address</Label>
                        <Input
                            value={tenant.address || ''}
                            onChange={(e) => setTenant({...tenant, address: e.target.value})}
                            placeholder="Floor, Building, Street"
                            className="h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>City</Label>
                            <Input
                                value={tenant.city || ''}
                                onChange={(e) => setTenant({...tenant, city: e.target.value})}
                                placeholder="Mumbai"
                                className="h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Pincode</Label>
                            <Input
                                value={tenant.pincode || ''}
                                onChange={(e) => setTenant({...tenant, pincode: e.target.value})}
                                placeholder="400001"
                                className="h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card border border-foreground/10 p-6 lg:col-span-2 rounded-lg">
                <CardContent className="space-y-6 p-0">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-4 bg-warning rounded-full" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-warning">{t('currency_settings') || 'Currency Settings'}</h4>
                    </div>
                    <div className="space-y-6">
                        <div className="grid lg:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Default Currency</Label>
                                <Select
                                    value={tenant.currency || 'INR'}
                                    onValueChange={(value) => {
                                        // Ensure default currency is always in allowed list
                                        const newAllowed = tenant.allowedCurrencies?.includes(value)
                                            ? tenant.allowedCurrencies
                                            : [...(tenant.allowedCurrencies || []), value];
                                        setTenant({...tenant, currency: value, allowedCurrencies: newAllowed});
                                    }}
                                >
                                    <SelectTrigger className="h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <Coins size={18} className="text-warning" />
                                            <SelectValue placeholder="Select currency" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CURRENCIES.map((currency) => (
                                            <SelectItem key={currency.code} value={currency.code}>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg font-black w-8">{currency.symbol}</span>
                                                    <div>
                                                        <p className="font-bold">{currency.code}</p>
                                                        <p className="text-xs text-foreground/50">{currency.name}</p>
                                                    </div>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
                                <p className="text-xs font-bold text-warning mb-1">Currency Impact</p>
                                <p className="text-[10px] text-foreground/60 leading-relaxed">
                                    This currency will be used as the default for all new invoices and financial reports.
                                    Existing transactions will retain their original currency.
                                </p>
                                {tenant.currency && (
                                    <div className="mt-3 flex items-center gap-2">
                                        <span className="text-2xl font-black text-warning">
                                            {CURRENCIES.find(c => c.code === tenant.currency)?.symbol || '₹'}
                                        </span>
                                        <span className="text-sm font-bold opacity-60">
                                            {CURRENCIES.find(c => c.code === tenant.currency)?.name || 'Indian Rupee'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Multi-currency selection */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label>Enabled Currencies for Users</Label>
                                <span className="text-[10px] text-foreground/40">
                                    {tenant.allowedCurrencies?.length || 1} currency enabled
                                </span>
                            </div>
                            <p className="text-[10px] text-foreground/50 -mt-2">
                                Select which currencies your team members can use. If only one is selected, the currency selector won&apos;t be shown.
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {CURRENCIES.map((currency) => {
                                    const isSelected = tenant.allowedCurrencies?.includes(currency.code);
                                    const isDefault = tenant.currency === currency.code;
                                    return (
                                        <button
                                            key={currency.code}
                                            type="button"
                                            disabled={isDefault}
                                            onClick={() => {
                                                if (isDefault) return; // Can't disable default currency
                                                const newAllowed = isSelected
                                                    ? tenant.allowedCurrencies.filter((c: string) => c !== currency.code)
                                                    : [...(tenant.allowedCurrencies || []), currency.code];
                                                setTenant({...tenant, allowedCurrencies: newAllowed});
                                            }}
                                            className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
                                                isSelected
                                                    ? 'bg-warning/10 border-warning/30 text-foreground'
                                                    : 'bg-foreground/5 border-foreground/10 text-foreground/50 hover:border-foreground/20'
                                            } ${isDefault ? 'ring-2 ring-warning/50' : ''}`}
                                        >
                                            <span className="text-lg font-bold">{currency.symbol}</span>
                                            <div className="text-left flex-1 min-w-0">
                                                <p className="text-xs font-bold">{currency.code}</p>
                                                <p className="text-[10px] opacity-60 truncate">{currency.name}</p>
                                            </div>
                                            {isDefault && (
                                                <span className="text-[8px] bg-warning text-warning-foreground px-1.5 py-0.5 rounded font-bold">
                                                    DEFAULT
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payments">
          <div className="mt-8 grid lg:grid-cols-2 gap-8">
             <Card className="bg-card border border-foreground/10 p-6 rounded-lg">
                <CardContent className="space-y-6 p-0">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-4 bg-success rounded-full" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-success">{t('upi')}</h4>
                    </div>
                    <p className="text-xs font-bold opacity-40">{t('upi_helper')}</p>
                    <div className="space-y-2">
                        <Label>Business VPA / UPI ID</Label>
                        <div className="relative">
                            <Globe size={18} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-20" />
                            <Input
                                value={tenant.upiId || ''}
                                onChange={(e) => setTenant({...tenant, upiId: e.target.value})}
                                placeholder="e.g. business@okaxis"
                                className="h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg pl-10"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card border border-foreground/10 p-6 rounded-lg">
                <CardContent className="space-y-6 p-0">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-4 bg-success rounded-full" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-success">{t('banking')}</h4>
                    </div>
                    <div className="space-y-2">
                        <Label>Bank Name</Label>
                        <Input
                            value={tenant.bankName || ''}
                            onChange={(e) => setTenant({...tenant, bankName: e.target.value})}
                            placeholder="HDFC Bank"
                            className="h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Account Number</Label>
                            <Input
                                value={tenant.accountNumber || ''}
                                onChange={(e) => setTenant({...tenant, accountNumber: e.target.value})}
                                placeholder="501XXX..."
                                className="h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>IFSC Code</Label>
                            <Input
                                value={tenant.ifscCode || ''}
                                onChange={(e) => setTenant({...tenant, ifscCode: e.target.value})}
                                placeholder="HDFC000..."
                                className="h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="mt-8 max-w-2xl">
            <Card className="bg-zinc-900 dark:bg-zinc-950 text-white p-6 border border-zinc-800 rounded-lg">
                <CardContent className="space-y-6 p-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold mb-1">{t('security_standards')}</h3>
                            <p className="text-sm text-zinc-400">{t('protection_subtitle')}</p>
                        </div>
                        <div className="px-3 py-1 bg-success/20 text-success rounded-full border border-success/30 text-xs font-bold">
                            ISO 27001 ACTIVE
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700">
                            <h5 className="text-sm font-bold mb-1">Encryption at Rest</h5>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                All sensitive credentials (GSP, WhatsApp, SMTP) are encrypted using AES-256-GCM before being persisted to the database.
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700">
                            <h5 className="text-sm font-bold mb-1">Audit Trail</h5>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                System tracks all administrative changes to business settings and financial protocols in compliance with quality control guidelines.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
