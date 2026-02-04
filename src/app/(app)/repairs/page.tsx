'use client';

import {
    Avatar,
    Button,
    Card,
    CardBody,
    Chip,
    Divider,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Select,
    SelectItem,
    Tab,
    Tabs,
    Textarea,
    useDisclosure
} from '@heroui/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Camera,
    Clock,
    LayoutGrid,
    List,
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
    case 'RECEIVED': return 'default';
    case 'DIAGNOSED': return 'warning';
    case 'IN_REPAIR': return 'secondary';
    case 'READY': return 'success';
    case 'DELIVERED': return 'primary';
    case 'CANCELLED': return 'danger';
    default: return 'default';
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
        onOpenChange();
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
        onDetailsOpenChange();
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
             <div className="w-10 h-10 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                <Wrench size={22} strokeWidth={2.5} />
             </div>
             <h1 className="text-3xl font-black tracking-tight text-secondary">Service Center</h1>
           </div>
           <p className="text-black/40 dark:text-white/40 font-bold ml-1">Live tracking of device lifecycle and technician efficiency.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-xl">
              <Button isIconOnly variant={view === 'grid' ? 'flat' : 'light'} size="sm" radius="lg" onClick={() => setView('grid')}><LayoutGrid size={18} /></Button>
              <Button isIconOnly variant={view === 'list' ? 'flat' : 'light'} size="sm" radius="lg" onClick={() => setView('list')}><List size={18} /></Button>
           </div>
           <Button color="secondary" radius="full" size="lg" className="font-black px-8 shadow-xl shadow-secondary/20" startContent={<Plus size={20} />} onClick={onOpen}>
              In-ward Device
           </Button>
        </div>
      </div>

      {/* Workflow Tabs */}
      <Tabs 
        aria-label="Repair Workflow" 
        variant="underlined" 
        color="secondary"
        selectedKey={activeTab}
        onSelectionChange={(key) => setActiveTab(key as string)}
        classNames={{
            tabList: "gap-8 w-full relative rounded-none p-0 border-b border-divider",
            cursor: "w-full bg-secondary",
            tab: "max-w-fit px-0 h-12",
            tabContent: "group-data-[selected=true]:text-secondary font-black tracking-tight"
        }}
      >
        <Tab key="all" title="Universal Queue" />
        <Tab key="receiving" title="Awaiting Diagnosis" />
        <Tab key="repairing" title="Live Repairs" />
        <Tab key="ready" title="Ready to Deliver" />
        <Tab key="delivered" title="Archived" />
      </Tabs>

      {/* Live Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         <AnimatePresence mode="popLayout">
            {isLoading ? (
               <div className="col-span-full py-20 text-center opacity-30 font-black uppercase tracking-[0.3em]">
                  Synchronizing Tickets...
               </div>
            ) : filteredTickets.length === 0 ? (
                <div className="col-span-full py-20 text-center opacity-20 font-black uppercase tracking-[0.3em]">
                  No Tickets in this Queue
                </div>
            ) : filteredTickets.map((ticket, idx) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="bg-card border border-soft group cursor-pointer relative overflow-hidden" radius="lg">
                  <CardBody className="p-6">
                     <div className="flex justify-between items-start mb-6">
                       <div className="flex flex-col">
                         <span className="text-[10px] font-black uppercase tracking-widest text-secondary mb-1">Job ID</span>
                         <h3 className="text-xl font-black">{ticket.ticketNumber}</h3>
                       </div>
                       <div className="flex flex-col items-end gap-2">
                             <Chip color={getStatusColor(ticket.status) as any} variant="flat" size="sm" className="font-black uppercase text-[10px]">
                                {ticket.status.replace(/_/g, ' ')}
                             </Chip>
                             {ticket.images?.length > 0 && (
                               <span className="text-[9px] font-bold text-muted flex items-center gap-1"><Camera size={10} /> {ticket.images.length} Photos</span>
                             )}
                           </div>
                    </div>

                     <div className="space-y-5">
                       <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50 space-y-1">
                          <h4 className="font-black text-sm">{ticket.productName}</h4>
                          <p className="text-[10px] uppercase font-bold text-muted flex items-center gap-2">
                             <QrCode size={12} /> {ticket.serialNumber || 'No S/N'}
                          </p>
                       </div>

                        <div className="space-y-4">
                           <div className="flex items-start gap-4">
                              <Avatar name={ticket.customer?.name?.split(' ').map((n: string) => n[0]).join('')} size="sm" radius="lg" className="shrink-0" />
                              <div>
                                 <p className="text-sm font-black leading-none mb-1">{ticket.customer?.name}</p>
                                 <p className="text-[11px] font-bold opacity-40">{ticket.customer?.phone}</p>
                              </div>
                             <div className="ml-auto flex gap-1">
                                <Button isIconOnly size="sm" variant="flat" color="success" radius="full" className="w-8 h-8"><MessageCircle size={14} /></Button>
                             </div>
                          </div>

                           <div className="bg-warning/5 border border-warning/10 p-3 rounded-xl">
                              <p className="text-xs font-bold leading-relaxed">{ticket.issueDescription}</p>
                           </div>
                       </div>

                       <Divider className="opacity-50" />

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
                    <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform bg-card border-t border-black/5 dark:border-white/10 flex gap-2 z-10">
                       <Button size="sm" className="flex-1 font-black bg-secondary text-white rounded-xl" onClick={() => handleOpenDetails(ticket)}>View Details</Button>
                       <Button isIconOnly size="sm" variant="flat" className="rounded-xl"><Share2 size={16} /></Button>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
         </AnimatePresence>
      </div>

      {/* In-ward Modal */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        scrollBehavior="inside"
        size="2xl"
        classNames={{
            backdrop: "bg-black/50 backdrop-blur-sm",
            base: "theme-modal rounded-2xl",
            header: "border-b border-zinc-200 dark:border-zinc-800",
            body: "py-6",
            footer: "border-t border-zinc-200 dark:border-zinc-800",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                 <h2 className="text-xl font-bold">New Service Request</h2>
                 <p className="text-sm text-muted font-normal">Generate Job ID and capture pre-state</p>
              </ModalHeader>
              <ModalBody className="space-y-6">
                
                {/* Section 1: Customer */}
                <div className="space-y-4">
                   <h4 className="text-xs font-bold uppercase tracking-wider text-muted">Customer Intelligence</h4>
                   <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        label="Customer Name"
                        placeholder="e.g. Alex Smith"
                        labelPlacement="outside"
                        size="lg"
                        radius="lg"
                        value={newTicket.customer}
                        onValueChange={(val) => setNewTicket({...newTicket, customer: val})}
                        classNames={{ inputWrapper: "h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700" }}
                      />
                      <Input
                        label="WhatsApp Phone"
                        placeholder="+91 00000 00000"
                        labelPlacement="outside"
                        size="lg"
                        radius="lg"
                        value={newTicket.phone}
                        onValueChange={(val) => setNewTicket({...newTicket, phone: val})}
                        classNames={{ inputWrapper: "h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700" }}
                        endContent={<MessageCircle className="text-success" size={20} />}
                      />
                   </div>
                </div>

                {/* Section 2: Product */}
                <div className="space-y-4">
                   <h4 className="text-xs font-bold uppercase tracking-wider text-muted">Asset Verification</h4>
                   <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        label="Item Name / Model"
                        placeholder="iPhone 15 Pro Max"
                        labelPlacement="outside"
                        size="lg"
                        radius="lg"
                        value={newTicket.product}
                        onValueChange={(val) => setNewTicket({...newTicket, product: val})}
                        classNames={{ inputWrapper: "h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700" }}
                      />
                      <Input
                        label="Serial Number (IMD/SN)"
                        placeholder="SN-XXXXXXXX"
                        labelPlacement="outside"
                        size="lg"
                        radius="lg"
                        value={newTicket.sn}
                        onValueChange={(val) => setNewTicket({...newTicket, sn: val})}
                        classNames={{ inputWrapper: "h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700" }}
                        endContent={<QrCode className="text-muted" size={20} />}
                      />
                   </div>
                </div>

                {/* Section 3: Issues */}
                <div className="space-y-4">
                   <h4 className="text-xs font-bold uppercase tracking-wider text-muted">Problem Declaration</h4>
                   <Textarea
                     label="Main Issues Reported"
                     placeholder="Describe the problem in detail (screen cracked, not charging, etc)"
                     labelPlacement="outside"
                     size="lg"
                     radius="lg"
                     minRows={3}
                     value={newTicket.issue}
                     onValueChange={(val) => setNewTicket({...newTicket, issue: val})}
                     classNames={{ inputWrapper: "bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700" }}
                   />

                   <div className="p-6 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-600 flex flex-col items-center justify-center text-center gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer" onClick={() => setNewTicket({...newTicket, images: [...newTicket.images, 'https://placehold.co/400x300?text=Condition+Report']})}>
                      <Camera size={28} className="text-secondary" />
                      <p className="text-xs font-bold text-muted">
                        {newTicket.images.length > 0 ? `${newTicket.images.length} Photos Captured` : 'Capture / Upload Before-Repair Photos'}
                      </p>
                      <span className="text-[10px] font-bold text-muted uppercase tracking-wider">MANDATORY FOR DISPUTE PREVENTION</span>
                   </div>
                </div>

              </ModalBody>
              <ModalFooter>
                <Button variant="flat" className="font-semibold" onPress={onClose}>Discard</Button>
                <Button color="secondary" className="font-semibold" onPress={handleAddTicket} isLoading={isLoading}>
                   Print Label & Generate JID
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Details & Lifecycle Modal */}
      <Modal
        isOpen={isDetailsOpen}
        onOpenChange={onDetailsOpenChange}
        scrollBehavior="inside"
        size="5xl"
        classNames={{
            backdrop: "bg-black/50 backdrop-blur-sm",
            base: "theme-modal rounded-2xl overflow-hidden",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
               <div className="flex h-[80vh]">
                  {/* Left Sidebar: Info */}
                  <div className="w-1/3 border-r border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 p-8 space-y-8">
                     <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-secondary mb-2 block">Service Ticket</span>
                        <h2 className="text-3xl font-black">{selectedTicket?.ticketNumber}</h2>
                        <Chip color={getStatusColor(selectedTicket?.status) as any} variant="flat" size="sm" className="mt-2 font-black uppercase text-[10px]">
                           {selectedTicket?.status?.replace(/_/g, ' ')}
                        </Chip>
                     </div>

                     <div className="space-y-6">
                        <div className="flex flex-col items-center p-6 border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-2xl space-y-4">
                           <div className="bg-white p-3 rounded-2xl shadow-sm">
                              <QRCodeSVG value={selectedTicket?.ticketNumber || 'TIC-00000'} size={120} />
                           </div>
                           <div className="text-center">
                              <p className="text-xs font-black uppercase tracking-[0.2em]">{selectedTicket?.ticketNumber}</p>
                              <p className="text-[10px] font-bold text-muted mt-1">SCAN TO TRACK STATUS</p>
                           </div>
                           <Button size="sm" variant="flat" color="default" className="font-semibold w-full" startContent={<Printer size={16} />}>Print Job Sticker</Button>
                        </div>

                        <div className="p-4 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 space-y-3">
                           <p className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2"><User size={12} /> Customer</p>
                           <div>
                              <p className="font-black">{selectedTicket?.customer?.name}</p>
                              <p className="text-xs font-bold text-muted">{selectedTicket?.customer?.phone}</p>
                           </div>
                        </div>

                        <div className="p-4 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 space-y-3">
                           <p className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2"><LayoutGrid size={12} /> Asset</p>
                           <div>
                              <p className="font-black">{selectedTicket?.productName}</p>
                              <p className="text-[10px] font-black text-muted uppercase tracking-tighter">{selectedTicket?.serialNumber || 'No Serial Recorded'}</p>
                           </div>
                        </div>

                        <div className="space-y-4 pt-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted">Assignment Control</p>
                            <Select
                              label="Assign Technician"
                              labelPlacement="outside"
                              selectedKeys={editData.assignedToId ? [editData.assignedToId] : []}
                              onSelectionChange={(keys) => setEditData({...editData, assignedToId: Array.from(keys)[0] as string})}
                              classNames={{ trigger: "h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl" }}
                            >
                               {technicians.map(tech => (
                                 <SelectItem key={tech.id} textValue={tech.name}>
                                    <div className="flex items-center gap-2">
                                       <Avatar size="sm" src={tech.image} />
                                       <span className="font-bold">{tech.name}</span>
                                    </div>
                                 </SelectItem>
                               ))}
                            </Select>

                            <Select
                              label="Priority Level"
                              labelPlacement="outside"
                              selectedKeys={[editData.priority]}
                              onSelectionChange={(keys) => setEditData({...editData, priority: Array.from(keys)[0] as string})}
                              classNames={{ trigger: "h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl" }}
                            >
                               {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map(p => (
                                 <SelectItem key={p}>{p}</SelectItem>
                               ))}
                            </Select>
                        </div>
                     </div>
                  </div>

                  {/* Right Content: Logs & Cost */}
                  <div className="flex-grow p-8 flex flex-col h-full bg-card">
                     <div className="flex-grow overflow-y-auto pr-4 space-y-8">
                        <section className="space-y-4">
                           <div className="flex items-center justify-between">
                              <h3 className="text-lg font-bold">Maintenance Ledger</h3>
                              <Button size="sm" variant="flat" color="secondary" className="font-semibold">Add Attachment</Button>
                           </div>

                           <Textarea
                              label="Technical Diagnosis"
                              placeholder="Describe the root cause found during inspection..."
                              value={editData.diagnosis}
                              onValueChange={(val) => setEditData({...editData, diagnosis: val})}
                              labelPlacement="outside"
                              classNames={{ inputWrapper: "bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700" }}
                           />

                           <Textarea
                              label="Repair Action Logs"
                              placeholder="Record what was done to fix the issue..."
                              value={editData.repairNotes}
                              onValueChange={(val) => setEditData({...editData, repairNotes: val})}
                              labelPlacement="outside"
                              classNames={{ inputWrapper: "bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700" }}
                           />
                        </section>

                        <section className="space-y-4">
                           <h3 className="text-lg font-bold">Financial Closure</h3>
                           <div className="grid grid-cols-2 gap-4">
                              <Input
                                 label="Labor / Service Fee"
                                 type="number"
                                 value={editData.laborCost}
                                 onChange={(e) => setEditData({...editData, laborCost: e.target.value})}
                                 startContent={<span className="text-sm text-muted">₹</span>}
                                 labelPlacement="outside"
                                 classNames={{ inputWrapper: "h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700" }}
                              />
                              <Input
                                 label="Parts Replacement Cost"
                                 type="number"
                                 value={editData.partsCost}
                                 onChange={(e) => setEditData({...editData, partsCost: e.target.value})}
                                 startContent={<span className="text-sm text-muted">₹</span>}
                                 labelPlacement="outside"
                                 classNames={{ inputWrapper: "h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700" }}
                              />
                           </div>
                           <div className="p-6 rounded-xl bg-secondary/5 border border-secondary/20 flex justify-between items-center">
                              <div>
                                 <p className="text-[10px] font-black uppercase tracking-widest text-secondary">Est. Invoice Value</p>
                                 <h4 className="text-3xl font-black tracking-tighter">₹{(Number(editData.laborCost) + Number(editData.partsCost)).toLocaleString()}</h4>
                              </div>
                              <Button variant="flat" color="secondary" className="font-semibold">Generate Draft Bill</Button>
                           </div>
                        </section>
                     </div>

                     {/* Lifecycle Action Bar */}
                     <div className="pt-6 border-t border-zinc-200 dark:border-zinc-700 flex items-center justify-between gap-4">
                        <div className="flex gap-2">
                           {['RECEIVED', 'IN_REPAIR', 'READY', 'DELIVERED'].map((st) => (
                              <Button
                                 key={st}
                                 size="sm"
                                 variant={editData.status === st ? 'solid' : 'flat'}
                                 color={editData.status === st ? 'secondary' : 'default'}
                                 className="font-semibold text-xs uppercase"
                                 onClick={() => setEditData({...editData, status: st})}
                              >
                                 {st.replace('_', ' ')}
                              </Button>
                           ))}
                        </div>
                        <div className="flex gap-3">
                           <Button variant="flat" className="font-semibold" onPress={onClose}>Discard</Button>
                           <Button color="secondary" className="font-semibold" onClick={handleUpdateTicket} isLoading={isLoading}>
                              Commit Changes
                           </Button>
                        </div>
                     </div>
                  </div>
               </div>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
