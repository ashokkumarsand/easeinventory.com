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
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 overflow-hidden selection:bg-primary selection:text-primary-foreground">
      {/* Subtle Background Gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-secondary/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto text-center">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link href="/" className="inline-flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Logo size={48} />
            <span className="text-xl font-black tracking-tight">
              Ease<span className="text-primary italic">Inventory</span>
            </span>
          </Link>
        </motion.div>

        {/* 404 Number */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <span className="text-[120px] sm:text-[160px] font-black leading-none tracking-tighter bg-gradient-to-b from-foreground/20 to-foreground/5 bg-clip-text text-transparent">
            404
          </span>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold mb-3">Page not found</h1>
          <p className="text-foreground/50 max-w-sm mx-auto">
            The page you&apos;re looking for doesn&apos;t exist or has been moved to a new location.
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex gap-2 max-w-md mx-auto">
            <Input
              placeholder="Search inventory, invoices..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              startContent={<Search size={18} className="text-foreground/30" />}
              classNames={{
                inputWrapper: "bg-foreground/5 border border-foreground/10 h-12 rounded-xl hover:border-primary/30 focus-within:border-primary transition-colors",
                input: "font-medium",
              }}
            />
            <Button
              isIconOnly
              color="primary"
              size="lg"
              radius="lg"
              className="h-12 w-12 shrink-0"
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
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 justify-center mb-10"
        >
          <Button
            as={Link}
            href="/dashboard"
            color="primary"
            size="lg"
            radius="lg"
            className="font-bold px-6"
            startContent={<Home size={18} />}
          >
            Go to Dashboard
          </Button>
          <Button
            as={Link}
            href="/"
            variant="bordered"
            size="lg"
            radius="lg"
            className="font-bold px-6 border-foreground/10"
            startContent={<ArrowLeft size={18} />}
          >
            Back to Home
          </Button>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <p className="text-xs font-semibold text-foreground/30 uppercase tracking-wider mb-3">
            Quick Links
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { label: 'Inventory', href: '/dashboard/inventory' },
              { label: 'Repairs', href: '/dashboard/repairs' },
              { label: 'Invoices', href: '/dashboard/invoices' },
              { label: 'Settings', href: '/dashboard/settings' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-lg bg-foreground/5 text-sm font-medium text-foreground/60 hover:text-primary hover:bg-primary/10 transition-colors"
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
