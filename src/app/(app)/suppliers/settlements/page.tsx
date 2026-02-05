'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    ArrowLeft,
    Banknote,
    Check,
    DollarSign,
    Package,
    Truck
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function SettlementsPage() {
    const [settlements, setSettlements] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('UNSETTLED');

    useEffect(() => {
        fetchSettlements();
    }, [statusFilter]);

    const fetchSettlements = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/settlements?status=${statusFilter}`);
            const data = await response.json();
            setSettlements(data.settlements || []);
        } catch (error) {
            console.error('Fetch settlements error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSettle = async (id: string) => {
        try {
            const response = await fetch(`/api/settlements/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'PAID' }),
            });

            if (response.ok) {
                fetchSettlements();
            } else {
                alert('Settlement failed');
            }
        } catch (error) {
            alert('Error updating settlement');
        }
    };

    const totalUnsettled = settlements
        .filter(s => s.status === 'UNSETTLED')
        .reduce((acc, s) => acc + Number(s.payoutAmount), 0);

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Link href="/suppliers">
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <ArrowLeft size={20} className="opacity-40" />
                            </Button>
                        </Link>
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <Banknote size={22} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-black tracking-tight font-heading">Settlement Ledger</h1>
                    </div>
                    <p className="text-foreground/50 font-bold ml-10">Manage vendor payouts for consignment sales.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-48 bg-black/5 h-12 rounded-2xl px-6 border-none">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="UNSETTLED">Unsettled</SelectItem>
                            <SelectItem value="PAID">Paid / Settled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="modern-card bg-success text-white p-8 rounded-lg">
                    <CardContent className="p-0 flex flex-row items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Outstanding Payouts</p>
                            <h2 className="text-5xl font-black">{totalUnsettled.toLocaleString()}</h2>
                        </div>
                        <div className="w-16 h-16 rounded-3xl bg-white/20 flex items-center justify-center">
                            <DollarSign size={32} />
                        </div>
                    </CardContent>
                </Card>
                <Card className="modern-card p-8 border border-black/5 rounded-lg">
                    <CardContent className="p-0 flex flex-row items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Pending Claims</p>
                            <h2 className="text-4xl font-black text-secondary">{settlements.filter(s => s.status === 'UNSETTLED').length} Items</h2>
                        </div>
                        <div className="w-16 h-16 rounded-3xl bg-black/5 flex items-center justify-center text-black/20">
                            <Package size={32} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <div className="space-y-6">
                <div className="modern-card theme-table-wrapper border border-black/5 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-none">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-black/[0.02] dark:bg-white/[0.02]">
                                <th className="h-16 font-black uppercase tracking-wider text-[10px] opacity-40 px-8 text-left">PRODUCT / SKU</th>
                                <th className="h-16 font-black uppercase tracking-wider text-[10px] opacity-40 px-8 text-left">SUPPLIER</th>
                                <th className="h-16 font-black uppercase tracking-wider text-[10px] opacity-40 px-8 text-left">INVOICE</th>
                                <th className="h-16 font-black uppercase tracking-wider text-[10px] opacity-40 px-8 text-left">SALE PRICE</th>
                                <th className="h-16 font-black uppercase tracking-wider text-[10px] opacity-40 px-8 text-left">PAYOUT (VND)</th>
                                <th className="h-16 font-black uppercase tracking-wider text-[10px] opacity-40 px-8 text-left">STATUS</th>
                                <th className="h-16 font-black uppercase tracking-wider text-[10px] opacity-40 px-8 text-center">ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {settlements.map((s) => (
                                <tr key={s.id} className="border-b last:border-none border-black/5 dark:border-white/10 hover:bg-black/[0.01] transition-colors">
                                    <td className="py-6 px-8 font-bold">
                                        <div className="flex flex-col">
                                            <span className="font-black truncate max-w-[150px]">{s.product.name}</span>
                                            <span className="text-[10px] font-bold opacity-30 uppercase tracking-widest">{s.product.sku}</span>
                                        </div>
                                    </td>
                                    <td className="py-6 px-8 font-bold">
                                        <div className="flex items-center gap-2">
                                            <Truck size={14} className="opacity-30" />
                                            <span className="text-sm font-black">{s.supplier.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-6 px-8 font-bold">
                                        <span className="text-xs opacity-50 font-bold">{s.invoice.invoiceNumber}</span>
                                    </td>
                                    <td className="py-6 px-8 font-bold">{Number(s.salePrice).toLocaleString()}</td>
                                    <td className="py-6 px-8 font-bold">
                                        <span className="font-black text-success">{Number(s.payoutAmount).toLocaleString()}</span>
                                    </td>
                                    <td className="py-6 px-8 font-bold">
                                        <Badge
                                            variant="secondary"
                                            className={`font-black text-[10px] uppercase ${s.status === 'PAID' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}
                                        >
                                            {s.status}
                                        </Badge>
                                    </td>
                                    <td className="py-6 px-8 font-bold text-center">
                                        {s.status === 'UNSETTLED' ? (
                                            <Button
                                                size="sm"
                                                className="font-black px-6 rounded-full bg-success text-white hover:bg-success/90"
                                                onClick={() => handleSettle(s.id)}
                                            >
                                                <Check size={14} className="mr-1" />
                                                Mark Settled
                                            </Button>
                                        ) : (
                                            <span className="text-[10px] font-black opacity-30 uppercase italic">{new Date(s.settledAt).toLocaleDateString()}</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
