'use client';

import {
    Button,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Select,
    SelectItem,
    Textarea,
} from '@heroui/react';
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
        <Modal
            isOpen={isOpen}
            onOpenChange={(open) => !open && handleClose()}
            size="lg"
            classNames={{ base: 'modern-card p-6' }}
        >
            <ModalContent>
                {() => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            <h2 className="text-2xl font-black tracking-tight">Request Leave</h2>
                            <p className="text-xs font-bold opacity-30 uppercase tracking-[0.2em]">
                                Submit a new leave request
                            </p>
                        </ModalHeader>
                        <ModalBody className="py-8 space-y-6">
                            {error && (
                                <div className="p-4 rounded-xl bg-danger/10 border border-danger/20">
                                    <p className="text-sm font-bold text-danger">{error}</p>
                                </div>
                            )}

                            <Select
                                label="Leave Type"
                                placeholder="Select leave type"
                                labelPlacement="outside"
                                size="lg"
                                radius="lg"
                                selectedKeys={leaveType ? [leaveType] : []}
                                onSelectionChange={(keys) => setLeaveType(Array.from(keys)[0] as string)}
                                classNames={{ trigger: 'bg-black/5 h-14' }}
                                isRequired
                            >
                                {LEAVE_TYPES.map((type) => (
                                    <SelectItem key={type.key} description={type.description}>
                                        {type.label}
                                    </SelectItem>
                                ))}
                            </Select>

                            {availableBalance !== null && (
                                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                                    <p className="text-sm">
                                        <span className="font-bold">Available Balance: </span>
                                        <span className="font-black text-primary">{availableBalance} days</span>
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Start Date"
                                    type="date"
                                    labelPlacement="outside"
                                    size="lg"
                                    radius="lg"
                                    value={startDate}
                                    onValueChange={setStartDate}
                                    classNames={{ inputWrapper: 'bg-black/5 h-14' }}
                                    isRequired
                                />
                                <Input
                                    label="End Date"
                                    type="date"
                                    labelPlacement="outside"
                                    size="lg"
                                    radius="lg"
                                    value={endDate}
                                    onValueChange={setEndDate}
                                    classNames={{ inputWrapper: 'bg-black/5 h-14' }}
                                    isRequired
                                />
                            </div>

                            <Textarea
                                label="Reason"
                                placeholder="Please provide a reason for your leave request..."
                                labelPlacement="outside"
                                radius="lg"
                                value={reason}
                                onValueChange={setReason}
                                classNames={{ inputWrapper: 'bg-black/5' }}
                                minRows={3}
                            />
                        </ModalBody>
                        <ModalFooter className="border-t border-black/5 pt-6">
                            <Button
                                variant="light"
                                className="font-bold h-12 px-8"
                                onPress={handleClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                color="secondary"
                                className="font-black h-12 px-10 shadow-xl shadow-secondary/20"
                                radius="full"
                                onClick={handleSubmit}
                                isLoading={isLoading}
                            >
                                Submit Request
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
