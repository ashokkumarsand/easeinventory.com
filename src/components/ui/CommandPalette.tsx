'use client';

import { Command } from 'cmdk';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  Box,
  Calculator,
  FileText,
  Home,
  Layers,
  LogOut,
  MapPin,
  Package,
  Plus,
  Search,
  Settings,
  ShoppingCart,
  Truck,
  User,
  Users,
  Wrench,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';

interface CommandItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  shortcut?: string[];
  action: () => void;
  category: 'navigation' | 'actions' | 'search' | 'settings';
  keywords?: string[];
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();

  // Toggle the menu when ⌘K / Ctrl+K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      // Escape to close
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const navigate = useCallback((path: string) => {
    router.push(path);
    setOpen(false);
    setSearch('');
  }, [router]);

  const commands: CommandItem[] = [
    // Navigation
    {
      id: 'dashboard',
      label: 'Go to Dashboard',
      icon: <Home size={18} />,
      shortcut: ['G', 'D'],
      action: () => navigate('/dashboard'),
      category: 'navigation',
      keywords: ['home', 'main'],
    },
    {
      id: 'inventory',
      label: 'Go to Inventory',
      icon: <Package size={18} />,
      shortcut: ['G', 'I'],
      action: () => navigate('/inventory'),
      category: 'navigation',
      keywords: ['products', 'stock', 'items'],
    },
    {
      id: 'suppliers',
      label: 'Go to Suppliers',
      icon: <Truck size={18} />,
      shortcut: ['G', 'S'],
      action: () => navigate('/suppliers'),
      category: 'navigation',
      keywords: ['vendors', 'partners'],
    },
    {
      id: 'repairs',
      label: 'Go to Repairs',
      icon: <Wrench size={18} />,
      shortcut: ['G', 'R'],
      action: () => navigate('/repairs'),
      category: 'navigation',
      keywords: ['service', 'fix', 'tickets'],
    },
    {
      id: 'invoices',
      label: 'Go to Invoices',
      icon: <FileText size={18} />,
      shortcut: ['G', 'B'],
      action: () => navigate('/invoices'),
      category: 'navigation',
      keywords: ['bills', 'sales', 'billing'],
    },
    {
      id: 'analytics',
      label: 'Go to Analytics',
      icon: <BarChart3 size={18} />,
      shortcut: ['G', 'A'],
      action: () => navigate('/analytics'),
      category: 'navigation',
      keywords: ['reports', 'charts', 'stats'],
    },
    {
      id: 'locations',
      label: 'Go to Locations',
      icon: <MapPin size={18} />,
      shortcut: ['G', 'L'],
      action: () => navigate('/inventory/locations'),
      category: 'navigation',
      keywords: ['warehouses', 'stores'],
    },
    {
      id: 'team',
      label: 'Go to Team',
      icon: <Users size={18} />,
      shortcut: ['G', 'T'],
      action: () => navigate('/team'),
      category: 'navigation',
      keywords: ['staff', 'employees', 'users'],
    },
    {
      id: 'settings',
      label: 'Go to Settings',
      icon: <Settings size={18} />,
      shortcut: ['G', ','],
      action: () => navigate('/settings'),
      category: 'navigation',
      keywords: ['preferences', 'config'],
    },

    // Quick Actions
    {
      id: 'new-product',
      label: 'Add New Product',
      icon: <Plus size={18} />,
      shortcut: ['N', 'P'],
      action: () => {
        navigate('/inventory');
        // TODO: Open add product modal via global state
      },
      category: 'actions',
      keywords: ['create', 'item', 'inventory'],
    },
    {
      id: 'new-supplier',
      label: 'Add New Supplier',
      icon: <Plus size={18} />,
      shortcut: ['N', 'S'],
      action: () => {
        navigate('/suppliers');
      },
      category: 'actions',
      keywords: ['create', 'vendor'],
    },
    {
      id: 'new-invoice',
      label: 'Create Invoice',
      icon: <Plus size={18} />,
      shortcut: ['N', 'I'],
      action: () => {
        navigate('/invoices');
      },
      category: 'actions',
      keywords: ['bill', 'sale', 'create'],
    },
    {
      id: 'new-repair',
      label: 'New Repair Ticket',
      icon: <Plus size={18} />,
      shortcut: ['N', 'R'],
      action: () => {
        navigate('/repairs');
      },
      category: 'actions',
      keywords: ['service', 'ticket', 'create'],
    },
    {
      id: 'stock-transfer',
      label: 'Transfer Stock',
      icon: <Layers size={18} />,
      shortcut: ['N', 'T'],
      action: () => navigate('/inventory/transfers'),
      category: 'actions',
      keywords: ['move', 'warehouse'],
    },

    // Settings & Profile
    {
      id: 'profile',
      label: 'My Profile',
      icon: <User size={18} />,
      action: () => navigate('/settings'),
      category: 'settings',
      keywords: ['account', 'me'],
    },
    {
      id: 'billing',
      label: 'Billing & Subscription',
      icon: <Calculator size={18} />,
      action: () => navigate('/settings'),
      category: 'settings',
      keywords: ['payment', 'plan', 'upgrade'],
    },
    {
      id: 'logout',
      label: 'Log Out',
      icon: <LogOut size={18} />,
      action: () => {
        router.push('/api/auth/signout');
        setOpen(false);
      },
      category: 'settings',
      keywords: ['signout', 'exit'],
    },
  ];

  const filteredCommands = search
    ? commands.filter((cmd) => {
        const searchLower = search.toLowerCase();
        return (
          cmd.label.toLowerCase().includes(searchLower) ||
          cmd.keywords?.some((k) => k.toLowerCase().includes(searchLower))
        );
      })
    : commands;

  const navigationCommands = filteredCommands.filter((c) => c.category === 'navigation');
  const actionCommands = filteredCommands.filter((c) => c.category === 'actions');
  const settingsCommands = filteredCommands.filter((c) => c.category === 'settings');

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Command Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', duration: 0.3, bounce: 0.1 }}
            className="fixed left-1/2 top-[20%] z-50 w-full max-w-xl -translate-x-1/2"
          >
            <Command
              className="rounded-2xl border border-foreground/10 bg-background shadow-2xl overflow-hidden"
              loop
            >
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 border-b border-foreground/10">
                <Search size={20} className="text-foreground/40" />
                <Command.Input
                  value={search}
                  onValueChange={setSearch}
                  placeholder="Type a command or search..."
                  className="flex-1 h-14 bg-transparent text-base font-medium outline-none placeholder:text-foreground/40"
                />
                <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs font-medium text-foreground/40 bg-foreground/5 rounded-md">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <Command.List className="max-h-[400px] overflow-y-auto p-2">
                <Command.Empty className="py-8 text-center text-sm text-foreground/40">
                  No results found.
                </Command.Empty>

                {navigationCommands.length > 0 && (
                  <Command.Group heading="Navigation" className="mb-2">
                    <p className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-foreground/40">
                      Navigation
                    </p>
                    {navigationCommands.map((cmd) => (
                      <CommandItemComponent key={cmd.id} item={cmd} onSelect={() => cmd.action()} />
                    ))}
                  </Command.Group>
                )}

                {actionCommands.length > 0 && (
                  <Command.Group heading="Quick Actions" className="mb-2">
                    <p className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-foreground/40">
                      Quick Actions
                    </p>
                    {actionCommands.map((cmd) => (
                      <CommandItemComponent key={cmd.id} item={cmd} onSelect={() => cmd.action()} />
                    ))}
                  </Command.Group>
                )}

                {settingsCommands.length > 0 && (
                  <Command.Group heading="Settings" className="mb-2">
                    <p className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-foreground/40">
                      Settings
                    </p>
                    {settingsCommands.map((cmd) => (
                      <CommandItemComponent key={cmd.id} item={cmd} onSelect={() => cmd.action()} />
                    ))}
                  </Command.Group>
                )}
              </Command.List>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-foreground/10 bg-foreground/[0.02]">
                <div className="flex items-center gap-4 text-xs text-foreground/40">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-foreground/10 rounded text-[10px]">↑</kbd>
                    <kbd className="px-1.5 py-0.5 bg-foreground/10 rounded text-[10px]">↓</kbd>
                    to navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-foreground/10 rounded text-[10px]">↵</kbd>
                    to select
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-foreground/40">
                  <Box size={14} className="text-primary" />
                  <span className="font-semibold">EaseInventory</span>
                </div>
              </div>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function CommandItemComponent({
  item,
  onSelect,
}: {
  item: CommandItem;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      value={item.label + ' ' + (item.keywords?.join(' ') || '')}
      onSelect={onSelect}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary"
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-foreground/5 text-foreground/60 data-[selected=true]:bg-primary/20 data-[selected=true]:text-primary">
        {item.icon}
      </div>
      <span className="flex-1 font-medium text-sm">{item.label}</span>
      {item.shortcut && (
        <div className="flex items-center gap-1">
          {item.shortcut.map((key, i) => (
            <kbd
              key={i}
              className="px-1.5 py-0.5 text-[10px] font-medium bg-foreground/10 rounded"
            >
              {key}
            </kbd>
          ))}
        </div>
      )}
    </Command.Item>
  );
}

export default CommandPalette;
