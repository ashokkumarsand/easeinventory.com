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
import { Mail, MessageSquare, Search } from "lucide-react";
import { useEffect, useState } from 'react';

export default function RefundsPage() {
    const [refunds, setRefunds] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedRefund, setSelectedRefund] = useState<any>(null);
    const [reply, setReply] = useState('');

    const fetchRefunds = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/refunds');
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

    const handleSendReply = async () => {
        if (!selectedRefund || !reply) return;
        try {
            const res = await fetch(`/api/admin/refunds/${selectedRefund.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: reply, status: 'UNDER_REVIEW' }),
            });
            if (res.ok) {
                setReply('');
                fetchRefunds();
            }
        } catch (error) {
            console.error("Failed to send reply:", error);
        }
    };

    const filteredRefunds = refunds.filter(r => 
        r.tenant.name.toLowerCase().includes(search.toLowerCase()) ||
        r.reason.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black tracking-tight">Refund Requests</h2>
                    <p className="text-foreground/60 font-medium">Manage client refund inquiries and communications</p>
                </div>
                <Chip variant="flat" color="danger" size="lg" className="font-bold">
                    {refunds.filter(r => r.status === 'OPEN').length} Open
                </Chip>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-12">
                   <div className="flex gap-4 mb-4">
                        <Input 
                            placeholder="Search refunds..." 
                            startContent={<Search size={18} className="opacity-30" />}
                            className="max-w-md"
                            value={search}
                            onValueChange={setSearch}
                        />
                    </div>

                    <Table aria-label="Refund requests">
                        <TableHeader>
                            <TableColumn>CLIENT</TableColumn>
                            <TableColumn>AMOUNT</TableColumn>
                            <TableColumn>REASON</TableColumn>
                            <TableColumn>STATUS</TableColumn>
                            <TableColumn>DATE</TableColumn>
                            <TableColumn align="center">ACTIONS</TableColumn>
                        </TableHeader>
                        <TableBody 
                            emptyContent={isLoading ? "Loading..." : "No refund requests found."}
                            items={filteredRefunds}
                        >
                            {(item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-bold">{item.tenant.name}</span>
                                            <span className="text-tiny text-foreground/40">{item.tenant.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-black text-danger">₹{parseFloat(item.amount).toLocaleString()}</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm opacity-70 line-clamp-1">{item.reason}</span>
                                    </TableCell>
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
                                    <TableCell>
                                        <span className="text-sm font-medium">{new Date(item.createdAt).toLocaleDateString()}</span>
                                    </TableCell>
                                    <TableCell>
                                        <Button 
                                            size="sm" 
                                            variant="flat" 
                                            startContent={<MessageSquare size={14} />}
                                            onPress={() => setSelectedRefund(item)}
                                        >
                                            View & Reply
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {selectedRefund && (
                    <div className="lg:col-span-12 mt-10">
                        <Card className="modern-card border-none shadow-xl bg-primary/5">
                            <CardBody className="p-8 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-black">Refund Inquiry: {selectedRefund.tenant.name}</h3>
                                        <p className="text-sm opacity-50 font-medium">Request ID: {selectedRefund.id}</p>
                                    </div>
                                    <Button isIconOnly variant="light" onPress={() => setSelectedRefund(null)}><X size={20} /></Button>
                                </div>

                                <div className="p-4 rounded-xl bg-white/50 dark:bg-black/50 border border-primary/10">
                                    <p className="font-bold mb-1">Reason for Refund:</p>
                                    <p className="text-sm font-medium italic opacity-70">"{selectedRefund.reason}"</p>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs font-black uppercase tracking-widest opacity-40">Email Reply to Client</label>
                                    <Textarea 
                                        placeholder="Type your response to the client..."
                                        value={reply}
                                        onValueChange={setReply}
                                        minRows={4}
                                        variant="bordered"
                                        className="bg-background"
                                    />
                                    <div className="flex justify-end gap-3">
                                        <Button variant="flat" color="danger" className="font-bold">Reject Refund</Button>
                                        <Button color="success" className="font-bold text-white">Approve Refund</Button>
                                        <Button color="primary" className="font-black px-8" startContent={<Mail size={18} />} onPress={handleSendReply}>
                                            Send Email Reply
                                        </Button>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}

function X({ size }: { size: number }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
}
