'use client';

import { Logo } from '@/components/icons/Logo';
import { Button, Input } from '@heroui/react';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, Search } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function NotFound() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/dashboard/inventory?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center overflow-hidden selection:bg-primary selection:text-primary-foreground">
      {/* Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div 
          className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] bg-secondary/10 blur-[120px] rounded-full"
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto space-y-12">
        {/* Animated Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "circOut" }}
          className="relative inline-block"
        >
          {/* Glassmorphism card */}
          <div className="relative bg-background/60 backdrop-blur-2xl border border-foreground/5 p-12 rounded-[3rem] shadow-2xl">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-[3rem]" />
            
            <div className="relative flex flex-col items-center gap-6">
              {/* Animated Logo */}
              <motion.div
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Logo size={72} />
              </motion.div>

              {/* 404 Text */}
              <div className="relative">
                <h1 className="text-[100px] md:text-[140px] font-black leading-none tracking-tighter text-foreground/10">
                  404
                </h1>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl md:text-5xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Not Found
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Text Content */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="space-y-4"
        >
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">
            This page doesn&apos;t exist
          </h2>
          <p className="text-foreground/40 font-medium max-w-md mx-auto leading-relaxed">
            The page you&apos;re looking for might have been moved, deleted, or never existed. 
            Try searching or go back to the dashboard.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="max-w-md mx-auto"
        >
          <div className="flex gap-2">
            <Input
              placeholder="Search inventory, repairs, invoices..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              startContent={<Search size={18} className="text-foreground/30" />}
              classNames={{
                inputWrapper: "bg-foreground/5 border border-foreground/5 h-14 rounded-2xl hover:border-primary/30 transition-colors",
                input: "font-medium",
              }}
            />
            <Button
              isIconOnly
              color="primary"
              size="lg"
              radius="lg"
              className="h-14 w-14"
              onClick={handleSearch}
            >
              <Search size={20} />
            </Button>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button
            as={Link}
            href="/"
            color="primary"
            size="lg"
            radius="full"
            className="font-bold px-8 h-14 shadow-lg shadow-primary/20 min-w-[180px]"
            startContent={<Home size={18} />}
          >
            Go Home
          </Button>
          <Button
            as={Link}
            href="/dashboard"
            variant="bordered"
            size="lg"
            radius="full"
            className="font-bold px-8 h-14 border-foreground/10 hover:bg-foreground/5 min-w-[180px]"
            startContent={<ArrowLeft size={18} />}
          >
            Back to Dashboard
          </Button>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="pt-8 border-t border-foreground/5"
        >
          <p className="text-xs font-bold text-foreground/30 uppercase tracking-widest mb-4">
            Popular Pages
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: 'Inventory', href: '/dashboard/inventory' },
              { label: 'Repairs', href: '/dashboard/repairs' },
              { label: 'Invoices', href: '/dashboard/invoices' },
              { label: 'Team', href: '/dashboard/team' },
              { label: 'Settings', href: '/dashboard/settings' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-full bg-foreground/5 text-sm font-medium text-foreground/60 hover:text-primary hover:bg-primary/10 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
