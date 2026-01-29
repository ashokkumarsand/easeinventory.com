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
import { Megaphone, Plus, Send } from "lucide-react";
import { useEffect, useState } from 'react';

export default function PromotionsPage() {
    const [promotions, setPromotions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newPromo, setNewPromo] = useState({
        title: '',
        content: '',
        type: 'EMAIL',
        targetPlans: ['FREE', 'STARTER']
    });

    const fetchPromotions = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/promotions');
            const data = await res.json();
            setPromotions(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch promotions:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPromotions();
    }, []);

    const handleCreate = async () => {
        try {
            const res = await fetch('/api/admin/promotions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPromo),
            });
            if (res.ok) {
                setShowCreate(false);
                setNewPromo({ title: '', content: '', type: 'EMAIL', targetPlans: ['FREE', 'STARTER'] });
                fetchPromotions();
            }
        } catch (error) {
            console.error("Failed to create promotion:", error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black tracking-tight">Promotional Offers</h2>
                    <p className="text-foreground/60 font-medium">Broadcast offers and announcements to your clients</p>
                </div>
                <Button 
                    color="primary" 
                    className="font-black px-8 shadow-xl shadow-primary/20" 
                    startContent={<Plus size={18} />}
                    onPress={() => setShowCreate(true)}
                >
                    Create Offer
                </Button>
            </div>

            {showCreate && (
                <Card className="modern-card border-none shadow-2xl bg-primary/5">
                    <CardBody className="p-8 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-black">New Promotion</h3>
                            <Button isIconOnly variant="light" onPress={() => setShowCreate(false)}><X size={20} /></Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input 
                                label="Campaign Title" 
                                placeholder="e.g. 20% Off Renewal" 
                                value={newPromo.title}
                                onValueChange={(val) => setNewPromo({...newPromo, title: val})}
                                labelPlacement="outside"
                                size="lg"
                                radius="lg"
                            />
                            <Select 
                                label="Distribution Channel" 
                                value={newPromo.type}
                                onChange={(e) => setNewPromo({...newPromo, type: e.target.value})}
                                labelPlacement="outside"
                                size="lg"
                                radius="lg"
                            >
                                <SelectItem key="EMAIL" value="EMAIL">Email Campaign</SelectItem>
                                <SelectItem key="DASHBOARD_BANNER" value="DASHBOARD_BANNER">Dashboard Banner</SelectItem>
                                <SelectItem key="SMS" value="SMS">SMS Alert</SelectItem>
                            </Select>
                        </div>

                        <Textarea 
                            label="Message Content" 
                            placeholder="Write your campaign message here..."
                            value={newPromo.content}
                            onValueChange={(val) => setNewPromo({...newPromo, content: val})}
                            labelPlacement="outside"
                            size="lg"
                            radius="lg"
                            minRows={4}
                        />

                        <div className="flex justify-end gap-3 mt-4">
                            <Button variant="flat" onPress={() => setShowCreate(false)}>Discard</Button>
                            <Button color="primary" className="font-black px-10" startContent={<Send size={18} />} onPress={handleCreate}>
                                Launch Campaign
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="modern-card bg-foreground/5 p-4">
                    <CardBody className="flex flex-row items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-xl text-primary"><Megaphone size={20} /></div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Active Campaigns</p>
                            <h4 className="text-xl font-black">{promotions.filter(p => p.status === 'SENT').length}</h4>
                        </div>
                    </CardBody>
                </Card>
            </div>

            <Table aria-label="Campaign history">
                <TableHeader>
                    <TableColumn>CAMPAIGN TITLE</TableColumn>
                    <TableColumn>CHANNEL</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                    <TableColumn>SENT DATE</TableColumn>
                    <TableColumn align="center">ACTIONS</TableColumn>
                </TableHeader>
                <TableBody 
                    emptyContent={isLoading ? "Loading..." : "No campaign history found."}
                    items={promotions}
                >
                    {(item) => (
                        <TableRow key={item.id}>
                            <TableCell><span className="font-bold">{item.title}</span></TableCell>
                            <TableCell>
                                <Chip size="sm" variant="flat" className="font-black text-[10px] uppercase">
                                    {item.type}
                                </Chip>
                            </TableCell>
                            <TableCell>
                                <Chip 
                                    color={item.status === 'SENT' ? 'success' : 'warning'} 
                                    size="sm" 
                                    variant="dot"
                                    className="font-bold"
                                >
                                    {item.status}
                                </Chip>
                            </TableCell>
                            <TableCell>
                                <span className="text-sm opacity-60">
                                    {item.sentAt ? new Date(item.sentAt).toLocaleDateString() : 'Pending'}
                                </span>
                            </TableCell>
                            <TableCell>
                                <div className="flex justify-center gap-2">
                                    <Button size="sm" variant="flat">View Stats</Button>
                                    <Button size="sm" variant="flat" color="danger">Cancel</Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

function X({ size }: { size: number }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
}
