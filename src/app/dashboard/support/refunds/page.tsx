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
    TableRow,
    Textarea
} from "@heroui/react";
import { Mail, Plus } from "lucide-react";
import { useEffect, useState } from 'react';

export default function RefundRequestsClientPage() {
    const [refunds, setRefunds] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newRefund, setNewRefund] = useState({
        amount: '',
        reason: '',
        invoiceId: ''
    });

    const fetchRefunds = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/tenant/refunds');
            const data = await res.json();
            setRefunds(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch refunds:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRefunds();
    }, []);

    const handleCreate = async () => {
        try {
            const res = await fetch('/api/tenant/refunds', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRefund),
            });
            if (res.ok) {
                setShowCreate(false);
                setNewRefund({ amount: '', reason: '', invoiceId: '' });
                fetchRefunds();
            }
        } catch (error) {
            console.error("Failed to create refund request:", error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black tracking-tight">Refund Inquiries</h2>
                    <p className="text-foreground/60 font-medium">Submit and track refund requests for your subscription or purchases</p>
                </div>
                <Button 
                    color="primary" 
                    className="font-black px-8 shadow-xl shadow-primary/20" 
                    startContent={<Plus size={18} />}
                    onPress={() => setShowCreate(true)}
                >
                    New Inquiry
                </Button>
            </div>

            {showCreate && (
                <Card className="modern-card border-none shadow-2xl bg-danger/5">
                    <CardBody className="p-8 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-black text-danger">New Refund Request</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input 
                                label="Refund Amount" 
                                placeholder="e.g. 5000" 
                                type="number"
                                value={newRefund.amount}
                                onValueChange={(val) => setNewRefund({...newRefund, amount: val})}
                                labelPlacement="outside"
                                size="lg"
                                radius="lg"
                                startContent={<span className="text-sm">₹</span>}
                            />
                            <Input 
                                label="Invoice Number (Optional)" 
                                placeholder="INV-2024-001" 
                                value={newRefund.invoiceId}
                                onValueChange={(val) => setNewRefund({...newRefund, invoiceId: val})}
                                labelPlacement="outside"
                                size="lg"
                                radius="lg"
                            />
                        </div>

                        <Textarea 
                            label="Reason for Refund" 
                            placeholder="Please explain the reason for your refund request..."
                            value={newRefund.reason}
                            onValueChange={(val) => setNewRefund({...newRefund, reason: val})}
                            labelPlacement="outside"
                            size="lg"
                            radius="lg"
                            minRows={4}
                        />

                        <div className="flex justify-end gap-3 mt-4">
                            <Button variant="flat" onPress={() => setShowCreate(false)}>Cancel</Button>
                            <Button color="danger" className="font-black px-10" onPress={handleCreate}>
                                Submit Inquiry
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            )}

            <Table aria-label="Refund history">
                <TableHeader>
                    <TableColumn>REQUEST ID</TableColumn>
                    <TableColumn>AMOUNT</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                    <TableColumn>SUBMITTED</TableColumn>
                    <TableColumn align="center">ACTIONS</TableColumn>
                </TableHeader>
                <TableBody 
                    emptyContent={isLoading ? "Loading..." : "No requests yet."}
                    items={refunds}
                >
                    {(item) => (
                        <TableRow key={item.id}>
                            <TableCell><span className="font-bold text-xs opacity-40 uppercase tracking-tighter">#{item.id.slice(-6)}</span></TableCell>
                            <TableCell><span className="font-black text-danger">₹{parseFloat(item.amount).toLocaleString()}</span></TableCell>
                            <TableCell>
                                <Chip 
                                    color={item.status === 'COMPLETED' ? 'success' : item.status === 'REJECTED' ? 'danger' : 'warning'} 
                                    size="sm" 
                                    variant="flat"
                                    className="font-bold uppercase text-[10px]"
                                >
                                    {item.status}
                                </Chip>
                            </TableCell>
                            <TableCell><span className="text-sm opacity-60">{new Date(item.createdAt).toLocaleDateString()}</span></TableCell>
                            <TableCell>
                                <div className="flex justify-center">
                                    <Button size="sm" variant="flat" startContent={<Mail size={14} />}>View Responses</Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
