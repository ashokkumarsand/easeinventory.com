'use client';

import {
    Button,
    Card,
    CardBody,
    Chip,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    useDisclosure
} from '@heroui/react';
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'success';
            case 'IN_TRANSIT': return 'primary';
            case 'CANCELLED': return 'danger';
            case 'PENDING': return 'warning';
            default: return 'default';
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
                        <h1 className="text-3xl font-black tracking-tight text-primary">Warehouse Transfers</h1>
                    </div>
                    <p className="text-black/40 dark:text-white/40 font-bold ml-1">Move inventory between stores and regional warehouses.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button color="primary" radius="full" size="lg" className="font-black px-8 shadow-xl shadow-primary/20" startContent={<Plus size={20} />} onClick={onOpen}>
                        New Transfer
                    </Button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="modern-card p-6" radius="lg">
                    <CardBody className="flex flex-row items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-warning/10 flex items-center justify-center text-warning">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase opacity-40">Pending Approval</p>
                            <h2 className="text-2xl font-black">{transfers.filter(t => t.status === 'PENDING').length}</h2>
                        </div>
                    </CardBody>
                </Card>
                <Card className="modern-card p-6" radius="lg">
                    <CardBody className="flex flex-row items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <Truck size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase opacity-40">In Transit</p>
                            <h2 className="text-2xl font-black">{transfers.filter(t => t.status === 'IN_TRANSIT').length}</h2>
                        </div>
                    </CardBody>
                </Card>
                <Card className="modern-card p-6" radius="lg">
                    <CardBody className="flex flex-row items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center text-success">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase opacity-40">Fulfilled</p>
                            <h2 className="text-2xl font-black">{transfers.filter(t => t.status === 'COMPLETED').length}</h2>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Transfers Table */}
            <div className="space-y-6">
                <div className="flex items-center gap-4 max-w-md">
                    <Input 
                        placeholder="Search transfers..." 
                        labelPlacement="outside"
                        startContent={<Search size={18} className="opacity-30" />}
                        value={searchTerm}
                        onValueChange={setSearchTerm}
                        classNames={{ inputWrapper: "bg-black/5 h-12 rounded-2xl" }}
                    />
                </div>

                <Table 
                    aria-label="Transfers Table"
                    className="modern-card border-none"
                    classNames={{
                        wrapper: "p-0 modern-card theme-table-wrapper border border-black/5 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-none",
                        th: "bg-black/[0.02] dark:bg-white/[0.02] h-16 font-black uppercase tracking-wider text-[10px] opacity-40 px-8",
                        td: "py-6 px-8 font-bold",
                    }}
                >
                    <TableHeader>
                        <TableColumn>REFERENCE</TableColumn>
                        <TableColumn>MOVEMENT</TableColumn>
                        <TableColumn>ITEMS</TableColumn>
                        <TableColumn>STATUS</TableColumn>
                        <TableColumn>INITIATED</TableColumn>
                        <TableColumn align="center">ACTIONS</TableColumn>
                    </TableHeader>
                    <TableBody>
                        {transfers.map((trf) => (
                            <TableRow key={trf.id} className="border-b last:border-none border-black/5 dark:border-white/10 hover:bg-black/[0.01] transition-colors">
                                <TableCell>
                                    <span className="font-black text-primary tracking-tight">{trf.transferNumber}</span>
                                </TableCell>
                                <TableCell>
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
                                </TableCell>
                                <TableCell>
                                    <Chip variant="flat" size="sm" className="font-black text-[10px]">
                                        {trf.items.length} Product(s)
                                    </Chip>
                                </TableCell>
                                <TableCell>
                                    <Chip variant="flat" size="sm" color={getStatusColor(trf.status) as any} className="font-black text-[10px] uppercase">
                                        {trf.status}
                                    </Chip>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black">{new Date(trf.createdAt).toLocaleDateString()}</span>
                                        <span className="text-[10px] opacity-30 uppercase font-bold">{new Date(trf.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col items-center gap-2 justify-center">
                                        {trf.status === 'PENDING' && (
                                            <div className="flex items-center gap-2">
                                                <Button size="sm" color="primary" radius="full" className="font-black text-[10px] px-4" onClick={() => handleAction(trf.id, 'IN_TRANSIT')}>Dispatch</Button>
                                                <Button isIconOnly size="sm" variant="light" color="danger" radius="full" onClick={() => handleAction(trf.id, 'CANCELLED')}><Box className="rotate-45" size={14} /></Button>
                                            </div>
                                        )}
                                        {trf.status === 'IN_TRANSIT' && (
                                            <div className="flex flex-col gap-2">
                                                <Button size="sm" color="success" radius="full" className="font-black text-[10px] px-4 text-white" onClick={() => handleAction(trf.id, 'COMPLETED')}>Acknowledge Receipt</Button>
                                                {!trf.ewayBillNumber && (
                                                    <Button 
                                                        size="sm" 
                                                        variant="flat" 
                                                        color="secondary" 
                                                        radius="full" 
                                                        className="font-black text-[9px] px-3 h-7"
                                                        startContent={<Truck size={12} />}
                                                        onClick={async () => {
                                                            const res = await fetch('/api/compliance/gst', {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ action: 'E_WAY_BILL', targetId: trf.id })
                                                            });
                                                            if (res.ok) fetchTransfers();
                                                        }}
                                                    >
                                                        Generate EWB
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                        {trf.ewayBillNumber && (
                                            <Chip variant="dot" color="success" size="sm" className="font-black text-[8px] h-5">
                                                EWB: {trf.ewayBillNumber}
                                            </Chip>
                                        )}
                                        {trf.status === 'COMPLETED' && (
                                            <CheckCircle2 size={18} className="text-success opacity-50" />
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Modal - Placeholder for Add Transfer (will implement full form if needed) */}
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>Initiate Inventory Movement</ModalHeader>
                            <ModalBody>
                                <p className="text-sm opacity-50 font-bold">Transfer logic with multi-point verification coming soon.</p>
                            </ModalBody>
                            <ModalFooter>
                                <Button onPress={onClose}>Close</Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
