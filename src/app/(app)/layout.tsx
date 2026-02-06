'use client';

import { Logo } from '@/components/icons/Logo';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { UpgradeBanner } from '@/components/upgrade';
import { CurrencySelector } from '@/components/currency';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import { GATED_MENU_ITEMS, FeatureKey } from '@/lib/plan-features';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    TooltipProvider,
} from '@/components/ui/tooltip';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertCircle,
    ArrowRightLeft,
    Bell,
    Brain,
    Building2,
    Calendar,
    Check,
    ClipboardCheck,
    ClipboardList,
    Command,
    FileText,
    Fingerprint,
    Globe,
    History,
    Home,
    IndianRupee,
    Layers,
    Lock,
    Mail,
    Menu,
    MessageCircle,
    Package,
    PackageCheck,
    RotateCcw,
    Settings,
    Shield,
    ShoppingCart,
    Sparkles,
    Tag,
    TrendingUp,
    Truck,
    Users,
    Wrench
} from 'lucide-react';
import { getShortcutForRoute } from '@/hooks/useKeyboardShortcuts';
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
    { label: 'Analytics', icon: TrendingUp, href: '/analytics' },
    { label: 'Intelligence', icon: Brain, href: '/intelligence' },
  ]},
  { group: 'Operations', items: [
    { label: 'Inventory', icon: Package, href: '/inventory' },
    { label: 'Orders', icon: ShoppingCart, href: '/orders' },
    { label: 'Shipments', icon: Truck, href: '/shipments' },
    { label: 'COD Management', icon: IndianRupee, href: '/shipments/cod' },
    { label: 'NDR Management', icon: AlertCircle, href: '/shipments/ndr' },
    { label: 'Blanket Discounts', icon: Tag, href: '/inventory/discounts' },
    { label: 'Warehouse Transfers', icon: ArrowRightLeft, href: '/inventory/transfers' },
    { label: 'Inventory Locations', icon: Building2, href: '/inventory/locations' },
    { label: 'Purchase Orders', icon: ClipboardList, href: '/purchase-orders' },
    { label: 'Goods Receipts', icon: PackageCheck, href: '/goods-receipts' },
    { label: 'Returns', icon: RotateCcw, href: '/returns' },
    { label: 'Wave Planning', icon: Layers, href: '/waves' },
    { label: 'Cycle Counting', icon: ClipboardCheck, href: '/cycle-counting' },
    { label: 'Suppliers', icon: PackageCheck, href: '/suppliers' },
    { label: 'Repair Center', icon: Wrench, href: '/repairs' },
    { label: 'Invoices', icon: FileText, href: '/invoices' },
    { label: 'Delivery', icon: PackageCheck, href: '/delivery' },
  ]},
  { group: 'Team', items: [
    { label: 'Employees', icon: Users, href: '/hr' },
    { label: 'Attendance', icon: Fingerprint, href: '/attendance' },
    { label: 'Geo-Fences', icon: Globe, href: '/hr/geo-fences' },
    { label: 'Leaves', icon: Calendar, href: '/hr/leaves' },
    { label: 'Holidays', icon: Calendar, href: '/hr/holidays' },
  ]},
  { group: 'Communication', items: [
    { label: 'WhatsApp Messages', icon: MessageCircle, href: '/communications' },
    { label: 'Inventory Requests', icon: Package, href: '/support/inventory' },
    { label: 'Refund Requests', icon: Mail, href: '/support/refunds' },
  ]},
  { group: 'Settings', items: [
    { label: 'Settings', icon: Settings, href: '/settings' },
    { label: 'Custom Roles', icon: Shield, href: '/settings/roles' },
    { label: 'Custom Domain', icon: Globe, href: '/settings/domains' },
    { label: 'Audit Trail', icon: History, href: '/settings/audit' },
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
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-foreground/[0.06] skeleton-shimmer" />
          <div className="flex flex-col items-center gap-2">
            <div className="w-32 h-4 rounded-md bg-foreground/[0.06] skeleton-shimmer" />
            <div className="w-24 h-3 rounded-md bg-foreground/[0.06] skeleton-shimmer" />
          </div>
        </div>
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

          <Separator className="opacity-50" />

          {/* Menu Items */}
          <div className="flex-grow py-6 overflow-auto">
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
                    <h4 className="px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                      {group.group}
                    </h4>
                  )}
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const isActive = pathname === item.href;
                      const isLocked = isMenuItemLocked(item.href);
                      const lockedFeature = getMenuItemFeature(item.href);
                      const featureDetails = lockedFeature ? getFeatureDetails(lockedFeature) : null;
                      const shortcut = getShortcutForRoute(item.href);

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
                            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                            : isLocked
                            ? 'text-muted-foreground/50 hover:text-muted-foreground cursor-pointer'
                            : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <item.icon className={`shrink-0 ${isSidebarOpen ? 'w-5 h-5' : 'w-6 h-6'} ${isLocked ? 'opacity-50' : ''}`} strokeWidth={2} />
                          {isSidebarOpen && (
                            <>
                              <span className={`text-sm font-semibold flex-1 ${isLocked ? 'opacity-50' : ''}`}>{item.label}</span>
                              {shortcut && !isLocked && (
                                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                                  isActive ? 'bg-white/20 text-white' : 'bg-foreground/5 text-foreground/40'
                                }`}>
                                  {shortcut}
                                </span>
                              )}
                              {isLocked && (
                                <Lock className="w-3.5 h-3.5 text-warning" />
                              )}
                            </>
                          )}
                          {!isSidebarOpen && (
                            <div className="absolute left-full ml-4 px-3 py-1.5 bg-foreground text-background text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg flex items-center gap-2">
                              {item.label}
                              {shortcut && <span className="text-[10px] opacity-60">{shortcut}</span>}
                              {isLocked && <Lock className="w-3 h-3" />}
                            </div>
                          )}
                        </Link>
                      );

                      if (isLocked && featureDetails && isSidebarOpen) {
                        return (
                          <TooltipProvider key={item.label}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                {menuItemContent}
                              </TooltipTrigger>
                              <TooltipContent side="right" className="p-2 max-w-[200px] bg-popover text-popover-foreground">
                                <p className="font-semibold text-sm">{featureDetails.name}</p>
                                <p className="text-xs text-foreground/60 mt-1">Requires {featureDetails.minPlan} plan</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      }

                      return menuItemContent;
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Section (Bottom) */}
           <div className="p-4 shrink-0 border-t border-black/[0.08] dark:border-white/[0.08]">
             <div className={`p-3 rounded-2xl bg-background transition-all ${!isSidebarOpen && 'p-1 bg-transparent'}`}>
                <div className={`flex items-center gap-3 ${!isSidebarOpen && 'justify-center'}`}>
                   <Avatar className={`ring-2 ring-primary ring-offset-2 ring-offset-card shrink-0 ${isSidebarOpen ? 'h-10 w-10' : 'h-8 w-8'}`}>
                     {user?.image && <AvatarImage src={user.image} alt={user?.name || 'User'} />}
                     <AvatarFallback>{(user?.name || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                   </Avatar>
                   {isSidebarOpen && (
                     <div className="flex-grow min-w-0 pr-2">
                        <p className="text-sm font-bold truncate leading-tight">{user?.name || 'Administrator'}</p>
                        <p className="text-xs text-muted truncate">{user?.role || 'User'}</p>
                     </div>
                   )}
                   {isSidebarOpen && (
                     <DropdownMenu>
                       <DropdownMenuTrigger asChild>
                         <Button variant="ghost" size="icon" className="rounded-full" aria-label="User settings menu">
                           <Settings className="w-4 h-4" aria-hidden="true" />
                         </Button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent align="end" side="top">
                         <DropdownMenuItem>Profile Settings</DropdownMenuItem>
                         <DropdownMenuItem className="text-destructive" onClick={() => signOut()}>Log Out</DropdownMenuItem>
                       </DropdownMenuContent>
                     </DropdownMenu>
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
                variant="ghost"
                size="icon"
                className="hidden lg:flex"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                aria-expanded={isSidebarOpen}
              >
                <Menu className="w-5 h-5" aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Open navigation menu"
                aria-expanded={isMobileMenuOpen}
              >
                <Menu className="w-5 h-5" aria-hidden="true" />
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
              {/* Command Palette Trigger */}
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex items-center gap-2 px-3 h-9 font-medium text-foreground/60 hover:text-foreground"
                onClick={() => {
                  // Dispatch keyboard event to open command palette
                  const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
                  document.dispatchEvent(event);
                }}
              >
                <Command size={14} />
                <span className="text-sm">Search...</span>
                <kbd className="ml-2 px-1.5 py-0.5 text-[10px] font-mono bg-foreground/10 rounded">⌘K</kbd>
              </Button>
              <CurrencySelector variant="compact" />
              <ThemeToggle />
              <LocaleSwitcher />
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-full"
                    aria-label={`Notifications${hasUnread ? ` - ${unreadCount} unread` : ''}`}
                  >
                    {hasUnread && (
                      <div className="w-2 h-2 bg-destructive rounded-full absolute top-2 right-2 border-2 border-white dark:border-zinc-900 animate-pulse" aria-hidden="true" />
                    )}
                    <Bell size={20} aria-hidden="true" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 p-0">
                  <div className="p-4 border-b border-black/5 dark:border-white/10">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm">Notifications</h3>
                      {hasUnread && (
                        <Button size="sm" variant="ghost" className="text-xs font-semibold h-7 text-primary" onClick={markAllAsRead}>
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
                      <Button variant="secondary" size="sm" className="w-full font-semibold">
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
