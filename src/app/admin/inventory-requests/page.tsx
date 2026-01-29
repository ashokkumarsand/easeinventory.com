'use client';

import {
    Button,
    Chip,
    Input,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Tooltip
} from "@heroui/react";
import { Check, Eye, Package, Search, X } from "lucide-react";
import { useEffect, useState } from 'react';

export default function InventoryRequestsPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchRequests = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/inventory-requests');
            const data = await res.json();
            setRequests(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch inventory requests:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = async (requestId: string, status: 'APPROVED' | 'REJECTED') => {
        try {
            const res = await fetch(`/api/admin/inventory-requests/${requestId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            if (res.ok) fetchRequests();
        } catch (error) {
            console.error("Failed to update request:", error);
        }
    };

    const filteredRequests = requests.filter(r => 
        r.tenant.name.toLowerCase().includes(search.toLowerCase()) ||
        (r.details as any).name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black tracking-tight">Inventory Requests</h2>
                    <p className="text-foreground/60 font-medium">Review product and category addition requests</p>
                </div>
                <Chip variant="flat" color="warning" size="lg" className="font-bold">
                    {requests.filter(r => r.status === 'PENDING').length} Pending
                </Chip>
            </div>

            <div className="flex gap-4 mb-4">
                <Input 
                    placeholder="Search requests..." 
                    startContent={<Search size={18} className="opacity-30" />}
                    className="max-w-md"
                    value={search}
                    onValueChange={setSearch}
                />
            </div>

            <Table aria-label="Inventory requests">
                <TableHeader>
                    <TableColumn>CLIENT</TableColumn>
                    <TableColumn>TYPE</TableColumn>
                    <TableColumn>ITEM DETAILS</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                    <TableColumn align="center">ACTIONS</TableColumn>
                </TableHeader>
                <TableBody 
                    emptyContent={isLoading ? "Loading..." : "No requests found."}
                    items={filteredRequests}
                >
                    {(item) => (
                        <TableRow key={item.id}>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-bold">{item.tenant.name}</span>
                                    <span className="text-tiny text-foreground/40">{item.tenant.slug}.easeinventory.com</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Chip size="sm" variant="flat" className="font-black uppercase tracking-widest text-[10px]">
                                    {item.type}
                                </Chip>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center">
                                        <Package size={14} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold">{(item.details as any).name}</span>
                                        <span className="text-tiny opacity-40 italic">{(item.details as any).brand || 'Standard'}</span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Chip 
                                    color={item.status === 'APPROVED' ? 'success' : item.status === 'REJECTED' ? 'danger' : 'warning'} 
                                    size="sm" 
                                    variant="dot"
                                    className="font-bold"
                                >
                                    {item.status}
                                </Chip>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2 justify-center">
                                    {item.status === 'PENDING' && (
                                        <>
                                            <Tooltip content="Approve">
                                                <Button isIconOnly size="sm" color="success" variant="light" onPress={() => handleAction(item.id, 'APPROVED')}>
                                                    <Check size={20} />
                                                </Button>
                                            </Tooltip>
                                            <Tooltip content="Reject">
                                                <Button isIconOnly size="sm" color="danger" variant="light" onPress={() => handleAction(item.id, 'REJECTED')}>
                                                    <X size={20} />
                                                </Button>
                                            </Tooltip>
                                        </>
                                    )}
                                    <Tooltip content="View Details">
                                        <Button isIconOnly size="sm" variant="light">
                                            <Eye size={20} />
                                        </Button>
                                    </Tooltip>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
