'use client';

import { Logo } from '@/components/icons/Logo';
import {
    Avatar,
    Button,
    Divider,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    ScrollShadow,
    Tooltip
} from '@heroui/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Calendar,
    FileText,
    Home,
    Menu,
    Package,
    PlusCircle,
    Settings,
    TrendingUp,
    Truck,
    Users,
    Wrench
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

const menuItems = [
  { group: 'Overview', items: [
    { label: 'Dashboard', icon: Home, href: '/dashboard' },
    { label: 'Analytics', icon: TrendingUp, href: '/dashboard/analytics' },
  ]},
  { group: 'Operations', items: [
    { label: 'Inventory', icon: Package, href: '/dashboard/inventory' },
    { label: 'Repair Center', icon: Wrench, href: '/dashboard/repairs' },
    { label: 'Invoices', icon: FileText, href: '/dashboard/invoices' },
    { label: 'Delivery', icon: Truck, href: '/dashboard/delivery' },
  ]},
  { group: 'Team', items: [
    { label: 'Employees', icon: Calendar, href: '/dashboard/hr' },
    { label: 'Team', icon: Users, href: '/dashboard/team' },
  ]},
  { group: 'Support & Settings', items: [
    { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ]}
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="flex h-screen bg-[#F8F9FA] dark:bg-[#0A0B0F] transition-colors duration-500 overflow-hidden">
      
      {/* Mobile Menu Backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside 
        className={`fixed lg:relative z-50 h-full bg-white dark:bg-[#111318] border-r border-black/5 dark:border-white/5 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-[280px]' : 'w-[88px]'
        } ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          
          {/* Logo Section */}
          <div className="h-20 flex items-center px-6 shrink-0">
             <Link href="/dashboard" className="flex items-center gap-3">
               <Logo size={isSidebarOpen ? 32 : 36} />
               {isSidebarOpen && (
                 <motion.span 
                   initial={{ opacity: 0, x: -10 }}
                   animate={{ opacity: 1, x: 0 }}
                   className="text-lg font-black tracking-tight"
                 >
                   Ease<span className="text-primary italic">Inventory</span>
                 </motion.span>
               )}
             </Link>
          </div>

          <Divider className="opacity-50" />

          {/* Menu Items */}
          <ScrollShadow className="flex-grow py-6" hideScrollBar>
            <div className="px-4 space-y-8">
              {menuItems.map((group, idx) => (
                <div key={idx} className="space-y-4">
                  {isSidebarOpen && (
                    <h4 className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-black/30 dark:text-white/20">
                      {group.group}
                    </h4>
                  )}
                  <div className="space-y-1.5">
                    {group.items.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link 
                          key={item.label} 
                          href={item.href}
                          className={`group flex items-center gap-4 px-3 py-2.5 rounded-2xl transition-all relative ${
                            isActive 
                            ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                            : 'hover:bg-black/5 dark:hover:bg-white/5 text-black/50 dark:text-white/40 hover:text-black dark:hover:text-white'
                          }`}
                        >
                          <item.icon className={`shrink-0 ${isSidebarOpen ? 'w-5 h-5' : 'w-6 h-6'}`} strokeWidth={2.5} />
                          {isSidebarOpen && (
                            <span className="text-sm font-bold tracking-tight">{item.label}</span>
                          )}
                          {!isSidebarOpen && (
                            <div className="absolute left-full ml-4 px-3 py-1 bg-dark text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                              {item.label}
                            </div>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollShadow>

          {/* User Section (Bottom) */}
          <div className="p-4 shrink-0">
             <div className={`p-4 rounded-3xl bg-black/[0.03] dark:bg-white/5 transition-all ${!isSidebarOpen && 'p-1 bg-transparent'}`}>
                <div className={`flex items-center gap-4 ${!isSidebarOpen && 'justify-center'}`}>
                   <Avatar 
                    src="https://i.pravatar.cc/150?u=a042581f4e29026704d" 
                    size={isSidebarOpen ? 'md' : 'sm'}
                    className="ring-2 ring-primary ring-offset-2 shrink-0"
                   />
                   {isSidebarOpen && (
                     <div className="flex-grow min-w-0 pr-2">
                        <p className="text-sm font-black truncate leading-tight">Ashok Kumar</p>
                        <p className="text-[10px] font-bold opacity-40 uppercase truncate">Super Admin</p>
                     </div>
                   )}
                   {isSidebarOpen && (
                     <Dropdown placement="top-end">
                       <DropdownTrigger>
                         <Button isIconOnly variant="light" size="sm" radius="full">
                           <Settings className="w-4 h-4" />
                         </Button>
                       </DropdownTrigger>
                       <DropdownMenu variant="flat">
                         <DropdownItem key="profile">Profile Settings</DropdownItem>
                         <DropdownItem key="logout" className="text-danger" color="danger">log Out</DropdownItem>
                       </DropdownMenu>
                     </Dropdown>
                   )}
                </div>
             </div>
          </div>
        </div>
      </aside>

      {/* Content wrapper */}
      <main className="flex-grow flex flex-col min-w-0">
        
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-6 lg:px-10 bg-white/40 dark:bg-dark-bg/20 backdrop-blur-md border-b border-black/5 dark:border-white/5 shrink-0 z-40">
           <div className="flex items-center gap-4">
              <Button 
                isIconOnly 
                variant="light" 
                className="hidden lg:flex" 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <Button 
                isIconOnly 
                variant="light" 
                className="lg:hidden" 
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <h2 className="text-xl font-black tracking-tight flex items-center gap-3">
                 Dashboard
              </h2>
           </div>

           <div className="flex items-center gap-3 md:gap-4">
              <Button 
                variant="flat" 
                color="primary" 
                className="hidden md:flex font-black shadow-lg shadow-primary/10"
                startContent={<PlusCircle size={18} />}
                radius="full"
              >
                Quick Action
              </Button>
              <div className="w-[1px] h-6 bg-black/10 dark:bg-white/10 hidden md:block mx-1" />
              <Tooltip content="Notifications">
                 <Button isIconOnly variant="light" radius="full" className="relative">
                    <div className="w-2 h-2 bg-secondary rounded-full absolute top-2 right-2 border-2 border-white dark:border-black" />
                    <Calendar size={20} className="opacity-50" />
                 </Button>
              </Tooltip>
           </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-grow overflow-y-auto overflow-x-hidden">
          <div className="container-custom py-8 lg:py-12 max-w-7xl">
             {children}
          </div>
        </div>
      </main>
    </div>
  );
}
