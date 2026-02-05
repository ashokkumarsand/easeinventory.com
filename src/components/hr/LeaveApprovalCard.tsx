'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Check, Loader2, X } from 'lucide-react';

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

interface LeaveApprovalCardProps {
    leave: LeaveRequest;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    isLoading?: boolean;
}

const LEAVE_TYPE_COLORS: Record<string, string> = {
    CASUAL: 'bg-primary/10 text-primary',
    SICK: 'bg-destructive/10 text-destructive',
    EARNED: 'bg-yellow-500/10 text-yellow-600',
    UNPAID: 'bg-muted text-muted-foreground',
    MATERNITY: 'bg-secondary/10 text-secondary-foreground',
    PATERNITY: 'bg-secondary/10 text-secondary-foreground',
};

export default function LeaveApprovalCard({
    leave,
    onApprove,
    onReject,
    isLoading = false,
}: LeaveApprovalCardProps) {
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const calculateDays = () => {
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    };

    const days = calculateDays();
    const isPending = leave.status === 'PENDING';

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <Card className="modern-card p-5 rounded-xl">
            <CardContent className="p-0 space-y-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="bg-secondary/10 text-secondary font-black rounded-xl">
                            <AvatarFallback className="bg-secondary/10 text-secondary font-black rounded-xl">
                                {getInitials(leave.employee.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-black text-sm">{leave.employee.name}</p>
                            <p className="text-[10px] font-bold opacity-40 uppercase">
                                {leave.employee.employeeId}
                            </p>
                        </div>
                    </div>
                    <Badge
                        variant="secondary"
                        className={`text-[10px] font-black ${LEAVE_TYPE_COLORS[leave.leaveType] || 'bg-muted text-muted-foreground'}`}
                    >
                        {leave.leaveType.replace('_', ' ')}
                    </Badge>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02]">
                    <Calendar size={16} className="opacity-40" />
                    <div className="flex-1">
                        <p className="text-xs font-bold">
                            {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                        </p>
                        <p className="text-[10px] font-bold opacity-40">{days} day(s)</p>
                    </div>
                </div>

                {leave.reason && (
                    <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02]">
                        <p className="text-[10px] font-bold opacity-40 uppercase mb-1">Reason</p>
                        <p className="text-xs">{leave.reason}</p>
                    </div>
                )}

                {isPending ? (
                    <div className="flex gap-2 pt-2">
                        <Button
                            variant="secondary"
                            className="flex-1 font-bold h-10 bg-destructive/10 text-destructive hover:bg-destructive/20"
                            onClick={() => onReject(leave.id)}
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 size={16} className="mr-2 animate-spin" /> : <X size={16} className="mr-2" />}
                            Reject
                        </Button>
                        <Button
                            className="flex-1 font-bold h-10 bg-green-500 hover:bg-green-600"
                            onClick={() => onApprove(leave.id)}
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Check size={16} className="mr-2" />}
                            Approve
                        </Button>
                    </div>
                ) : (
                    <Badge
                        variant="secondary"
                        className={`font-black text-[10px] w-full justify-center py-2 ${
                            leave.status === 'APPROVED' ? 'bg-green-500/10 text-green-600' :
                            leave.status === 'REJECTED' ? 'bg-destructive/10 text-destructive' :
                            'bg-muted text-muted-foreground'
                        }`}
                    >
                        {leave.status}
                    </Badge>
                )}
            </CardContent>
        </Card>
    );
}
