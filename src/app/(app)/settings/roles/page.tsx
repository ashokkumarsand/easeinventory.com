'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDisclosure } from '@/hooks/useDisclosure';
import {
    Building,
    Edit2,
    FileText,
    Loader2,
    MoreVertical,
    Package,
    Plus,
    Settings,
    Shield,
    Trash2,
    Truck,
    UserCog,
    Users,
    Wrench
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import RoleBuilderModal from '@/components/roles/RoleBuilderModal';

interface PermissionModule {
    key: string;
    label: string;
    icon: string;
    permissions: { key: string; label: string; description: string }[];
}

interface Role {
    key: string;
    label: string;
    permissions: string[];
    userCount: number;
    isDefault: boolean;
}

interface CustomRole {
    id: string;
    name: string;
    description?: string | null;
    color?: string | null;
    permissions: string[];
    userCount: number;
    isDefault: boolean;
}

const ICON_MAP: Record<string, any> = {
    Package, Wrench, FileText, Truck, Users, Building, UserCog, Settings, Shield
};

export default function RolesManagementPage() {
    const t = useTranslations('Roles');
    const commonT = useTranslations('HR'); // For standard modal buttons
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
    const { isOpen: isRoleModalOpen, onOpen: onRoleModalOpen, onOpenChange: onRoleModalOpenChange } = useDisclosure();
    const [roles, setRoles] = useState<Role[]>([]);
    const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);
    const [modules, setModules] = useState<PermissionModule[]>([]);
    const [teamMembers, setTeamMembers] = useState<any[]>([]);
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [selectedCustomRole, setSelectedCustomRole] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Permission editor state
    const [editingUser, setEditingUser] = useState<any>(null);
    const [editingPermissions, setEditingPermissions] = useState<string[]>([]);

    // Custom role editor state
    const [editingCustomRole, setEditingCustomRole] = useState<CustomRole | null>(null);

    useEffect(() => {
        fetchRoles();
        fetchCustomRoles();
        fetchTeamMembers();
    }, []);

    const fetchRoles = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/roles');
            const data = await response.json();
            setRoles(data.roles || []);
            setModules(data.modules || []);
            if (data.roles?.length > 0) {
                setSelectedRole(data.roles[0].key);
            }
        } catch (error) {
            console.error('Fetch roles error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCustomRoles = async () => {
        try {
            const response = await fetch('/api/custom-roles');
            const data = await response.json();
            setCustomRoles(data.customRoles || []);
        } catch (error) {
            console.error('Fetch custom roles error:', error);
        }
    };

    const fetchTeamMembers = async () => {
        try {
            const response = await fetch('/api/users');
            const data = await response.json();
            setTeamMembers(data.users || []);
        } catch (error) {
            console.error('Fetch team error:', error);
        }
    };

    const openPermissionEditor = (user: any) => {
        setEditingUser(user);
        const role = roles.find(r => r.key === user.role);
        setEditingPermissions(user.permissions || role?.permissions || []);
        onOpen();
    };

    const handleSavePermissions = async () => {
        if (!editingUser) return;
        setIsLoading(true);
        try {
            const response = await fetch('/api/roles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: editingUser.id,
                    permissions: editingPermissions
                }),
            });

            if (response.ok) {
                fetchTeamMembers();
                onClose();
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to update permissions');
            }
        } catch (error) {
            alert('Error updating permissions');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveCustomRole = async (roleData: { id?: string; name: string; description?: string | null; color?: string | null; permissions: string[] }) => {
        const method = roleData.id ? 'PATCH' : 'POST';
        const url = roleData.id ? `/api/custom-roles/${roleData.id}` : '/api/custom-roles';

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(roleData),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to save custom role');
        }

        fetchCustomRoles();
        setEditingCustomRole(null);
    };

    const handleDeleteCustomRole = async (roleId: string) => {
        if (!confirm('Are you sure you want to delete this custom role?')) return;

        try {
            const response = await fetch(`/api/custom-roles/${roleId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchCustomRoles();
                if (selectedCustomRole === roleId) {
                    setSelectedCustomRole(null);
                }
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to delete custom role');
            }
        } catch (error) {
            alert('Error deleting custom role');
        }
    };

    const handleEditCustomRole = (role: CustomRole) => {
        setEditingCustomRole(role);
        onRoleModalOpen();
    };

    const handleCreateCustomRole = () => {
        setEditingCustomRole(null);
        onRoleModalOpen();
    };

    const currentRole = roles.find(r => r.key === selectedRole);
    const currentCustomRole = selectedCustomRole ? customRoles.find(r => r.id === selectedCustomRole) : null;
    const displayRole = currentCustomRole || currentRole;

    const handlePermissionChange = (moduleKey: string, permKey: string, checked: boolean) => {
        if (checked) {
            setEditingPermissions([...editingPermissions, permKey]);
        } else {
            setEditingPermissions(editingPermissions.filter(p => p !== permKey));
        }
    };

    const getInitials = (name: string | null | undefined) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-warning/10 flex items-center justify-center text-warning">
                            <Shield size={22} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-warning">{t('title')}</h1>
                    </div>
                    <p className="text-black/40 dark:text-white/40 font-bold ml-1">{t('subtitle')}</p>
                </div>
                <Button
                    className="font-black px-8 shadow-xl shadow-warning/20 rounded-full bg-warning text-warning-foreground hover:bg-warning/90"
                    size="lg"
                    onClick={handleCreateCustomRole}
                >
                    <Plus size={20} className="mr-2" />
                    Create Custom Role
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Role List */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Custom Roles */}
                    {customRoles.length > 0 && (
                        <Card className="modern-card p-6 rounded-lg">
                            <CardContent className="p-0 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-black uppercase tracking-widest opacity-40">Custom Roles</h3>
                                    <Badge variant="secondary" className="bg-warning/10 text-warning text-[8px] font-black">
                                        {customRoles.length}
                                    </Badge>
                                </div>
                                <div className="space-y-2">
                                    {customRoles.map(role => (
                                        <div
                                            key={role.id}
                                            className={`p-4 rounded-2xl transition-all flex items-center justify-between ${
                                                selectedCustomRole === role.id
                                                    ? 'bg-warning/10 border-2 border-warning'
                                                    : 'bg-black/[0.02] border-2 border-transparent hover:bg-black/[0.04]'
                                            }`}
                                        >
                                            <button
                                                onClick={() => {
                                                    setSelectedCustomRole(role.id);
                                                    setSelectedRole('');
                                                }}
                                                className="flex-1 text-left"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-3 h-3 rounded-full"
                                                        style={{ backgroundColor: role.color || '#6A3BF6' }}
                                                    />
                                                    <p className="font-black text-sm">{role.name}</p>
                                                </div>
                                                <p className="text-[10px] font-bold opacity-40 mt-1">
                                                    {t('permissions_count', { count: role.permissions.length })}
                                                </p>
                                            </button>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="text-[10px] font-black">
                                                    {t('users_count', { count: role.userCount })}
                                                </Badge>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreVertical size={16} />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuItem onClick={() => handleEditCustomRole(role)}>
                                                            <Edit2 size={14} className="mr-2" />
                                                            Edit Role
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-destructive"
                                                            onClick={() => handleDeleteCustomRole(role.id)}
                                                        >
                                                            <Trash2 size={14} className="mr-2" />
                                                            Delete Role
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Predefined Roles */}
                    <Card className="modern-card p-6 rounded-lg">
                        <CardContent className="p-0 space-y-4">
                            <h3 className="text-sm font-black uppercase tracking-widest opacity-40">{t('predefined_roles')}</h3>
                            <div className="space-y-2">
                                {roles.map(role => (
                                    <button
                                        key={role.key}
                                        onClick={() => {
                                            setSelectedRole(role.key);
                                            setSelectedCustomRole(null);
                                        }}
                                        className={`w-full p-4 rounded-2xl text-left transition-all flex items-center justify-between ${
                                            selectedRole === role.key && !selectedCustomRole
                                                ? 'bg-warning/10 border-2 border-warning'
                                                : 'bg-black/[0.02] border-2 border-transparent hover:bg-black/[0.04]'
                                        }`}
                                    >
                                        <div>
                                            <p className="font-black text-sm">{role.label}</p>
                                            <p className="text-[10px] font-bold opacity-40">
                                                {t('permissions_count', { count: role.permissions.length })}
                                            </p>
                                        </div>
                                        <Badge variant="secondary" className="text-[10px] font-black">
                                            {t('users_count', { count: role.userCount })}
                                        </Badge>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Permission Matrix */}
                <div className="lg:col-span-8">
                    <Card className="modern-card p-8 rounded-lg">
                        <CardContent className="p-0 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {currentCustomRole && (
                                        <div
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: currentCustomRole.color || '#6A3BF6' }}
                                        />
                                    )}
                                    <h3 className="text-xl font-black tracking-tight">
                                        {currentCustomRole
                                            ? currentCustomRole.name
                                            : t('permissions_title', { role: currentRole?.label || '' })}
                                    </h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    {currentCustomRole && (
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="font-bold bg-warning/10 text-warning hover:bg-warning/20"
                                            onClick={() => handleEditCustomRole(currentCustomRole)}
                                        >
                                            <Edit2 size={14} className="mr-2" />
                                            Edit
                                        </Button>
                                    )}
                                    <Badge variant={currentCustomRole ? 'default' : 'secondary'} className={currentCustomRole ? '' : 'bg-warning/10 text-warning'}>
                                        {currentCustomRole ? 'Custom Role' : t('read_only')}
                                    </Badge>
                                </div>
                            </div>

                            {currentCustomRole?.description && (
                                <p className="text-sm opacity-60">{currentCustomRole.description}</p>
                            )}

                            <Separator />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {modules.map(module => {
                                    const Icon = ICON_MAP[module.icon] || Package;
                                    const rolePermissions = displayRole?.permissions || [];
                                    const modulePermissions = module.permissions.filter(p =>
                                        rolePermissions.includes(p.key)
                                    );
                                    const hasAny = modulePermissions.length > 0;

                                    return (
                                        <div key={module.key} className={`p-4 rounded-2xl border ${
                                            hasAny ? 'bg-success/5 border-success/20' : 'bg-black/[0.02] border-black/5'
                                        }`}>
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                                                    hasAny ? 'bg-success/20 text-success' : 'bg-black/5 opacity-40'
                                                }`}>
                                                    <Icon size={16} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-sm">{module.label}</p>
                                                    <p className="text-[10px] opacity-40">
                                                        {t('enabled_count', { count: modulePermissions.length, total: module.permissions.length })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                {module.permissions.map(perm => {
                                                    const isEnabled = rolePermissions.includes(perm.key);
                                                    return (
                                                        <div key={perm.key} className="flex items-center gap-2">
                                                            <div className={`w-2 h-2 rounded-full ${
                                                                isEnabled ? 'bg-success' : 'bg-black/10'
                                                            }`} />
                                                            <span className={`text-xs ${
                                                                isEnabled ? 'font-bold' : 'opacity-40'
                                                            }`}>{perm.label}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Team Members with Custom Permissions */}
            <Card className="modern-card p-8 rounded-lg">
                <CardContent className="p-0 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black tracking-tight">{t('overrides_title')}</h3>
                        <p className="text-xs font-bold opacity-40">{t('overrides_hint')}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {teamMembers.map(member => (
                            <button
                                key={member.id}
                                onClick={() => openPermissionEditor(member)}
                                className="p-4 rounded-2xl bg-black/[0.02] border border-black/5 text-left hover:bg-black/[0.04] transition-all flex items-center gap-4"
                            >
                                <Avatar className="bg-primary/10 text-primary font-black rounded-lg h-10 w-10">
                                    <AvatarFallback className="bg-primary/10 text-primary font-black rounded-lg">
                                        {getInitials(member.name || member.email)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-sm truncate">{member.name || t('unnamed')}</p>
                                    <p className="text-[10px] opacity-40 truncate">{member.email}</p>
                                </div>
                                <Badge variant="secondary" className={member.permissions ? 'bg-warning/10 text-warning' : ''}>
                                    {member.permissions ? t('custom') : member.role}
                                </Badge>
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Permission Editor Modal */}
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto modern-card">
                    <DialogHeader className="p-8 pb-0">
                        <DialogTitle className="text-2xl font-black tracking-tight">
                            {t('modal.title', { name: editingUser?.name || editingUser?.email || '' })}
                        </DialogTitle>
                        <DialogDescription className="text-xs font-bold opacity-30 uppercase tracking-[0.2em]">
                            {t('modal.subtitle')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-8">
                        <Tabs defaultValue={modules[0]?.key} className="w-full">
                            <TabsList className="w-full justify-start border-b border-soft rounded-none bg-transparent h-auto p-0 mb-6">
                                {modules.map(module => {
                                    const Icon = ICON_MAP[module.icon] || Package;
                                    return (
                                        <TabsTrigger
                                            key={module.key}
                                            value={module.key}
                                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-warning data-[state=active]:text-warning data-[state=active]:shadow-none"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Icon size={14} />
                                                <span>{module.label}</span>
                                            </div>
                                        </TabsTrigger>
                                    );
                                })}
                            </TabsList>
                            {modules.map(module => (
                                <TabsContent key={module.key} value={module.key}>
                                    <div className="py-6 space-y-4">
                                        {module.permissions.map(perm => (
                                            <div key={perm.key} className="flex items-start gap-3 mb-4">
                                                <Checkbox
                                                    id={perm.key}
                                                    checked={editingPermissions.includes(perm.key)}
                                                    onCheckedChange={(checked) =>
                                                        handlePermissionChange(module.key, perm.key, checked as boolean)
                                                    }
                                                />
                                                <label htmlFor={perm.key} className="cursor-pointer">
                                                    <p className="font-bold text-sm">{perm.label}</p>
                                                    <p className="text-[10px] opacity-40">{perm.description}</p>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </TabsContent>
                            ))}
                        </Tabs>
                    </div>
                    <DialogFooter className="border-t border-black/5 p-6">
                        <Button variant="ghost" className="font-bold h-12 px-8" onClick={onClose}>{commonT('modal.cancel')}</Button>
                        <Button
                            variant="secondary"
                            className="font-bold h-12 px-8"
                            onClick={() => {
                                const role = roles.find(r => r.key === editingUser?.role);
                                setEditingPermissions(role?.permissions || []);
                            }}
                        >
                            {t('modal.reset')}
                        </Button>
                        <Button
                            className="font-black h-12 px-10 shadow-xl shadow-warning/20 rounded-full bg-warning text-warning-foreground hover:bg-warning/90"
                            onClick={handleSavePermissions}
                            disabled={isLoading}
                        >
                            {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            {t('modal.save')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Custom Role Builder Modal */}
            <RoleBuilderModal
                isOpen={isRoleModalOpen}
                onClose={() => {
                    onRoleModalOpenChange(false);
                    setEditingCustomRole(null);
                }}
                onSave={handleSaveCustomRole}
                modules={modules}
                existingRole={editingCustomRole}
            />
        </div>
    );
}
