'use client';

import { Avatar, Button, Card, CardBody, Chip } from '@heroui/react';
import { Calendar, Check, X } from 'lucide-react';

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

const LEAVE_TYPE_COLORS: Record<string, 'primary' | 'danger' | 'warning' | 'default'> = {
    CASUAL: 'primary',
    SICK: 'danger',
    EARNED: 'warning',
    UNPAID: 'default',
    MATERNITY: 'secondary' as any,
    PATERNITY: 'secondary' as any,
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

    return (
        <Card className="modern-card p-5" radius="lg">
            <CardBody className="p-0 space-y-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar
                            name={leave.employee.name}
                            radius="lg"
                            className="bg-secondary/10 text-secondary font-black"
                        />
                        <div>
                            <p className="font-black text-sm">{leave.employee.name}</p>
                            <p className="text-[10px] font-bold opacity-40 uppercase">
                                {leave.employee.employeeId}
                            </p>
                        </div>
                    </div>
                    <Chip
                        size="sm"
                        color={LEAVE_TYPE_COLORS[leave.leaveType] || 'default'}
                        variant="flat"
                        className="text-[10px] font-black"
                    >
                        {leave.leaveType.replace('_', ' ')}
                    </Chip>
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
                            color="danger"
                            variant="flat"
                            className="flex-1 font-bold h-10"
                            startContent={<X size={16} />}
                            onClick={() => onReject(leave.id)}
                            isLoading={isLoading}
                        >
                            Reject
                        </Button>
                        <Button
                            color="success"
                            className="flex-1 font-bold h-10"
                            startContent={<Check size={16} />}
                            onClick={() => onApprove(leave.id)}
                            isLoading={isLoading}
                        >
                            Approve
                        </Button>
                    </div>
                ) : (
                    <Chip
                        size="sm"
                        color={leave.status === 'APPROVED' ? 'success' : leave.status === 'REJECTED' ? 'danger' : 'default'}
                        variant="flat"
                        className="font-black text-[10px] w-full justify-center py-2"
                    >
                        {leave.status}
                    </Chip>
                )}
            </CardBody>
        </Card>
    );
}
