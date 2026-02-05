'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
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
                    variant="default"
                    className="font-black px-8 shadow-xl shadow-primary/20"
                    onClick={() => setShowCreate(true)}
                >
                    <Plus size={18} />
                    New Inquiry
                </Button>
            </div>

            {showCreate && (
                <Card className="modern-card border-none shadow-2xl bg-destructive/5">
                    <CardContent className="p-8 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-black text-destructive">New Refund Request</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="refund-amount">Refund Amount</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₹</span>
                                    <Input
                                        id="refund-amount"
                                        placeholder="e.g. 5000"
                                        type="number"
                                        value={newRefund.amount}
                                        onChange={(e) => setNewRefund({...newRefund, amount: e.target.value})}
                                        className="h-12 rounded-lg pl-8"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="invoice-id">Invoice Number (Optional)</Label>
                                <Input
                                    id="invoice-id"
                                    placeholder="INV-2024-001"
                                    value={newRefund.invoiceId}
                                    onChange={(e) => setNewRefund({...newRefund, invoiceId: e.target.value})}
                                    className="h-12 rounded-lg"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="refund-reason">Reason for Refund</Label>
                            <Textarea
                                id="refund-reason"
                                placeholder="Please explain the reason for your refund request..."
                                value={newRefund.reason}
                                onChange={(e) => setNewRefund({...newRefund, reason: e.target.value})}
                                className="rounded-lg min-h-[120px]"
                            />
                        </div>

                        <div className="flex justify-end gap-3 mt-4">
                            <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
                            <Button variant="destructive" className="font-black px-10" onClick={handleCreate}>
                                Submit Inquiry
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>REQUEST ID</TableHead>
                        <TableHead>AMOUNT</TableHead>
                        <TableHead>STATUS</TableHead>
                        <TableHead>SUBMITTED</TableHead>
                        <TableHead className="text-center">ACTIONS</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {refunds.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                                {isLoading ? "Loading..." : "No requests yet."}
                            </TableCell>
                        </TableRow>
                    ) : (
                        refunds.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell><span className="font-bold text-xs opacity-40 uppercase tracking-tighter">#{item.id.slice(-6)}</span></TableCell>
                                <TableCell><span className="font-black text-destructive">₹{parseFloat(item.amount).toLocaleString()}</span></TableCell>
                                <TableCell>
                                    <Badge
                                        variant={item.status === 'COMPLETED' ? 'default' : item.status === 'REJECTED' ? 'destructive' : 'secondary'}
                                        className="font-bold uppercase text-[10px]"
                                    >
                                        {item.status}
                                    </Badge>
                                </TableCell>
                                <TableCell><span className="text-sm opacity-60">{new Date(item.createdAt).toLocaleDateString()}</span></TableCell>
                                <TableCell>
                                    <div className="flex justify-center">
                                        <Button size="sm" variant="secondary">
                                            <Mail size={14} />
                                            View Responses
                                        </Button>
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
