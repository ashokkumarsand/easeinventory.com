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
    Camera,
    CreditCard,
    FileText,
    Fingerprint,
    Lock,
    MoreVertical,
    Package,
    Shield,
    ShieldAlert,
    UserPlus,
    Users,
    Wrench
} from 'lucide-react';
import { useEffect, useState } from 'react';

// Role color mapping
const roleColors: Record<string, "primary" | "secondary" | "success" | "warning" | "danger" | "default"> = {
  OWNER: 'primary',
  ADMIN: 'secondary',
  MANAGER: 'warning',
  STAFF: 'default',
  TECHNICIAN: 'success',
  DELIVERY_AGENT: 'success'
};

const permissionModules = [
  { id: 'inventory', label: 'Inventory Management', icon: Package, desc: 'Add/Edit stock, valuation, pricing' },
  { id: 'repairs', label: 'Service Center', icon: Wrench, desc: 'Handle repair tickets, assign techs' },
  { id: 'invoices', label: 'Finance & Invoicing', icon: FileText, desc: 'Generate bills, payment tracking' },
  { id: 'hr', label: 'People & Attendance', icon: Users, desc: 'Employee records, HR, Payouts' },
];

export default function TeamPage() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isPermOpen, onOpen: onPermOpen, onOpenChange: onPermOpenChange } = useDisclosure();
  const [team, setTeam] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [inviteData, setInviteData] = useState({ 
    name: '', 
    email: '', 
    role: 'STAFF', 
    phone: '', 
    password: 'Password@123',
    profileImage: '',
    rfidToken: '',
    accessZones: [] as string[]
  });

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setTeam(data.users || []);
    } catch (error) {
      console.error('Fetch team error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inviteData),
      });

      if (response.ok) {
        fetchTeam();
        onOpenChange();
        setInviteData({ name: '', email: '', role: 'STAFF', phone: '', password: 'Password@123', profileImage: '', rfidToken: '', accessZones: [] });
      } else {
        const data = await response.json();
        alert(data.message || 'Invitation failed');
      }
    } catch (error) {
      alert('Error inviting member');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (response.ok) fetchTeam();
    } catch (error) {
      alert('Error updating status');
    }
  };

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
              <h1 className="text-3xl font-black tracking-tight">Team Management</h1>
           </div>
           <p className="text-black/40 dark:text-white/40 font-bold ml-1">Manage team roles and system permissions securely.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="flat" color="primary" className="font-black rounded-2xl" startContent={<ArrowLeftRight size={18} />}>
              Transfer Account Ownership
           </Button>
           <Button color="primary" radius="full" size="lg" className="font-black px-8 shadow-xl shadow-primary/20" startContent={<UserPlus size={20} />} onClick={onOpen}>
              Invite Member
           </Button>
        </div>
      </div>

      {/* Role Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { label: 'Owners', count: team.filter(u => u.role === 'OWNER').length, color: 'primary' },
           { label: 'Administrators', count: team.filter(u => u.role === 'ADMIN').length, color: 'secondary' },
           { label: 'Total Personnel', count: team.length, color: 'success' },
           { label: 'Active Sessions', count: team.filter(u => u.isActive).length, color: 'default' },
         ].map((r) => (
           <div key={r.label} className="p-6 rounded-xl bg-card border border-soft flex flex-col gap-1 hover:border-primary/20 transition-all cursor-default group">
              <span className="text-xs font-bold uppercase tracking-wider text-muted group-hover:text-foreground transition-colors">{r.label}</span>
              <h3 className="text-3xl font-black">{r.count}</h3>
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
             <Card className="bg-card border border-soft hover:shadow-lg transition-shadow duration-300 overflow-visible" radius="lg">
                <CardBody className="p-6">
                   <div className="flex justify-between items-start mb-8">
                      <div className="relative">
                         <Badge content="" color={member.isActive ? 'success' : 'danger'} shape="circle" placement="bottom-right" className="border-4 border-white dark:border-black w-5 h-5">
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
                            <DropdownItem key="toggleStatus" className="text-danger" color="danger" onClick={() => toggleUserStatus(member.id, member.isActive)}>
                               {member.isActive ? 'Revoke Access' : 'Restore Access'}
                             </DropdownItem>
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
                            color={roleColors[member.role] || 'default'}
                            className="font-black uppercase text-[10px] px-3 h-7 tracking-widest"
                            startContent={<Shield size={12} />}
                         >
                            {member.role}
                         </Chip>
                         <Chip size="sm" variant="dot" color={member.isActive ? "success" : "danger"} className="font-black uppercase text-[10px] opacity-40">
                            {member.isActive ? 'Active' : 'Disabled'}
                          </Chip>
                       </div>

                      <Divider className="opacity-50" />

                      <div>
                         <p className="text-xs font-bold uppercase tracking-wider text-muted mb-3">Module Permissions</p>
                         <div className="flex flex-wrap gap-2">
                            {member.permissions.map((p: string) => (
                               <div key={p} className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                  <span className="text-xs font-bold uppercase">{member.role} Full Access</span>
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
                 <div className="flex items-center gap-4">
                    <Avatar src={`https://i.pravatar.cc/150?u=${selectedUser?.email}`} className="w-12 h-12" />
                    <div>
                      <h2 className="text-xl font-bold">Permission Settings</h2>
                      <p className="text-sm text-muted font-normal">Configuring Access for {selectedUser?.name}</p>
                    </div>
                 </div>
              </ModalHeader>
              <ModalBody className="space-y-6">

                <div className="flex items-center justify-between p-4 rounded-xl bg-danger/5 border border-danger/20">
                   <div className="flex items-center gap-4">
                      <ShieldAlert className="text-danger" size={24} />
                      <div>
                         <h4 className="font-bold text-sm">Administrative Override</h4>
                         <p className="text-xs text-muted">Granting full sub-admin rights bypasses modular checks.</p>
                      </div>
                   </div>
                   <Switch color="danger" />
                </div>

                <div className="space-y-4">
                   <h4 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-2">
                       <Lock size={12} /> Granular Module Constraints
                   </h4>
                   <div className="grid gap-3">
                      {permissionModules.map((mod) => (
                         <div key={mod.id} className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 hover:border-primary/30 transition-colors cursor-pointer group">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                                  <mod.icon size={20} strokeWidth={2.5} />
                                </div>
                               <div>
                                  <h5 className="font-bold text-sm">{mod.label}</h5>
                                  <p className="text-xs text-muted">{mod.desc}</p>
                               </div>
                            </div>
                            <Checkbox defaultSelected={selectedUser?.permissions.includes(mod.id)} color="primary" />
                         </div>
                      ))}
                   </div>
                </div>

              </ModalBody>
              <ModalFooter>
                <Button variant="flat" className="font-semibold" onPress={onClose}>Discard</Button>
                <Button color="primary" className="font-semibold" onPress={onClose}>
                   Save Permissions
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Invite Member Modal */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
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
                 <h2 className="text-xl font-bold">Invite Team Member</h2>
                 <p className="text-sm text-muted font-normal">Add a new member to your team</p>
              </ModalHeader>
               <ModalBody className="space-y-6">
                  {/* Profile Image Upload */}
                  <div className="flex items-center gap-6">
                    <div className="relative group">
                      <Avatar 
                        src={inviteData.profileImage || undefined}
                        className="w-24 h-24 text-2xl font-black border-4 border-dashed border-black/10 group-hover:border-primary/30 transition-colors"
                        name={inviteData.name?.[0] || '?'}
                      />
                      <button 
                        className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          // TODO: Implement file picker
                          const url = prompt('Enter image URL (or implement file upload):');
                          if (url) setInviteData({...inviteData, profileImage: url});
                        }}
                      >
                        <Camera size={24} className="text-white" />
                      </button>
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Profile Photo</p>
                      <p className="text-sm opacity-60">Upload a professional photo for easy identification.</p>
                    </div>
                  </div>

                  <Divider />

                  <div className="grid md:grid-cols-2 gap-6">
                    <Input label="Full Name" placeholder="e.g. Alex Smith" value={inviteData.name} onValueChange={(val) => setInviteData({...inviteData, name: val})} labelPlacement="outside" size="lg" radius="lg" classNames={{ inputWrapper: "h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700" }} />
                    <Input label="Business Email" type="email" placeholder="alex@business.com" value={inviteData.email} onValueChange={(val) => setInviteData({...inviteData, email: val})} labelPlacement="outside" size="lg" radius="lg" classNames={{ inputWrapper: "h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700" }} />
                  </div>
                  
                  <Input label="Mobile Number" placeholder="+91 98XXX XXXXX" value={inviteData.phone} onValueChange={(val) => setInviteData({...inviteData, phone: val})} labelPlacement="outside" size="lg" radius="lg" classNames={{ inputWrapper: "h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700" }} />

                  <Divider />

                  {/* Biometric & Access Section */}
                  <div className="space-y-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted">Access Control</p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input 
                        label="RFID Token" 
                        placeholder="Scan or enter token ID" 
                        value={inviteData.rfidToken} 
                        onValueChange={(val) => setInviteData({...inviteData, rfidToken: val})} 
                        labelPlacement="outside" 
                        size="lg" 
                        radius="lg" 
                        startContent={<CreditCard size={18} className="opacity-30" />}
                        classNames={{ inputWrapper: "h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700" }} 
                      />
                      
                      <div className="space-y-2">
                        <label className="font-black opacity-40 text-sm">Fingerprint</label>
                        <Button 
                          variant="flat" 
                          color="primary" 
                          className="w-full h-14 font-black rounded-2xl"
                          startContent={<Fingerprint size={20} />}
                          onClick={() => alert('Fingerprint scanner integration requires device SDK. Placeholder for biometric enrollment.')}
                        >
                          Capture Fingerprint
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Divider />

                  {/* Role Selection */}
                  <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted">Select Role</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                       {['ADMIN', 'MANAGER', 'STAFF', 'TECHNICIAN'].map(role => (
                         <Button
                          key={role}
                          variant={inviteData.role === role ? 'flat' : 'light'}
                          color={inviteData.role === role ? 'primary' : 'default'}
                          className="font-semibold text-xs"
                          onClick={() => setInviteData({...inviteData, role})}
                         >
                           {role}
                         </Button>
                       ))}
                    </div>
                  </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" className="font-semibold" onPress={onClose}>Cancel</Button>
                <Button color="primary" className="font-semibold" onClick={handleInvite} isLoading={isLoading}>Send Invite</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
