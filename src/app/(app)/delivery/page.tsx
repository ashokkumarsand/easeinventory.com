'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useDisclosure } from '@/hooks/useDisclosure';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    Box,
    Clock,
    Loader2,
    MapPin,
    Navigation,
    Package,
    Phone,
    Plus,
    TrendingUp,
    Truck,
    User
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

// Mock Data
const SHIPMENTS = [
  { id: 'SHP-88201', customer: 'Alex Smith', items: 2, status: 'in_transit', manifest: '4.2 kg', driver: 'Agent A.', eta: 'Today, 4:00 PM', address: 'Tech Park, Sector 1' },
  { id: 'SHP-88202', customer: 'Jordan Lee', items: 1, status: 'pending', manifest: '1.5 kg', driver: 'Unassigned', eta: 'Tomorrow', address: 'Business District, Area 42' },
  { id: 'SHP-88203', customer: 'Sam Taylor', items: 5, status: 'delivered', manifest: '8.4 kg', driver: 'Agent B.', eta: 'Delivered', address: 'Innovation Square, Block C' },
  { id: 'SHP-88204', customer: 'Premier Solutions', items: 12, status: 'out_for_delivery', manifest: '45 kg', driver: 'Agent C.', eta: 'Today, 2:30 PM', address: 'Retail Hub, Downtown' },
];

export default function DeliveryPage() {
  const t = useTranslations('Logistics');
  const commonT = useTranslations('HR'); // For standard buttons like Cancel
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/deliveries');
      const data = await response.json();
      setDeliveries(data.deliveries || []);
    } catch (error) {
      console.error('Fetch deliveries error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10 pb-20">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
             <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Truck size={22} strokeWidth={2.5} />
             </div>
             <h1 className="text-3xl lg:text-4xl font-black tracking-tight font-heading">{t('title')}</h1>
           </div>
           <p className="text-foreground/50 font-bold ml-1">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
           <Button className="font-black px-8 shadow-xl shadow-primary/20 rounded-full" size="lg" onClick={onOpen}>
              <Plus size={20} />
              {t('dispatch_manifest')}
           </Button>
        </div>
      </div>

      {/* Fleet Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { label: t('fleet_stats.vehicles_active'), val: '6/8', sub: t('fleet_stats.capacity', { count: 75 }), color: 'primary' },
           { label: t('fleet_stats.deliveries_today'), val: '24', sub: t('fleet_stats.completed', { count: 18 }), color: 'success' },
           { label: t('fleet_stats.avg_time'), val: '1.2h', sub: t('fleet_stats.comparison', { val: '-10%' }), color: 'warning' },
           { label: t('fleet_stats.pending_dispatch'), val: '5', sub: t('fleet_stats.processing'), color: 'secondary' },
         ].map((it) => (
           <Card key={it.label} className="modern-card p-6 border-none shadow-sm rounded-lg">
              <CardContent className="p-0 space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-30">{it.label}</p>
                  <h3 className={`text-3xl font-black text-${it.color}`}>{it.val}</h3>
                  <p className="text-[10px] font-bold opacity-40 uppercase tracking-tight">{it.sub}</p>
              </CardContent>
           </Card>
         ))}
      </div>

      {/* Main Delivery View */}
      <div className="grid lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
               <h3 className="text-xl font-black tracking-tight">{t('view.active_dispatches')}</h3>
               <div className="flex bg-black/[0.03] dark:bg-white/5 p-1 rounded-xl">
                  <Button size="sm" variant="secondary" className="font-black rounded-lg">{t('view.view_all')}</Button>
               </div>
            </div>

             <div className="space-y-6">
               {(deliveries.length === 0 && !isLoading) && (
                 <div className="text-center py-20 opacity-30 font-black uppercase tracking-widest">
                    {t('view.no_dispatches')}
                 </div>
               )}
               {deliveries.map((shp) => (
                 <motion.div
                   key={shp.id}
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                 >
                   <Card className="modern-card border border-black/5 dark:border-white/5 hover:border-primary/20 transition-all p-2 rounded-lg">
                      <CardContent className="p-6">
                         <div className="flex flex-col md:flex-row gap-6">
                            {/* Icon & ID */}
                            <div className="flex md:flex-col items-center justify-between md:justify-center w-full md:w-32 p-4 rounded-2xl bg-black/[0.02] dark:bg-white/5 border border-black/5 shrink-0">
                               <div className="w-12 h-12 bg-white dark:bg-dark-card rounded-2xl flex items-center justify-center text-primary shadow-sm mb-2">
                                  <Box size={24} />
                               </div>
                               <div className="text-center">
                                 <p className="text-[10px] font-black uppercase tracking-widest opacity-30">{t('view.shipment')}</p>
                                 <h4 className="font-black text-xs">DLV-{shp.id.slice(-5).toUpperCase()}</h4>
                               </div>
                            </div>

                            {/* Info */}
                            <div className="flex-grow space-y-4">
                               <div className="flex justify-between items-start">
                                  <div>
                                     <h3 className="text-lg font-black tracking-tight mb-1">{shp.invoice?.customer?.name || t('view.walk_in')}</h3>
                                     <p className="text-xs font-bold opacity-30 flex items-center gap-1">
                                        <MapPin size={12} /> {shp.address || shp.invoice?.customer?.address || 'Pickup from Hub'}
                                     </p>
                                  </div>
                                  <Badge
                                    variant="secondary"
                                    className={`font-black uppercase text-[10px] tracking-widest ${
                                      shp.status === 'DELIVERED' ? 'bg-green-500/10 text-green-600' :
                                      shp.status === 'IN_TRANSIT' ? 'bg-primary/10 text-primary' :
                                      shp.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-600' : ''
                                    }`}
                                  >
                                    {shp.status.replace(/_/g, ' ')}
                                  </Badge>
                               </div>

                               <div className="p-4 rounded-2xl bg-black/[0.01] dark:bg-white/[0.02] border border-black/[0.03] grid grid-cols-2 lg:grid-cols-4 gap-6">
                                  <div className="space-y-1">
                                     <p className="text-[10px] font-black uppercase tracking-widest opacity-20 flex items-center gap-1"><User size={10} /> {t('view.personnel')}</p>
                                     <p className="font-bold text-xs">{shp.deliveryAgent?.name || 'Unassigned'}</p>
                                  </div>
                                  <div className="space-y-1">
                                     <p className="text-[10px] font-black uppercase tracking-widest opacity-20 flex items-center gap-1"><Package size={10} /> {t('view.inventory')}</p>
                                     <p className="font-bold text-xs">{shp.invoice?.invoiceNumber || 'N/A'}</p>
                                  </div>
                                  <div className="space-y-1">
                                     <p className="text-[10px] font-black uppercase tracking-widest opacity-20 flex items-center gap-1"><Clock size={10} /> {t('view.estimated')}</p>
                                     <p className="font-bold text-xs">{shp.expectedDeliveryDate ? new Date(shp.expectedDeliveryDate).toLocaleDateString() : 'TBD'}</p>
                                  </div>
                                  <div className="space-y-1">
                                     <p className="text-[10px] font-black uppercase tracking-widest opacity-20 flex items-center gap-1"><TrendingUp size={10} /> {t('view.progress')}</p>
                                     <Progress value={shp.status === 'DELIVERED' ? 100 : shp.status === 'IN_TRANSIT' ? 60 : 10} className="h-1 mt-1" />
                                  </div>
                               </div>
                            </div>
                         </div>
                      </CardContent>
                   </Card>
                 </motion.div>
               ))}
             </div>
         </div>

         {/* Logistics Sidebar */}
         <div className="space-y-8">
            <Card className="modern-card p-6 bg-black text-white rounded-lg">
               <CardContent className="p-0 space-y-6">
                  <div className="flex items-center gap-3">
                     <div className="w-1.5 h-6 bg-primary rounded-full" />
                     <h3 className="text-xl font-black tracking-tight">{t('sidebar.fleet_map')}</h3>
                  </div>

                  {/* Simulated Map Placeholder */}
                  <div className="h-60 rounded-[2.5rem] bg-white/5 border border-white/10 relative overflow-hidden flex items-center justify-center group cursor-crosshair">
                     <div className="absolute inset-0 bg-[radial-gradient(#ffffff22_1px,#0000_1px)] bg-[size:20px_20px] opacity-20" />
                     <motion.div
                       animate={{
                         x: [0, 20, -10, 0],
                         y: [0, -30, 10, 0]
                       }}
                       transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                       className="relative"
                     >
                        <div className="w-4 h-4 bg-primary rounded-full shadow-[0_0_20px_rgba(106,59,246,0.6)] border-2 border-black" />
                        <div className="absolute -top-10 -left-10 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
                     </motion.div>
                     <p className="absolute bottom-6 text-[10px] font-black uppercase tracking-[0.3em] opacity-30 group-hover:opacity-100 transition-opacity">{t('sidebar.geofence', { count: 6 })}</p>
                  </div>

                  <div className="space-y-4">
                     <p className="text-[10px] font-black uppercase tracking-widest opacity-30">{t('sidebar.service_area')}</p>
                     <div className="space-y-4">
                        {[
                          { area: 'Noida (Sector 1-150)', perf: 98 },
                          { area: 'Ghaziabad / Indirapuram', perf: 82 },
                          { area: 'New Delhi (South)', perf: 91 },
                        ].map(area => (
                          <div key={area.area} className="space-y-1">
                             <div className="flex justify-between text-xs font-black">
                                <span className="opacity-50">{area.area}</span>
                                <span>{area.perf}%</span>
                             </div>
                             <Progress value={area.perf} className="h-1 bg-white/10" />
                          </div>
                        ))}
                     </div>
                  </div>
               </CardContent>
            </Card>

            <Card className="modern-card p-6 border border-black/5 dark:border-white/5 rounded-lg">
               <CardContent className="p-0">
                  <div className="flex items-center gap-3 mb-6">
                     <Phone size={18} className="text-primary" />
                     <h4 className="text-sm font-black uppercase tracking-widest">{t('sidebar.hotlines')}</h4>
                  </div>
                  <div className="space-y-4">
                     {['Main Hub Dispatch', 'Warehouse A (Electronics)', 'Fleet Support Line'].map(ln => (
                       <div key={ln} className="flex justify-between items-center group cursor-pointer">
                          <p className="text-xs font-black opacity-30 group-hover:opacity-100 transition-opacity uppercase">{ln}</p>
                          <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-all text-primary" />
                       </div>
                     ))}
                  </div>
               </CardContent>
            </Card>
         </div>
      </div>

      {/* Dispatch Modal */}
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="modern-card p-4 max-w-2xl rounded-lg">
          <DialogHeader>
             <DialogTitle className="text-2xl font-black tracking-tight">{t('modal.title')}</DialogTitle>
          </DialogHeader>
          <div className="py-6 space-y-6">
             <div className="space-y-2">
               <label className="text-sm font-medium">{t('modal.recipient')}</label>
               <Input placeholder="e.g. Global Logistics" className="bg-black/5 h-14 border-none" />
             </div>
             <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('modal.items')}</label>
                  <Input type="number" placeholder="200" className="bg-black/5 h-14 border-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('modal.weight')}</label>
                  <Input placeholder="45 kg" className="bg-black/5 h-14 border-none" />
                </div>
             </div>
             <div className="space-y-2">
               <label className="text-sm font-medium">{t('modal.address')}</label>
               <Textarea placeholder="Enter full destination details..." className="bg-black/5 min-h-[100px] border-none" />
             </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" className="font-bold h-14 px-8" onClick={() => onOpenChange(false)}>{commonT('modal.cancel')}</Button>
            <Button className="px-10 font-black h-14 shadow-xl shadow-primary/20 text-white rounded-full" onClick={() => onOpenChange(false)}>
               <Navigation size={20} />
               {t('modal.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
