'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDisclosure } from '@/hooks/useDisclosure';
import {
    Calendar,
    Check,
    Clock,
    FileText,
    Loader2,
    Plus,
    RefreshCw,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import LeaveApprovalCard from '@/components/hr/LeaveApprovalCard';
import LeaveBalanceWidget from '@/components/hr/LeaveBalanceWidget';
import LeaveRequestModal from '@/components/hr/LeaveRequestModal';

interface LeaveRequest {
    id: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    reason: string | null;
    status: string;
    employee: {
        name: string;
        employeeId: string;
    };
    createdAt: string;
}

interface LeaveBalance {
    casualTotal: number;
    casualUsed: number;
    sickTotal: number;
    sickUsed: number;
    earnedTotal: number;
    earnedUsed: number;
}

export default function LeaveManagementPage() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [balance, setBalance] = useState<LeaveBalance | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const currentYear = new Date().getFullYear();

    useEffect(() => {
        fetchLeaves();
        fetchBalance();
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

    const fetchBalance = async () => {
        try {
            const response = await fetch(`/api/hr/leave-balance?year=${currentYear}`);
            const data = await response.json();
            // Get first balance (user's own) or null
            if (data.balances && data.balances.length > 0) {
                setBalance(data.balances[0]);
            }
        } catch (error) {
            console.error('Fetch balance error:', error);
        }
    };

    const handleSubmitLeave = async (data: {
        leaveType: string;
        startDate: string;
        endDate: string;
        reason: string;
    }) => {
        const response = await fetch('/api/hr/leaves', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to submit leave');
        }

        fetchLeaves();
        fetchBalance();
    };

    const handleApprove = async (id: string) => {
        setIsActionLoading(true);
        try {
            const response = await fetch(`/api/hr/leaves/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'APPROVED' }),
            });

            if (response.ok) {
                fetchLeaves();
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to approve');
            }
        } catch (error) {
            alert('Error approving leave');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleReject = async (id: string) => {
        setIsActionLoading(true);
        try {
            const response = await fetch(`/api/hr/leaves/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'REJECTED' }),
            });

            if (response.ok) {
                fetchLeaves();
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to reject');
            }
        } catch (error) {
            alert('Error rejecting leave');
        } finally {
            setIsActionLoading(false);
        }
    };

    const filteredLeaves = statusFilter === 'ALL'
        ? leaves
        : leaves.filter(l => l.status === statusFilter);

    const pendingCount = leaves.filter(l => l.status === 'PENDING').length;
    const approvedCount = leaves.filter(l => l.status === 'APPROVED').length;
    const rejectedCount = leaves.filter(l => l.status === 'REJECTED').length;

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                            <FileText size={22} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-secondary">
                            Leave Management
                        </h1>
                    </div>
                    <p className="text-black/40 dark:text-white/40 font-bold ml-1">
                        Request and manage team leave applications
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="secondary"
                        className="font-bold rounded-2xl"
                        onClick={() => {
                            fetchLeaves();
                            fetchBalance();
                        }}
                        disabled={isLoading}
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <RefreshCw size={18} />
                        Refresh
                    </Button>
                    <Button
                        className="font-black px-8 shadow-xl shadow-secondary/20 rounded-full"
                        size="lg"
                        onClick={onOpen}
                    >
                        <Plus size={20} />
                        Request Leave
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="modern-card bg-secondary text-white p-6 rounded-lg">
                    <CardContent className="p-0">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 text-white">
                            Total Requests
                        </p>
                        <h2 className="text-4xl font-black">{leaves.length}</h2>
                        <p className="text-xs font-bold opacity-60">This year</p>
                    </CardContent>
                </Card>
                <Card className="modern-card p-6 border border-black/5 dark:border-white/10 rounded-lg">
                    <CardContent className="p-0 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-warning/10 flex items-center justify-center">
                            <Clock size={24} className="text-warning" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Pending</p>
                            <h2 className="text-3xl font-black text-warning">{pendingCount}</h2>
                        </div>
                    </CardContent>
                </Card>
                <Card className="modern-card p-6 border border-black/5 dark:border-white/10 rounded-lg">
                    <CardContent className="p-0 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center">
                            <Check size={24} className="text-success" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Approved</p>
                            <h2 className="text-3xl font-black text-success">{approvedCount}</h2>
                        </div>
                    </CardContent>
                </Card>
                <Card className="modern-card p-6 border border-black/5 dark:border-white/10 rounded-lg">
                    <CardContent className="p-0 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-danger/10 flex items-center justify-center">
                            <X size={24} className="text-danger" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Rejected</p>
                            <h2 className="text-3xl font-black text-danger">{rejectedCount}</h2>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Leave Requests */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black uppercase tracking-widest opacity-40">
                            Leave Requests
                        </h3>
                        <Select
                            value={statusFilter}
                            onValueChange={(value) => setStatusFilter(value)}
                        >
                            <SelectTrigger className="bg-black/5 h-10 min-w-[140px] rounded-xl">
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Status</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="APPROVED">Approved</SelectItem>
                                <SelectItem value="REJECTED">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {isLoading ? (
                        <div className="text-center py-20 opacity-40">Loading...</div>
                    ) : filteredLeaves.length === 0 ? (
                        <Card className="modern-card p-8 rounded-lg">
                            <CardContent className="p-0 text-center py-12">
                                <Calendar size={48} className="mx-auto opacity-20 mb-4" />
                                <p className="font-bold opacity-40">No leave requests found</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <Tabs defaultValue="pending" className="w-full">
                            <TabsList className="gap-6 w-full relative rounded-none p-0 border-b border-divider bg-transparent h-auto">
                                <TabsTrigger
                                    value="pending"
                                    className="max-w-fit px-0 h-12 data-[state=active]:text-secondary font-black uppercase tracking-widest text-[10px] rounded-none data-[state=active]:border-b-2 data-[state=active]:border-secondary data-[state=active]:shadow-none"
                                >
                                    <div className="flex items-center gap-2">
                                        <Clock size={14} />
                                        <span>Pending ({pendingCount})</span>
                                    </div>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="history"
                                    className="max-w-fit px-0 h-12 data-[state=active]:text-secondary font-black uppercase tracking-widest text-[10px] rounded-none data-[state=active]:border-b-2 data-[state=active]:border-secondary data-[state=active]:shadow-none"
                                >
                                    <div className="flex items-center gap-2">
                                        <FileText size={14} />
                                        <span>History ({approvedCount + rejectedCount})</span>
                                    </div>
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="pending">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
                                    {leaves
                                        .filter((l) => l.status === 'PENDING')
                                        .map((leave) => (
                                            <LeaveApprovalCard
                                                key={leave.id}
                                                leave={leave}
                                                onApprove={handleApprove}
                                                onReject={handleReject}
                                                isLoading={isActionLoading}
                                            />
                                        ))}
                                    {pendingCount === 0 && (
                                        <p className="col-span-2 text-center py-8 opacity-40">
                                            No pending requests
                                        </p>
                                    )}
                                </div>
                            </TabsContent>
                            <TabsContent value="history">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
                                    {leaves
                                        .filter((l) => l.status !== 'PENDING')
                                        .map((leave) => (
                                            <LeaveApprovalCard
                                                key={leave.id}
                                                leave={leave}
                                                onApprove={handleApprove}
                                                onReject={handleReject}
                                            />
                                        ))}
                                    {approvedCount + rejectedCount === 0 && (
                                        <p className="col-span-2 text-center py-8 opacity-40">
                                            No history yet
                                        </p>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    )}
                </div>

                {/* Leave Balance Sidebar */}
                <div className="lg:col-span-4">
                    <LeaveBalanceWidget balance={balance} year={currentYear} />
                </div>
            </div>

            {/* Leave Request Modal */}
            <LeaveRequestModal
                isOpen={isOpen}
                onClose={onClose}
                onSubmit={handleSubmitLeave}
                balance={balance}
            />
        </div>
    );
}
