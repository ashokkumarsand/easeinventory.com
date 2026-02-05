'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useDisclosure } from '@/hooks/useDisclosure';
import {
    ArrowRightLeft,
    Box,
    CheckCircle2,
    Clock,
    Plus,
    Search,
    Truck
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function TransfersPage() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [transfers, setTransfers] = useState<any[]>([]);
    const [locations, setLocations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // New Transfer State
    const [newTransfer, setNewTransfer] = useState({
        sourceLocationId: '',
        destLocationId: '',
        notes: '',
        items: [] as { productId: string, quantity: number, name: string }[]
    });

    useEffect(() => {
        fetchTransfers();
        fetchLocations();
    }, []);

    const fetchTransfers = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/inventory/transfers');
            const data = await response.json();
            setTransfers(data.transfers || []);
        } catch (error) {
            console.error('Fetch transfers error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchLocations = async () => {
        try {
            const response = await fetch('/api/inventory/locations');
            const data = await response.json();
            setLocations(data.locations || []);
        } catch (error) {
            console.error('Fetch locations error:', error);
        }
    };

    const handleAction = async (id: string, status: string) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/inventory/transfers/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });

            if (response.ok) {
                fetchTransfers();
            } else {
                const data = await response.json();
                alert(data.message || 'Action failed');
            }
        } catch (error) {
            alert('Error updating transfer status');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        switch (status) {
            case 'COMPLETED': return 'default';
            case 'IN_TRANSIT': return 'secondary';
            case 'CANCELLED': return 'destructive';
            case 'PENDING': return 'outline';
            default: return 'secondary';
        }
    };

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <ArrowRightLeft size={22} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-black tracking-tight font-heading">Warehouse Transfers</h1>
                    </div>
                    <p className="text-foreground/50 font-bold ml-1">Move inventory between stores and regional warehouses.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button className="font-black px-8 shadow-xl shadow-primary/20 rounded-full" size="lg" onClick={onOpen}>
                        <Plus size={20} />
                        New Transfer
                    </Button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="modern-card p-6 rounded-lg">
                    <CardContent className="flex flex-row items-center gap-4 p-0">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase opacity-40">Pending Approval</p>
                            <h2 className="text-2xl font-black">{transfers.filter(t => t.status === 'PENDING').length}</h2>
                        </div>
                    </CardContent>
                </Card>
                <Card className="modern-card p-6 rounded-lg">
                    <CardContent className="flex flex-row items-center gap-4 p-0">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <Truck size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase opacity-40">In Transit</p>
                            <h2 className="text-2xl font-black">{transfers.filter(t => t.status === 'IN_TRANSIT').length}</h2>
                        </div>
                    </CardContent>
                </Card>
                <Card className="modern-card p-6 rounded-lg">
                    <CardContent className="flex flex-row items-center gap-4 p-0">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase opacity-40">Fulfilled</p>
                            <h2 className="text-2xl font-black">{transfers.filter(t => t.status === 'COMPLETED').length}</h2>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Transfers Table */}
            <div className="space-y-6">
                <div className="flex items-center gap-4 max-w-md">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                        <Input
                            placeholder="Search transfers..."
                            className="bg-black/5 h-12 rounded-2xl pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="modern-card theme-table-wrapper border border-black/5 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-none">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-black/[0.02] dark:bg-white/[0.02]">
                                <th className="h-16 font-black uppercase tracking-wider text-[10px] opacity-40 px-8 text-left">REFERENCE</th>
                                <th className="h-16 font-black uppercase tracking-wider text-[10px] opacity-40 px-8 text-left">MOVEMENT</th>
                                <th className="h-16 font-black uppercase tracking-wider text-[10px] opacity-40 px-8 text-left">ITEMS</th>
                                <th className="h-16 font-black uppercase tracking-wider text-[10px] opacity-40 px-8 text-left">STATUS</th>
                                <th className="h-16 font-black uppercase tracking-wider text-[10px] opacity-40 px-8 text-left">INITIATED</th>
                                <th className="h-16 font-black uppercase tracking-wider text-[10px] opacity-40 px-8 text-center">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transfers.map((trf) => (
                                <tr key={trf.id} className="border-b last:border-none border-black/5 dark:border-white/10 hover:bg-black/[0.01] transition-colors">
                                    <td className="py-6 px-8 font-bold">
                                        <span className="font-black text-primary tracking-tight">{trf.transferNumber}</span>
                                    </td>
                                    <td className="py-6 px-8 font-bold">
                                        <div className="flex items-center gap-3">
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs font-black">{trf.sourceLocation?.name}</span>
                                                <span className="text-[8px] opacity-30 uppercase font-black tracking-widest leading-none">Source</span>
                                            </div>
                                            <ArrowRightLeft size={14} className="opacity-20" />
                                            <div className="flex flex-col items-start">
                                                <span className="text-xs font-black">{trf.destLocation?.name}</span>
                                                <span className="text-[8px] opacity-30 uppercase font-black tracking-widest leading-none">Target</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-6 px-8 font-bold">
                                        <Badge variant="secondary" className="font-black text-[10px]">
                                            {trf.items.length} Product(s)
                                        </Badge>
                                    </td>
                                    <td className="py-6 px-8 font-bold">
                                        <Badge variant={getStatusVariant(trf.status)} className="font-black text-[10px] uppercase">
                                            {trf.status}
                                        </Badge>
                                    </td>
                                    <td className="py-6 px-8 font-bold">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black">{new Date(trf.createdAt).toLocaleDateString()}</span>
                                            <span className="text-[10px] opacity-30 uppercase font-bold">{new Date(trf.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </td>
                                    <td className="py-6 px-8 font-bold">
                                        <div className="flex flex-col items-center gap-2 justify-center">
                                            {trf.status === 'PENDING' && (
                                                <div className="flex items-center gap-2">
                                                    <Button size="sm" className="font-black text-[10px] px-4 rounded-full" onClick={() => handleAction(trf.id, 'IN_TRANSIT')}>Dispatch</Button>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-destructive" onClick={() => handleAction(trf.id, 'CANCELLED')}><Box className="rotate-45" size={14} /></Button>
                                                </div>
                                            )}
                                            {trf.status === 'IN_TRANSIT' && (
                                                <div className="flex flex-col gap-2">
                                                    <Button size="sm" className="font-black text-[10px] px-4 rounded-full bg-success hover:bg-success/90 text-white" onClick={() => handleAction(trf.id, 'COMPLETED')}>Acknowledge Receipt</Button>
                                                    {!trf.ewayBillNumber && (
                                                        <Button
                                                            size="sm"
                                                            variant="secondary"
                                                            className="font-black text-[9px] px-3 h-7 rounded-full"
                                                            onClick={async () => {
                                                                const res = await fetch('/api/compliance/gst', {
                                                                    method: 'POST',
                                                                    headers: { 'Content-Type': 'application/json' },
                                                                    body: JSON.stringify({ action: 'E_WAY_BILL', targetId: trf.id })
                                                                });
                                                                if (res.ok) fetchTransfers();
                                                            }}
                                                        >
                                                            <Truck size={12} />
                                                            Generate EWB
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                            {trf.ewayBillNumber && (
                                                <Badge variant="outline" className="font-black text-[8px] h-5 bg-success/10 text-success border-success/20">
                                                    EWB: {trf.ewayBillNumber}
                                                </Badge>
                                            )}
                                            {trf.status === 'COMPLETED' && (
                                                <CheckCircle2 size={18} className="text-success opacity-50" />
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal - Placeholder for Add Transfer (will implement full form if needed) */}
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Initiate Inventory Movement</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-sm opacity-50 font-bold">Transfer logic with multi-point verification coming soon.</p>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => onOpenChange(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
