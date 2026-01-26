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
                Your <span className="text-primary italic">Dominance</span>
              </h1>
              <p className="text-xl lg:text-2xl text-foreground/50 max-w-md leading-relaxed font-medium italic">
                Enlist today and unlock the most advanced business operating system built for India.
              </p>
           </div>

           <div className="grid grid-cols-2 gap-6 max-w-lg">
              {[
                { label: 'Cloud Sovereignty', icon: '☁️' },
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
        <div className="relative w-full max-w-xl mx-auto lg:mx-0">
          <Card className="modern-card p-6 md:p-12 border-none shadow-2xl bg-card" radius="lg">
            <CardBody className="space-y-10">
              
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
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 ml-2">Phase {step}/2</span>
                </div>
              </div>

              <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
                <AnimatePresence mode="wait">
                  {step === 1 ? (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <Input
                        label="Entity Name"
                        placeholder="Nand Shop"
                        labelPlacement="outside"
                        value={formData.businessName}
                        onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                        size="lg"
                        radius="lg"
                        classNames={{
                          label: "font-black text-[10px] uppercase tracking-[0.2em] text-foreground/40 mb-2",
                          inputWrapper: "bg-foreground/5 h-16 border-none shadow-inner",
                          input: "text-lg font-bold"
                        }}
                      />
                      
                      <div className="space-y-2">
                        <label className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground/40 block mb-2">Claim Your Subdomain</label>
                        <Input
                          placeholder="yourshop"
                          value={formData.slug}
                          onValueChange={(val) => handleSlugChange({ target: { value: val } } as any)}
                          size="lg"
                          radius="lg"
                          classNames={{
                            inputWrapper: "bg-foreground/5 h-16 border-none shadow-inner pr-4",
                            input: "text-lg font-bold"
                          }}
                          endContent={<span className="text-[10px] font-black uppercase tracking-widest text-primary whitespace-nowrap">.easeinventory.com</span>}
                        />
                        {formData.slug && (
                          <div className="mt-2 pl-1">
                            {isCheckingSlug ? (
                              <span className="text-[10px] uppercase font-black text-primary animate-pulse tracking-widest">Verifying Path...</span>
                            ) : isSlugAvailable ? (
                              <span className="text-[10px] uppercase font-black text-green-500 tracking-widest">Path Available</span>
                            ) : <span className="text-[10px] uppercase font-black text-red-500 tracking-widest">Path Occupied</span>}
                          </div>
                        )}
                      </div>

                      <Select
                        label="Industry Designation"
                        placeholder="Select industry"
                        labelPlacement="outside"
                        size="lg"
                        radius="lg"
                        classNames={{
                          label: "font-black text-[10px] uppercase tracking-[0.2em] text-foreground/40 mb-2",
                          trigger: "bg-foreground/5 h-16 border-none shadow-inner",
                          value: "text-lg font-bold"
                        }}
                      >
                        {businessTypes.map((type) => (
                          <SelectItem key={type.value} className="text-foreground">
                            {type.label}
                          </SelectItem>
                        ))}
                      </Select>

                      <Button 
                        color="primary" 
                        size="lg"
                        className="w-full font-black h-16 shadow-2xl shadow-primary/30 mt-6 text-lg uppercase tracking-widest" 
                        radius="full"
                        onClick={() => setStep(2)}
                        isDisabled={!formData.businessName || !isSlugAvailable || isCheckingSlug}
                      >
                        Proceed to Next Phase
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <Input
                        type="email"
                        label="Primary Email"
                        placeholder="commander@email.in"
                        labelPlacement="outside"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        size="lg"
                        radius="lg"
                        classNames={{
                          label: "font-black text-[10px] uppercase tracking-[0.2em] text-foreground/40 mb-2",
                          inputWrapper: "bg-foreground/5 h-16 border-none shadow-inner",
                          input: "text-lg font-bold transition-all"
                        }}
                      />

                      <Input
                        type="password"
                        label="Secure Password"
                        placeholder="••••••••••••"
                        labelPlacement="outside"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        size="lg"
                        radius="lg"
                        classNames={{
                          label: "font-black text-[10px] uppercase tracking-[0.2em] text-foreground/40 mb-2",
                          inputWrapper: "bg-foreground/5 h-16 border-none shadow-inner",
                          input: "text-lg font-bold"
                        }}
                      />

                      <Checkbox 
                        isSelected={formData.agreeToTerms}
                        onValueChange={(val) => setFormData({...formData, agreeToTerms: val})}
                        color="primary"
                        radius="sm"
                        classNames={{ 
                          label: "text-xs font-black uppercase tracking-widest text-foreground/40 select-none",
                        }}
                      >
                        I accept the <span className="text-primary hover:underline">Code of Conduct & Privacy</span>
                      </Checkbox>

                      <div className="flex gap-4 pt-4">
                        <Button 
                          variant="light"
                          className="font-black h-16 text-foreground/40 hover:text-foreground uppercase tracking-widest"
                          onClick={() => setStep(1)}
                        >
                          Revise Phase 1
                        </Button>
                        <Button 
                          color="primary" 
                          size="lg"
                          className="flex-1 font-black h-16 shadow-2xl shadow-primary/30 text-lg uppercase tracking-widest" 
                          radius="full"
                          isDisabled={!formData.email || !formData.password || !formData.agreeToTerms}
                        >
                          Initialize Account
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>

              <Divider className="opacity-10" />

              <p className="text-center text-sm font-black uppercase tracking-widest text-foreground/40">
                Already Authenticated?{' '}
                <Link href="/login" className="text-primary font-black hover:underline underline-offset-8">
                  Log in here
                </Link>
              </p>
            </CardBody>
          </Card>
        </div>

      </div>
    </div>
  );
}
