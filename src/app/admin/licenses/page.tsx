'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
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
                    <Button variant="secondary" className="font-bold">
                        <Mail size={18} className="mr-2" />
                        Configure Notifications
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="py-6 flex items-center gap-4">
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
                    </CardContent>
                </Card>
                <Card className="bg-destructive/5 border-destructive/20">
                    <CardContent className="py-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-destructive/20 flex items-center justify-center text-destructive">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Expired Licenses</p>
                            <h3 className="text-2xl font-black">{tenants.filter(t => {
                                const days = getDaysRemaining(t.planExpiresAt);
                                return days !== null && days <= 0;
                            }).length}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-green-500/5 border-green-500/20">
                    <CardContent className="py-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center text-green-600">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Active Subscriptions</p>
                            <h3 className="text-2xl font-black">{tenants.filter(t => t.plan !== 'FREE' && t.plan !== 'TRIAL').length}</h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex gap-4 mb-4">
                <div className="relative max-w-md">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                    <Input
                        placeholder="Search clients..."
                        className="pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>CLIENT / TENANT</TableHead>
                        <TableHead>PLAN</TableHead>
                        <TableHead>EXPIRY DATE</TableHead>
                        <TableHead>STATUS</TableHead>
                        <TableHead className="text-center">ACTIONS</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredTenants.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                                {isLoading ? "Loading..." : "No license data found."}
                            </TableCell>
                        </TableRow>
                    ) : (
                        filteredTenants.map((item) => {
                            const daysRemaining = getDaysRemaining(item.planExpiresAt);
                            return (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-bold">{item.name}</span>
                                            <span className="text-xs text-muted-foreground">{item.slug}.easeinventory.com</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={item.plan === 'ENTERPRISE' ? 'secondary' : item.plan === 'BUSINESS' ? 'default' : 'outline'}
                                            className="font-black"
                                        >
                                            {item.plan}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm font-medium">
                                            {item.planExpiresAt ? new Date(item.planExpiresAt).toLocaleDateString() : 'Never'}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {daysRemaining !== null ? (
                                            <Badge
                                                variant={daysRemaining <= 0 ? 'destructive' : daysRemaining <= 7 ? 'secondary' : 'default'}
                                                className="font-bold"
                                            >
                                                {daysRemaining <= 0 ? 'Expired' : `${daysRemaining} days left`}
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline">LIFETIME</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 justify-center">
                                            <Button size="sm" variant="secondary" className="font-bold italic">Extend</Button>
                                            <Button size="sm" variant="secondary" className="font-bold underline">Billing</Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
