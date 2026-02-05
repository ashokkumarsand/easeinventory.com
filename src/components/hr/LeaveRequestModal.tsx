'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

interface LeaveRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        leaveType: string;
        startDate: string;
        endDate: string;
        reason: string;
    }) => Promise<void>;
    balance?: {
        casualTotal: number;
        casualUsed: number;
        sickTotal: number;
        sickUsed: number;
        earnedTotal: number;
        earnedUsed: number;
    } | null;
}

const LEAVE_TYPES = [
    { key: 'CASUAL', label: 'Casual Leave', description: 'For personal matters' },
    { key: 'SICK', label: 'Sick Leave', description: 'For health issues' },
    { key: 'EARNED', label: 'Earned Leave', description: 'Annual/privilege leave' },
    { key: 'UNPAID', label: 'Unpaid Leave', description: 'Leave without pay' },
    { key: 'MATERNITY', label: 'Maternity Leave', description: 'Maternity benefit' },
    { key: 'PATERNITY', label: 'Paternity Leave', description: 'Paternity benefit' },
];

export default function LeaveRequestModal({
    isOpen,
    onClose,
    onSubmit,
    balance,
}: LeaveRequestModalProps) {
    const [leaveType, setLeaveType] = useState<string>('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!leaveType || !startDate || !endDate) {
            setError('Please fill all required fields');
            return;
        }

        if (new Date(endDate) < new Date(startDate)) {
            setError('End date cannot be before start date');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await onSubmit({ leaveType, startDate, endDate, reason });
            handleClose();
        } catch (err: any) {
            setError(err.message || 'Failed to submit leave request');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setLeaveType('');
        setStartDate('');
        setEndDate('');
        setReason('');
        setError('');
        onClose();
    };

    const getAvailableBalance = () => {
        if (!balance || !leaveType) return null;

        switch (leaveType) {
            case 'CASUAL':
                return balance.casualTotal - balance.casualUsed;
            case 'SICK':
                return balance.sickTotal - balance.sickUsed;
            case 'EARNED':
                return balance.earnedTotal - balance.earnedUsed;
            default:
                return null;
        }
    };

    const availableBalance = getAvailableBalance();

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="max-w-lg modern-card p-6">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black tracking-tight">Request Leave</DialogTitle>
                    <DialogDescription className="text-xs font-bold opacity-30 uppercase tracking-[0.2em]">
                        Submit a new leave request
                    </DialogDescription>
                </DialogHeader>
                <div className="py-8 space-y-6">
                    {error && (
                        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                            <p className="text-sm font-bold text-destructive">{error}</p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="leave-type" className="text-sm font-bold">
                            Leave Type <span className="text-destructive">*</span>
                        </Label>
                        <Select value={leaveType} onValueChange={setLeaveType}>
                            <SelectTrigger className="bg-black/5 h-14 text-lg rounded-lg">
                                <SelectValue placeholder="Select leave type" />
                            </SelectTrigger>
                            <SelectContent>
                                {LEAVE_TYPES.map((type) => (
                                    <SelectItem key={type.key} value={type.key}>
                                        <div className="flex flex-col">
                                            <span>{type.label}</span>
                                            <span className="text-xs text-muted-foreground">{type.description}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {availableBalance !== null && (
                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                            <p className="text-sm">
                                <span className="font-bold">Available Balance: </span>
                                <span className="font-black text-primary">{availableBalance} days</span>
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="start-date" className="text-sm font-bold">
                                Start Date <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="start-date"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-black/5 h-14 rounded-lg"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="end-date" className="text-sm font-bold">
                                End Date <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="end-date"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-black/5 h-14 rounded-lg"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reason" className="text-sm font-bold">
                            Reason
                        </Label>
                        <Textarea
                            id="reason"
                            placeholder="Please provide a reason for your leave request..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="bg-black/5 rounded-lg min-h-[100px]"
                        />
                    </div>
                </div>
                <DialogFooter className="border-t border-black/5 pt-6">
                    <Button
                        variant="ghost"
                        className="font-bold h-12 px-8"
                        onClick={handleClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="secondary"
                        className="font-black h-12 px-10 shadow-xl shadow-secondary/20 rounded-full"
                        onClick={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Request
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
