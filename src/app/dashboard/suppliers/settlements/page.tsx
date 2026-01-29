'use client';

import {
    Button,
    Card,
    CardBody,
    Chip,
    Select,
    SelectItem,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow
} from '@heroui/react';
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
                        <Link href="/dashboard/suppliers">
                            <Button isIconOnly variant="light" radius="full" size="sm">
                                <ArrowLeft size={20} className="opacity-40" />
                            </Button>
                        </Link>
                        <div className="w-10 h-10 rounded-2xl bg-success/10 flex items-center justify-center text-success">
                            <Banknote size={22} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-success">Settlement Ledger</h1>
                    </div>
                    <p className="text-black/40 dark:text-white/40 font-bold ml-10">Manage vendor payouts for consignment sales.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Select 
                        className="w-48"
                        labelPlacement="outside"
                        selectedKeys={[statusFilter]}
                        onSelectionChange={(keys) => setStatusFilter(Array.from(keys)[0] as string)}
                        classNames={{ trigger: "bg-black/5 h-12 rounded-2xl px-6 border-none" }}
                    >
                        <SelectItem key="UNSETTLED">Unsettled</SelectItem>
                        <SelectItem key="PAID">Paid / Settled</SelectItem>
                    </Select>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="modern-card bg-success text-white p-8" radius="lg">
                    <CardBody className="p-0 flex flex-row items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Outstanding Payouts</p>
                            <h2 className="text-5xl font-black">₹{totalUnsettled.toLocaleString()}</h2>
                        </div>
                        <div className="w-16 h-16 rounded-3xl bg-white/20 flex items-center justify-center">
                            <DollarSign size={32} />
                        </div>
                    </CardBody>
                </Card>
                <Card className="modern-card p-8 border border-black/5" radius="lg">
                    <CardBody className="p-0 flex flex-row items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Pending Claims</p>
                            <h2 className="text-4xl font-black text-secondary">{settlements.filter(s => s.status === 'UNSETTLED').length} Items</h2>
                        </div>
                        <div className="w-16 h-16 rounded-3xl bg-black/5 flex items-center justify-center text-black/20">
                            <Package size={32} />
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Table */}
            <div className="space-y-6">
                <Table 
                    aria-label="Settlement Table"
                    className="modern-card border-none"
                    classNames={{
                        wrapper: "p-0 modern-card bg-white dark:bg-[#111318] border border-black/5 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-none",
                        th: "bg-black/[0.02] dark:bg-white/[0.02] h-16 font-black uppercase tracking-wider text-[10px] opacity-40 px-8",
                        td: "py-6 px-8 font-bold",
                    }}
                >
                    <TableHeader>
                        <TableColumn>PRODUCT / SKU</TableColumn>
                        <TableColumn>SUPPLIER</TableColumn>
                        <TableColumn>INVOICE</TableColumn>
                        <TableColumn>SALE PRICE</TableColumn>
                        <TableColumn>PAYOUT (VND)</TableColumn>
                        <TableColumn>STATUS</TableColumn>
                        <TableColumn align="center">ACTION</TableColumn>
                    </TableHeader>
                    <TableBody>
                        {settlements.map((s) => (
                            <TableRow key={s.id} className="border-b last:border-none border-black/5 dark:border-white/10 hover:bg-black/[0.01] transition-colors">
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-black truncate max-w-[150px]">{s.product.name}</span>
                                        <span className="text-[10px] font-bold opacity-30 uppercase tracking-widest">{s.product.sku}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Truck size={14} className="opacity-30" />
                                        <span className="text-sm font-black">{s.supplier.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-xs opacity-50 font-bold">{s.invoice.invoiceNumber}</span>
                                </TableCell>
                                <TableCell>₹{Number(s.salePrice).toLocaleString()}</TableCell>
                                <TableCell>
                                    <span className="font-black text-success">₹{Number(s.payoutAmount).toLocaleString()}</span>
                                </TableCell>
                                <TableCell>
                                    <Chip variant="flat" size="sm" color={s.status === 'PAID' ? 'success' : 'warning'} className="font-black text-[10px] uppercase">
                                        {s.status}
                                    </Chip>
                                </TableCell>
                                <TableCell>
                                    {s.status === 'UNSETTLED' ? (
                                        <Button color="success" size="sm" radius="full" className="font-black px-6 text-white" startContent={<Check size={14} />} onClick={() => handleSettle(s.id)}>
                                            Mark Settled
                                        </Button>
                                    ) : (
                                        <span className="text-[10px] font-black opacity-30 uppercase italic">{new Date(s.settledAt).toLocaleDateString()}</span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
