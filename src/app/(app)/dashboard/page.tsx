'use client';

import StockFlowChart from '@/components/charts/StockFlowChart';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    ArrowDownRight,
    ArrowRight,
    ArrowUpRight,
    FileText,
    Package,
    Plus,
    ShoppingCart,
    TrendingUp,
    Users,
    Wrench
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
// Color class mappings to avoid Tailwind purging dynamic classes
const colorClasses = {
  primary: {
    bg: 'bg-primary/5',
    bgIcon: 'bg-primary/10',
    text: 'text-primary',
  },
  secondary: {
    bg: 'bg-secondary/5',
    bgIcon: 'bg-secondary/10',
    text: 'text-secondary',
  },
  success: {
    bg: 'bg-success/5',
    bgIcon: 'bg-success/10',
    text: 'text-success',
  },
  warning: {
    bg: 'bg-warning/5',
    bgIcon: 'bg-warning/10',
    text: 'text-warning',
  },
} as const;

type ColorKey = keyof typeof colorClasses;

const stats = [
  {
    label: 'Inventory Value',
    value: '₹42,84,000',
    change: '+12.5%',
    isPositive: true,
    icon: Package,
    color: 'primary' as ColorKey
  },
  {
    label: 'Active Repairs',
    value: '24',
    change: '-2',
    isPositive: false,
    icon: Wrench,
    color: 'secondary' as ColorKey
  },
  {
    label: 'Team Present',
    value: '18/20',
    subvalue: '90% Attendance',
    icon: Users,
    color: 'success' as ColorKey
  },
  {
    label: 'Today Sales',
    value: '₹2,14,000',
    change: '+18.2%',
    isPositive: true,
    icon: TrendingUp,
    color: 'warning' as ColorKey
  },
];

export default function OverviewPage() {
  const t = useTranslations('Dashboard');
  const { data: session } = useSession();
  const userName = session?.user?.name?.split(' ')[0] || 'Administrator';

  return (
    <div className="space-y-10">
      
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-3xl lg:text-4xl font-black tracking-tight mb-2">{t('welcome')}, {userName}.</h1>
           <p className="text-foreground/40 font-bold">{t('title')}</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex flex-col items-end mr-4">
              <span className="text-xs font-black uppercase opacity-20 tracking-widest">Business Health</span>
              <span className="text-sm font-black text-success">EXCELLENT</span>
           </div>
           <Button variant="default" size="lg" className="font-black px-8 shadow-xl shadow-primary/20 rounded-full">
              Download Report
           </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {stats.map((stat, idx) => (
           <motion.div
             key={stat.label}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: idx * 0.1 }}
           >
             <Card className="modern-card border-none shadow-sm h-full rounded-lg">
               <CardContent className="p-6 relative overflow-hidden">
                 <div className={`absolute -right-4 -top-4 w-24 h-24 ${colorClasses[stat.color].bg} rounded-full blur-2xl`} />

                 <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-2xl ${colorClasses[stat.color].bgIcon} flex items-center justify-center ${colorClasses[stat.color].text}`}>
                       <stat.icon size={24} strokeWidth={2.5} aria-hidden="true" />
                    </div>
                    {stat.change && (
                      <Badge
                        variant={stat.isPositive ? 'default' : 'destructive'}
                        className={`font-black flex items-center gap-1 ${stat.isPositive ? 'bg-success/10 text-success hover:bg-success/20' : 'bg-destructive/10 text-destructive hover:bg-destructive/20'}`}
                      >
                        {stat.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {stat.change}
                      </Badge>
                    )}
                 </div>

                 <div className="space-y-1">
                    <p className="text-xs font-black uppercase opacity-30 tracking-widest">{stat.label}</p>
                    <h3 className="text-3xl font-black">{stat.value}</h3>
                    {stat.subvalue && <p className="text-xs font-bold text-success">{stat.subvalue}</p>}
                 </div>
               </CardContent>
             </Card>
           </motion.div>
         ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
         {/* Main Activity Chart Area */}
         <Card className="col-span-2 modern-card p-4 rounded-lg">
            <CardContent className="p-4">
               <StockFlowChart />

               <div className="grid grid-cols-3 gap-6 pt-4 mt-2 border-t border-black/5 dark:border-white/5">
                   {[
                     { label: 'Purchase In', val: '1,240', color: 'primary' },
                     { label: 'Sales Out', val: '842', color: 'success' },
                     { label: 'Repairs In', val: '12', color: 'warning' },
                   ].map(item => (
                     <div key={item.label}>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-1">{item.label}</p>
                        <p className="text-xl font-black">{item.val}</p>
                        <Progress value={Math.random() * 100} className="mt-2 h-1.5 rounded-full" />
                     </div>
                   ))}
               </div>
            </CardContent>
         </Card>

         {/* Sidebar for status */}
         <div className="space-y-6">
            <Card className="modern-card p-4 rounded-lg">
               <CardContent className="p-0">
                  <div className="flex items-center gap-4 mb-8">
                     <div className="w-1.5 h-6 bg-secondary rounded-full" />
                     <h3 className="text-xl font-black tracking-tight text-secondary">Repair Queue</h3>
                  </div>

                  <div className="space-y-6">
                     {[
                       { sn: 'SN-48291', model: 'iPhone 15 Pro', status: 'In Repair', technician: 'Tech A.' },
                       { sn: 'SN-10292', model: 'Samsung S24 Ultra', status: 'Diagnostics', technician: 'Tech B.' },
                       { sn: 'SN-99201', model: 'MacBook M3 Max', status: 'Waiting Parts', technician: 'Unassigned' },
                     ].map((item, idx) => (
                       <div key={item.sn} className="flex gap-4 group cursor-pointer">
                          <div className="flex flex-col items-center">
                             <div className="w-2 h-2 rounded-full bg-secondary shrink-0" />
                             {idx !== 2 && <div className="w-[1px] flex-grow bg-black/10 dark:bg-white/10 my-1" />}
                          </div>
                          <div className="pb-4 flex-grow border-b border-black/5 dark:border-white/5 last:border-none">
                             <div className="flex justify-between items-start mb-1">
                                <h4 className="text-sm font-black tracking-tight group-hover:text-secondary transition-colors">{item.model}</h4>
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${item.status === 'In Repair' ? 'bg-secondary/10 text-secondary' : 'bg-black/5 dark:bg-white/5 opacity-50'}`}>
                                   {item.status}
                                </span>
                             </div>
                             <p className="text-[10px] font-bold opacity-30 uppercase tracking-tighter">
                                {item.sn} • Technician: {item.technician}
                             </p>
                          </div>
                       </div>
                     ))}
                  </div>

                  <Button variant="secondary" className="w-full mt-6 font-black py-6 rounded-[1.5rem]">
                     Open Service Center
                  </Button>
               </CardContent>
            </Card>

            <Card className="modern-card bg-primary p-4 shadow-xl shadow-primary/20 text-white rounded-lg">
               <CardContent className="p-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-20">
                     <TrendingUp size={80} />
                  </div>
                  <div className="relative z-10">
                     <h3 className="text-xl font-black mb-1">Monthly Goal</h3>
                     <p className="text-xs opacity-60 font-medium mb-6">₹50L Target Revenue</p>

                     <div className="space-y-2 mb-6">
                        <div className="flex justify-between items-end">
                           <span className="text-2xl font-black">₹42.8L</span>
                           <span className="text-sm font-bold">85%</span>
                        </div>
                        <Progress value={85} className="h-2.5 rounded-full bg-white/20 [&>div]:bg-white" />
                     </div>

                     <p className="text-xs font-bold leading-relaxed opacity-80">
                        You are on track to exceed your target by ₹5L. Keep scaling!
                     </p>
                  </div>
               </CardContent>
            </Card>
         </div>
      </div>

      {/* Additional Dashboard Sections */}
      <div className="grid lg:grid-cols-3 gap-6">
         {/* Low Stock Alerts */}
         <Card className="modern-card p-4 rounded-lg">
            <CardContent className="p-0">
               <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <AlertTriangle size={20} />
                     </div>
                     <h3 className="text-lg font-black tracking-tight">Low Stock Alerts</h3>
                  </div>
                  <Badge variant="secondary" className="bg-warning/10 text-warning font-bold">
                     5 items
                  </Badge>
               </div>

               <div className="space-y-3">
                  {[
                     { name: 'iPhone 15 Pro Max', sku: 'IPH-15PM-256', qty: 3, minQty: 10 },
                     { name: 'Samsung S24 Ultra', sku: 'SAM-S24U-512', qty: 2, minQty: 8 },
                     { name: 'MacBook Air M3', sku: 'MAC-AIR-M3', qty: 1, minQty: 5 },
                  ].map((item) => (
                     <div key={item.sku} className="flex items-center justify-between p-3 rounded-xl bg-warning/5 border border-warning/10">
                        <div className="flex-1 min-w-0">
                           <p className="font-bold text-sm truncate">{item.name}</p>
                           <p className="text-[10px] uppercase tracking-wider opacity-40">{item.sku}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-lg font-black text-warning">{item.qty}</p>
                           <p className="text-[10px] opacity-40">min: {item.minQty}</p>
                        </div>
                     </div>
                  ))}
               </div>

               <Button variant="outline" className="w-full mt-4 font-bold" asChild>
                  <Link href="/inventory?filter=low-stock">
                     View All Low Stock
                     <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
               </Button>
            </CardContent>
         </Card>

         {/* Recent Invoices */}
         <Card className="modern-card p-4 rounded-lg">
            <CardContent className="p-0">
               <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <FileText size={20} />
                     </div>
                     <h3 className="text-lg font-black tracking-tight">Recent Invoices</h3>
                  </div>
                  <Badge variant="secondary" className="bg-primary/10 text-primary font-bold">
                     Today
                  </Badge>
               </div>

               <div className="space-y-3">
                  {[
                     { id: 'INV-2024-0847', customer: 'Sharma Electronics', amount: '₹45,000', status: 'Paid' },
                     { id: 'INV-2024-0846', customer: 'Tech Hub Store', amount: '₹28,500', status: 'Pending' },
                     { id: 'INV-2024-0845', customer: 'Mobile World', amount: '₹62,000', status: 'Paid' },
                  ].map((invoice) => (
                     <div key={invoice.id} className="flex items-center justify-between p-3 rounded-xl bg-foreground/[0.02] hover:bg-foreground/[0.04] transition-colors cursor-pointer">
                        <div className="flex-1 min-w-0">
                           <p className="font-bold text-sm">{invoice.id}</p>
                           <p className="text-xs opacity-50 truncate">{invoice.customer}</p>
                        </div>
                        <div className="text-right">
                           <p className="font-black">{invoice.amount}</p>
                           <Badge
                              variant="secondary"
                              className={`text-[10px] ${invoice.status === 'Paid' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}
                           >
                              {invoice.status}
                           </Badge>
                        </div>
                     </div>
                  ))}
               </div>

               <Button variant="outline" className="w-full mt-4 font-bold" asChild>
                  <Link href="/invoices">
                     View All Invoices
                     <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
               </Button>
            </CardContent>
         </Card>

         {/* Quick Actions */}
         <Card className="modern-card p-4 rounded-lg">
            <CardContent className="p-0">
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                     <Plus size={20} />
                  </div>
                  <h3 className="text-lg font-black tracking-tight">Quick Actions</h3>
               </div>

               <div className="grid grid-cols-2 gap-3">
                  {[
                     { label: 'Add Product', icon: Package, href: '/inventory?action=add', color: 'primary' },
                     { label: 'New Invoice', icon: FileText, href: '/invoices?action=new', color: 'success' },
                     { label: 'New Repair', icon: Wrench, href: '/repairs?action=new', color: 'secondary' },
                     { label: 'Record Sale', icon: ShoppingCart, href: '/invoices?action=sale', color: 'warning' },
                  ].map((action) => (
                     <Link
                        key={action.label}
                        href={action.href}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl bg-${action.color}/5 hover:bg-${action.color}/10 border border-${action.color}/10 hover:border-${action.color}/20 transition-all group h-24`}
                     >
                        <action.icon className={`w-6 h-6 mb-2 text-${action.color} group-hover:scale-110 transition-transform`} />
                        <span className="text-xs font-bold text-center">{action.label}</span>
                     </Link>
                  ))}
               </div>

               <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/10">
                  <p className="text-xs font-bold mb-2">Pro Tip</p>
                  <p className="text-[11px] opacity-60 leading-relaxed">
                     Use keyboard shortcuts for faster navigation. Press <kbd className="px-1.5 py-0.5 bg-foreground/10 rounded text-[10px] font-mono">⌘K</kbd> to open command palette.
                  </p>
               </div>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
