'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Home,
  Package,
  FileText,
  Wrench,
  Menu,
  MoreHorizontal,
} from 'lucide-react';
import { useState } from 'react';
import BottomSheet from './BottomSheet';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const mainItems: NavItem[] = [
  { label: 'Home', href: '/dashboard', icon: Home },
  { label: 'Inventory', href: '/inventory', icon: Package },
  { label: 'Invoices', href: '/invoices', icon: FileText },
  { label: 'Repairs', href: '/repairs', icon: Wrench },
];

const moreItems: NavItem[] = [
  { label: 'Suppliers', href: '/suppliers', icon: Package },
  { label: 'Delivery', href: '/delivery', icon: Package },
  { label: 'HR', href: '/hr', icon: Package },
  { label: 'Settings', href: '/settings', icon: Package },
];

export default function MobileNav() {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-background/95 backdrop-blur-lg border-t border-foreground/10 safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {mainItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center flex-1 py-2 relative"
              >
                {active && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <item.icon
                  size={22}
                  className={active ? 'text-primary' : 'text-foreground/50'}
                  strokeWidth={active ? 2.5 : 2}
                />
                <span
                  className={`text-[10px] mt-1 font-bold ${
                    active ? 'text-primary' : 'text-foreground/50'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setIsMoreOpen(true)}
            className="flex flex-col items-center justify-center flex-1 py-2"
          >
            <MoreHorizontal size={22} className="text-foreground/50" />
            <span className="text-[10px] mt-1 font-bold text-foreground/50">
              More
            </span>
          </button>
        </div>
      </nav>

      {/* More menu bottom sheet */}
      <BottomSheet
        isOpen={isMoreOpen}
        onClose={() => setIsMoreOpen(false)}
        title="More Options"
      >
        <div className="grid grid-cols-4 gap-4 p-4">
          {moreItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMoreOpen(false)}
              className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-foreground/5 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <item.icon size={24} className="text-primary" />
              </div>
              <span className="text-xs font-bold text-center">{item.label}</span>
            </Link>
          ))}
        </div>
      </BottomSheet>

      {/* Spacer to prevent content being hidden behind nav */}
      <div className="h-16 lg:hidden" />
    </>
  );
}
