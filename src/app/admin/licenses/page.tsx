'use client';

import {
    Button,
    Card,
    CardBody,
    Chip,
    Input,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow
} from "@heroui/react";
import { AlertCircle, Calendar, Clock, Mail, Search } from "lucide-react";
import { useEffect, useState } from 'react';

export default function LicenseRegistryPage() {
    const [tenants, setTenants] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchLicenses = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/licenses');
            const data = await res.json();
            setTenants(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch licenses:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLicenses();
    }, []);

    const filteredTenants = tenants.filter(t => 
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.slug?.toLowerCase().includes(search.toLowerCase())
    );

    const getDaysRemaining = (date: string) => {
        if (!date) return null;
        const diff = new Date(date).getTime() - new Date().getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black tracking-tight">License Registry</h2>
                    <p className="text-foreground/60 font-medium">Monitor active subscriptions and plan expiries</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="flat" color="primary" className="font-bold" startContent={<Mail size={18} />}>
                        Configure Notifications
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="modern-card bg-primary/5 border-primary/20">
                    <CardBody className="py-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Expiring Soon (7 Days)</p>
                            <h3 className="text-2xl font-black">{tenants.filter(t => {
                                const days = getDaysRemaining(t.planExpiresAt);
                                return days !== null && days <= 7 && days > 0;
                            }).length}</h3>
                        </div>
                    </CardBody>
                </Card>
                <Card className="modern-card bg-danger/5 border-danger/20">
                    <CardBody className="py-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-danger/20 flex items-center justify-center text-danger">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Expired Licenses</p>
                            <h3 className="text-2xl font-black">{tenants.filter(t => {
                                const days = getDaysRemaining(t.planExpiresAt);
                                return days !== null && days <= 0;
                            }).length}</h3>
                        </div>
                    </CardBody>
                </Card>
                <Card className="modern-card bg-success/5 border-success/20">
                    <CardBody className="py-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-success/20 flex items-center justify-center text-success">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Active Subscriptions</p>
                            <h3 className="text-2xl font-black">{tenants.filter(t => t.plan !== 'FREE').length}</h3>
                        </div>
                    </CardBody>
                </Card>
            </div>

            <div className="flex gap-4 mb-4">
                <Input 
                    placeholder="Search clients..." 
                    startContent={<Search size={18} className="opacity-30" />}
                    className="max-w-md"
                    value={search}
                    onValueChange={setSearch}
                />
            </div>

            <Table aria-label="Tenant licenses">
                <TableHeader>
                    <TableColumn>CLIENT / TENANT</TableColumn>
                    <TableColumn>PLAN</TableColumn>
                    <TableColumn>EXPIRY DATE</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                    <TableColumn align="center">ACTIONS</TableColumn>
                </TableHeader>
                <TableBody 
                    emptyContent={isLoading ? "Loading..." : "No license data found."}
                    items={filteredTenants}
                >
                    {(item) => {
                        const daysRemaining = getDaysRemaining(item.planExpiresAt);
                        return (
                            <TableRow key={item.id}>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-bold">{item.name}</span>
                                        <span className="text-tiny text-foreground/40">{item.slug}.easeinventory.com</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        color={item.plan === 'ENTERPRISE' ? 'secondary' : item.plan === 'BUSINESS' ? 'primary' : 'default'} 
                                        variant="flat" 
                                        size="sm"
                                        className="font-black"
                                    >
                                        {item.plan}
                                    </Chip>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm font-medium">
                                        {item.planExpiresAt ? new Date(item.planExpiresAt).toLocaleDateString() : 'Never'}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {daysRemaining !== null ? (
                                        <Chip 
                                            color={daysRemaining <= 0 ? 'danger' : daysRemaining <= 7 ? 'warning' : 'success'} 
                                            size="sm" 
                                            variant="dot"
                                            className="font-bold"
                                        >
                                            {daysRemaining <= 0 ? 'Expired' : `${daysRemaining} days left`}
                                        </Chip>
                                    ) : (
                                        <Chip size="sm" variant="dot">LIFETIME</Chip>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 justify-center">
                                        <Button size="sm" variant="flat" className="font-bold italic">Extend</Button>
                                        <Button size="sm" variant="flat" color="primary" className="font-bold underline">Billing</Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    }}
                </TableBody>
            </Table>
        </div>
    );
}
