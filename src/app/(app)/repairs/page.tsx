'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useDisclosure } from '@/hooks/useDisclosure';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Camera,
    Clock,
    LayoutGrid,
    List,
    Loader2,
    MessageCircle,
    Plus,
    Printer,
    QrCode,
    Share2,
    User,
    Wrench
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';

// Role color mapping for UI
const getStatusColor = (status: string) => {
  switch(status.toUpperCase()) {
    case 'RECEIVED': return 'bg-gray-500/10 text-gray-600';
    case 'DIAGNOSED': return 'bg-yellow-500/10 text-yellow-600';
    case 'IN_REPAIR': return 'bg-purple-500/10 text-purple-600';
    case 'READY': return 'bg-green-500/10 text-green-600';
    case 'DELIVERED': return 'bg-blue-500/10 text-blue-600';
    case 'CANCELLED': return 'bg-red-500/10 text-red-600';
    default: return 'bg-gray-500/10 text-gray-600';
  }
};

export default function RepairCenterPage() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onOpenChange: onDetailsOpenChange } = useDisclosure();
  const [tickets, setTickets] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  // New Ticket State
  const [newTicket, setNewTicket] = useState({
    customer: '',
    phone: '',
    product: '',
    sn: '',
    modelNumber: '',
    issue: '',
    priority: 'MEDIUM',
    images: [] as string[]
  });

  // Edit/Lifecycle state
  const [editData, setEditData] = useState<any>({
    status: '',
    priority: '',
    assignedToId: '',
    diagnosis: '',
    repairNotes: '',
    laborCost: 0,
    partsCost: 0,
    images: [] as string[]
  });

  useEffect(() => {
    fetchTickets();
    fetchTechnicians();
  }, []);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/repairs');
      const data = await response.json();
      setTickets(data.tickets || []);
    } catch (error) {
      console.error('Fetch tickets error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      // Filter for technicians or show all staff if needed
      setTechnicians(data.users?.filter((u: any) => u.role === 'TECHNICIAN' || u.role === 'STAFF') || []);
    } catch (error) {
      console.error('Fetch technicians error:', error);
    }
  };

  const handleAddTicket = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/repairs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: newTicket.customer,
          customerPhone: newTicket.phone,
          productName: newTicket.product,
          modelNumber: newTicket.modelNumber,
          serialNumber: newTicket.sn,
          issueDescription: newTicket.issue,
          priority: newTicket.priority,
          images: newTicket.images
        }),
      });

      if (response.ok) {
        fetchTickets();
        onOpenChange(false);
        setNewTicket({ customer: '', phone: '', product: '', sn: '', modelNumber: '', issue: '', priority: 'MEDIUM', images: [] });
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to create ticket');
      }
    } catch (error) {
      alert('Error creating repair ticket');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDetails = (ticket: any) => {
    setSelectedTicket(ticket);
    setEditData({
      status: ticket.status,
      priority: ticket.priority,
      assignedToId: ticket.assignedToId || '',
      diagnosis: ticket.diagnosis || '',
      repairNotes: ticket.repairNotes || '',
      laborCost: Number(ticket.laborCost) || 0,
      partsCost: Number(ticket.partsCost) || 0,
      images: ticket.images || []
    });
    onDetailsOpen();
  };

  const handleUpdateTicket = async () => {
    if (!selectedTicket) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/repairs/${selectedTicket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editData,
          totalCost: Number(editData.laborCost) + Number(editData.partsCost)
        }),
      });

      if (response.ok) {
        fetchTickets();
        onDetailsOpenChange(false);
      } else {
        const data = await response.json();
        alert(data.message || 'Update failed');
      }
    } catch (error) {
      alert('Error updating ticket');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTickets = tickets.filter(t => {
     if (activeTab === 'all') return true;
     if (activeTab === 'receiving') return t.status === 'RECEIVED';
     if (activeTab === 'repairing') return t.status === 'IN_REPAIR' || t.status === 'DIAGNOSED';
     if (activeTab === 'ready') return t.status === 'READY';
     if (activeTab === 'delivered') return t.status === 'DELIVERED' || t.status === 'CANCELLED';
     return true;
  });

  return (
    <div className="space-y-10 pb-20">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
             <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Wrench size={22} strokeWidth={2.5} aria-hidden="true" />
             </div>
             <h1 className="text-3xl font-black tracking-tight">Service Center</h1>
           </div>
           <p className="text-foreground/40 font-bold ml-1">Live tracking of device lifecycle and technician efficiency.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex p-1 rounded-xl" style={{ backgroundColor: 'var(--input-bg)' }}>
              <Button variant={view === 'grid' ? 'secondary' : 'ghost'} size="icon" className="rounded-full" onClick={() => setView('grid')} aria-label="Grid view">
                <LayoutGrid size={18} aria-hidden="true" />
              </Button>
              <Button variant={view === 'list' ? 'secondary' : 'ghost'} size="icon" className="rounded-full" onClick={() => setView('list')} aria-label="List view">
                <List size={18} aria-hidden="true" />
              </Button>
           </div>
           <Button className="font-black px-8 shadow-xl shadow-primary/20 rounded-full gap-2" size="lg" onClick={onOpen}>
              <Plus size={20} aria-hidden="true" />
              New Repair
           </Button>
        </div>
      </div>

      {/* Workflow Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start gap-8 rounded-none border-b border-border bg-transparent p-0 h-12">
          <TabsTrigger value="all" className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary font-black tracking-tight rounded-none px-0 pb-3">Universal Queue</TabsTrigger>
          <TabsTrigger value="receiving" className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary font-black tracking-tight rounded-none px-0 pb-3">Awaiting Diagnosis</TabsTrigger>
          <TabsTrigger value="repairing" className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary font-black tracking-tight rounded-none px-0 pb-3">Live Repairs</TabsTrigger>
          <TabsTrigger value="ready" className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary font-black tracking-tight rounded-none px-0 pb-3">Ready to Deliver</TabsTrigger>
          <TabsTrigger value="delivered" className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary font-black tracking-tight rounded-none px-0 pb-3">Archived</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-8">
          {/* Live Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             <AnimatePresence mode="popLayout">
                {isLoading ? (
                   <div className="col-span-full py-20 text-center opacity-30 font-black uppercase tracking-[0.3em]">
                      Synchronizing Tickets...
                   </div>
                ) : filteredTickets.length === 0 ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center gap-6">
                      <div className="w-20 h-20 rounded-3xl bg-primary/5 flex items-center justify-center">
                        <Wrench size={36} className="text-primary/30" aria-hidden="true" />
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-foreground/40 mb-2">No tickets in this queue</p>
                        <p className="text-sm text-foreground/30">Click &quot;New Repair&quot; to add a device for service</p>
                      </div>
                    </div>
                ) : filteredTickets.map((ticket, idx) => (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="modern-card group cursor-pointer relative overflow-hidden">
                      <CardContent className="p-6">
                         <div className="flex justify-between items-start mb-6">
                           <div className="flex flex-col">
                             <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Job ID</span>
                             <h3 className="text-xl font-black">{ticket.ticketNumber}</h3>
                           </div>
                           <div className="flex flex-col items-end gap-2">
                                 <Badge className={`font-black uppercase text-[10px] ${getStatusColor(ticket.status)}`}>
                                    {ticket.status.replace(/_/g, ' ')}
                                 </Badge>
                                 {ticket.images?.length > 0 && (
                                   <span className="text-[9px] font-bold text-muted-foreground flex items-center gap-1"><Camera size={10} /> {ticket.images.length} Photos</span>
                                 )}
                               </div>
                        </div>

                         <div className="space-y-5">
                           <div className="p-4 rounded-2xl space-y-1" style={{ backgroundColor: 'var(--input-bg)' }}>
                              <h4 className="font-black text-sm">{ticket.productName}</h4>
                              <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-2">
                                 <QrCode size={12} aria-hidden="true" /> {ticket.serialNumber || 'No S/N'}
                              </p>
                           </div>

                            <div className="space-y-4">
                               <div className="flex items-start gap-4">
                                  <Avatar className="shrink-0 h-8 w-8 rounded-lg">
                                    <AvatarFallback className="rounded-lg text-xs">
                                      {ticket.customer?.name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                     <p className="text-sm font-black leading-none mb-1">{ticket.customer?.name}</p>
                                     <p className="text-[11px] font-bold opacity-40">{ticket.customer?.phone}</p>
                                  </div>
                                 <div className="ml-auto flex gap-1">
                                    <Button variant="secondary" size="icon" className="w-8 h-8 rounded-full bg-green-500/10 text-green-600 hover:bg-green-500/20" aria-label="Message customer">
                                      <MessageCircle size={14} aria-hidden="true" />
                                    </Button>
                                 </div>
                              </div>

                               <div className="bg-yellow-500/5 border border-yellow-500/10 p-3 rounded-xl">
                                  <p className="text-xs font-bold leading-relaxed">{ticket.issueDescription}</p>
                               </div>
                           </div>

                           <Separator className="opacity-50" />

                            <div className="flex items-center justify-between pt-2">
                               <div className="flex items-center gap-2">
                                  <Clock size={16} className="opacity-20" />
                                  <span className="text-[10px] font-black opacity-30 uppercase">{new Date(ticket.receivedAt).toLocaleDateString()}</span>
                               </div>
                               <div className="flex items-center gap-2">
                                  <User size={16} className="opacity-20" />
                                  <span className="text-xs font-black">{ticket.assignedTo?.name || 'Unassigned'}</span>
                               </div>
                            </div>
                        </div>

                        {/* Quick Maintenance Panel Hover (Simulated) */}
                        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform border-t flex gap-2 z-10" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                           <Button size="sm" className="flex-1 font-black rounded-full" onClick={() => handleOpenDetails(ticket)}>View Details</Button>
                           <Button variant="secondary" size="icon" className="rounded-full" aria-label="Share ticket">
                             <Share2 size={16} aria-hidden="true" />
                           </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
             </AnimatePresence>
          </div>
        </TabsContent>
      </Tabs>

      {/* New Service Request Modal */}
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b border-foreground/5 px-8 py-6">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                 <Wrench size={20} className="text-primary" aria-hidden="true" />
               </div>
               <div>
                 <DialogTitle className="text-xl font-bold">New Service Request</DialogTitle>
                 <DialogDescription className="text-sm text-foreground/50 font-normal">Register a device for repair</DialogDescription>
               </div>
             </div>
          </DialogHeader>

            {/* Section 1: Customer */}
            <div className="px-8 py-6 border-b border-foreground/5">
               <div className="flex items-center gap-2 mb-5">
                 <User size={16} className="text-primary" aria-hidden="true" />
                 <h4 className="text-sm font-bold text-foreground/70">Customer Details</h4>
               </div>
               <div className="grid md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm font-semibold text-foreground/70">
                      Customer Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      placeholder="Enter customer name"
                      className="h-12 border border-foreground/10 hover:border-foreground/20 focus:border-primary bg-background"
                      value={newTicket.customer}
                      onChange={(e) => setNewTicket({...newTicket, customer: e.target.value})}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm font-semibold text-foreground/70">
                      Phone Number <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        placeholder="+91 98765 43210"
                        className="h-12 border border-foreground/10 hover:border-foreground/20 focus:border-primary bg-background pr-10"
                        value={newTicket.phone}
                        onChange={(e) => setNewTicket({...newTicket, phone: e.target.value})}
                      />
                      <MessageCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500/60" size={18} aria-hidden="true" />
                    </div>
                  </div>
               </div>
            </div>

            {/* Section 2: Device */}
            <div className="px-8 py-6 border-b border-foreground/5">
               <div className="flex items-center gap-2 mb-5">
                 <QrCode size={16} className="text-primary" aria-hidden="true" />
                 <h4 className="text-sm font-bold text-foreground/70">Device Information</h4>
               </div>
               <div className="grid md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm font-semibold text-foreground/70">
                      Device Name / Model <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      placeholder="e.g. iPhone 15 Pro Max"
                      className="h-12 border border-foreground/10 hover:border-foreground/20 focus:border-primary bg-background"
                      value={newTicket.product}
                      onChange={(e) => setNewTicket({...newTicket, product: e.target.value})}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm font-semibold text-foreground/70">Serial / IMEI Number</Label>
                    <div className="relative">
                      <Input
                        placeholder="Enter serial or IMEI"
                        className="h-12 border border-foreground/10 hover:border-foreground/20 focus:border-primary bg-background pr-10"
                        value={newTicket.sn}
                        onChange={(e) => setNewTicket({...newTicket, sn: e.target.value})}
                      />
                      <QrCode className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/30" size={18} aria-hidden="true" />
                    </div>
                  </div>
               </div>
            </div>

            {/* Section 3: Issue */}
            <div className="px-8 py-6">
               <div className="flex items-center gap-2 mb-5">
                 <Wrench size={16} className="text-primary" aria-hidden="true" />
                 <h4 className="text-sm font-bold text-foreground/70">Problem Description</h4>
               </div>
               <div className="flex flex-col gap-1.5">
                 <Label className="text-sm font-semibold text-foreground/70">
                   Issue Details <span className="text-destructive">*</span>
                 </Label>
                 <Textarea
                   placeholder="Describe the problem (e.g. screen cracked, not charging, water damage...)"
                   className="min-h-[80px] border border-foreground/10 hover:border-foreground/20 focus:border-primary bg-background"
                   value={newTicket.issue}
                   onChange={(e) => setNewTicket({...newTicket, issue: e.target.value})}
                 />
               </div>

               <div
                 className="mt-5 p-5 rounded-xl border-2 border-dashed border-foreground/10 hover:border-primary/30 flex items-center gap-4 hover:bg-primary/5 transition-all cursor-pointer group"
                 onClick={() => setNewTicket({...newTicket, images: [...newTicket.images, 'https://placehold.co/400x300?text=Photo']})}
               >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Camera size={22} className="text-primary" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground/70 group-hover:text-primary transition-colors">
                      {newTicket.images.length > 0 ? `${newTicket.images.length} photo(s) attached` : 'Upload device photos'}
                    </p>
                    <p className="text-xs text-foreground/40">Capture condition before repair for reference</p>
                  </div>
               </div>
            </div>

          <DialogFooter className="border-t border-foreground/5 px-8 py-4">
            <Button variant="secondary" className="font-semibold rounded-full" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button className="font-semibold px-6 rounded-full" onClick={handleAddTicket} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
               Create Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details & Lifecycle Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={onDetailsOpenChange}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden">
            <>
               <div className="flex h-[80vh]">
                  {/* Left Sidebar: Info */}
                  <div className="w-1/3 border-r p-8 space-y-8" style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--input-bg)' }}>
                     <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 block">Service Ticket</span>
                        <h2 className="text-3xl font-black">{selectedTicket?.ticketNumber}</h2>
                        <Badge className={`mt-2 font-black uppercase text-[10px] ${getStatusColor(selectedTicket?.status || '')}`}>
                           {selectedTicket?.status?.replace(/_/g, ' ')}
                        </Badge>
                     </div>

                     <div className="space-y-6">
                        <div className="flex flex-col items-center p-6 border-2 border-dashed rounded-2xl space-y-4" style={{ borderColor: 'var(--card-border)' }}>
                           <div className="bg-white dark:bg-zinc-900 p-3 rounded-2xl shadow-sm">
                              <QRCodeSVG value={selectedTicket?.ticketNumber || 'TIC-00000'} size={120} />
                           </div>
                           <div className="text-center">
                              <p className="text-xs font-black uppercase tracking-[0.2em]">{selectedTicket?.ticketNumber}</p>
                              <p className="text-[10px] font-bold text-muted-foreground mt-1">SCAN TO TRACK STATUS</p>
                           </div>
                           <Button variant="secondary" size="sm" className="font-semibold w-full rounded-full gap-2">
                             <Printer size={16} aria-hidden="true" />
                             Print Job Sticker
                           </Button>
                        </div>

                        <div className="p-4 rounded-xl space-y-3" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><User size={12} aria-hidden="true" /> Customer</p>
                           <div>
                              <p className="font-black">{selectedTicket?.customer?.name}</p>
                              <p className="text-xs font-bold text-muted-foreground">{selectedTicket?.customer?.phone}</p>
                           </div>
                        </div>

                        <div className="p-4 rounded-xl space-y-3" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><LayoutGrid size={12} aria-hidden="true" /> Asset</p>
                           <div>
                              <p className="font-black">{selectedTicket?.productName}</p>
                              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">{selectedTicket?.serialNumber || 'No Serial Recorded'}</p>
                           </div>
                        </div>

                        <div className="space-y-4 pt-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Assignment Control</p>
                            <div className="space-y-2">
                              <Label className="text-sm">Assign Technician</Label>
                              <Select value={editData.assignedToId} onValueChange={(val) => setEditData({...editData, assignedToId: val})}>
                                <SelectTrigger className="h-12 border border-foreground/10 rounded-xl" style={{ backgroundColor: 'var(--input-bg)' }}>
                                  <SelectValue placeholder="Select technician" />
                                </SelectTrigger>
                                <SelectContent>
                                  {technicians.map(tech => (
                                    <SelectItem key={tech.id} value={tech.id}>
                                      <div className="flex items-center gap-2">
                                         <Avatar className="h-6 w-6">
                                           <AvatarImage src={tech.image} />
                                           <AvatarFallback>{tech.name?.[0] || '?'}</AvatarFallback>
                                         </Avatar>
                                         <span className="font-bold">{tech.name}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm">Priority Level</Label>
                              <Select value={editData.priority} onValueChange={(val) => setEditData({...editData, priority: val})}>
                                <SelectTrigger className="h-12 border border-foreground/10 rounded-xl" style={{ backgroundColor: 'var(--input-bg)' }}>
                                  <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                  {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map(p => (
                                    <SelectItem key={p} value={p}>{p}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                        </div>
                     </div>
                  </div>

                  {/* Right Content: Logs & Cost */}
                  <div className="flex-grow p-8 flex flex-col h-full" style={{ backgroundColor: 'var(--card-bg)' }}>
                     <div className="flex-grow overflow-y-auto pr-4 space-y-8">
                        <section className="space-y-4">
                           <div className="flex items-center justify-between">
                              <h3 className="text-lg font-bold">Maintenance Ledger</h3>
                              <Button size="sm" variant="secondary" className="font-semibold rounded-full">Add Attachment</Button>
                           </div>

                           <div className="space-y-2">
                             <Label>Technical Diagnosis</Label>
                             <Textarea
                                placeholder="Describe the root cause found during inspection..."
                                value={editData.diagnosis}
                                onChange={(e) => setEditData({...editData, diagnosis: e.target.value})}
                                className="border border-foreground/10"
                                style={{ backgroundColor: 'var(--input-bg)' }}
                             />
                           </div>

                           <div className="space-y-2">
                             <Label>Repair Action Logs</Label>
                             <Textarea
                                placeholder="Record what was done to fix the issue..."
                                value={editData.repairNotes}
                                onChange={(e) => setEditData({...editData, repairNotes: e.target.value})}
                                className="border border-foreground/10"
                                style={{ backgroundColor: 'var(--input-bg)' }}
                             />
                           </div>
                        </section>

                        <section className="space-y-4">
                           <h3 className="text-lg font-bold">Financial Closure</h3>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Labor / Service Fee</Label>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">&#8377;</span>
                                  <Input
                                     type="number"
                                     value={editData.laborCost}
                                     onChange={(e) => setEditData({...editData, laborCost: e.target.value})}
                                     className="h-12 pl-7 border border-foreground/10"
                                     style={{ backgroundColor: 'var(--input-bg)' }}
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label>Parts Replacement Cost</Label>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">&#8377;</span>
                                  <Input
                                     type="number"
                                     value={editData.partsCost}
                                     onChange={(e) => setEditData({...editData, partsCost: e.target.value})}
                                     className="h-12 pl-7 border border-foreground/10"
                                     style={{ backgroundColor: 'var(--input-bg)' }}
                                  />
                                </div>
                              </div>
                           </div>
                           <div className="p-6 rounded-xl bg-primary/5 border border-primary/20 flex justify-between items-center">
                              <div>
                                 <p className="text-[10px] font-black uppercase tracking-widest text-primary">Est. Invoice Value</p>
                                 <h4 className="text-3xl font-black tracking-tighter">&#8377;{(Number(editData.laborCost) + Number(editData.partsCost)).toLocaleString()}</h4>
                              </div>
                              <Button variant="secondary" className="font-semibold rounded-full">Generate Draft Bill</Button>
                           </div>
                        </section>
                     </div>

                     {/* Lifecycle Action Bar */}
                     <div className="pt-6 border-t flex items-center justify-between gap-4" style={{ borderColor: 'var(--card-border)' }}>
                        <div className="flex gap-2">
                           {['RECEIVED', 'IN_REPAIR', 'READY', 'DELIVERED'].map((st) => (
                              <Button
                                 key={st}
                                 size="sm"
                                 variant={editData.status === st ? 'default' : 'secondary'}
                                 className="font-semibold text-xs uppercase rounded-full"
                                 onClick={() => setEditData({...editData, status: st})}
                              >
                                 {st.replace('_', ' ')}
                              </Button>
                           ))}
                        </div>
                        <div className="flex gap-3">
                           <Button variant="secondary" className="font-semibold rounded-full" onClick={() => onDetailsOpenChange(false)}>Discard</Button>
                           <Button className="font-semibold rounded-full" onClick={handleUpdateTicket} disabled={isLoading}>
                             {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Commit Changes
                           </Button>
                        </div>
                     </div>
                  </div>
               </div>
            </>
        </DialogContent>
      </Dialog>
    </div>
  );
}
