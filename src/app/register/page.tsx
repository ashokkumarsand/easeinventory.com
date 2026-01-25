'use client';

import { Logo } from '@/components/icons/Logo';
import {
    Button,
    Card,
    CardBody,
    Checkbox,
    Divider,
    Input,
    Select,
    SelectItem
} from '@heroui/react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import React, { useState } from 'react';

const businessTypes = [
  { label: 'Retail Shop', value: 'SHOP' },
  { label: 'Service Center', value: 'SERVICE_CENTER' },
  { label: 'Wholesale / Distributor', value: 'DISTRIBUTOR' },
  { label: 'Company / Enterprise', value: 'COMPANY' },
];

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: '',
    slug: '',
    email: '',
    password: '',
    businessType: '',
    agreeToTerms: false
  });
  const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setFormData({ ...formData, slug: value });
    if (value.length > 2) {
      setIsCheckingSlug(true);
      setTimeout(() => {
        setIsSlugAvailable(true);
        setIsCheckingSlug(false);
      }, 500);
    } else {
      setIsSlugAvailable(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 lg:p-12">
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden">
         <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
         <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
        
        {/* Left: Branding & Info */}
        <div className="hidden lg:block space-y-12">
           <Link href="/" className="inline-flex items-center gap-4 active:scale-95 transition-transform">
             <Logo size={56} />
             <span className="text-3xl font-black tracking-tight">
               Ease<span className="text-primary italic">Inventory</span>
             </span>
           </Link>

           <div className="space-y-8">
              <h1 className="text-6xl font-black leading-[1.1] tracking-tight">
                Scale your <br />
                <span className="text-primary italic">Business</span> with <br />
                confidence.
              </h1>
              <p className="text-xl text-foreground/50 max-w-md leading-relaxed">
                Join thousands of businesses across India who trust EaseInventory for their daily operations.
              </p>
           </div>

           <div className="grid grid-cols-2 gap-6 max-w-md">
              {[
                { label: 'Cloud Hosted', icon: '☁️' },
                { label: 'Secure Data', icon: '🛡️' },
                { label: 'Live Support', icon: '🎧' },
                { label: 'GST Ready', icon: '🇮🇳' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3 p-4 rounded-3xl bg-foreground/5 border border-foreground/5">
                   <span className="text-2xl">{item.icon}</span>
                   <span className="text-sm font-bold opacity-70">{item.label}</span>
                </div>
              ))}
           </div>
        </div>

        {/* Right: Actual Form */}
        <div className="relative">
          <Card className="modern-card p-4 lg:p-8" radius="3xl">
            <CardBody className="space-y-8">
              
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="lg:hidden mb-10">
                   <Link href="/" className="flex items-center gap-3">
                     <Logo size={40} />
                     <span className="text-xl font-bold tracking-tight">Ease<span className="text-primary italic">Inventory</span></span>
                   </Link>
                </div>
                <h2 className="text-3xl font-black tracking-tight mb-2">Create Account</h2>
                <p className="text-foreground/40 font-medium">Step {step} of 2</p>
              </div>

              {/* Progress Line */}
              <div className="flex gap-2">
                 <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-primary' : 'bg-foreground/5'}`} />
                 <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-primary' : 'bg-foreground/5'}`} />
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
                      <Input
                        label="Business Name"
                        placeholder="Nand Shop"
                        labelPlacement="outside"
                        value={formData.businessName}
                        onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                        size="lg"
                        radius="2xl"
                        classNames={{ inputWrapper: "bg-foreground/5 h-14" }}
                      />
                      
                      <Input
                        label="Choose Subdomain"
                        placeholder="yourshop"
                        labelPlacement="outside"
                        value={formData.slug}
                        onValueChange={(val) => handleSlugChange({ target: { value: val } } as any)}
                        size="lg"
                        radius="2xl"
                        classNames={{ inputWrapper: "bg-foreground/5 h-14 pr-4" }}
                        endContent={<span className="text-xs font-bold opacity-30">.ease.in</span>}
                        description={
                          formData.slug && (
                            <div className="mt-2 pl-1">
                              {isCheckingSlug ? (
                                <span className="text-[10px] uppercase font-bold text-primary animate-pulse">Checking...</span>
                              ) : isSlugAvailable ? (
                                <span className="text-[10px] uppercase font-bold text-green-500">Available</span>
                              ) : <span className="text-[10px] uppercase font-bold text-red-500">Taken</span>}
                            </div>
                          )
                        }
                      />

                      <Select
                        label="Industry"
                        placeholder="Retail Store"
                        labelPlacement="outside"
                        size="lg"
                        radius="2xl"
                        classNames={{ trigger: "bg-foreground/5 h-14" }}
                      >
                        {businessTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </Select>

                      <Button 
                        color="primary" 
                        size="lg"
                        className="w-full font-black h-14 shadow-xl shadow-primary/20 mt-4" 
                        radius="full"
                        onClick={() => setStep(2)}
                        disabled={!formData.businessName || !isSlugAvailable}
                      >
                        Continue
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <Input
                        type="email"
                        label="Email"
                        placeholder="you@email.com"
                        labelPlacement="outside"
                        size="lg"
                        radius="2xl"
                        classNames={{ inputWrapper: "bg-foreground/5 h-14" }}
                      />

                      <Input
                        type="password"
                        label="Password"
                        placeholder="••••••••"
                        labelPlacement="outside"
                        size="lg"
                        radius="2xl"
                        classNames={{ inputWrapper: "bg-foreground/5 h-14" }}
                      />

                      <Checkbox defaultSelected size="sm" classNames={{ label: "text-xs font-medium opacity-60" }}>
                        I agree to the <span className="text-primary">Terms & Privacy</span>.
                      </Checkbox>

                      <div className="flex gap-4">
                        <Button 
                          variant="light"
                          className="font-bold h-14"
                          onClick={() => setStep(1)}
                        >
                          Back
                        </Button>
                        <Button 
                          color="primary" 
                          size="lg"
                          className="flex-1 font-black h-14 shadow-xl shadow-primary/20" 
                          radius="full"
                        >
                          Finish Setup
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>

              <Divider className="opacity-10" />

              <p className="text-center text-sm font-medium opacity-40">
                Member already?{' '}
                <Link href="/login" className="text-primary font-bold hover:underline">
                  Log in
                </Link>
              </p>
            </CardBody>
          </Card>
        </div>

      </div>
    </div>
  );
}
