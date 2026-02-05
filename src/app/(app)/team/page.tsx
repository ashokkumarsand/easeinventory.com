'use client';

import { useDisclosure } from '@/hooks/useDisclosure';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import {
    ArrowLeftRight,
    Camera,
    CreditCard,
    FileText,
    Fingerprint,
    Loader2,
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
const roleColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  OWNER: 'default',
  ADMIN: 'secondary',
  MANAGER: 'outline',
  STAFF: 'secondary',
  TECHNICIAN: 'default',
  DELIVERY_AGENT: 'default'
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
        onOpenChange(false);
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
           <Button variant="outline" className="font-black rounded-2xl">
              <ArrowLeftRight size={18} className="mr-2" />
              Transfer Account Ownership
           </Button>
           <Button onClick={onOpen} className="font-black px-8 shadow-xl shadow-primary/20 rounded-full">
              <UserPlus size={20} className="mr-2" />
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
           <div key={r.label} className="p-6 rounded-xl bg-card border border-border flex flex-col gap-1 hover:border-primary/20 transition-all cursor-default group">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">{r.label}</span>
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
             <Card className="bg-card border border-border hover:shadow-lg transition-shadow duration-300 overflow-visible rounded-lg">
                <CardContent className="p-6">
                   <div className="flex justify-between items-start mb-8">
                      <div className="relative">
                         <Avatar className="w-20 h-20 text-xl font-black shadow-lg">
                            <AvatarImage src={`https://i.pravatar.cc/150?u=${member.email}`} />
                            <AvatarFallback>{member.name[0]}</AvatarFallback>
                         </Avatar>
                         <span className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-4 border-white dark:border-black ${member.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                      </div>
                      <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full">
                               <MoreVertical size={20} className="opacity-30" />
                            </Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit Profile</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openPermissions(member)}>Manage Access Rights</DropdownMenuItem>
                            <DropdownMenuItem>Make Primary Owner</DropdownMenuItem>
                            <DropdownMenuItem
                               className="text-destructive"
                               onClick={() => toggleUserStatus(member.id, member.isActive)}
                            >
                               {member.isActive ? 'Revoke Access' : 'Restore Access'}
                             </DropdownMenuItem>
                          </DropdownMenuContent>
                      </DropdownMenu>
                   </div>

                   <div className="space-y-6">
                      <div>
                         <h3 className="text-xl font-black leading-tight">{member.name}</h3>
                         <p className="text-xs font-bold opacity-30 mt-1 uppercase tracking-widest">{member.email}</p>
                      </div>

                      <div className="flex items-center gap-2">
                         <Badge
                            variant={roleColors[member.role] || 'secondary'}
                            className="font-black uppercase text-[10px] px-3 h-7 tracking-widest"
                         >
                            <Shield size={12} className="mr-1" />
                            {member.role}
                         </Badge>
                         <Badge variant={member.isActive ? "default" : "destructive"} className="font-black uppercase text-[10px] opacity-40">
                            {member.isActive ? 'Active' : 'Disabled'}
                          </Badge>
                       </div>

                      <Separator className="opacity-50" />

                      <div>
                         <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Module Permissions</p>
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
                </CardContent>
             </Card>
           </motion.div>
         ))}
      </div>

      {/* Permissions Modal */}
      <Dialog open={isPermOpen} onOpenChange={onPermOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
             <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12">
                   <AvatarImage src={`https://i.pravatar.cc/150?u=${selectedUser?.email}`} />
                   <AvatarFallback>{selectedUser?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <DialogTitle>Permission Settings</DialogTitle>
                  <DialogDescription>Configuring Access for {selectedUser?.name}</DialogDescription>
                </div>
             </div>
          </DialogHeader>
          <div className="space-y-6 py-4">

            <div className="flex items-center justify-between p-4 rounded-xl bg-destructive/5 border border-destructive/20">
               <div className="flex items-center gap-4">
                  <ShieldAlert className="text-destructive" size={24} />
                  <div>
                     <h4 className="font-bold text-sm">Administrative Override</h4>
                     <p className="text-xs text-muted-foreground">Granting full sub-admin rights bypasses modular checks.</p>
                  </div>
               </div>
               <Switch />
            </div>

            <div className="space-y-4">
               <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
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
                              <p className="text-xs text-muted-foreground">{mod.desc}</p>
                           </div>
                        </div>
                        <Checkbox defaultChecked={selectedUser?.permissions.includes(mod.id)} />
                     </div>
                  ))}
               </div>
            </div>

          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => onPermOpenChange(false)}>Discard</Button>
            <Button onClick={() => onPermOpenChange(false)}>
               Save Permissions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite Member Modal */}
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
             <DialogTitle>Invite Team Member</DialogTitle>
             <DialogDescription>Add a new member to your team</DialogDescription>
          </DialogHeader>
           <div className="space-y-6 py-4">
              {/* Profile Image Upload */}
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <Avatar className="w-24 h-24 text-2xl font-black border-4 border-dashed border-black/10 group-hover:border-primary/30 transition-colors">
                    <AvatarImage src={inviteData.profileImage || undefined} />
                    <AvatarFallback>{inviteData.name?.[0] || '?'}</AvatarFallback>
                  </Avatar>
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

              <Separator />

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input placeholder="e.g. Alex Smith" value={inviteData.name} onChange={(e) => setInviteData({...inviteData, name: e.target.value})} className="h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700" />
                </div>
                <div className="space-y-2">
                  <Label>Business Email</Label>
                  <Input type="email" placeholder="alex@business.com" value={inviteData.email} onChange={(e) => setInviteData({...inviteData, email: e.target.value})} className="h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Mobile Number</Label>
                <Input placeholder="+91 98XXX XXXXX" value={inviteData.phone} onChange={(e) => setInviteData({...inviteData, phone: e.target.value})} className="h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700" />
              </div>

              <Separator />

              {/* Biometric & Access Section */}
              <div className="space-y-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Access Control</p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>RFID Token</Label>
                    <div className="relative">
                      <CreditCard size={18} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                      <Input
                        placeholder="Scan or enter token ID"
                        value={inviteData.rfidToken}
                        onChange={(e) => setInviteData({...inviteData, rfidToken: e.target.value})}
                        className="h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Fingerprint</Label>
                    <Button
                      variant="outline"
                      className="w-full h-14 font-black rounded-2xl"
                      onClick={() => alert('Fingerprint scanner integration requires device SDK. Placeholder for biometric enrollment.')}
                    >
                      <Fingerprint size={20} className="mr-2" />
                      Capture Fingerprint
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Role Selection */}
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Role</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                   {['ADMIN', 'MANAGER', 'STAFF', 'TECHNICIAN'].map(role => (
                     <Button
                      key={role}
                      variant={inviteData.role === role ? 'default' : 'ghost'}
                      className="font-semibold text-xs"
                      onClick={() => setInviteData({...inviteData, role})}
                     >
                       {role}
                     </Button>
                   ))}
                </div>
              </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleInvite} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
