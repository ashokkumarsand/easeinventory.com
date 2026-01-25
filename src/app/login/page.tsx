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

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 lg:p-12">
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden">
         <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
         <div className="absolute bottom-[10%] left-[-10%] w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md flex flex-col gap-10">
        
        <div className="flex flex-col items-center text-center">
           <motion.div
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ duration: 0.5 }}
           >
             <Link href="/" className="inline-flex items-center gap-4 mb-10 group active:scale-95 transition-transform">
               <Logo size={64} />
             </Link>
           </motion.div>
           <h1 className="text-4xl font-black tracking-tight mb-3">Welcome Back</h1>
           <p className="text-foreground/40 font-medium">Log in to manage your empire.</p>
        </div>

        <motion.div
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ delay: 0.1, duration: 0.6 }}
        >
          <Card className="modern-card p-4 lg:p-8" radius="3xl">
            <CardBody className="space-y-8">
              <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                <Input
                  type="email"
                  label="Email"
                  placeholder="name@business.com"
                  labelPlacement="outside"
                  size="lg"
                  radius="2xl"
                  classNames={{ inputWrapper: "bg-foreground/5 h-14" }}
                />

                <div className="space-y-2">
                   <div className="flex justify-between px-1">
                      <label className="text-sm font-bold opacity-60">Password</label>
                      <Link href="/forgot" className="text-xs text-primary font-bold hover:underline">Forgot?</Link>
                   </div>
                   <Input
                    type="password"
                    placeholder="••••••••"
                    size="lg"
                    radius="2xl"
                    classNames={{ inputWrapper: "bg-foreground/5 h-14" }}
                  />
                </div>

                <Checkbox size="sm" classNames={{ label: "text-xs font-medium opacity-60" }}>
                  Remember session
                </Checkbox>

                <Button 
                  color="primary" 
                  size="lg"
                  className="w-full font-black h-14 shadow-xl shadow-primary/20" 
                  radius="full"
                >
                  Log In
                </Button>
              </form>

              <div className="flex items-center gap-4 py-2">
                 <Divider className="flex-1 opacity-10" />
                 <span className="text-[10px] font-black uppercase tracking-widest opacity-30">or</span>
                 <Divider className="flex-1 opacity-10" />
              </div>

              <Button 
                variant="bordered" 
                className="w-full font-bold h-14 border-foreground/10" 
                radius="full"
                startContent={
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                }
              >
                Continue with Google
              </Button>
            </CardBody>
          </Card>
        </motion.div>

        <p className="text-center text-sm font-medium opacity-40">
          First time here?{' '}
          <Link href="/register" className="text-primary font-bold hover:underline">
            Join the elite
          </Link>
        </p>
      </div>
    </div>
  );
}
