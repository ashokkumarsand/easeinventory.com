'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useEffect, useState } from 'react';

export default function InventoryRequestsClientPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newRequest, setNewRequest] = useState({
        name: '',
        brand: '',
        type: 'PRODUCT',
        description: ''
    });

    const fetchRequests = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/tenant/inventory-requests');
            const data = await res.json();
            setRequests(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch requests:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleCreate = async () => {
        try {
            const res = await fetch('/api/tenant/inventory-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRequest),
            });
            if (res.ok) {
                setShowCreate(false);
                setNewRequest({ name: '', brand: '', type: 'PRODUCT', description: '' });
                fetchRequests();
            }
        } catch (error) {
            console.error("Failed to create request:", error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black tracking-tight">Inventory Requests</h2>
                    <p className="text-foreground/60 font-medium">Request new products or categories for your inventory</p>
                </div>
                <Button
                    variant="default"
                    className="font-black px-8 shadow-xl shadow-primary/20"
                    onClick={() => setShowCreate(true)}
                >
                    <Plus size={18} />
                    Request Addition
                </Button>
            </div>

            {showCreate && (
                <Card className="modern-card border-none shadow-2xl bg-primary/5">
                    <CardContent className="p-8 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-black">New Addition Request</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="item-name">Item Name</Label>
                                <Input
                                    id="item-name"
                                    placeholder="e.g. iPhone 15 Pro"
                                    value={newRequest.name}
                                    onChange={(e) => setNewRequest({...newRequest, name: e.target.value})}
                                    className="h-12 rounded-lg"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="request-type">Request Type</Label>
                                <Select
                                    value={newRequest.type}
                                    onValueChange={(val) => setNewRequest({...newRequest, type: val})}
                                >
                                    <SelectTrigger className="h-12 rounded-lg">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PRODUCT">Product Addition</SelectItem>
                                        <SelectItem value="CATEGORY">Category Addition</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="brand">Brand / Manufacturer</Label>
                            <Input
                                id="brand"
                                placeholder="e.g. Apple"
                                value={newRequest.brand}
                                onChange={(e) => setNewRequest({...newRequest, brand: e.target.value})}
                                className="h-12 rounded-lg"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Additional Details</Label>
                            <Textarea
                                id="description"
                                placeholder="Specifications, reasons for addition, etc."
                                value={newRequest.description}
                                onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
                                className="rounded-lg"
                            />
                        </div>

                        <div className="flex justify-end gap-3 mt-4">
                            <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
                            <Button variant="default" className="font-black px-10" onClick={handleCreate}>
                                Submit Request
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ITEM NAME</TableHead>
                        <TableHead>TYPE</TableHead>
                        <TableHead>STATUS</TableHead>
                        <TableHead>SUBMITTED</TableHead>
                        <TableHead>ADMIN NOTE</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {requests.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                                {isLoading ? "Loading..." : "No requests yet."}
                            </TableCell>
                        </TableRow>
                    ) : (
                        requests.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell><span className="font-bold">{(item.details as any).name}</span></TableCell>
                                <TableCell><Badge variant="secondary" className="font-black text-[10px] uppercase">{item.type}</Badge></TableCell>
                                <TableCell>
                                    <Badge
                                        variant={item.status === 'APPROVED' ? 'default' : item.status === 'REJECTED' ? 'destructive' : 'secondary'}
                                        className="font-bold"
                                    >
                                        {item.status}
                                    </Badge>
                                </TableCell>
                                <TableCell><span className="text-sm opacity-60">{new Date(item.createdAt).toLocaleDateString()}</span></TableCell>
                                <TableCell><span className="text-sm font-medium italic opacity-50">{item.adminNote || 'No response yet'}</span></TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
