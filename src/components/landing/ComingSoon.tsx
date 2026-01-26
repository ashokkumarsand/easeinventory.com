'use client';

import { Logo } from '@/components/icons/Logo';
import { Button, Chip, Input } from '@heroui/react';
import { motion } from 'framer-motion';
import React, { useState } from 'react';

const ComingSoon: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-[#030407] text-white flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      {/* Background Decor */}
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] animate-pulse delay-1000" />

      <div className="relative z-10 max-w-4xl mx-auto space-y-12">
        
        <motion.div
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ duration: 0.8 }}
           className="flex justify-center"
        >
          <Logo size={100} />
        </motion.div>

        <motion.div
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ delay: 0.2, duration: 0.8 }}
           className="space-y-6"
        >
          <Chip variant="flat" color="primary" className="mb-4 font-black uppercase tracking-widest text-[10px] px-4 py-1">
             Phase 1: Deployment
          </Chip>
          <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9]">
             The future of <br />
             <span className="text-primary italic">Inventory</span> is arriving.
          </h1>
          <p className="text-xl md:text-2xl font-medium opacity-50 max-w-2xl mx-auto leading-relaxed italic">
             Smart inventory, repair tracking, and automated GST billing — all personalized with your business subdomain.
          </p>
        </motion.div>

        {!isSubmitted ? (
          <motion.form 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            onSubmit={(e) => { e.preventDefault(); setIsSubmitted(true); }}
            className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto bg-foreground/5 p-3 rounded-[32px] border border-foreground/5"
          >
            <Input 
              placeholder="Join the waitlist (you@email.com)"
              value={email}
              onValueChange={setEmail}
              variant="flat"
              classNames={{
                inputWrapper: "bg-transparent shadow-none h-14",
                input: "font-bold text-lg"
              }}
            />
            <Button 
              color="primary" 
              className="h-14 px-10 font-black text-lg shadow-xl shadow-primary/20"
              radius="full"
              type="submit"
            >
               Notify Me
            </Button>
          </motion.form>
        ) : (
          <motion.div 
             initial={{ scale: 0.9, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="bg-green-500/10 text-green-500 border border-green-500/20 p-8 rounded-[40px] inline-block"
          >
             <p className="text-2xl font-black mb-2">You&apos;re in the inner circle!</p>
             <p className="text-sm font-bold opacity-60">We&apos;ll ping you the moment we flip the switch.</p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
           {[
             { title: 'Inventory SN Control', desc: 'Track every unit with unique serial numbers and tiered costing.' },
             { title: 'Repair Logistics', desc: 'Automated Job ID generation and WhatsApp service updates.' },
             { title: 'GST Billing Engine', desc: 'Generate professional invoices with automatic tax compliance.' },
             { title: 'Personnel & Attendance', desc: 'Biometric verified punching and integrated payroll.' },
           ].map((feature, idx) => (
             <motion.div 
               key={idx}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.6 + (idx * 0.1) }}
               className="p-6 rounded-[32px] bg-foreground/5 border border-foreground/5 text-left space-y-3"
             >
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black">
                   {idx + 1}
                </div>
                <h3 className="font-black text-sm uppercase tracking-tight">{feature.title}</h3>
                <p className="text-xs font-bold opacity-40 leading-relaxed">{feature.desc}</p>
             </motion.div>
           ))}
        </div>
      </div>

      <footer className="fixed bottom-10 left-0 w-full flex justify-center opacity-20">
         <div className="flex items-center gap-3">
            <span className="text-xs font-black uppercase tracking-widest">EaseInventory 🇮🇳 2026</span>
         </div>
      </footer>
    </div>
  );
};

export default ComingSoon;
