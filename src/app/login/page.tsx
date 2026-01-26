'use client';

import { Logo } from '@/components/icons/Logo';
import {
    Button,
    Card,
    CardBody,
    Checkbox,
    Divider,
    Input
} from '@heroui/react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animae-drift pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] animate-drift delay-1000 pointer-events-none" />

      <div className="w-full max-w-xl flex flex-col gap-10 relative z-10">
        
        <div className="flex flex-col items-center text-center">
           <motion.div
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ duration: 0.5 }}
           >
             <Link href="/" className="inline-flex items-center gap-4 mb-10 group active:scale-95 transition-transform">
               <div className="p-3 bg-foreground/5 rounded-2xl group-hover:bg-primary/20 transition-colors">
                 <Logo size={44} />
               </div>
               <span className="text-2xl font-black tracking-tighter uppercase text-foreground">
                 Ease<span className="text-primary italic">Inventory</span>
               </span>
             </Link>
           </motion.div>
           <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-foreground uppercase">Empire Access</h1>
           <p className="text-foreground/50 font-medium text-lg italic max-w-xs">Enter your credentials to regain command of your operations.</p>
        </div>

        <motion.div
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ delay: 0.1, duration: 0.6 }}
        >
          <Card className="modern-card p-4 md:p-10 border-none shadow-2xl bg-card" radius="lg">
            <CardBody className="space-y-10">
              <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
                <Input
                  type="email"
                  label="Administrative Email"
                  placeholder="commander@business.in"
                  labelPlacement="outside"
                  size="lg"
                  radius="lg"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  classNames={{
                    label: "font-black text-[10px] uppercase tracking-[0.2em] text-foreground/40 mb-2",
                    inputWrapper: "bg-foreground/5 h-16 border-none shadow-inner",
                    input: "text-lg font-bold"
                  }}
                />

                <div className="space-y-2">
                   <div className="flex justify-between px-1 mb-1">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Sovereign Password</label>
                      <Link href="/forgot-password" title="Coming soon" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Reset Keys?</Link>
                   </div>
                   <Input
                    type="password"
                    placeholder="••••••••••••"
                    size="lg"
                    radius="lg"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    classNames={{
                      inputWrapper: "bg-foreground/5 h-16 border-none shadow-inner",
                      input: "text-lg font-bold"
                    }}
                  />
                </div>

                <Checkbox 
                  isSelected={formData.rememberMe}
                  onValueChange={(val) => setFormData({...formData, rememberMe: val})}
                  color="primary"
                  radius="sm"
                  classNames={{ 
                    label: "text-xs font-black uppercase tracking-widest text-foreground/40 select-none",
                  }}
                >
                  Keep Terminal Authenticated
                </Checkbox>

                <Button 
                  color="primary" 
                  size="lg"
                  className="w-full font-black h-16 shadow-2xl shadow-primary/30 text-lg uppercase tracking-widest" 
                  radius="full"
                  type="submit"
                >
                  Initialize Login
                </Button>
              </form>

              <div className="flex items-center gap-6 py-2">
                 <Divider className="flex-1 opacity-10" />
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-20">Biometric / External</span>
                 <Divider className="flex-1 opacity-10" />
              </div>

              <Button 
                variant="bordered" 
                className="w-full font-black h-16 border-foreground/10 text-foreground uppercase tracking-widest hover:bg-foreground/5" 
                radius="full"
                startContent={
                  <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                }
              >
                Authenticate with Google
              </Button>
            </CardBody>
          </Card>
        </motion.div>

        <p className="text-center text-sm font-black uppercase tracking-widest text-foreground/40">
          New Strategist?{' '}
          <Link href="/register" className="text-primary font-black hover:underline underline-offset-8">
            Enlist now
          </Link>
        </p>
      </div>
    </div>
  );
}
