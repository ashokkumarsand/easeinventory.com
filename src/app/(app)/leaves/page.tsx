'use client';

import { usePermissions } from '@/hooks/usePermissions';
import { useDisclosure } from '@/hooks/useDisclosure';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Calendar,
    Check,
    Clock,
    Filter,
    Loader2,
    Plus,
    X
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function LeavesPage() {
    const { canManageHR } = usePermissions();
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [leaves, setLeaves] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // New Leave State
    const [newLeave, setNewLeave] = useState({
        leaveType: 'CASUAL',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        reason: ''
    });

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/hr/leaves');
            const data = await response.json();
            setLeaves(data.leaves || []);
        } catch (error) {
            console.error('Fetch leaves error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitLeave = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/hr/leaves', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newLeave),
            });

            if (response.ok) {
                fetchLeaves();
                onOpenChange(false);
                setNewLeave({
                    leaveType: 'CASUAL',
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: new Date().toISOString().split('T')[0],
                    reason: ''
                });
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to submit leave');
            }
        } catch (error) {
            alert('Error submitting leave');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = async (id: string, status: 'APPROVED' | 'REJECTED') => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/hr/leaves/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });

            if (response.ok) {
                fetchLeaves();
            } else {
                const data = await response.json();
                alert(data.message || 'Action failed');
            }
        } catch (error) {
            alert('Error processing leave request');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        switch (status) {
            case 'APPROVED': return 'default';
            case 'REJECTED': return 'destructive';
            case 'PENDING': return 'secondary';
            default: return 'outline';
        }
    };

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <Calendar size={22} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-black tracking-tight font-heading">Leave Management</h1>
                    </div>
                    <p className="text-foreground/50 font-bold ml-1">Request absences and track approval workflows.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="font-bold rounded-2xl">
                        <Filter size={18} className="mr-2" />
                        Filter Requests
                    </Button>
                    <Button onClick={onOpen} className="font-black px-8 shadow-xl shadow-yellow-500/20 rounded-full bg-yellow-500 hover:bg-yellow-600 text-white">
                        <Plus size={20} className="mr-2" />
                        Request Leave
                    </Button>
                </div>
            </div>

            {/* Content Table */}
            <div className="space-y-6">
                <div className="bg-card border border-black/5 dark:border-white/10 rounded-[2.5rem] overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-black/5 dark:border-white/10">
                                <th className="bg-black/[0.02] dark:bg-white/[0.02] h-16 font-black uppercase tracking-wider text-[10px] opacity-40 px-8 text-left">EMPLOYEE</th>
                                <th className="bg-black/[0.02] dark:bg-white/[0.02] h-16 font-black uppercase tracking-wider text-[10px] opacity-40 px-8 text-left">TYPE</th>
                                <th className="bg-black/[0.02] dark:bg-white/[0.02] h-16 font-black uppercase tracking-wider text-[10px] opacity-40 px-8 text-left">DURATION</th>
                                <th className="bg-black/[0.02] dark:bg-white/[0.02] h-16 font-black uppercase tracking-wider text-[10px] opacity-40 px-8 text-left">STATUS</th>
                                <th className="bg-black/[0.02] dark:bg-white/[0.02] h-16 font-black uppercase tracking-wider text-[10px] opacity-40 px-8 text-left">REASON</th>
                                <th className="bg-black/[0.02] dark:bg-white/[0.02] h-16 font-black uppercase tracking-wider text-[10px] opacity-40 px-8 text-center">ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaves.map((leave) => (
                                <tr key={leave.id} className="border-b last:border-none border-black/5 dark:border-white/10 hover:bg-black/[0.01] transition-colors">
                                    <td className="py-6 px-8 font-bold">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8 bg-yellow-500/10 text-yellow-600 font-black">
                                                <AvatarFallback>{leave.employee?.name?.[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-black tracking-tight">{leave.employee?.name}</span>
                                                <span className="text-[10px] font-bold opacity-30 uppercase">{leave.employee?.employeeId}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-6 px-8 font-bold">
                                        <Badge variant="secondary" className="font-black text-[10px] border-none">
                                            {leave.leaveType}
                                        </Badge>
                                    </td>
                                    <td className="py-6 px-8 font-bold">
                                        <div className="flex flex-col">
                                            <span className="text-sm">{new Date(leave.startDate).toLocaleDateString()}</span>
                                            <span className="text-[10px] opacity-30 uppercase font-black">To {new Date(leave.endDate).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="py-6 px-8 font-bold">
                                        <Badge variant={getStatusColor(leave.status)} className="font-black text-[10px] uppercase">
                                            {leave.status}
                                        </Badge>
                                    </td>
                                    <td className="py-6 px-8 font-bold max-w-[200px] truncate opacity-50 text-xs italic">
                                        &quot;{leave.reason || 'No reason provided'}&quot;
                                    </td>
                                    <td className="py-6 px-8 font-bold text-center">
                                        {leave.status === 'PENDING' && canManageHR ? (
                                            <div className="flex items-center gap-2 justify-center">
                                                <Button variant="default" size="icon" className="rounded-full h-8 w-8" onClick={() => handleAction(leave.id, 'APPROVED')}>
                                                    <Check size={16} />
                                                </Button>
                                                <Button variant="destructive" size="icon" className="rounded-full h-8 w-8" onClick={() => handleAction(leave.id, 'REJECTED')}>
                                                    <X size={16} />
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" disabled>
                                                <Clock size={16} className="opacity-20" />
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Request Leave Modal */}
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black tracking-tight">Request Absence</DialogTitle>
                        <DialogDescription className="text-xs font-bold opacity-30 uppercase tracking-[0.2em]">Submit leave for manager approval</DialogDescription>
                    </DialogHeader>
                    <div className="py-8 space-y-8">
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <Label>Leave Type</Label>
                                <Select
                                    defaultValue="CASUAL"
                                    onValueChange={(val) => setNewLeave({...newLeave, leaveType: val})}
                                >
                                    <SelectTrigger className="bg-black/5 h-14">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CASUAL">Casual Leave</SelectItem>
                                        <SelectItem value="SICK">Sick Leave</SelectItem>
                                        <SelectItem value="EARNED">Earned Leave</SelectItem>
                                        <SelectItem value="UNPAID">Unpaid Leave</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                 <Label>Balance</Label>
                                 <div className="h-14 bg-yellow-500/5 rounded-2xl flex items-center px-4 border border-yellow-500/10">
                                    <span className="font-black text-yellow-600">12 Days Remaining</span>
                                 </div>
                            </div>
                            <div className="space-y-2">
                                <Label>From Date</Label>
                                <Input
                                    type="date"
                                    className="bg-black/5 h-14 text-xs"
                                    value={newLeave.startDate}
                                    onChange={(e) => setNewLeave({...newLeave, startDate: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>To Date</Label>
                                <Input
                                    type="date"
                                    className="bg-black/5 h-14 text-xs"
                                    value={newLeave.endDate}
                                    onChange={(e) => setNewLeave({...newLeave, endDate: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Reason for Absence</Label>
                            <Textarea
                                placeholder="Briefly describe why you are requesting this leave..."
                                className="bg-black/5 p-4 rounded-2xl"
                                value={newLeave.reason}
                                onChange={(e) => setNewLeave({...newLeave, reason: e.target.value})}
                            />
                        </div>
                    </div>
                    <DialogFooter className="border-t border-black/5 pt-6">
                        <Button variant="ghost" className="font-bold h-12 px-8" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button onClick={handleSubmitLeave} disabled={isLoading} className="font-black h-12 px-10 shadow-xl shadow-yellow-500/20 rounded-full bg-yellow-500 hover:bg-yellow-600 text-white">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit Request
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
