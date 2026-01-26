'use client';

import {
    Avatar,
    Badge,
    Button,
    Card,
    CardBody,
    Checkbox,
    Chip,
    Divider,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Switch,
    useDisclosure
} from '@heroui/react';
import { motion } from 'framer-motion';
import {
    ArrowLeftRight,
    FileText,
    Lock,
    MoreVertical,
    Package,
    Shield,
    ShieldAlert,
    UserPlus,
    Users,
    Wrench
} from 'lucide-react';
import { useState } from 'react';

// Mock Data
const INITIAL_TEAM = [
  { id: '1', name: 'Ashok Kumar', email: 'ashok@shop.com', role: 'owner', status: 'active', permissions: ['all'] },
  { id: '2', name: 'Sunita Mehra', email: 'sunita@shop.com', role: 'admin', status: 'active', permissions: ['inventory', 'invoices', 'hr'] },
  { id: '3', name: 'Kamal Kishor', email: 'kamal@shop.com', role: 'technician', status: 'active', permissions: ['repairs'] },
  { id: '4', name: 'Amit Singh', email: 'amit@shop.com', role: 'staff', status: 'inactive', permissions: ['inventory:view'] },
];

const permissionModules = [
  { id: 'inventory', label: 'Inventory Management', icon: Package, desc: 'Add/Edit stock, valuation, pricing' },
  { id: 'repairs', label: 'Service Center', icon: Wrench, desc: 'Handle repair tickets, assign techs' },
  { id: 'invoices', label: 'Finance & Invoicing', icon: FileText, desc: 'Generate bills, payment tracking' },
  { id: 'hr', label: 'People & Attendance', icon: Users, desc: 'Employee records, HR, Payouts' },
];

export default function TeamPage() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isPermOpen, onOpen: onPermOpen, onOpenChange: onPermOpenChange } = useDisclosure();
  const [team, setTeam] = useState(INITIAL_TEAM);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const openPermissions = (user: any) => {
    setSelectedUser(user);
    onPermOpen();
  };

  return (
    <div className="space-y-10 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
             <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Shield size={22} strokeWidth={2.5} />
             </div>
             <h1 className="text-3xl font-black tracking-tight">Access Control</h1>
           </div>
           <p className="text-black/40 dark:text-white/40 font-bold ml-1">Securely delegate authority and manage team permissions.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="flat" color="primary" className="font-black rounded-2xl" startContent={<ArrowLeftRight size={18} />}>
              Ownership Transfer
           </Button>
           <Button color="primary" radius="full" size="lg" className="font-black px-8 shadow-xl shadow-primary/20" startContent={<UserPlus size={20} />} onClick={onOpen}>
              Invite Member
           </Button>
        </div>
      </div>

      {/* Role Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { label: 'Owners', count: 1, color: 'primary' },
           { label: 'Administrators', count: 1, color: 'secondary' },
           { label: 'Field Staff', count: 8, color: 'success' },
           { label: 'Guest Viewers', count: 2, color: 'default' },
         ].map((r) => (
           <div key={r.label} className="p-6 rounded-[2rem] bg-white dark:bg-[#111318] border border-black/5 dark:border-white/5 flex flex-col gap-1 hover:border-primary/10 transition-all cursor-default group">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-30 group-hover:opacity-100 transition-opacity">{r.label}</span>
              <h3 className="text-3xl font-black text-dark dark:text-white">{r.count}</h3>
           </div>
         ))}
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {team.map((member, idx) => (
           <motion.div
             key={member.id}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: idx * 0.1 }}
           >
             <Card className="modern-card border-none hover:shadow-2xl transition-shadow duration-500 overflow-visible" radius="lg">
                <CardBody className="p-8">
                   <div className="flex justify-between items-start mb-8">
                      <div className="relative">
                         <Badge content="" color={member.status === 'active' ? 'success' : 'danger'} shape="circle" placement="bottom-right" className="border-4 border-white dark:border-black w-5 h-5">
                            <Avatar 
                              src={`https://i.pravatar.cc/150?u=${member.email}`}
                              className="w-20 h-20 text-xl font-black shadow-lg"
                              name={member.name[0]}
                            />
                         </Badge>
                      </div>
                      <Dropdown placement="bottom-end">
                         <DropdownTrigger>
                            <Button isIconOnly variant="light" radius="full"><MoreVertical size={20} className="opacity-30" /></Button>
                         </DropdownTrigger>
                         <DropdownMenu variant="flat">
                            <DropdownItem key="edit">Edit Profile</DropdownItem>
                            <DropdownItem key="perms" onClick={() => openPermissions(member)}>Manage Access Rights</DropdownItem>
                            <DropdownItem key="transfer">Make Primary Owner</DropdownItem>
                            <DropdownItem key="deactivate" className="text-danger" color="danger">Revoke Access</DropdownItem>
                         </DropdownMenu>
                      </Dropdown>
                   </div>

                   <div className="space-y-6">
                      <div>
                         <h3 className="text-xl font-black leading-tight">{member.name}</h3>
                         <p className="text-xs font-bold opacity-30 mt-1 uppercase tracking-widest">{member.email}</p>
                      </div>

                      <div className="flex items-center gap-2">
                         <Chip 
                            size="sm" 
                            variant="flat" 
                            color={member.role === 'owner' ? 'primary' : member.role === 'admin' ? 'secondary' : 'default'}
                            className="font-black uppercase text-[10px] px-3 h-7 tracking-widest"
                            startContent={<Shield size={12} />}
                         >
                            {member.role === 'owner' ? 'Sovereign' : member.role}
                         </Chip>
                         <Chip size="sm" variant="dot" className="font-black uppercase text-[10px] opacity-40">{member.status}</Chip>
                      </div>

                      <Divider className="opacity-50" />

                      <div>
                         <p className="text-[10px] font-black uppercase tracking-widest opacity-20 mb-3">Modular Authority</p>
                         <div className="flex flex-wrap gap-2">
                            {member.permissions.map(p => (
                               <div key={p} className="p-2 rounded-xl bg-black/[0.03] dark:bg-white/5 border border-black/5 flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                  <span className="text-[10px] font-black uppercase tracking-tight">{p.replace(':', ' ')}</span>
                                </div>
                            ))}
                         </div>
                      </div>
                   </div>
                </CardBody>
             </Card>
           </motion.div>
         ))}
      </div>

      {/* Permissions Modal */}
      <Modal 
        isOpen={isPermOpen} 
        onOpenChange={onPermOpenChange}
        size="2xl"
        radius="lg"
        classNames={{
            backdrop: "bg-black/60 backdrop-blur-md",
            base: "modern-card p-4",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 pb-8 border-b border-black/5">
                 <div className="flex items-center gap-4">
                    <Avatar src={`https://i.pravatar.cc/150?u=${selectedUser?.email}`} className="w-12 h-12" />
                    <div>
                      <h2 className="text-2xl font-black tracking-tight">Authority Matrix</h2>
                      <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Configuring Access for {selectedUser?.name}</p>
                    </div>
                 </div>
              </ModalHeader>
              <ModalBody className="py-8 space-y-10">
                
                <div className="flex items-center justify-between p-6 rounded-[2rem] bg-danger/5 border border-danger/20">
                   <div className="flex items-center gap-4">
                      <ShieldAlert className="text-danger" size={24} />
                      <div>
                         <h4 className="font-black text-sm">Administrative Override</h4>
                         <p className="text-xs opacity-50">Granting full sub-admin rights bypasses modular checks.</p>
                      </div>
                   </div>
                   <Switch color="danger" />
                </div>

                <div className="space-y-4">
                   <h4 className="text-[10px] font-black uppercase tracking-widest opacity-30 flex items-center gap-2">
                       <Lock size={12} /> Granular Module Constraints
                   </h4>
                   <div className="grid gap-4">
                      {permissionModules.map((mod) => (
                         <div key={mod.id} className="flex items-center justify-between p-5 rounded-[1.5rem] bg-black/[0.02] dark:bg-white/5 border border-black/[0.05] hover:bg-black/[0.04] transition-colors cursor-pointer group">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 rounded-2xl bg-white dark:bg-dark-card shadow-sm flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                  <mod.icon size={24} strokeWidth={2.5} />
                               </div>
                               <div>
                                  <h5 className="font-black text-sm">{mod.label}</h5>
                                  <p className="text-[10px] font-medium opacity-40">{mod.desc}</p>
                               </div>
                            </div>
                            <Checkbox defaultSelected={selectedUser?.permissions.includes(mod.id)} color="primary" />
                         </div>
                      ))}
                   </div>
                </div>

              </ModalBody>
              <ModalFooter className="border-t border-black/5 pt-6">
                <Button variant="light" className="font-bold" onPress={onClose}>Discard</Button>
                <div className="flex-grow flex justify-end">
                   <Button color="primary" className="px-10 font-black h-14 shadow-xl shadow-primary/20" radius="full" onPress={onClose}>
                      Update Protocol
                   </Button>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Invite Member Modal */}
      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        radius="lg"
        classNames={{ base: "modern-card p-4" }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                 <h2 className="text-2xl font-black tracking-tight">Invite Strategic Partner</h2>
              </ModalHeader>
              <ModalBody className="py-6 space-y-6">
                 <Input label="Full Name" placeholder="e.g. Aman Gupta" labelPlacement="outside" size="lg" radius="lg" classNames={{ label: "font-black opacity-40", inputWrapper: "bg-black/5 h-14" }} />
                 <Input label="Business Email" placeholder="aman@google.com" labelPlacement="outside" size="lg" radius="lg" classNames={{ label: "font-black opacity-40", inputWrapper: "bg-black/5 h-14" }} />
                 <div className="grid grid-cols-2 gap-4">
                    <Button variant="flat" className="h-14 font-bold rounded-2xl opacity-60">Manager Role</Button>
                    <Button variant="flat" color="primary" className="h-14 font-black rounded-2xl">Staff Role</Button>
                 </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" className="font-bold" onPress={onClose}>Cancel</Button>
                <Button color="primary" className="px-8 font-black rounded-full h-12 shadow-lg shadow-primary/20">Send Invite</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
