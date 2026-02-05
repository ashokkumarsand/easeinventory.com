'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
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

    const getInitials = (name: string | null) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Staff Management</h1>
                    <p className="text-foreground/50 font-medium">Manage system-wide administrative access and portal roles.</p>
                </div>
                <Button className="rounded-full font-bold">
                    <UserPlus size={18} />
                    Invite Staff
                </Button>
            </div>

            <Card className="modern-card rounded-lg">
                <CardContent className="p-0">
                    <div className="p-4 border-b border-border flex gap-4">
                        <div className="relative max-w-md flex-1">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" />
                            <Input
                                placeholder="Search by name or email..."
                                className="pl-10 rounded-lg"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full" aria-label="Staff table">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-4 px-6 text-xs font-bold uppercase text-foreground/50">STRATEGIST</th>
                                    <th className="text-left py-4 px-6 text-xs font-bold uppercase text-foreground/50">ROLE</th>
                                    <th className="text-left py-4 px-6 text-xs font-bold uppercase text-foreground/50">WORKSPACE</th>
                                    <th className="text-left py-4 px-6 text-xs font-bold uppercase text-foreground/50">STATUS</th>
                                    <th className="text-center py-4 px-6 text-xs font-bold uppercase text-foreground/50">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="py-8 px-6">
                                            <div className="space-y-4">
                                                {[1, 2, 3].map((i) => (
                                                    <div key={i} className="flex items-center gap-4">
                                                        <Skeleton className="h-8 w-8 rounded-full" />
                                                        <Skeleton className="h-4 w-full" />
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-8 px-6 text-center text-foreground/50">
                                            No staff members found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarFallback className="text-xs">
                                                            {getInitials(user.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold">{user.name}</span>
                                                        <span className="text-xs text-foreground/40">{user.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <Select
                                                    value={user.role}
                                                    onValueChange={(value) => handleRoleUpdate(user.id, value)}
                                                >
                                                    <SelectTrigger className="w-40 rounded-lg">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {ROLES.map((role) => (
                                                            <SelectItem key={role.value} value={role.value}>
                                                                {role.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium">{user.tenant?.name || 'System'}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <Badge
                                                    variant={user.isActive ? 'default' : 'destructive'}
                                                    className="font-bold uppercase text-[10px]"
                                                >
                                                    {user.isActive ? 'Active' : 'Disabled'}
                                                </Badge>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button variant="ghost" size="icon" className="rounded-full">
                                                        <Mail size={16} className="text-foreground/40" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="rounded-full">
                                                        <Shield size={16} className="text-foreground/40" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
