'use client';

import {
    Avatar,
    Button,
    Card,
    CardBody,
    Checkbox,
    CheckboxGroup,
    Chip,
    Divider,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Tab,
    Tabs,
    useDisclosure
} from '@heroui/react';
import {
    Building,
    Edit2,
    FileText,
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
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
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
                onOpenChange();
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
                    color="warning"
                    radius="full"
                    size="lg"
                    className="font-black px-8 shadow-xl shadow-warning/20"
                    startContent={<Plus size={20} />}
                    onClick={handleCreateCustomRole}
                >
                    Create Custom Role
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Role List */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Custom Roles */}
                    {customRoles.length > 0 && (
                        <Card className="modern-card p-6" radius="lg">
                            <CardBody className="p-0 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-black uppercase tracking-widest opacity-40">Custom Roles</h3>
                                    <Chip size="sm" color="warning" variant="flat" className="text-[8px] font-black">
                                        {customRoles.length}
                                    </Chip>
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
                                                <Chip size="sm" variant="flat" color="default" className="text-[10px] font-black">
                                                    {t('users_count', { count: role.userCount })}
                                                </Chip>
                                                <Dropdown>
                                                    <DropdownTrigger>
                                                        <Button isIconOnly size="sm" variant="light">
                                                            <MoreVertical size={16} />
                                                        </Button>
                                                    </DropdownTrigger>
                                                    <DropdownMenu aria-label="Role actions">
                                                        <DropdownItem
                                                            key="edit"
                                                            startContent={<Edit2 size={14} />}
                                                            onClick={() => handleEditCustomRole(role)}
                                                        >
                                                            Edit Role
                                                        </DropdownItem>
                                                        <DropdownItem
                                                            key="delete"
                                                            className="text-danger"
                                                            color="danger"
                                                            startContent={<Trash2 size={14} />}
                                                            onClick={() => handleDeleteCustomRole(role.id)}
                                                        >
                                                            Delete Role
                                                        </DropdownItem>
                                                    </DropdownMenu>
                                                </Dropdown>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardBody>
                        </Card>
                    )}

                    {/* Predefined Roles */}
                    <Card className="modern-card p-6" radius="lg">
                        <CardBody className="p-0 space-y-4">
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
                                        <Chip size="sm" variant="flat" color="default" className="text-[10px] font-black">
                                            {t('users_count', { count: role.userCount })}
                                        </Chip>
                                    </button>
                                ))}
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Permission Matrix */}
                <div className="lg:col-span-8">
                    <Card className="modern-card p-8" radius="lg">
                        <CardBody className="p-0 space-y-6">
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
                                            variant="flat"
                                            color="warning"
                                            className="font-bold"
                                            startContent={<Edit2 size={14} />}
                                            onClick={() => handleEditCustomRole(currentCustomRole)}
                                        >
                                            Edit
                                        </Button>
                                    )}
                                    <Chip color={currentCustomRole ? 'primary' : 'warning'} variant="flat" className="font-black text-[10px]">
                                        {currentCustomRole ? 'Custom Role' : t('read_only')}
                                    </Chip>
                                </div>
                            </div>

                            {currentCustomRole?.description && (
                                <p className="text-sm opacity-60">{currentCustomRole.description}</p>
                            )}

                            <Divider />

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
                        </CardBody>
                    </Card>
                </div>
            </div>

            {/* Team Members with Custom Permissions */}
            <Card className="modern-card p-8" radius="lg">
                <CardBody className="p-0 space-y-6">
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
                                <Avatar name={member.name || member.email} radius="lg" className="bg-primary/10 text-primary font-black" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-sm truncate">{member.name || t('unnamed')}</p>
                                    <p className="text-[10px] opacity-40 truncate">{member.email}</p>
                                </div>
                                <Chip size="sm" variant="flat" color={member.permissions ? 'warning' : 'default'} className="text-[10px] font-black">
                                    {member.permissions ? t('custom') : member.role}
                                </Chip>
                            </button>
                        ))}
                    </div>
                </CardBody>
            </Card>

            {/* Permission Editor Modal */}
            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                size="4xl"
                scrollBehavior="inside"
                classNames={{ base: "modern-card" }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 p-8">
                                <h2 className="text-2xl font-black tracking-tight">
                                    {t('modal.title', { name: editingUser?.name || editingUser?.email || '' })}
                                </h2>
                                <p className="text-xs font-bold opacity-30 uppercase tracking-[0.2em]">
                                    {t('modal.subtitle')}
                                </p>
                            </ModalHeader>
                            <ModalBody className="p-8">
                                <Tabs aria-label="Permission Modules" color="warning" variant="underlined">
                                    {modules.map(module => {
                                        const Icon = ICON_MAP[module.icon] || Package;
                                        return (
                                            <Tab
                                                key={module.key}
                                                title={
                                                    <div className="flex items-center gap-2">
                                                        <Icon size={14} />
                                                        <span>{module.label}</span>
                                                    </div>
                                                }
                                            >
                                                <div className="py-6 space-y-4">
                                                    <CheckboxGroup
                                                        value={editingPermissions.filter(p => p.startsWith(module.key))}
                                                        onValueChange={(values) => {
                                                            const otherPerms = editingPermissions.filter(p => !p.startsWith(module.key));
                                                            setEditingPermissions([...otherPerms, ...values]);
                                                        }}
                                                    >
                                                        {module.permissions.map(perm => (
                                                            <Checkbox key={perm.key} value={perm.key} className="mb-2">
                                                                <div>
                                                                    <p className="font-bold text-sm">{perm.label}</p>
                                                                    <p className="text-[10px] opacity-40">{perm.description}</p>
                                                                </div>
                                                            </Checkbox>
                                                        ))}
                                                    </CheckboxGroup>
                                                </div>
                                            </Tab>
                                        );
                                    })}
                                </Tabs>
                            </ModalBody>
                            <ModalFooter className="border-t border-black/5 p-6">
                                <Button variant="light" className="font-bold h-12 px-8" onPress={onClose}>{commonT('modal.cancel')}</Button>
                                <Button
                                    variant="flat"
                                    className="font-bold h-12 px-8"
                                    onClick={() => {
                                        const role = roles.find(r => r.key === editingUser?.role);
                                        setEditingPermissions(role?.permissions || []);
                                    }}
                                >
                                    {t('modal.reset')}
                                </Button>
                                <Button
                                    color="warning"
                                    className="font-black h-12 px-10 shadow-xl shadow-warning/20"
                                    radius="full"
                                    onClick={handleSavePermissions}
                                    isLoading={isLoading}
                                >
                                    {t('modal.save')}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* Custom Role Builder Modal */}
            <RoleBuilderModal
                isOpen={isRoleModalOpen}
                onClose={() => {
                    onRoleModalOpenChange();
                    setEditingCustomRole(null);
                }}
                onSave={handleSaveCustomRole}
                modules={modules}
                existingRole={editingCustomRole}
            />
        </div>
    );
}
