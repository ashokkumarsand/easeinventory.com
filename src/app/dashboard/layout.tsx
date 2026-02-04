'use client';

import { Logo } from '@/components/icons/Logo';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { UpgradeBanner } from '@/components/upgrade';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import { GATED_MENU_ITEMS, FeatureKey } from '@/lib/plan-features';
import {
    Avatar,
    Badge,
    Button,
    Divider,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Popover,
    PopoverContent,
    PopoverTrigger,
    ScrollShadow,
    Tooltip,
} from '@heroui/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertCircle,
    ArrowRightLeft,
    Bell,
    Building2,
    Calendar,
    Check,
    FileText,
    Fingerprint,
    Globe,
    History,
    Home,
    Lock,
    Mail,
    Menu,
    MessageCircle,
    Package,
    Settings,
    Shield,
    Sparkles,
    Tag,
    TrendingUp,
    Truck,
    Users,
    Wrench
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useRef } from 'react';

// Lazy load AIHelpWidget to prevent blocking navigation
const AIHelpWidget = dynamic(() => import('@/components/help/AIHelpWidget'), {
  ssr: false,
  loading: () => null,
});

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

// Mock notification data for development
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Low Stock Alert',
    message: 'iPhone 15 Pro is running low (3 units left)',
    type: 'warning',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
  },
  {
    id: '2',
    title: 'New Order Received',
    message: 'Order #INV-2024-0847 has been placed',
    type: 'success',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
  },
  {
    id: '3',
    title: 'Payment Received',
    message: '₹45,000 received from Sharma Electronics',
    type: 'success',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<Notification[]>(MOCK_NOTIFICATIONS);

  // Plan-based feature gating
  const { isMenuItemLocked, getMenuItemFeature, showUpgradeModal, shouldShowUpgradePrompts, getFeatureDetails } = usePlanFeatures();

  // Track if initial auth check has been performed
  const hasCheckedAuth = useRef(false);

  // Computed values for notifications
  const unreadCount = notifications.filter(n => !n.read).length;
  const hasUnread = unreadCount > 0;

  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Format relative time
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Ensure theme is properly mounted to avoid hydration issues
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Auth check - only run when status changes, not on every pathname change
  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    // Only perform redirect checks once per session, not on every navigation
    if (status === 'authenticated' && !hasCheckedAuth.current) {
      hasCheckedAuth.current = true;
      const user = session?.user as any;

      // If tenant is still pending approval, redirect to pending-approval page
      // But skip this for SUPER_ADMINs
      if (user?.role !== 'SUPER_ADMIN' && user?.registrationStatus === 'PENDING') {
        router.push('/pending-approval');
        return;
      }

      if (user?.onboardingStatus === 'PENDING') {
        router.push('/onboarding');
      }
    }
  }, [status, session, router]);

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
        className={`fixed lg:relative z-50 h-full transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-[280px]' : 'w-[88px]'
        } ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{
          backgroundColor: mounted ? (resolvedTheme === 'dark' ? '#18181b' : '#ffffff') : '#ffffff',
          borderRight: mounted
            ? (resolvedTheme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)')
            : '1px solid rgba(0, 0, 0, 0.08)'
        }}
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
                      const isLocked = isMenuItemLocked(item.href);
                      const lockedFeature = getMenuItemFeature(item.href);
                      const featureDetails = lockedFeature ? getFeatureDetails(lockedFeature) : null;

                      const handleClick = (e: React.MouseEvent) => {
                        if (isLocked && lockedFeature) {
                          e.preventDefault();
                          showUpgradeModal(lockedFeature);
                        } else {
                          setIsMobileMenuOpen(false);
                        }
                      };

                      const menuItemContent = (
                        <Link
                          key={item.label}
                          href={isLocked ? '#' : item.href}
                          prefetch={!isLocked}
                          onClick={handleClick}
                          className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative ${
                            isActive
                            ? 'bg-primary text-white shadow-md shadow-primary/20'
                            : isLocked
                            ? 'text-muted/50 hover:text-muted cursor-pointer'
                            : 'hover:bg-background text-muted hover:text-foreground'
                          }`}
                        >
                          <item.icon className={`shrink-0 ${isSidebarOpen ? 'w-5 h-5' : 'w-6 h-6'} ${isLocked ? 'opacity-50' : ''}`} strokeWidth={2} />
                          {isSidebarOpen && (
                            <>
                              <span className={`text-sm font-semibold flex-1 ${isLocked ? 'opacity-50' : ''}`}>{item.label}</span>
                              {isLocked && (
                                <Lock className="w-3.5 h-3.5 text-warning" />
                              )}
                            </>
                          )}
                          {!isSidebarOpen && (
                            <div className="absolute left-full ml-4 px-3 py-1.5 bg-foreground text-background text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg flex items-center gap-2">
                              {item.label}
                              {isLocked && <Lock className="w-3 h-3" />}
                            </div>
                          )}
                        </Link>
                      );

                      if (isLocked && featureDetails && isSidebarOpen) {
                        return (
                          <Tooltip
                            key={item.label}
                            content={
                              <div className="p-2 max-w-[200px]">
                                <p className="font-semibold text-sm">{featureDetails.name}</p>
                                <p className="text-xs text-foreground/60 mt-1">Requires {featureDetails.minPlan} plan</p>
                              </div>
                            }
                            placement="right"
                          >
                            {menuItemContent}
                          </Tooltip>
                        );
                      }

                      return menuItemContent;
                    })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollShadow>

          {/* User Section (Bottom) */}
           <div className="p-4 shrink-0 border-t border-black/[0.08] dark:border-white/[0.08]">
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
        <header
          className="h-20 flex items-center justify-between px-6 lg:px-10 shrink-0 z-40"
          style={{
            backgroundColor: mounted ? (resolvedTheme === 'dark' ? '#18181b' : '#ffffff') : '#ffffff',
            borderBottom: mounted
              ? (resolvedTheme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)')
              : '1px solid rgba(0, 0, 0, 0.08)'
          }}
        >
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
              <ThemeToggle />
              <LocaleSwitcher />
              <Popover placement="bottom-end" showArrow offset={10}>
                <PopoverTrigger>
                  <Button isIconOnly variant="light" radius="full" className="relative">
                    {hasUnread && (
                      <div className="w-2 h-2 bg-danger rounded-full absolute top-2 right-2 border-2 border-white dark:border-zinc-900 animate-pulse" />
                    )}
                    <Bell size={20} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0">
                  <div className="p-4 border-b border-black/5 dark:border-white/10">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm">Notifications</h3>
                      {hasUnread && (
                        <Button size="sm" variant="light" color="primary" className="text-xs font-semibold h-7" onClick={markAllAsRead}>
                          Mark all read
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="w-10 h-10 mx-auto mb-3 opacity-20" />
                        <p className="text-sm font-medium opacity-50">No notifications</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => markAsRead(notification.id)}
                          className={`p-4 border-b border-black/5 dark:border-white/5 cursor-pointer transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02] ${
                            !notification.read ? 'bg-primary/5' : ''
                          }`}
                        >
                          <div className="flex gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                              notification.type === 'success' ? 'bg-success/10 text-success' :
                              notification.type === 'warning' ? 'bg-warning/10 text-warning' :
                              notification.type === 'error' ? 'bg-danger/10 text-danger' :
                              'bg-primary/10 text-primary'
                            }`}>
                              {notification.type === 'success' ? <Check size={14} /> :
                               notification.type === 'warning' ? <AlertCircle size={14} /> :
                               notification.type === 'error' ? <AlertCircle size={14} /> :
                               <Bell size={14} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className={`text-sm font-semibold truncate ${!notification.read ? 'text-foreground' : 'text-foreground/70'}`}>
                                  {notification.title}
                                </p>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1.5" />
                                )}
                              </div>
                              <p className="text-xs text-foreground/50 mt-0.5 line-clamp-2">{notification.message}</p>
                              <p className="text-[10px] text-foreground/30 mt-1 font-medium">{formatRelativeTime(notification.createdAt)}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="p-3 border-t border-black/5 dark:border-white/10">
                      <Button variant="flat" color="primary" size="sm" className="w-full font-semibold">
                        View All Notifications
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
           </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-grow overflow-y-auto overflow-x-hidden">
          <div className="container-custom py-8 lg:py-12 max-w-7xl">
             {/* Upgrade Banner for FREE/STARTER users */}
             {shouldShowUpgradePrompts() && pathname === '/dashboard' && (
               <div className="mb-8">
                 <UpgradeBanner />
               </div>
             )}
             {children}
          </div>
        </div>
      </main>

      {/* AI Help Widget */}
      <AIHelpWidget />
    </div>
  );
}
