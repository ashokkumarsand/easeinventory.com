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
    QrCode,
    Share2,
    User,
    Wrench
} from 'lucide-react';
import { useState } from 'react';

// Mock Data
const INITIAL_TICKETS = [
  { 
    id: 'TIC-10294', 
    customer: 'Rahul Verma', 
    phone: '+91 98765 43210', 
    product: 'iPhone 15 Pro', 
    sn: 'SN-IP15P-4829', 
    issue: 'Screen cracked & charging port loose',
    status: 'received', 
    priority: 'high',
    technician: 'Kamal Kishor',
    receivedAt: '2024-01-25 10:30 AM',
    images: 3
  },
  { 
    id: 'TIC-10295', 
    customer: 'Sunita Mehra', 
    phone: '+91 88223 11445', 
    product: 'Dell XPS 15', 
    sn: 'SN-DXPS-7742', 
    issue: 'Motherboard short circuit',
    status: 'in_repair', 
    priority: 'urgent',
    technician: 'Sarah J.',
    receivedAt: '2024-01-25 11:15 AM',
    images: 5
  },
  { 
    id: 'TIC-10296', 
    customer: 'Amit Singh', 
    phone: '+91 77665 44332', 
    product: 'Sony Pulse 3D', 
    sn: 'SN-SNYP-2291', 
    issue: 'Mic not picking up sound',
    status: 'diagnosed', 
    priority: 'medium',
    technician: 'Unassigned',
    receivedAt: '2024-01-25 02:20 PM',
    images: 2
  }
];

const technicians = [
  { id: '1', name: 'Kamal Kishor', avatar: 'KK' },
  { id: '2', name: 'Sarah J.', avatar: 'SJ' },
  { id: '3', name: 'Ankit Sharma', avatar: 'AS' },
  { id: '4', name: 'Priya Verma', avatar: 'PV' },
];

export default function RepairCenterPage() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  // New Ticket State
  const [newTicket, setNewTicket] = useState({
    customer: '',
    phone: '',
    product: '',
    sn: '',
    modelNumber: '',
    issue: '',
    priority: 'medium'
  });

  const handleAddTicket = () => {
    const id = `TIC-${Math.floor(10000 + Math.random() * 90000)}`;
    const ticket = {
      ...newTicket,
      id,
      status: 'received',
      receivedAt: new Date().toLocaleString(),
      technician: 'Unassigned',
      images: 2
    };
    setTickets([ticket as any, ...tickets]);
    onOpenChange();
    setNewTicket({ customer: '', phone: '', product: '', sn: '', modelNumber: '', issue: '', priority: 'medium' });
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'received': return 'default';
      case 'diagnosed': return 'warning';
      case 'in_repair': return 'secondary';
      case 'ready': return 'success';
      case 'delivered': return 'primary';
      default: return 'default';
    }
  };

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
           <div className="flex bg-black/[0.03] dark:bg-white/5 p-1 rounded-2xl">
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
         <AnimatePresence>
            {tickets.map((ticket, idx) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="modern-card border-none group cursor-pointer" radius="lg">
                  <CardBody className="p-6">
                    <div className="flex justify-between items-start mb-6">
                       <div className="flex flex-col">
                         <span className="text-[10px] font-black uppercase tracking-widest text-secondary mb-1">Job ID</span>
                         <h3 className="text-xl font-black">{ticket.id}</h3>
                       </div>
                       <Chip color={getStatusColor(ticket.status) as any} variant="flat" size="sm" className="font-black uppercase text-[10px]">
                          {ticket.status.replace('_', ' ')}
                       </Chip>
                    </div>

                    <div className="space-y-5">
                       <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] space-y-1">
                          <h4 className="font-black text-sm">{ticket.product}</h4>
                          <p className="text-[10px] uppercase font-bold opacity-30 flex items-center gap-2">
                             <QrCode size={12} /> {ticket.sn}
                          </p>
                       </div>

                       <div className="space-y-4">
                          <div className="flex items-start gap-4">
                             <Avatar name={ticket.customer.split(' ').map(n => n[0]).join('')} size="sm" radius="lg" className="shrink-0" />
                             <div>
                                <p className="text-sm font-black leading-none mb-1">{ticket.customer}</p>
                                <p className="text-[11px] font-bold opacity-40">{ticket.phone}</p>
                             </div>
                             <div className="ml-auto flex gap-1">
                                <Button isIconOnly size="sm" variant="flat" color="success" radius="full" className="w-8 h-8"><MessageCircle size={14} /></Button>
                             </div>
                          </div>

                          <div className="bg-warning/5 border border-warning/10 p-3 rounded-xl">
                             <p className="text-xs font-bold leading-relaxed">{ticket.issue}</p>
                          </div>
                       </div>

                       <Divider className="opacity-50" />

                       <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2">
                             <Clock size={16} className="opacity-20" />
                             <span className="text-[10px] font-black opacity-30 uppercase">{ticket.receivedAt}</span>
                          </div>
                          <div className="flex items-center gap-2">
                             <User size={16} className="opacity-20" />
                             <span className="text-xs font-black">{ticket.technician}</span>
                          </div>
                       </div>
                    </div>

                    {/* Quick Maintenance Panel Hover (Simulated) */}
                    <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform bg-white dark:bg-dark-card border-t border-black/5 flex gap-2 z-10">
                       <Button size="sm" className="flex-1 font-black bg-secondary text-white rounded-xl">View Details</Button>
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
        classNames={{ backdrop: "bg-secondary/40 backdrop-blur-md", base: "modern-card p-4" }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                       <Plus size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black tracking-tight">New Service Request</h2>
                      <p className="text-xs font-bold opacity-30 uppercase tracking-widest">Generate Job ID and capture pre-state</p>
                    </div>
                 </div>
              </ModalHeader>
              <ModalBody className="py-8 space-y-8">
                
                {/* Section 1: Customer */}
                <div className="space-y-6">
                   <div className="flex items-center gap-2">
                      <div className="w-1 h-4 bg-secondary rounded-full" />
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary">Customer Intelligence</h4>
                   </div>
                   <div className="grid md:grid-cols-2 gap-6">
                      <Input
                        label="Customer Name"
                        placeholder="e.g. Rahul Verma"
                        labelPlacement="outside"
                        size="lg"
                        radius="lg"
                        value={newTicket.customer}
                        onValueChange={(val) => setNewTicket({...newTicket, customer: val})}
                        classNames={{ label: "font-black opacity-40", inputWrapper: "bg-black/5 h-14" }}
                      />
                      <Input
                        label="WhatsApp Phone"
                        placeholder="+91 00000 00000"
                        labelPlacement="outside"
                        size="lg"
                        radius="lg"
                        value={newTicket.phone}
                        onValueChange={(val) => setNewTicket({...newTicket, phone: val})}
                        classNames={{ label: "font-black opacity-40", inputWrapper: "bg-black/5 h-14" }}
                        endContent={<MessageCircle className="text-success" size={20} />}
                      />
                   </div>
                </div>

                {/* Section 2: Product */}
                <div className="space-y-6">
                   <div className="flex items-center gap-2">
                      <div className="w-1 h-4 bg-secondary rounded-full" />
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary">Asset Verification</h4>
                   </div>
                   <div className="grid md:grid-cols-2 gap-6">
                      <Input
                        label="Item Name / Model"
                        placeholder="iPhone 15 Pro Max"
                        labelPlacement="outside"
                        size="lg"
                        radius="lg"
                        value={newTicket.product}
                        onValueChange={(val) => setNewTicket({...newTicket, product: val})}
                        classNames={{ label: "font-black opacity-40", inputWrapper: "bg-black/5 h-14" }}
                      />
                      <Input
                        label="Serial Number (IMD/SN)"
                        placeholder="SN-XXXXXXXX"
                        labelPlacement="outside"
                        size="lg"
                        radius="lg"
                        value={newTicket.sn}
                        onValueChange={(val) => setNewTicket({...newTicket, sn: val})}
                        classNames={{ label: "font-black opacity-40", inputWrapper: "bg-black/5 h-14" }}
                        endContent={<QrCode className="opacity-20" size={20} />}
                      />
                   </div>
                </div>

                {/* Section 3: Issues */}
                <div className="space-y-6">
                   <div className="flex items-center gap-2">
                      <div className="w-1 h-4 bg-secondary rounded-full" />
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary">Problem Declaration</h4>
                   </div>
                   <Textarea
                     label="Main Issues Reported"
                     placeholder="Describe the problem in detail (screeen cracked, not charging, etc)"
                     labelPlacement="outside"
                     size="lg"
                     radius="lg"
                     minRows={3}
                     value={newTicket.issue}
                     onValueChange={(val) => setNewTicket({...newTicket, issue: val})}
                     classNames={{ label: "font-black opacity-40", inputWrapper: "bg-black/5" }}
                   />
                   
                   <div className="p-6 rounded-[1.5rem] border-2 border-dashed border-black/10 flex flex-col items-center justify-center text-center gap-3 hover:bg-black/5 transition-colors cursor-pointer">
                      <Camera size={28} className="text-secondary opacity-40" />
                      <p className="text-xs font-black opacity-40">Capture / Upload Before-Repair Photos</p>
                      <span className="text-[10px] font-bold opacity-30 text-uppercase tracking-wider">MANDATORY FOR DISPUTE PREVENTION</span>
                   </div>
                </div>

              </ModalBody>
              <ModalFooter className="gap-4">
                <Button variant="light" className="font-bold h-14 px-8" onPress={onClose}>Discard</Button>
                <div className="flex-grow md:flex-grow-0 md:w-[280px]">
                   <Button color="secondary" className="w-full font-black h-14 shadow-xl shadow-secondary/20" radius="full" onPress={handleAddTicket}>
                      Print Label & Generate JID
                   </Button>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
