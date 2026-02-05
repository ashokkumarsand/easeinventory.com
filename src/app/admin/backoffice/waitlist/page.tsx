'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
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
                    <Card className="bg-foreground/5 border-none px-6 py-3 flex flex-row items-center gap-4 rounded-lg">
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
                    <Card className="modern-card border-none shadow-xl rounded-lg">
                        <CardContent className="p-8 space-y-8">
                            <div className="flex flex-col md:flex-row gap-6 justify-between">
                                <div className="relative max-w-xl flex-1">
                                    <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                                    <Input
                                        placeholder="Search leads by name, email or business..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="bg-foreground/5 h-14 border-none shadow-inner pl-10 rounded-lg"
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <Button variant="secondary" className="font-bold h-14 px-8 rounded-lg">Export CSV</Button>
                                    <Button className="font-black h-14 px-10 shadow-lg shadow-primary/20 rounded-full">Refresh Data</Button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-foreground/5">
                                            <th className="bg-foreground/[0.03] text-foreground/40 font-black uppercase tracking-widest text-[10px] py-6 px-4 text-left">LEAD INFO</th>
                                            <th className="bg-foreground/[0.03] text-foreground/40 font-black uppercase tracking-widest text-[10px] py-6 px-4 text-left">BUSINESS</th>
                                            <th className="bg-foreground/[0.03] text-foreground/40 font-black uppercase tracking-widest text-[10px] py-6 px-4 text-left">INTERESTS</th>
                                            <th className="bg-foreground/[0.03] text-foreground/40 font-black uppercase tracking-widest text-[10px] py-6 px-4 text-left">JOINED ON</th>
                                            <th className="bg-foreground/[0.03] text-foreground/40 font-black uppercase tracking-widest text-[10px] py-6 px-4 text-left">STATUS</th>
                                            <th className="bg-foreground/[0.03] text-foreground/40 font-black uppercase tracking-widest text-[10px] py-6 px-4 text-center">ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan={6} className="py-6 px-4">
                                                    <div className="space-y-4">
                                                        {[1, 2, 3].map((i) => (
                                                            <div key={i} className="flex items-center gap-4">
                                                                <Skeleton className="h-10 w-full" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : filteredEntries.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="py-6 px-4 text-center text-foreground/40">
                                                    No entries found
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredEntries.map((entry) => (
                                                <tr key={entry.id} className="border-b border-foreground/5 hover:bg-foreground/[0.02] transition-colors">
                                                    <td className="py-6 px-4 font-bold">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-black uppercase tracking-tight">{entry.name || 'Anonymous'}</span>
                                                            <span className="text-xs opacity-40 italic">{entry.email}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-6 px-4 font-bold">
                                                        <div className="flex items-center gap-2">
                                                            <Building size={14} className="opacity-30" />
                                                            <span className="text-xs font-black uppercase">{entry.businessName || 'STLTH MODE'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-6 px-4 font-bold">
                                                        <div className="flex flex-wrap gap-1">
                                                            {entry.interests?.map((interest: string, i: number) => (
                                                                <Badge key={i} variant="secondary" className="font-black text-[10px] py-0 h-5">
                                                                    {interest}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="py-6 px-4 font-bold">
                                                        <div className="flex items-center gap-2 opacity-50">
                                                            <Calendar size={12} />
                                                            <span className="text-[10px] font-black">{new Date(entry.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-6 px-4 font-bold">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-2 h-2 rounded-full ${entry.status === 'APPROVED' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                                            <Badge variant={entry.status === 'APPROVED' ? 'default' : 'secondary'} className="font-black text-[10px]">
                                                                {entry.status}
                                                            </Badge>
                                                        </div>
                                                    </td>
                                                    <td className="py-6 px-4 font-bold text-center">
                                                        <Button variant="ghost" size="sm" className="font-black text-[10px] uppercase text-primary">Review</Button>
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
            </div>
        </div>
    );
}
