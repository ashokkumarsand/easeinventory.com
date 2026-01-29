'use client';

import {
    Avatar,
    Button,
    Card,
    CardBody,
    Chip,
    Input,
    Select,
    SelectItem,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow
} from '@heroui/react';
import { Mail, Search, Shield, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';

interface User {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    tenant: { name: string } | null;
    isActive: boolean;
}

const ROLES = [
    { label: 'Super Admin', value: 'SUPER_ADMIN' },
    { label: 'Owner', value: 'OWNER' },
    { label: 'Manager', value: 'MANAGER' },
    { label: 'Staff', value: 'STAFF' },
];

export default function StaffManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/staff');
            const data = await response.json();
            setUsers(Array.isArray(data.users) ? data.users : []);
        } catch (error) {
            console.error('Fetch users error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRoleUpdate = async (userId: string, newRole: string) => {
        try {
            const response = await fetch(`/api/admin/staff/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole }),
            });

            if (response.ok) {
                setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            }
        } catch (error) {
            alert('Failed to update role');
        }
    };

    const filteredUsers = users.filter(user => 
        (user.name?.toLowerCase().includes(search.toLowerCase()) || 
         user.email?.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Staff Management</h1>
                    <p className="text-foreground/50 font-medium">Manage system-wide administrative access and portal roles.</p>
                </div>
                <Button color="primary" radius="full" startContent={<UserPlus size={18} />} className="font-bold">
                    Invite Staff
                </Button>
            </div>

            <Card className="modern-card" radius="lg">
                <CardBody className="p-0">
                    <div className="p-4 border-b border-divider flex gap-4">
                        <Input
                            placeholder="Search by name or email..."
                            size="md"
                            radius="lg"
                            startContent={<Search size={18} className="text-foreground/30" />}
                            className="max-w-md"
                            value={search}
                            onValueChange={setSearch}
                        />
                    </div>
                    
                    <Table aria-label="Staff table" removeWrapper>
                        <TableHeader>
                            <TableColumn>STRATEGIST</TableColumn>
                            <TableColumn>ROLE</TableColumn>
                            <TableColumn>WORKSPACE</TableColumn>
                            <TableColumn>STATUS</TableColumn>
                            <TableColumn align="center">ACTIONS</TableColumn>
                        </TableHeader>
                        <TableBody isLoading={isLoading} emptyContent="No staff members found.">
                            {filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar name={user.name || ''} size="sm" />
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold">{user.name}</span>
                                                <span className="text-xs text-foreground/40">{user.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            size="sm"
                                            radius="lg"
                                            selectedKeys={[user.role]}
                                            onSelectionChange={(keys) => handleRoleUpdate(user.id, Array.from(keys)[0] as string)}
                                            className="w-40"
                                            aria-label="Selection role"
                                        >
                                            {ROLES.map((role) => (
                                                <SelectItem key={role.value}>
                                                    {role.label}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">{user.tenant?.name || 'System'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            size="sm" 
                                            variant="flat" 
                                            color={user.isActive ? 'success' : 'danger'}
                                            className="font-bold uppercase text-[10px]"
                                        >
                                            {user.isActive ? 'Active' : 'Disabled'}
                                        </Chip>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-center gap-2">
                                            <Button isIconOnly size="sm" variant="light" radius="full">
                                                <Mail size={16} className="text-foreground/40" />
                                            </Button>
                                            <Button isIconOnly size="sm" variant="light" radius="full">
                                                <Shield size={16} className="text-foreground/40" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>
        </div>
    );
}
