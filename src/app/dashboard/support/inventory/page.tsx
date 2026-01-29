'use client';

import {
    Button,
    Card,
    CardBody,
    Chip,
    Input,
    Select,
    SelectItem,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Textarea
} from "@heroui/react";
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
                    color="primary" 
                    className="font-black px-8 shadow-xl shadow-primary/20" 
                    startContent={<Plus size={18} />}
                    onPress={() => setShowCreate(true)}
                >
                    Request Addition
                </Button>
            </div>

            {showCreate && (
                <Card className="modern-card border-none shadow-2xl bg-primary/5">
                    <CardBody className="p-8 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-black">New Addition Request</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input 
                                label="Item Name" 
                                placeholder="e.g. iPhone 15 Pro" 
                                value={newRequest.name}
                                onValueChange={(val) => setNewRequest({...newRequest, name: val})}
                                labelPlacement="outside"
                                size="lg"
                                radius="lg"
                            />
                            <Select 
                                label="Request Type" 
                                value={newRequest.type}
                                onChange={(e) => setNewRequest({...newRequest, type: e.target.value})}
                                labelPlacement="outside"
                                size="lg"
                                radius="lg"
                            >
                                <SelectItem key="PRODUCT">Product Addition</SelectItem>
                                <SelectItem key="CATEGORY">Category Addition</SelectItem>
                            </Select>
                        </div>

                        <Input 
                            label="Brand / Manufacturer" 
                            placeholder="e.g. Apple" 
                            value={newRequest.brand}
                            onValueChange={(val) => setNewRequest({...newRequest, brand: val})}
                            labelPlacement="outside"
                            size="lg"
                            radius="lg"
                        />

                        <Textarea 
                            label="Additional Details" 
                            placeholder="Specifications, reasons for addition, etc."
                            value={newRequest.description}
                            onValueChange={(val) => setNewRequest({...newRequest, description: val})}
                            labelPlacement="outside"
                            size="lg"
                            radius="lg"
                        />

                        <div className="flex justify-end gap-3 mt-4">
                            <Button variant="flat" onPress={() => setShowCreate(false)}>Cancel</Button>
                            <Button color="primary" className="font-black px-10" onPress={handleCreate}>
                                Submit Request
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            )}

            <Table aria-label="Request history">
                <TableHeader>
                    <TableColumn>ITEM NAME</TableColumn>
                    <TableColumn>TYPE</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                    <TableColumn>SUBMITTED</TableColumn>
                    <TableColumn>ADMIN NOTE</TableColumn>
                </TableHeader>
                <TableBody 
                    emptyContent={isLoading ? "Loading..." : "No requests yet."}
                    items={requests}
                >
                    {(item) => (
                        <TableRow key={item.id}>
                            <TableCell><span className="font-bold">{(item.details as any).name}</span></TableCell>
                            <TableCell><Chip size="sm" variant="flat" className="font-black text-[10px] uppercase">{item.type}</Chip></TableCell>
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
                            <TableCell><span className="text-sm opacity-60">{new Date(item.createdAt).toLocaleDateString()}</span></TableCell>
                            <TableCell><span className="text-sm font-medium italic opacity-50">{item.adminNote || 'No response yet'}</span></TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
