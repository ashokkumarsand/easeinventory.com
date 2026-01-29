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
} from '@heroui/react';
import { Building, Calendar, Rocket, Search, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function WaitlistManagementPage() {
    const [entries, setEntries] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchWaitlist = async () => {
            try {
                const res = await fetch('/api/waitlist');
                const data = await res.json();
                setEntries(data.entries || []);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchWaitlist();
    }, []);

    const filteredEntries = entries.filter(e => 
        e.email?.toLowerCase().includes(search.toLowerCase()) || 
        e.name?.toLowerCase().includes(search.toLowerCase()) ||
        e.businessName?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-8 space-y-10 selection:bg-primary selection:text-black">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-lg shadow-primary/20">
                            <Rocket size={24} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-4xl font-black tracking-tight uppercase">Waitlist <span className="text-primary italic">Intelligence</span></h1>
                    </div>
                    <p className="text-foreground/40 font-bold ml-1 uppercase tracking-widest text-[10px]">Tracking global interest & market expansion</p>
                </div>

                <div className="flex items-center gap-4">
                    <Card className="bg-foreground/5 border-none px-6 py-3 flex flex-row items-center gap-4" radius="lg">
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase opacity-40">Total Leads</p>
                            <p className="text-2xl font-black text-primary">{entries.length}</p>
                        </div>
                        <Users className="text-primary" size={24} />
                    </Card>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Stats & Search */}
                <div className="lg:col-span-12">
                    <Card className="modern-card border-none shadow-xl" radius="lg">
                        <CardBody className="p-8 space-y-8">
                            <div className="flex flex-col md:flex-row gap-6 justify-between">
                                <Input
                                    placeholder="Search leads by name, email or business..."
                                    size="lg"
                                    radius="lg"
                                    value={search}
                                    onValueChange={setSearch}
                                    startContent={<Search size={20} className="opacity-30" />}
                                    className="max-w-xl"
                                    classNames={{
                                        inputWrapper: "bg-foreground/5 h-14 border-none shadow-inner"
                                    }}
                                />
                                <div className="flex gap-4">
                                    <Button variant="flat" className="font-bold h-14 px-8" radius="lg">Export CSV</Button>
                                    <Button color="primary" className="font-black h-14 px-10 shadow-lg shadow-primary/20" radius="full">Refresh Data</Button>
                                </div>
                            </div>

                            <Table 
                                aria-label="Waitlist Table"
                                className="border-none"
                                removeWrapper
                                classNames={{
                                    th: "bg-foreground/[0.03] text-foreground/40 font-black uppercase tracking-widest text-[10px] py-6 h-auto",
                                    td: "py-6 font-bold"
                                }}
                            >
                                <TableHeader>
                                    <TableColumn>LEAD INFO</TableColumn>
                                    <TableColumn>BUSINESS</TableColumn>
                                    <TableColumn>INTERESTS</TableColumn>
                                    <TableColumn>JOINED ON</TableColumn>
                                    <TableColumn>STATUS</TableColumn>
                                    <TableColumn align="center">ACTIONS</TableColumn>
                                </TableHeader>
                                <TableBody isLoading={isLoading} loadingContent={<div>Loading the waitlist...</div>}>
                                    {filteredEntries.map((entry) => (
                                        <TableRow key={entry.id} className="border-b border-foreground/5 hover:bg-foreground/[0.02] transition-colors">
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black uppercase tracking-tight">{entry.name || 'Anonymous'}</span>
                                                    <span className="text-xs opacity-40 italic">{entry.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Building size={14} className="opacity-30" />
                                                    <span className="text-xs font-black uppercase">{entry.businessName || 'STLTH MODE'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {entry.interests?.map((interest: string, i: number) => (
                                                        <Chip key={i} size="sm" variant="flat" color="primary" className="font-black text-[10px] py-0 h-5">
                                                            {interest}
                                                        </Chip>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 opacity-50">
                                                    <Calendar size={12} />
                                                    <span className="text-[10px] font-black">{new Date(entry.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Chip color={entry.status === 'APPROVED' ? 'success' : 'warning'} variant="dot" className="font-black text-[10px]">
                                                    {entry.status}
                                                </Chip>
                                            </TableCell>
                                            <TableCell>
                                                <Button size="sm" variant="light" color="primary" className="font-black text-[10px] uppercase">Review</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
}
