'use client';

import AIHelpWidget from '@/components/help/AIHelpWidget';
import { Logo } from '@/components/icons/Logo';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import ThemeToggle from '@/components/ui/ThemeToggle';
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
    ArrowRightLeft,
    Bell,
    Building2,
    Calendar,
    FileText,
    Fingerprint,
    Globe,
    History,
    Home,
    Mail,
    Menu,
    MessageCircle,
    Package,
    PlusCircle,
    Settings,
    Shield,
    Tag,
    TrendingUp,
    Truck,
    Users,
    Wrench
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

const menuItems = [
  { group: 'Overview', items: [
    { label: 'Dashboard', icon: Home, href: '/dashboard' },
    { label: 'Analytics', icon: TrendingUp, href: '/dashboard/analytics' },
  ]},
  { group: 'Operations', items: [
    { label: 'Inventory', icon: Package, href: '/dashboard/inventory' },
    { label: 'Blanket Discounts', icon: Tag, href: '/dashboard/inventory/discounts' },
    { label: 'Warehouse Transfers', icon: ArrowRightLeft, href: '/dashboard/inventory/transfers' },
    { label: 'Inventory Locations', icon: Building2, href: '/dashboard/inventory/locations' },
    { label: 'Suppliers', icon: Truck, href: '/dashboard/suppliers' },
    { label: 'Repair Center', icon: Wrench, href: '/dashboard/repairs' },
    { label: 'Invoices', icon: FileText, href: '/dashboard/invoices' },
    { label: 'Delivery', icon: Truck, href: '/dashboard/delivery' },
  ]},
  { group: 'Team', items: [
    { label: 'Employees', icon: Users, href: '/dashboard/hr' },
    { label: 'Attendance', icon: Fingerprint, href: '/dashboard/attendance' },
    { label: 'Geo-Fences', icon: Globe, href: '/dashboard/hr/geo-fences' },
    { label: 'Leaves', icon: Calendar, href: '/dashboard/hr/leaves' },
    { label: 'Holidays', icon: Calendar, href: '/dashboard/hr/holidays' },
  ]},
  { group: 'Communication', items: [
    { label: 'WhatsApp Messages', icon: MessageCircle, href: '/dashboard/communications' },
    { label: 'Inventory Requests', icon: Package, href: '/dashboard/support/inventory' },
    { label: 'Refund Requests', icon: Mail, href: '/dashboard/support/refunds' },
  ]},
  { group: 'Settings', items: [
    { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
    { label: 'Custom Roles', icon: Shield, href: '/dashboard/settings/roles' },
    { label: 'Custom Domain', icon: Globe, href: '/dashboard/settings/domains' },
    { label: 'Audit Trail', icon: History, href: '/dashboard/settings/audit' },
  ]}
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Ensure theme is properly mounted to avoid hydration issues
  React.useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      const user = session?.user as any;
      
      // If tenant is still pending approval, redirect to pending-approval page
      // But skip this for SUPER_ADMINs
      if (user?.role !== 'SUPER_ADMIN' && user?.registrationStatus === 'PENDING' && pathname !== '/pending-approval') {
        router.push('/pending-approval');
        return;
      }

      if (user?.onboardingStatus === 'PENDING' && pathname !== '/onboarding') {
        router.push('/onboarding');
      }
    }
  }, [status, session, pathname, router]);

  // Show loading state while checking auth or redirecting
  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const user = session?.user as any;

  return (
    <div className="flex h-screen bg-background transition-colors duration-300 overflow-hidden">
      
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
        data-sidebar="true"
        data-theme={mounted ? resolvedTheme : 'dark'}
        className={`fixed lg:relative z-50 h-full border-r transition-all duration-300 ease-in-out ${
          (mounted ? resolvedTheme : 'dark') === 'dark' 
            ? 'bg-zinc-900 border-zinc-700' 
            : 'bg-white border-zinc-200'
        } ${
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
                   className="text-lg font-black tracking-tight font-heading"
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
              {[
                ...menuItems,
                ...(user?.role === 'SUPER_ADMIN' ? [{
                  group: 'Administration',
                  items: [
                    { label: 'Backoffice', icon: Building2, href: '/admin/backoffice' },
                    { label: 'Manage Tenants', icon: Users, href: '/admin/tenants' },
                    { label: 'Staff Management', icon: Shield, href: '/admin/staff' },
                  ]
                }] : [])
              ].map((group, idx) => (
                <div key={idx} className="space-y-3">
                  {isSidebarOpen && (
                    <h4 className="px-3 text-[10px] font-bold uppercase tracking-widest text-muted">
                      {group.group}
                    </h4>
                  )}
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.label}
                          href={item.href}
                          className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative ${
                            isActive
                            ? 'bg-primary text-white shadow-md shadow-primary/20'
                            : 'hover:bg-background text-muted hover:text-foreground'
                          }`}
                        >
                          <item.icon className={`shrink-0 ${isSidebarOpen ? 'w-5 h-5' : 'w-6 h-6'}`} strokeWidth={2} />
                          {isSidebarOpen && (
                            <span className="text-sm font-semibold">{item.label}</span>
                          )}
                          {!isSidebarOpen && (
                            <div className="absolute left-full ml-4 px-3 py-1.5 bg-foreground text-background text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
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
           <div className="p-4 shrink-0 border-t border-zinc-200 dark:border-zinc-700">
             <div className={`p-3 rounded-2xl bg-background transition-all ${!isSidebarOpen && 'p-1 bg-transparent'}`}>
                <div className={`flex items-center gap-3 ${!isSidebarOpen && 'justify-center'}`}>
                   <Avatar
                    name={user?.name || 'User'}
                    src={user?.image}
                    size={isSidebarOpen ? 'md' : 'sm'}
                    className="ring-2 ring-primary ring-offset-2 ring-offset-card shrink-0"
                   />
                   {isSidebarOpen && (
                     <div className="flex-grow min-w-0 pr-2">
                        <p className="text-sm font-bold truncate leading-tight">{user?.name || 'Administrator'}</p>
                        <p className="text-xs text-muted truncate">{user?.role || 'User'}</p>
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
                           <DropdownItem key="logout" className="text-danger" color="danger" onClick={() => signOut()}>Log Out</DropdownItem>
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
        <header className="h-20 flex items-center justify-between px-6 lg:px-10 bg-white dark:bg-zinc-900 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 shrink-0 z-40">
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
               <h2 className="text-xl font-black tracking-tight font-heading flex items-center gap-3">
                 {pathname.split('/').pop()?.charAt(0).toUpperCase()}{pathname.split('/').pop()?.slice(1) || 'Dashboard'}
                 {user?.onboardingStatus === 'UNDER_REVIEW' && (
                   <span className="text-[10px] bg-warning/10 text-warning px-2 py-1 rounded-full border border-warning/20">
                     UNDER REVIEW
                   </span>
                 )}
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
              <ThemeToggle />
              <LocaleSwitcher />
              <Tooltip content="Notifications" classNames={{ content: "bg-transparent shadow-none text-foreground font-medium text-sm" }}>
                 <Button isIconOnly variant="light" radius="full" className="relative">
                    <div className="w-2 h-2 bg-danger rounded-full absolute top-2 right-2 border-2 border-white dark:border-zinc-900 animate-pulse" />
                    <Bell size={20} />
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

      {/* AI Help Widget */}
      <AIHelpWidget />
    </div>
  );
}
