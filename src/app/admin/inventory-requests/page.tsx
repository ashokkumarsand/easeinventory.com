'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from "@/components/ui/tooltip";
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
                <Badge variant="secondary" className="font-bold text-base px-3 py-1">
                    {requests.filter(r => r.status === 'PENDING').length} Pending
                </Badge>
            </div>

            <div className="flex gap-4 mb-4">
                <div className="relative max-w-md">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                    <Input
                        placeholder="Search requests..."
                        className="pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>CLIENT</TableHead>
                        <TableHead>TYPE</TableHead>
                        <TableHead>ITEM DETAILS</TableHead>
                        <TableHead>STATUS</TableHead>
                        <TableHead className="text-center">ACTIONS</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredRequests.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                                {isLoading ? "Loading..." : "No requests found."}
                            </TableCell>
                        </TableRow>
                    ) : (
                        filteredRequests.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-bold">{item.tenant.name}</span>
                                        <span className="text-xs text-muted-foreground">{item.tenant.slug}.easeinventory.com</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className="font-black uppercase tracking-widest text-[10px]">
                                        {item.type}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                                            <Package size={14} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold">{(item.details as any).name}</span>
                                            <span className="text-xs text-muted-foreground italic">{(item.details as any).brand || 'Standard'}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={item.status === 'APPROVED' ? 'default' : item.status === 'REJECTED' ? 'destructive' : 'secondary'}
                                        className="font-bold"
                                    >
                                        {item.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 justify-center">
                                        {item.status === 'PENDING' && (
                                            <>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button size="icon" variant="ghost" className="text-green-600 hover:text-green-700 hover:bg-green-100" onClick={() => handleAction(item.id, 'APPROVED')}>
                                                            <Check size={20} />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Approve</TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button size="icon" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-100" onClick={() => handleAction(item.id, 'REJECTED')}>
                                                            <X size={20} />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Reject</TooltipContent>
                                                </Tooltip>
                                            </>
                                        )}
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button size="icon" variant="ghost">
                                                    <Eye size={20} />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>View Details</TooltipContent>
                                        </Tooltip>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
