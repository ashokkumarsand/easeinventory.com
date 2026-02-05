'use client';

import { Logo } from '@/components/icons/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { AnimatePresence, motion } from 'framer-motion';
import { Building2, Check, Crown, Loader2, Zap } from 'lucide-react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import React, { useState } from 'react';

const businessTypes = [
  { label: 'Retail Shop', value: 'SHOP' },
  { label: 'Service Center', value: 'SERVICE_CENTER' },
  { label: 'Wholesale / Distributor', value: 'DISTRIBUTOR' },
  { label: 'Company / Enterprise', value: 'COMPANY' },
];

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    icon: Zap,
    monthlyPrice: 799,
    annualPrice: 7999,
    features: ['500 Products', '3 Users', '500 MB Storage', '100 WhatsApp msgs/mo'],
    popular: false,
  },
  {
    id: 'business',
    name: 'Business',
    icon: Building2,
    monthlyPrice: 1499,
    annualPrice: 14999,
    features: ['5,000 Products', '10 Users', '5 GB Storage', '500 WhatsApp msgs/mo', 'Custom Domain'],
    popular: true,
  },
  {
    id: 'professional',
    name: 'Professional',
    icon: Crown,
    monthlyPrice: 2999,
    annualPrice: 29999,
    features: ['Unlimited Products', '25 Users', '25 GB Storage', '2000 WhatsApp msgs/mo', 'API Access', 'Priority Support'],
    popular: false,
  },
];

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    brandName: '',
    workspaceName: '',
    ownerName: '',
    email: '',
    password: '',
    phone: '',
    businessType: '',
    gstin: '',
    selectedPlan: 'business',
    billingCycle: 'monthly' as 'monthly' | 'annual',
    agreeToTerms: false,
    otp: ''
  });
  const slugCheckTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleSlugChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // No longer used in first step, but keeping function for future use in settings
  };

  // Validate GSTIN format (15-character alphanumeric)
  const validateGSTIN = (gstin: string): boolean => {
    if (!gstin) return true; // Optional field
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstinRegex.test(gstin.toUpperCase());
  };

  const isGSTINValid = validateGSTIN(formData.gstin);

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brandName: formData.brandName,
          workspaceName: formData.workspaceName,
          ownerName: formData.ownerName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          businessType: formData.businessType || 'SHOP',
          gstin: formData.gstin || null,
          selectedPlan: formData.selectedPlan,
          billingCycle: formData.billingCycle,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Redirect to payment or dashboard based on plan
      if (formData.selectedPlan === 'starter' && formData.billingCycle === 'monthly') {
        // Free trial - go to dashboard
        window.location.href = `/login?registered=true${formData.workspaceName ? `&workspace=${formData.workspaceName}` : ''}`;
      } else {
        // Paid plan - redirect to payment
        window.location.href = `/login?registered=true${formData.workspaceName ? `&workspace=${formData.workspaceName}` : ''}&plan=${formData.selectedPlan}`;
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedPlanDetails = plans.find(p => p.id === formData.selectedPlan);
  const currentPrice = formData.billingCycle === 'annual'
    ? selectedPlanDetails?.annualPrice
    : selectedPlanDetails?.monthlyPrice;
  const gstAmount = Math.round((currentPrice || 0) * 0.18);
  const totalPrice = (currentPrice || 0) + gstAmount;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] animate-drift pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[130px] animate-drift delay-1000 pointer-events-none" />

      <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-20 items-center relative z-10">

        {/* Left: Branding & Info */}
        <div className="hidden lg:flex flex-col gap-12">
           <Link href="/" className="inline-flex items-center gap-4 group active:scale-95 transition-transform">
              <div className="p-3 bg-foreground/5 rounded-2xl group-hover:bg-primary/20 transition-colors">
                 <Logo size={44} />
              </div>
              <span className="text-3xl font-black tracking-tighter uppercase text-foreground">
                Ease<span className="text-primary italic">Inventory</span>
              </span>
           </Link>

           <div className="space-y-10">
              <h1 className="text-6xl lg:text-8xl font-black leading-[0.9] tracking-tighter text-foreground uppercase">
                Establish <br />
                Your <span className="text-primary italic">Operations</span>
              </h1>
              <p className="text-xl lg:text-2xl text-foreground/50 max-w-md leading-relaxed font-medium italic">
                Register today and unlock the most advanced business operating system built for India.
              </p>
           </div>

           <div className="grid grid-cols-2 gap-6 max-w-lg">
              {[
                { label: 'Data Sovereignty', icon: '☁️' },
                { label: 'AES Encryption', icon: '🛡️' },
                { label: '24/7 Logistics Support', icon: '🎧' },
                { label: 'GST Compliant', icon: '🇮🇳' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-4 p-5 rounded-[32px] bg-foreground/5 border border-foreground/5 transition-all hover:bg-foreground/10">
                   <span className="text-2xl">{item.icon}</span>
                   <span className="text-xs font-black uppercase tracking-widest text-foreground/60 leading-tight">{item.label}</span>
                </div>
              ))}
           </div>
        </div>

        {/* Right: Actual Form */}
        <div className="relative w-full max-w-xl mx-auto lg:mx-0 py-12">
          <Card className="modern-card p-6 md:p-12 border-none shadow-2xl bg-card rounded-lg">
            <CardContent className="space-y-10 p-0">

              <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="lg:hidden mb-12">
                   <Link href="/" className="flex items-center gap-4">
                     <Logo size={40} />
                     <span className="text-2xl font-black tracking-tighter uppercase text-foreground">Ease<span className="text-primary italic">Inventory</span></span>
                   </Link>
                </div>
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-4 text-foreground uppercase">Create Account</h2>
                <div className="flex items-center gap-4 w-full mb-6">
                   <div className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-primary' : 'bg-foreground/5'}`} />
                   <div className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-primary' : 'bg-foreground/5'}`} />
                   <div className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= 3 ? 'bg-primary' : 'bg-foreground/5'}`} />
                   <div className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= 4 ? 'bg-primary' : 'bg-foreground/5'}`} />
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 ml-2">Step {step}/4</span>
                </div>
              </div>

              <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                <AnimatePresence mode="wait">
                  {step === 1 ? (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="space-y-1">
                        <label className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground/40 block mb-2 ml-1">Owner / Manager Name</label>
                        <Input
                          placeholder="John Doe"
                          value={formData.ownerName}
                          onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                          required
                          className="bg-foreground/5 h-12 border-none shadow-inner text-sm font-bold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground/40 block mb-2 ml-1">Company/Entity Name</label>
                        <Input
                          placeholder="Vertex Solutions"
                          value={formData.brandName}
                          onChange={(e) => setFormData({...formData, brandName: e.target.value})}
                          required
                          className="bg-foreground/5 h-12 border-none shadow-inner text-sm font-bold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground/40 block mb-2 ml-1">Industry Designation</label>
                        <Select
                          value={formData.businessType}
                          onValueChange={(value) => setFormData({...formData, businessType: value})}
                        >
                          <SelectTrigger className="bg-foreground/5 h-12 border-none shadow-inner text-sm font-bold">
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                          <SelectContent>
                            {businessTypes.map((type) => (
                              <SelectItem
                                key={type.value}
                                value={type.value}
                                className="font-bold text-foreground py-3"
                              >
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* GST Number - New Field */}
                      <div className="space-y-1">
                        <label className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground/40 block mb-2 ml-1">
                          GSTIN <span className="text-foreground/20">(Optional)</span>
                        </label>
                        <Input
                          placeholder="22AAAAA0000A1Z5"
                          value={formData.gstin}
                          onChange={(e) => setFormData({...formData, gstin: e.target.value.toUpperCase()})}
                          maxLength={15}
                          className={`bg-foreground/5 h-12 border-none shadow-inner text-sm font-bold uppercase tracking-wider ${formData.gstin && !isGSTINValid ? 'border-2 border-red-500' : ''}`}
                        />
                        {formData.gstin && !isGSTINValid && (
                          <p className="text-[10px] text-red-500 font-bold ml-1 mt-1">Invalid GSTIN format</p>
                        )}
                        <p className="text-[10px] text-foreground/30 ml-1 mt-1">Required for B2B GST invoices</p>
                      </div>

                      <Button
                        size="lg"
                        className="w-full font-black h-12 shadow-xl shadow-primary/20 mt-6 text-sm uppercase tracking-widest rounded-full"
                        onClick={() => setStep(2)}
                        disabled={!formData.ownerName || !formData.brandName || Boolean(formData.gstin && !isGSTINValid)}
                      >
                        Proceed to Next Step
                      </Button>
                    </motion.div>
                  ) : step === 2 ? (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      {/* Plan Selection - New Step */}
                      <div className="space-y-4">
                        <label className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground/40 block mb-2 ml-1">Select Your Plan</label>

                        {/* Billing Toggle */}
                        <div className="flex items-center justify-center gap-4 p-2 bg-foreground/5 rounded-full">
                          <button
                            type="button"
                            className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                              formData.billingCycle === 'monthly'
                                ? 'bg-primary text-white'
                                : 'text-foreground/50 hover:text-foreground'
                            }`}
                            onClick={() => setFormData({...formData, billingCycle: 'monthly'})}
                          >
                            Monthly
                          </button>
                          <button
                            type="button"
                            className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                              formData.billingCycle === 'annual'
                                ? 'bg-primary text-white'
                                : 'text-foreground/50 hover:text-foreground'
                            }`}
                            onClick={() => setFormData({...formData, billingCycle: 'annual'})}
                          >
                            Annual
                            <span className="text-[8px] bg-green-500 text-white px-2 py-0.5 rounded-full">2 Mo Free</span>
                          </button>
                        </div>

                        {/* Plan Cards */}
                        <div className="space-y-3">
                          {plans.map((plan) => {
                            const PlanIcon = plan.icon;
                            const price = formData.billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
                            const isSelected = formData.selectedPlan === plan.id;

                            return (
                              <button
                                key={plan.id}
                                type="button"
                                onClick={() => setFormData({...formData, selectedPlan: plan.id})}
                                className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                                  isSelected
                                    ? 'border-primary bg-primary/10'
                                    : 'border-foreground/10 bg-foreground/5 hover:border-foreground/20'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl ${isSelected ? 'bg-primary text-white' : 'bg-foreground/10 text-foreground/50'}`}>
                                      <PlanIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-black text-sm uppercase">{plan.name}</span>
                                        {plan.popular && (
                                          <span className="text-[8px] bg-primary text-white px-2 py-0.5 rounded-full font-bold">POPULAR</span>
                                        )}
                                      </div>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {plan.features.slice(0, 3).map((f, i) => (
                                          <span key={i} className="text-[9px] text-foreground/40 bg-foreground/5 px-2 py-0.5 rounded-full">{f}</span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-xl font-black text-primary">₹{price.toLocaleString()}</div>
                                    <div className="text-[10px] text-foreground/40">
                                      {formData.billingCycle === 'annual' ? '/year' : '/month'}
                                    </div>
                                  </div>
                                </div>
                                {isSelected && (
                                  <div className="absolute top-3 right-3">
                                    <Check className="w-5 h-5 text-primary" />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Price Summary */}
                        <div className="p-4 bg-foreground/5 rounded-xl space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-foreground/50">Plan ({selectedPlanDetails?.name})</span>
                            <span className="font-bold">₹{currentPrice?.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-foreground/50">GST (18%)</span>
                            <span className="font-bold">₹{gstAmount.toLocaleString()}</span>
                          </div>
                          <Separator className="my-2" />
                          <div className="flex justify-between text-lg">
                            <span className="font-black">Total</span>
                            <span className="font-black text-primary">₹{totalPrice.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-4 pt-2">
                        <Button
                          size="lg"
                          className="w-full font-black h-12 shadow-xl shadow-primary/20 text-sm uppercase tracking-widest rounded-full"
                          onClick={() => setStep(3)}
                        >
                          Continue to Credentials
                        </Button>
                        <Button
                          variant="ghost"
                          className="font-black text-[10px] uppercase tracking-widest text-foreground/40 hover:text-foreground"
                          onClick={() => setStep(1)}
                        >
                          Previous Step
                        </Button>
                      </div>
                    </motion.div>
                  ) : step === 3 ? (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="space-y-1">
                        <label className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground/40 block mb-2 ml-1">Administrative Email</label>
                        <Input
                          type="email"
                          placeholder="admin@business.in"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          required
                          className="bg-foreground/5 h-12 border-none shadow-inner text-sm font-bold transition-all"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground/40 block mb-2 ml-1">Phone Number (Required)</label>
                        <Input
                          type="tel"
                          placeholder="+91 98XXX XXXXX"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          required
                          className="bg-foreground/5 h-12 border-none shadow-inner text-sm font-bold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground/40 block mb-2 ml-1">Secure Password</label>
                        <Input
                          type="password"
                          placeholder="••••••••••••"
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          required
                          className="bg-foreground/5 h-12 border-none shadow-inner text-sm font-bold"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="terms"
                          checked={formData.agreeToTerms}
                          onCheckedChange={(checked) => setFormData({...formData, agreeToTerms: checked as boolean})}
                        />
                        <label htmlFor="terms" className="text-xs font-bold text-foreground/40 select-none">
                          I accept the <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> and acknowledge that pricing is subject to 18% GST
                        </label>
                      </div>

                      <div className="flex flex-col gap-4 pt-6">
                        <Button
                          size="lg"
                          className="w-full font-black h-12 shadow-xl shadow-primary/20 text-sm uppercase tracking-widest rounded-full"
                          onClick={() => setStep(4)}
                          disabled={!formData.email || !formData.password || !formData.phone || !formData.agreeToTerms}
                        >
                          Proceed to Verification
                        </Button>
                        <Button
                          variant="ghost"
                          className="font-black text-[10px] uppercase tracking-widest text-foreground/40 hover:text-foreground"
                          onClick={() => setStep(2)}
                        >
                          Previous Step
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6 text-center"
                    >
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                         <span className="text-3xl text-primary animate-pulse">📲</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-black uppercase tracking-tight mb-1">Mobile Verification</h3>
                        <p className="text-foreground/50 font-medium italic mb-6 text-xs">We&apos;ve sent a code to <span className="text-foreground font-black">*{formData.phone.slice(-4)}</span></p>
                      </div>

                      <div className="space-y-4 max-w-xs mx-auto text-left">
                        <div className="space-y-1">
                          <label className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground/40 block mb-2 ml-1 text-center">Enter OTP</label>
                          <Input
                            placeholder="X X X X X X"
                            value={formData.otp}
                            onChange={(e) => setFormData({...formData, otp: e.target.value})}
                            maxLength={6}
                            className="bg-foreground/5 h-12 border-none shadow-inner text-lg font-black tracking-[0.5em] text-center"
                          />
                        </div>

                        {/* Order Summary */}
                        <div className="p-3 bg-foreground/5 rounded-xl text-xs">
                          <div className="flex justify-between mb-1">
                            <span className="text-foreground/50">Plan</span>
                            <span className="font-bold">{selectedPlanDetails?.name} ({formData.billingCycle})</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground/50">Total (incl. GST)</span>
                            <span className="font-bold text-primary">₹{totalPrice.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-4">
                          <Button
                            size="lg"
                            className="w-full font-black h-12 shadow-xl shadow-primary/20 text-sm uppercase tracking-widest rounded-full"
                            disabled={isLoading}
                            onClick={handleRegister}
                          >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Account & Pay
                          </Button>
                          <Button
                            variant="ghost"
                            className="font-black text-[10px] uppercase tracking-widest text-foreground/40 hover:text-foreground"
                            onClick={() => setStep(3)}
                          >
                            Cancel Registration
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>

              <div className="flex items-center gap-6 py-2">
                 <Separator className="flex-1 opacity-10" />
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-20">Express Path</span>
                 <Separator className="flex-1 opacity-10" />
              </div>

              <Button
                variant="outline"
                className="w-full font-black h-12 border-foreground/10 text-foreground text-xs uppercase tracking-widest hover:bg-foreground/5 rounded-full"
                onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              >
                <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign up with Google
              </Button>

              <Separator className="opacity-10" />

              <p className="text-center text-sm font-black uppercase tracking-widest text-foreground/40">
                Already Authenticated?{' '}
                <Link href="/login" className="text-primary font-black hover:underline underline-offset-8">
                  Log in here
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
