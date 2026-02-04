'use client';

import {
    Button,
    Card,
    CardBody,
    Input,
    Select,
    SelectItem,
    Tab,
    Tabs
} from '@heroui/react';
import {
    Building2,
    Coins,
    CreditCard,
    Globe,
    Save,
    ShieldCheck
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
import { useEffect, useState } from 'react';

export default function SettingsPage() {
  const t = useTranslations('Settings');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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
    upiId: '',
    bankName: '',
    accountNumber: '',
    ifscCode: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

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

  const handleSave = async () => {
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
          <h1 className="text-3xl font-black tracking-tight">{t('title')}</h1>
          <p className="text-black/40 dark:text-white/40 font-bold">{t('subtitle')}</p>
        </div>
        <Button 
          color="primary" 
          radius="full" 
          size="lg" 
          className="font-black px-8" 
          startContent={<Save size={20} />}
          onClick={handleSave}
          isLoading={isSaving}
        >
          {t('save')}
        </Button>
      </div>

      <Tabs 
        aria-label="Settings categories" 
        variant="underlined" 
        classNames={{
            tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
            cursor: "w-full bg-primary",
            tab: "max-w-fit px-0 h-12",
            tabContent: "group-data-[selected=true]:text-primary font-black uppercase text-[10px] tracking-widest"
        }}
      >
        <Tab
          key="business"
          title={
            <div className="flex items-center space-x-2">
              <Building2 size={18} />
              <span>{t('tabs.business')}</span>
            </div>
          }
        >
          <div className="mt-8 grid lg:grid-cols-2 gap-8">
            <Card className="bg-card border border-soft p-6" radius="lg">
                <CardBody className="space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-4 bg-primary rounded-full" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{t('identity')}</h4>
                    </div>
                    <Input 
                        label="Legal Business Name" 
                        value={tenant.name} 
                        onValueChange={(v) => setTenant({...tenant, name: v})}
                        labelPlacement="outside" placeholder="Enter business name" size="lg" radius="lg" classNames={{ inputWrapper: "h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700" }}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input 
                            label="GST Number" 
                            value={tenant.gstNumber || ''} 
                            onValueChange={(v) => setTenant({...tenant, gstNumber: v})}
                            labelPlacement="outside" placeholder="27XXXXX..." size="lg" radius="lg" classNames={{ inputWrapper: "h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700" }}
                        />
                         <Input 
                            label="Phone" 
                            value={tenant.phone || ''} 
                            onValueChange={(v) => setTenant({...tenant, phone: v})}
                            labelPlacement="outside" placeholder="+91..." size="lg" radius="lg" classNames={{ inputWrapper: "h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700" }}
                        />
                    </div>
                </CardBody>
            </Card>

            <Card className="bg-card border border-soft p-6" radius="lg">
                <CardBody className="space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-4 bg-primary rounded-full" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{t('location')}</h4>
                    </div>
                    <Input
                        label="Address"
                        value={tenant.address || ''}
                        onValueChange={(v) => setTenant({...tenant, address: v})}
                        labelPlacement="outside" placeholder="Floor, Building, Street" size="lg" radius="lg" classNames={{ inputWrapper: "h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700" }}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="City"
                            value={tenant.city || ''}
                            onValueChange={(v) => setTenant({...tenant, city: v})}
                            labelPlacement="outside" placeholder="Mumbai" size="lg" radius="lg" classNames={{ inputWrapper: "h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700" }}
                        />
                        <Input
                            label="Pincode"
                            value={tenant.pincode || ''}
                            onValueChange={(v) => setTenant({...tenant, pincode: v})}
                            labelPlacement="outside" placeholder="400001" size="lg" radius="lg" classNames={{ inputWrapper: "h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700" }}
                        />
                    </div>
                </CardBody>
            </Card>

            <Card className="bg-card border border-soft p-6 lg:col-span-2" radius="lg">
                <CardBody className="space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-4 bg-warning rounded-full" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-warning">{t('currency_settings') || 'Currency Settings'}</h4>
                    </div>
                    <div className="grid lg:grid-cols-2 gap-6">
                        <div>
                            <Select
                                label="Default Currency"
                                labelPlacement="outside"
                                placeholder="Select currency"
                                selectedKeys={tenant.currency ? [tenant.currency] : ['INR']}
                                onSelectionChange={(keys) => {
                                    const selected = Array.from(keys)[0] as string;
                                    setTenant({...tenant, currency: selected});
                                }}
                                size="lg"
                                radius="lg"
                                startContent={<Coins size={18} className="text-warning" />}
                                classNames={{
                                    trigger: "h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700",
                                    value: "font-bold"
                                }}
                            >
                                {CURRENCIES.map((currency) => (
                                    <SelectItem key={currency.code} textValue={`${currency.code} - ${currency.name}`}>
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg font-black w-8">{currency.symbol}</span>
                                            <div>
                                                <p className="font-bold">{currency.code}</p>
                                                <p className="text-xs text-foreground/50">{currency.name}</p>
                                            </div>
                                        </div>
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>
                        <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
                            <p className="text-xs font-bold text-warning mb-1">Currency Impact</p>
                            <p className="text-[10px] text-foreground/60 leading-relaxed">
                                This currency will be used as the default for all new invoices and financial reports.
                                Existing invoices will retain their original currency.
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
                </CardBody>
            </Card>
          </div>
        </Tab>

        <Tab
          key="payments"
          title={
            <div className="flex items-center space-x-2">
              <CreditCard size={18} />
              <span>{t('tabs.payments')}</span>
            </div>
          }
        >
          <div className="mt-8 grid lg:grid-cols-2 gap-8">
             <Card className="bg-card border border-soft p-6" radius="lg">
                <CardBody className="space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-4 bg-success rounded-full" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-success">{t('upi')}</h4>
                    </div>
                    <p className="text-xs font-bold opacity-40">{t('upi_helper')}</p>
                    <Input 
                        label="Business VPA / UPI ID" 
                        value={tenant.upiId || ''} 
                        onValueChange={(v) => setTenant({...tenant, upiId: v})}
                        labelPlacement="outside" placeholder="e.g. business@okaxis" size="lg" radius="lg" classNames={{ inputWrapper: "h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700" }}
                        startContent={<Globe size={18} className="opacity-20" />}
                    />
                </CardBody>
            </Card>

            <Card className="bg-card border border-soft p-6" radius="lg">
                <CardBody className="space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-4 bg-success rounded-full" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-success">{t('banking')}</h4>
                    </div>
                    <Input 
                        label="Bank Name" 
                        value={tenant.bankName || ''} 
                        onValueChange={(v) => setTenant({...tenant, bankName: v})}
                        labelPlacement="outside" placeholder="HDFC Bank" size="lg" radius="lg" classNames={{ inputWrapper: "h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700" }}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input 
                            label="Account Number" 
                            value={tenant.accountNumber || ''} 
                            onValueChange={(v) => setTenant({...tenant, accountNumber: v})}
                            labelPlacement="outside" placeholder="501XXX..." size="lg" radius="lg" classNames={{ inputWrapper: "h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700" }}
                        />
                        <Input 
                            label="IFSC Code" 
                            value={tenant.ifscCode || ''} 
                            onValueChange={(v) => setTenant({...tenant, ifscCode: v})}
                            labelPlacement="outside" placeholder="HDFC000..." size="lg" radius="lg" classNames={{ inputWrapper: "h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700" }}
                        />
                    </div>
                </CardBody>
            </Card>
          </div>
        </Tab>

        <Tab
          key="security"
          title={
            <div className="flex items-center space-x-2">
              <ShieldCheck size={18} />
              <span>{t('tabs.security')}</span>
            </div>
          }
        >
          <div className="mt-8 max-w-2xl">
            <Card className="bg-zinc-900 dark:bg-zinc-950 text-white p-6 border border-zinc-800" radius="lg">
                <CardBody className="space-y-6 p-0">
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
                </CardBody>
            </Card>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
