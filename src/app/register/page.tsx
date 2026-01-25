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
    <div className="min-h-screen bg-cream dark:bg-dark-bg flex items-center justify-center p-4 md:p-12 relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
         <div className="absolute top-[-10%] left-[-5%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-primary/5 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-10%] right-[-5%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-secondary/5 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        
        {/* Left: Branding & Info */}
        <div className="hidden lg:block space-y-12">
           <Link href="/" className="inline-flex items-center gap-4 active:scale-95 transition-transform">
             <Logo size={56} />
             <span className="text-3xl font-black tracking-tight text-dark dark:text-white">
               Ease<span className="text-primary italic">Inventory</span>
             </span>
           </Link>

           <div className="space-y-8">
              <h1 className="text-5xl lg:text-7xl font-black leading-[1.1] tracking-tight text-dark dark:text-white">
                Scale your <br />
                <span className="text-primary italic">Business</span> with <br />
                confidence.
              </h1>
              <p className="text-lg lg:text-xl text-dark/50 dark:text-white/50 max-w-md leading-relaxed">
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
                <div key={item.label} className="flex items-center gap-3 p-4 rounded-3xl bg-dark/5 dark:bg-white/5 border border-dark/5 dark:border-white/5">
                   <span className="text-2xl">{item.icon}</span>
                   <span className="text-sm font-bold opacity-70 text-dark dark:text-white">{item.label}</span>
                </div>
              ))}
           </div>
        </div>

        {/* Right: Actual Form */}
        <div className="relative">
          <Card className="modern-card p-4 lg:p-8" radius="lg">
            <CardBody className="space-y-6 md:space-y-8">
              
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="lg:hidden mb-10">
                   <Link href="/" className="flex items-center gap-3">
                     <Logo size={40} />
                     <span className="text-xl font-bold tracking-tight text-dark dark:text-white">Ease<span className="text-primary italic">Inventory</span></span>
                   </Link>
                </div>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-2 text-dark dark:text-white">Create Account</h2>
                <p className="text-dark/40 dark:text-white/40 font-medium text-sm">Step {step} of 2</p>
              </div>

              {/* Progress Tracker */}
              <div className="flex gap-2">
                 <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-primary' : 'bg-dark/5 dark:bg-white/5'}`} />
                 <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-primary' : 'bg-dark/5 dark:bg-white/5'}`} />
              </div>

              <form onSubmit={(e) => e.preventDefault()} className="space-y-5 md:space-y-6">
                <AnimatePresence mode="wait">
                  {step === 1 ? (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-5 md:space-y-6"
                    >
                      <Input
                        label="Business Name"
                        placeholder="Nand Shop"
                        labelPlacement="outside"
                        value={formData.businessName}
                        onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                        size="lg"
                        radius="lg"
                        classNames={{
                          label: "font-bold text-dark/80 dark:text-white/90 pb-2",
                          inputWrapper: "bg-black/5 dark:bg-white/5 h-12 md:h-14 mt-1",
                          input: "text-base"
                        }}
                      />
                      
                      <div className="space-y-1">
                        <label className="text-sm font-bold text-dark/80 dark:text-white/90">Choose Subdomain</label>
                        <Input
                          placeholder="yourshop"
                          value={formData.slug}
                          onValueChange={(val) => handleSlugChange({ target: { value: val } } as any)}
                          size="lg"
                          radius="lg"
                          classNames={{
                            inputWrapper: "bg-black/5 dark:bg-white/5 h-12 md:h-14 mt-1 pr-4",
                            input: "text-base"
                          }}
                          endContent={<span className="text-xs font-bold opacity-30 text-dark dark:text-white whitespace-nowrap">.easeinventory.com</span>}
                        />
                        {formData.slug && (
                          <div className="mt-2 pl-1">
                            {isCheckingSlug ? (
                              <span className="text-[10px] uppercase font-bold text-primary animate-pulse">Checking Availability...</span>
                            ) : isSlugAvailable ? (
                              <span className="text-[10px] uppercase font-bold text-green-500">Subdomain Available</span>
                            ) : <span className="text-[10px] uppercase font-bold text-red-500">Subdomain Taken</span>}
                          </div>
                        )}
                      </div>

                      <Select
                        label="Industry"
                        placeholder="Select your industry"
                        labelPlacement="outside"
                        size="lg"
                        radius="lg"
                        classNames={{
                          label: "font-bold text-dark/80 dark:text-white/90 pb-2",
                          trigger: "bg-black/5 dark:bg-white/5 h-12 md:h-14 mt-1"
                        }}
                      >
                        {businessTypes.map((type) => (
                          <SelectItem key={type.value} className="text-dark dark:text-white">
                            {type.label}
                          </SelectItem>
                        ))}
                      </Select>

                      <Button 
                        color="primary" 
                        size="lg"
                        className="w-full font-black h-12 md:h-14 shadow-xl shadow-primary/20 mt-4" 
                        radius="full"
                        onClick={() => setStep(2)}
                        isDisabled={!formData.businessName || !isSlugAvailable || isCheckingSlug}
                      >
                        Continue to Next Step
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-5 md:space-y-6"
                    >
                      <Input
                        type="email"
                        label="Email"
                        placeholder="you@email.com"
                        labelPlacement="outside"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        size="lg"
                        radius="lg"
                        classNames={{
                          label: "font-bold text-dark/80 dark:text-white/90 pb-2",
                          inputWrapper: "bg-black/5 dark:bg-white/5 h-12 md:h-14 mt-1",
                          input: "text-base"
                        }}
                      />

                      <Input
                        type="password"
                        label="Password"
                        placeholder="••••••••"
                        labelPlacement="outside"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        size="lg"
                        radius="lg"
                        classNames={{
                          label: "font-bold text-dark/80 dark:text-white/90 pb-2",
                          inputWrapper: "bg-black/5 dark:bg-white/5 h-12 md:h-14 mt-1",
                          input: "text-base"
                        }}
                      />

                        <Checkbox 
                          isSelected={formData.agreeToTerms}
                          onValueChange={(val) => setFormData({...formData, agreeToTerms: val})}
                          color="primary"
                          size="md"
                          classNames={{ 
                            label: "text-sm font-medium opacity-70 select-none",
                          }}
                        >
                          I agree to the <span className="text-primary font-bold">Terms & Privacy</span>
                        </Checkbox>

                      <div className="flex gap-4 pt-2">
                        <Button 
                          variant="light"
                          className="font-bold h-12 md:h-14 text-dark dark:text-white"
                          onClick={() => setStep(1)}
                        >
                          Back
                        </Button>
                        <Button 
                          color="primary" 
                          size="lg"
                          className="flex-1 font-black h-12 md:h-14 shadow-xl shadow-primary/20" 
                          radius="full"
                          isDisabled={!formData.email || !formData.password || !formData.agreeToTerms}
                        >
                          Complete Registration
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
