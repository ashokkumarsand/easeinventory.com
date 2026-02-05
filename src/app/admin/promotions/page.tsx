'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
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
                    variant="default"
                    className="font-black px-8 shadow-xl shadow-primary/20"
                    onClick={() => setShowCreate(true)}
                >
                    <Plus size={18} />
                    Create Offer
                </Button>
            </div>

            {showCreate && (
                <Card className="modern-card border-none shadow-2xl bg-primary/5">
                    <CardContent className="p-8 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-black">New Promotion</h3>
                            <Button size="icon" variant="ghost" onClick={() => setShowCreate(false)}><X size={20} /></Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Campaign Title</Label>
                                <Input
                                    placeholder="e.g. 20% Off Renewal"
                                    value={newPromo.title}
                                    onChange={(e) => setNewPromo({...newPromo, title: e.target.value})}
                                    className="h-12 rounded-lg"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Distribution Channel</Label>
                                <Select
                                    value={newPromo.type}
                                    onValueChange={(value) => setNewPromo({...newPromo, type: value})}
                                >
                                    <SelectTrigger className="h-12 rounded-lg">
                                        <SelectValue placeholder="Select channel" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="EMAIL">Email Campaign</SelectItem>
                                        <SelectItem value="DASHBOARD_BANNER">Dashboard Banner</SelectItem>
                                        <SelectItem value="SMS">SMS Alert</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Message Content</Label>
                            <Textarea
                                placeholder="Write your campaign message here..."
                                value={newPromo.content}
                                onChange={(e) => setNewPromo({...newPromo, content: e.target.value})}
                                className="min-h-[120px] rounded-lg"
                            />
                        </div>

                        <div className="flex justify-end gap-3 mt-4">
                            <Button variant="secondary" onClick={() => setShowCreate(false)}>Discard</Button>
                            <Button variant="default" className="font-black px-10" onClick={handleCreate}>
                                <Send size={18} />
                                Launch Campaign
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="modern-card bg-foreground/5 p-4">
                    <CardContent className="flex flex-row items-center gap-4 p-0">
                        <div className="p-3 bg-primary/10 rounded-xl text-primary"><Megaphone size={20} /></div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Active Campaigns</p>
                            <h4 className="text-xl font-black">{promotions.filter(p => p.status === 'SENT').length}</h4>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>CAMPAIGN TITLE</TableHead>
                        <TableHead>CHANNEL</TableHead>
                        <TableHead>STATUS</TableHead>
                        <TableHead>SENT DATE</TableHead>
                        <TableHead className="text-center">ACTIONS</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {promotions.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                                {isLoading ? "Loading..." : "No campaign history found."}
                            </TableCell>
                        </TableRow>
                    ) : (
                        promotions.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell><span className="font-bold">{item.title}</span></TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className="font-black text-[10px] uppercase">
                                        {item.type}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={item.status === 'SENT' ? 'default' : 'secondary'}
                                        className="font-bold"
                                    >
                                        {item.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm opacity-60">
                                        {item.sentAt ? new Date(item.sentAt).toLocaleDateString() : 'Pending'}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex justify-center gap-2">
                                        <Button size="sm" variant="secondary">View Stats</Button>
                                        <Button size="sm" variant="destructive">Cancel</Button>
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

function X({ size }: { size: number }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
}
