'use client';

import { Logo } from '@/components/icons/Logo';
import { Button } from '@heroui/react';
import { motion } from 'framer-motion';
import { Home, MoveLeft, PackageX } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#030407] text-white flex flex-col items-center justify-center p-6 text-center overflow-hidden selection:bg-primary selection:text-black">
      {/* Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-drift" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/10 blur-[120px] rounded-full animate-drift delay-1000" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto space-y-12">
        {/* Animated 404 Visual */}
        <motion.div
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ duration: 0.8, ease: "circOut" }}
           className="relative inline-block"
        >
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 transform -translate-y-4" />
          <div className="relative bg-white/5 backdrop-blur-3xl border border-white/10 p-12 rounded-[3.5rem] shadow-2xl">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center text-black mb-8 group overflow-hidden">
                <PackageX size={48} className="animate-bounce" />
              </div>
              <h1 className="text-[120px] font-black leading-none tracking-tighter uppercase italic text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20">
                404
              </h1>
            </div>
          </div>
        </motion.div>

        {/* Text Content */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="space-y-6"
        >
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight italic">
            Stock <span className="text-primary">Not Found.</span>
          </h2>
          <p className="text-xl text-white/40 font-bold max-w-lg mx-auto leading-relaxed italic">
            The item you are looking for does not exist in our inventory. It might have been relocated, sold out, or the SKU is invalid.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <Button
            as={Link}
            href="/"
            color="primary"
            size="lg"
            radius="full"
            className="font-black px-12 h-16 text-lg uppercase tracking-widest shadow-2xl shadow-primary/30 min-w-[200px]"
            startContent={<Home size={20} />}
          >
            Return Home
          </Button>
          <Button
            as={Link}
            href="/dashboard"
            variant="bordered"
            size="lg"
            radius="full"
            className="font-black px-12 h-16 text-lg uppercase tracking-widest border-white/10 text-white hover:bg-white/5 min-w-[200px]"
            startContent={<MoveLeft size={20} />}
          >
            Back to System
          </Button>
        </motion.div>

        {/* Footer Brand */}
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 0.2 }}
           transition={{ delay: 1, duration: 2 }}
           className="pt-20"
        >
          <div className="flex items-center justify-center gap-4 opacity-50 grayscale contrast-125">
             <Logo size={24} />
             <span className="text-sm font-black uppercase tracking-[0.5em]">EaseInventory</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
