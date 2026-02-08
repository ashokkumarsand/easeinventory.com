'use client';

import { Logo } from '@/components/icons/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Confetti } from '@/components/ui/confetti';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { DEFAULT_CATEGORIES } from '@/lib/setup-categories';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Loader2,
  MapPin,
  Package,
  Rocket,
  SkipForward,
  Sparkles,
  Tag,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';

const STEPS = [
  { id: 'welcome', label: 'Welcome', icon: Sparkles },
  { id: 'profile', label: 'Business Profile', icon: Building2 },
  { id: 'warehouse', label: 'Warehouse', icon: MapPin },
  { id: 'categories', label: 'Categories', icon: Tag },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'done', label: 'All Done', icon: CheckCircle2 },
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry',
];

const ASSIGNABLE_ROLES = [
  { value: 'MANAGER', label: 'Manager' },
  { value: 'ACCOUNTANT', label: 'Accountant' },
  { value: 'SALES_STAFF', label: 'Sales Staff' },
  { value: 'TECHNICIAN', label: 'Technician' },
  { value: 'STAFF', label: 'Staff' },
  { value: 'VIEWER', label: 'Viewer' },
];

interface ProductRow {
  name: string;
  sku: string;
  salePrice: string;
  quantity: string;
  categoryId: string;
}

interface InviteRow {
  email: string;
  name: string;
  role: string;
}

interface InviteResult {
  email: string;
  tempPassword: string;
  role: string;
  error?: string;
}

export default function SetupPage() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [tenantName, setTenantName] = useState('');
  const [businessType, setBusinessType] = useState('general');
  const [setupProgress, setSetupProgress] = useState<Record<string, boolean>>({});
  const [showConfetti, setShowConfetti] = useState(false);

  // Step summaries for done page
  const [summary, setSummary] = useState({ categories: 0, products: 0, team: 0 });

  // Profile form
  const [profile, setProfile] = useState({
    address: '', city: '', state: '', pincode: '', phone: '', email: '',
    bankName: '', accountNumber: '', ifscCode: '', upiId: '',
  });

  // Warehouse form
  const [warehouse, setWarehouse] = useState({
    name: '', address: '', city: '', state: '', pincode: '',
  });

  // Categories
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [customCategory, setCustomCategory] = useState('');
  const [categorySuggestions, setCategorySuggestions] = useState<string[]>([]);

  // Products
  const [products, setProducts] = useState<ProductRow[]>([
    { name: '', sku: '', salePrice: '', quantity: '', categoryId: '' },
  ]);
  const [createdCategories, setCreatedCategories] = useState<Array<{ id: string; name: string }>>([]);

  // Team invites
  const [invites, setInvites] = useState<InviteRow[]>([
    { email: '', name: '', role: 'STAFF' },
  ]);
  const [inviteResults, setInviteResults] = useState<InviteResult[]>([]);

  // Fetch setup status on mount
  useEffect(() => {
    const user = session?.user as any;
    if (!user) return;

    // If setup is already complete, redirect to dashboard
    if (user.setupComplete !== false) {
      router.push('/dashboard');
      return;
    }

    async function fetchStatus() {
      try {
        const res = await fetch('/api/setup/status');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();

        setTenantName(data.tenantName || '');
        setBusinessType(data.businessType?.toLowerCase() || 'general');
        setSetupProgress(data.setupProgress || {});

        // Set category suggestions based on business type
        const bType = data.businessType?.toLowerCase() || 'general';
        const suggestions = DEFAULT_CATEGORIES[bType] || DEFAULT_CATEGORIES['general'];
        setCategorySuggestions(suggestions);
        setSelectedCategories(new Set(suggestions));

        // Find first incomplete step to resume
        const progress = data.setupProgress || {};
        if (progress.profile) {
          if (progress.warehouse) {
            if (progress.categories) {
              if (progress.products) {
                if (progress.team) {
                  setCurrentStep(6); // done
                } else {
                  setCurrentStep(5); // team
                }
              } else {
                setCurrentStep(4); // products
              }
            } else {
              setCurrentStep(3); // categories
            }
          } else {
            setCurrentStep(2); // warehouse
          }
        } else {
          setCurrentStep(0); // welcome
        }
      } catch {
        // silently fail, start from beginning
      } finally {
        setInitialLoading(false);
      }
    }
    fetchStatus();
  }, [session, router]);

  // Fetch categories for product step
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) return;
      const data = await res.json();
      if (data.categories) {
        setCreatedCategories(data.categories.map((c: any) => ({ id: c.id, name: c.name })));
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (currentStep === 4) fetchCategories();
  }, [currentStep, fetchCategories]);

  const handleProfileSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/setup/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save profile');
      }
      setSetupProgress((p) => ({ ...p, profile: true }));
      setCurrentStep(2);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWarehouseSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/setup/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(warehouse),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create warehouse');
      }
      setSetupProgress((p) => ({ ...p, warehouse: true }));
      setCurrentStep(3);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoriesSubmit = async () => {
    setLoading(true);
    try {
      const categories = Array.from(selectedCategories);
      const res = await fetch('/api/setup/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create categories');
      }
      const data = await res.json();
      setSummary((s) => ({ ...s, categories: data.created || categories.length }));
      setSetupProgress((p) => ({ ...p, categories: true }));
      setCurrentStep(4);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProductsSubmit = async () => {
    const validProducts = products.filter((p) => p.name.trim());
    if (validProducts.length === 0) {
      // Skip
      setSetupProgress((p) => ({ ...p, products: true }));
      setCurrentStep(5);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/setup/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: validProducts }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create products');
      }
      const data = await res.json();
      setSummary((s) => ({ ...s, products: data.created || validProducts.length }));
      setSetupProgress((p) => ({ ...p, products: true }));
      setCurrentStep(5);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteSubmit = async () => {
    const validInvites = invites.filter((i) => i.email.trim());
    if (validInvites.length === 0) {
      // Skip
      setSetupProgress((p) => ({ ...p, team: true }));
      setCurrentStep(6);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/setup/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invites: validInvites }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to invite team');
      }
      const data = await res.json();
      setSummary((s) => ({ ...s, team: data.invited || 0 }));
      setInviteResults(data.results || []);
      setSetupProgress((p) => ({ ...p, team: true }));
      setCurrentStep(6);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      await fetch('/api/setup/complete', { method: 'POST' });
      await updateSession({ setupComplete: true });
      setShowConfetti(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } catch {
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const addCustomCategory = () => {
    const trimmed = customCategory.trim();
    if (trimmed && !selectedCategories.has(trimmed)) {
      setSelectedCategories((prev) => new Set([...prev, trimmed]));
      setCustomCategory('');
    }
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const addProductRow = () => {
    if (products.length < 10) {
      setProducts([...products, { name: '', sku: '', salePrice: '', quantity: '', categoryId: '' }]);
    }
  };

  const updateProduct = (index: number, field: keyof ProductRow, value: string) => {
    setProducts((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };

  const removeProduct = (index: number) => {
    if (products.length > 1) {
      setProducts((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const addInviteRow = () => {
    if (invites.length < 5) {
      setInvites([...invites, { email: '', name: '', role: 'STAFF' }]);
    }
  };

  const updateInvite = (index: number, field: keyof InviteRow, value: string) => {
    setInvites((prev) => prev.map((inv, i) => (i === index ? { ...inv, [field]: value } : inv)));
  };

  const removeInvite = (index: number) => {
    if (invites.length > 1) {
      setInvites((prev) => prev.filter((_, i) => i !== index));
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm font-bold text-foreground/40 uppercase tracking-widest">Loading setup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-4 md:p-8 relative overflow-hidden">
      {showConfetti && <Confetti />}

      {/* Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Header */}
      <div className="w-full max-w-3xl mx-auto mb-8 relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <Logo size={32} />
          <span className="text-lg font-black tracking-tight">
            Ease<span className="text-primary italic">Inventory</span>
          </span>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-1 mb-2">
          {STEPS.map((step, idx) => {
            const StepIcon = step.icon;
            const isActive = idx === currentStep;
            const isComplete = idx < currentStep;
            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center gap-1 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all text-xs font-bold ${
                      isComplete
                        ? 'bg-primary text-primary-foreground'
                        : isActive
                        ? 'bg-primary/20 text-primary ring-2 ring-primary'
                        : 'bg-foreground/5 text-foreground/30'
                    }`}
                  >
                    {isComplete ? <Check className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-wider hidden md:block ${
                    isActive ? 'text-primary' : isComplete ? 'text-foreground/60' : 'text-foreground/20'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 rounded-full transition-all ${
                    idx < currentStep ? 'bg-primary' : 'bg-foreground/10'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <div className="w-full max-w-3xl mx-auto relative z-10">
        <Card className="border-none shadow-2xl bg-card rounded-lg">
          <CardContent className="p-6 md:p-10">
            <AnimatePresence mode="wait">
              {/* STEP 0: Welcome */}
              {currentStep === 0 && (
                <motion.div
                  key="welcome"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <Rocket className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase">
                      Welcome, {tenantName || 'there'}!
                    </h1>
                    <p className="text-foreground/50 font-medium max-w-md mx-auto">
                      Let&apos;s set up your workspace in just a few minutes. Here&apos;s what we&apos;ll do:
                    </p>
                  </div>

                  <div className="grid gap-3 max-w-md mx-auto">
                    {[
                      { icon: Building2, label: 'Add your business address & details' },
                      { icon: MapPin, label: 'Create your first warehouse' },
                      { icon: Tag, label: 'Set up product categories' },
                      { icon: Package, label: 'Add your first products' },
                      { icon: Users, label: 'Invite your team members' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-foreground/[0.03]">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <item.icon className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm font-semibold text-foreground/70">{item.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center pt-4">
                    <Button
                      size="lg"
                      className="font-black h-12 px-12 shadow-xl shadow-primary/20 text-sm uppercase tracking-widest rounded-full"
                      onClick={() => setCurrentStep(1)}
                    >
                      Let&apos;s Get Started
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 1: Business Profile */}
              {currentStep === 1 && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-black tracking-tight uppercase">Business Profile</h2>
                    <p className="text-sm text-foreground/40 mt-1">Your business address will appear on invoices and purchase orders.</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 space-y-1">
                      <label className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground/40 block mb-1.5 ml-1">Street Address *</label>
                      <Input
                        placeholder="123, Main Street"
                        value={profile.address}
                        onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                        className="bg-foreground/5 h-11 border-none shadow-inner text-sm font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground/40 block mb-1.5 ml-1">City *</label>
                      <Input
                        placeholder="Mumbai"
                        value={profile.city}
                        onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                        className="bg-foreground/5 h-11 border-none shadow-inner text-sm font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground/40 block mb-1.5 ml-1">State *</label>
                      <Select value={profile.state} onValueChange={(v) => setProfile({ ...profile, state: v })}>
                        <SelectTrigger className="bg-foreground/5 h-11 border-none shadow-inner text-sm font-bold">
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {INDIAN_STATES.map((s) => (
                            <SelectItem key={s} value={s} className="font-bold">{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground/40 block mb-1.5 ml-1">Pincode *</label>
                      <Input
                        placeholder="400001"
                        maxLength={6}
                        value={profile.pincode}
                        onChange={(e) => setProfile({ ...profile, pincode: e.target.value.replace(/\D/g, '') })}
                        className="bg-foreground/5 h-11 border-none shadow-inner text-sm font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground/40 block mb-1.5 ml-1">Phone</label>
                      <Input
                        placeholder="+91 98XXX XXXXX"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="bg-foreground/5 h-11 border-none shadow-inner text-sm font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground/40 block mb-1.5 ml-1">Email</label>
                      <Input
                        type="email"
                        placeholder="billing@company.com"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="bg-foreground/5 h-11 border-none shadow-inner text-sm font-bold"
                      />
                    </div>
                  </div>

                  <Separator className="opacity-20" />

                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-foreground/40 mb-4">
                      Bank Details <span className="text-foreground/20">(Optional)</span>
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground/40 block mb-1.5 ml-1">Bank Name</label>
                        <Input
                          placeholder="State Bank of India"
                          value={profile.bankName}
                          onChange={(e) => setProfile({ ...profile, bankName: e.target.value })}
                          className="bg-foreground/5 h-11 border-none shadow-inner text-sm font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground/40 block mb-1.5 ml-1">Account Number</label>
                        <Input
                          placeholder="XXXXXXXXXXXX"
                          value={profile.accountNumber}
                          onChange={(e) => setProfile({ ...profile, accountNumber: e.target.value })}
                          className="bg-foreground/5 h-11 border-none shadow-inner text-sm font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground/40 block mb-1.5 ml-1">IFSC Code</label>
                        <Input
                          placeholder="SBIN0001234"
                          value={profile.ifscCode}
                          onChange={(e) => setProfile({ ...profile, ifscCode: e.target.value.toUpperCase() })}
                          className="bg-foreground/5 h-11 border-none shadow-inner text-sm font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground/40 block mb-1.5 ml-1">UPI ID</label>
                        <Input
                          placeholder="business@upi"
                          value={profile.upiId}
                          onChange={(e) => setProfile({ ...profile, upiId: e.target.value })}
                          className="bg-foreground/5 h-11 border-none shadow-inner text-sm font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <Button variant="ghost" onClick={() => setCurrentStep(0)} className="font-bold text-foreground/40">
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button
                      size="lg"
                      className="font-black h-12 px-8 shadow-xl shadow-primary/20 text-sm uppercase tracking-widest rounded-full"
                      onClick={handleProfileSubmit}
                      disabled={loading || !profile.address || !profile.city || !profile.state || !profile.pincode}
                    >
                      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Save & Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Warehouse */}
              {currentStep === 2 && (
                <motion.div
                  key="warehouse"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-black tracking-tight uppercase">First Warehouse</h2>
                    <p className="text-sm text-foreground/40 mt-1">Create your primary storage location. You can add more warehouses later.</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 space-y-1">
                      <label className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground/40 block mb-1.5 ml-1">Warehouse Name *</label>
                      <Input
                        placeholder="Main Warehouse"
                        value={warehouse.name}
                        onChange={(e) => setWarehouse({ ...warehouse, name: e.target.value })}
                        className="bg-foreground/5 h-11 border-none shadow-inner text-sm font-bold"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <label className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground/40 block mb-1.5 ml-1">Address</label>
                      <Input
                        placeholder="Plot No. 12, Industrial Area"
                        value={warehouse.address}
                        onChange={(e) => setWarehouse({ ...warehouse, address: e.target.value })}
                        className="bg-foreground/5 h-11 border-none shadow-inner text-sm font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground/40 block mb-1.5 ml-1">City</label>
                      <Input
                        placeholder="Mumbai"
                        value={warehouse.city}
                        onChange={(e) => setWarehouse({ ...warehouse, city: e.target.value })}
                        className="bg-foreground/5 h-11 border-none shadow-inner text-sm font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground/40 block mb-1.5 ml-1">State</label>
                      <Select value={warehouse.state} onValueChange={(v) => setWarehouse({ ...warehouse, state: v })}>
                        <SelectTrigger className="bg-foreground/5 h-11 border-none shadow-inner text-sm font-bold">
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {INDIAN_STATES.map((s) => (
                            <SelectItem key={s} value={s} className="font-bold">{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground/40 block mb-1.5 ml-1">Pincode</label>
                      <Input
                        placeholder="400001"
                        maxLength={6}
                        value={warehouse.pincode}
                        onChange={(e) => setWarehouse({ ...warehouse, pincode: e.target.value.replace(/\D/g, '') })}
                        className="bg-foreground/5 h-11 border-none shadow-inner text-sm font-bold"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <Button variant="ghost" onClick={() => setCurrentStep(1)} className="font-bold text-foreground/40">
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button
                      size="lg"
                      className="font-black h-12 px-8 shadow-xl shadow-primary/20 text-sm uppercase tracking-widest rounded-full"
                      onClick={handleWarehouseSubmit}
                      disabled={loading || !warehouse.name}
                    >
                      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Create Warehouse
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Categories */}
              {currentStep === 3 && (
                <motion.div
                  key="categories"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-black tracking-tight uppercase">Categories</h2>
                      <p className="text-sm text-foreground/40 mt-1">Select categories for your products. We&apos;ve suggested some based on your industry.</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSetupProgress((p) => ({ ...p, categories: true }));
                        setCurrentStep(4);
                      }}
                      className="text-xs font-bold text-foreground/40"
                    >
                      <SkipForward className="w-3 h-3 mr-1" /> Skip
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {categorySuggestions.map((cat) => {
                      const isSelected = selectedCategories.has(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggleCategory(cat)}
                          className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                            isSelected
                              ? 'bg-primary text-primary-foreground shadow-md'
                              : 'bg-foreground/5 text-foreground/50 hover:bg-foreground/10'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                          {cat}
                        </button>
                      );
                    })}
                    {/* Custom categories added */}
                    {Array.from(selectedCategories)
                      .filter((cat) => !categorySuggestions.includes(cat))
                      .map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggleCategory(cat)}
                          className="px-4 py-2 rounded-full text-sm font-bold bg-primary text-primary-foreground shadow-md"
                        >
                          <Check className="w-3 h-3 inline mr-1" />
                          {cat}
                        </button>
                      ))}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Add custom category..."
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomCategory(); } }}
                      className="bg-foreground/5 h-11 border-none shadow-inner text-sm font-bold"
                    />
                    <Button variant="outline" onClick={addCustomCategory} disabled={!customCategory.trim()}>
                      Add
                    </Button>
                  </div>

                  <p className="text-xs text-foreground/30 font-medium">
                    {selectedCategories.size} categor{selectedCategories.size === 1 ? 'y' : 'ies'} selected
                  </p>

                  <div className="flex items-center justify-between pt-4">
                    <Button variant="ghost" onClick={() => setCurrentStep(2)} className="font-bold text-foreground/40">
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button
                      size="lg"
                      className="font-black h-12 px-8 shadow-xl shadow-primary/20 text-sm uppercase tracking-widest rounded-full"
                      onClick={handleCategoriesSubmit}
                      disabled={loading || selectedCategories.size === 0}
                    >
                      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Save Categories
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: Products */}
              {currentStep === 4 && (
                <motion.div
                  key="products"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-black tracking-tight uppercase">Add Products</h2>
                      <p className="text-sm text-foreground/40 mt-1">Add a few products to get started. You can always add more from the Inventory page.</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSetupProgress((p) => ({ ...p, products: true }));
                        setCurrentStep(5);
                      }}
                      className="text-xs font-bold text-foreground/40"
                    >
                      <SkipForward className="w-3 h-3 mr-1" /> Skip
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {products.map((product, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-12 md:col-span-3 space-y-1">
                          {idx === 0 && <label className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground/40 block mb-1 ml-1">Name *</label>}
                          <Input
                            placeholder="Product name"
                            value={product.name}
                            onChange={(e) => updateProduct(idx, 'name', e.target.value)}
                            className="bg-foreground/5 h-10 border-none shadow-inner text-sm font-bold"
                          />
                        </div>
                        <div className="col-span-4 md:col-span-2 space-y-1">
                          {idx === 0 && <label className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground/40 block mb-1 ml-1">SKU</label>}
                          <Input
                            placeholder="SKU-001"
                            value={product.sku}
                            onChange={(e) => updateProduct(idx, 'sku', e.target.value)}
                            className="bg-foreground/5 h-10 border-none shadow-inner text-sm font-bold"
                          />
                        </div>
                        <div className="col-span-4 md:col-span-2 space-y-1">
                          {idx === 0 && <label className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground/40 block mb-1 ml-1">Price</label>}
                          <Input
                            placeholder="0.00"
                            type="number"
                            value={product.salePrice}
                            onChange={(e) => updateProduct(idx, 'salePrice', e.target.value)}
                            className="bg-foreground/5 h-10 border-none shadow-inner text-sm font-bold"
                          />
                        </div>
                        <div className="col-span-3 md:col-span-2 space-y-1">
                          {idx === 0 && <label className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground/40 block mb-1 ml-1">Qty</label>}
                          <Input
                            placeholder="0"
                            type="number"
                            value={product.quantity}
                            onChange={(e) => updateProduct(idx, 'quantity', e.target.value)}
                            className="bg-foreground/5 h-10 border-none shadow-inner text-sm font-bold"
                          />
                        </div>
                        <div className="col-span-12 md:col-span-2 space-y-1">
                          {idx === 0 && <label className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground/40 block mb-1 ml-1">Category</label>}
                          <Select value={product.categoryId} onValueChange={(v) => updateProduct(idx, 'categoryId', v)}>
                            <SelectTrigger className="bg-foreground/5 h-10 border-none shadow-inner text-sm font-bold">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {createdCategories.map((c) => (
                                <SelectItem key={c.id} value={c.id} className="font-bold text-sm">{c.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-1 flex justify-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeProduct(idx)}
                            disabled={products.length <= 1}
                            className="h-10 w-10 text-foreground/30 hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {products.length < 10 && (
                    <Button variant="outline" size="sm" onClick={addProductRow} className="font-bold">
                      + Add another product
                    </Button>
                  )}

                  <div className="flex items-center justify-between pt-4">
                    <Button variant="ghost" onClick={() => setCurrentStep(3)} className="font-bold text-foreground/40">
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button
                      size="lg"
                      className="font-black h-12 px-8 shadow-xl shadow-primary/20 text-sm uppercase tracking-widest rounded-full"
                      onClick={handleProductsSubmit}
                      disabled={loading}
                    >
                      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      {products.some((p) => p.name.trim()) ? 'Save Products' : 'Skip'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 5: Team */}
              {currentStep === 5 && (
                <motion.div
                  key="team"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-black tracking-tight uppercase">Invite Team</h2>
                      <p className="text-sm text-foreground/40 mt-1">Add team members who&apos;ll help manage your inventory.</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSetupProgress((p) => ({ ...p, team: true }));
                        setCurrentStep(6);
                      }}
                      className="text-xs font-bold text-foreground/40"
                    >
                      <SkipForward className="w-3 h-3 mr-1" /> Skip
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {invites.map((invite, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-12 md:col-span-4 space-y-1">
                          {idx === 0 && <label className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground/40 block mb-1 ml-1">Email *</label>}
                          <Input
                            type="email"
                            placeholder="team@company.com"
                            value={invite.email}
                            onChange={(e) => updateInvite(idx, 'email', e.target.value)}
                            className="bg-foreground/5 h-10 border-none shadow-inner text-sm font-bold"
                          />
                        </div>
                        <div className="col-span-5 md:col-span-4 space-y-1">
                          {idx === 0 && <label className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground/40 block mb-1 ml-1">Name</label>}
                          <Input
                            placeholder="Full name"
                            value={invite.name}
                            onChange={(e) => updateInvite(idx, 'name', e.target.value)}
                            className="bg-foreground/5 h-10 border-none shadow-inner text-sm font-bold"
                          />
                        </div>
                        <div className="col-span-6 md:col-span-3 space-y-1">
                          {idx === 0 && <label className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground/40 block mb-1 ml-1">Role</label>}
                          <Select value={invite.role} onValueChange={(v) => updateInvite(idx, 'role', v)}>
                            <SelectTrigger className="bg-foreground/5 h-10 border-none shadow-inner text-sm font-bold">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ASSIGNABLE_ROLES.map((r) => (
                                <SelectItem key={r.value} value={r.value} className="font-bold">{r.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-1 flex justify-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeInvite(idx)}
                            disabled={invites.length <= 1}
                            className="h-10 w-10 text-foreground/30 hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {invites.length < 5 && (
                    <Button variant="outline" size="sm" onClick={addInviteRow} className="font-bold">
                      <UserPlus className="w-4 h-4 mr-2" /> Add another
                    </Button>
                  )}

                  <p className="text-xs text-foreground/30 font-medium">
                    Temporary passwords will be generated for each team member. Share them securely.
                  </p>

                  <div className="flex items-center justify-between pt-4">
                    <Button variant="ghost" onClick={() => setCurrentStep(4)} className="font-bold text-foreground/40">
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button
                      size="lg"
                      className="font-black h-12 px-8 shadow-xl shadow-primary/20 text-sm uppercase tracking-widest rounded-full"
                      onClick={handleInviteSubmit}
                      disabled={loading}
                    >
                      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      {invites.some((i) => i.email.trim()) ? 'Invite & Finish' : 'Skip & Finish'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 6: Done */}
              {currentStep === 6 && (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8 text-center"
                >
                  <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                  </div>

                  <div>
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight uppercase">You&apos;re All Set!</h2>
                    <p className="text-foreground/50 font-medium mt-2 max-w-md mx-auto">
                      Your workspace is ready. Here&apos;s a summary of what was set up:
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                    {[
                      { label: 'Categories', count: summary.categories },
                      { label: 'Products', count: summary.products },
                      { label: 'Team Members', count: summary.team },
                    ].map((item) => (
                      <div key={item.label} className="p-4 rounded-xl bg-foreground/[0.03]">
                        <div className="text-2xl font-black text-primary">{item.count}</div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-foreground/40">{item.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Show invite results with temp passwords */}
                  {inviteResults.length > 0 && (
                    <div className="text-left max-w-md mx-auto">
                      <h3 className="text-xs font-black uppercase tracking-wider text-foreground/40 mb-2">Team Credentials</h3>
                      <div className="bg-foreground/[0.03] rounded-xl p-4 space-y-2">
                        {inviteResults.map((r, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span className="font-bold truncate mr-2">{r.email}</span>
                            {r.error ? (
                              <span className="text-destructive text-xs font-bold">{r.error}</span>
                            ) : (
                              <code className="bg-foreground/10 px-2 py-1 rounded text-xs font-mono">{r.tempPassword}</code>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-foreground/30 mt-2 font-medium">
                        Save these credentials now. They won&apos;t be shown again.
                      </p>
                    </div>
                  )}

                  <Button
                    size="lg"
                    className="font-black h-12 px-12 shadow-xl shadow-primary/20 text-sm uppercase tracking-widest rounded-full"
                    onClick={handleComplete}
                    disabled={loading}
                  >
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
