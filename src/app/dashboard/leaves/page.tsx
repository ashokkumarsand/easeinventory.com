'use client';

import { usePermissions } from '@/hooks/usePermissions';
import {
    Avatar,
    Button,
    Chip,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Select,
    SelectItem,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Textarea,
    useDisclosure
} from '@heroui/react';
import {
    Calendar,
    Check,
    Clock,
    Filter,
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
                onOpenChange();
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'success';
            case 'REJECTED': return 'danger';
            case 'PENDING': return 'warning';
            default: return 'default';
        }
    };

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-warning/10 flex items-center justify-center text-warning">
                            <Calendar size={22} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-warning">Leave Management</h1>
                    </div>
                    <p className="text-black/40 dark:text-white/40 font-bold ml-1">Request absences and track approval workflows.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="flat" color="default" className="font-bold rounded-2xl" startContent={<Filter size={18} />}>
                        Filter Requests
                    </Button>
                    <Button color="warning" radius="full" size="lg" className="font-black px-8 shadow-xl shadow-warning/20 text-white" startContent={<Plus size={20} />} onClick={onOpen}>
                        Request Leave
                    </Button>
                </div>
            </div>

            {/* Content Table */}
            <div className="space-y-6">
                <Table 
                    aria-label="Leave Requests"
                    className="modern-card border-none"
                    classNames={{
                        wrapper: "p-0 modern-card theme-table-wrapper border border-black/5 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-none",
                        th: "bg-black/[0.02] dark:bg-white/[0.02] h-16 font-black uppercase tracking-wider text-[10px] opacity-40 px-8",
                        td: "py-6 px-8 font-bold",
                    }}
                >
                    <TableHeader>
                        <TableColumn>EMPLOYEE</TableColumn>
                        <TableColumn>TYPE</TableColumn>
                        <TableColumn>DURATION</TableColumn>
                        <TableColumn>STATUS</TableColumn>
                        <TableColumn>REASON</TableColumn>
                        <TableColumn align="center">ACTION</TableColumn>
                    </TableHeader>
                    <TableBody>
                        {leaves.map((leave) => (
                            <TableRow key={leave.id} className="border-b last:border-none border-black/5 dark:border-white/10 hover:bg-black/[0.01] transition-colors">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar name={leave.employee?.name} size="sm" className="bg-warning/10 text-warning font-black" />
                                        <div className="flex flex-col">
                                            <span className="font-black tracking-tight">{leave.employee?.name}</span>
                                            <span className="text-[10px] font-bold opacity-30 uppercase">{leave.employee?.employeeId}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Chip variant="dot" color="warning" size="sm" className="font-black text-[10px] border-none">
                                        {leave.leaveType}
                                    </Chip>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-sm">{new Date(leave.startDate).toLocaleDateString()}</span>
                                        <span className="text-[10px] opacity-30 uppercase font-black">To {new Date(leave.endDate).toLocaleDateString()}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Chip variant="flat" size="sm" color={getStatusColor(leave.status) as any} className="font-black text-[10px] uppercase">
                                        {leave.status}
                                    </Chip>
                                </TableCell>
                                <TableCell className="max-w-[200px] truncate opacity-50 text-xs italic">
                                    "{leave.reason || 'No reason provided'}"
                                </TableCell>
                                <TableCell>
                                    {leave.status === 'PENDING' && canManageHR ? (
                                        <div className="flex items-center gap-2">
                                            <Button isIconOnly radius="full" color="success" variant="flat" size="sm" onClick={() => handleAction(leave.id, 'APPROVED')}>
                                                <Check size={16} />
                                            </Button>
                                            <Button isIconOnly radius="full" color="danger" variant="flat" size="sm" onClick={() => handleAction(leave.id, 'REJECTED')}>
                                                <X size={16} />
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button isIconOnly radius="full" variant="light" size="sm" disabled><Clock size={16} className="opacity-20" /></Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Request Leave Modal */}
            <Modal 
                isOpen={isOpen} 
                onOpenChange={onOpenChange}
                size="2xl"
                classNames={{ base: "modern-card p-6" }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <h2 className="text-2xl font-black tracking-tight">Request Absence</h2>
                                <p className="text-xs font-bold opacity-30 uppercase tracking-[0.2em]">Submit leave for manager approval</p>
                            </ModalHeader>
                            <ModalBody className="py-8 space-y-8">
                                <div className="grid grid-cols-2 gap-8">
                                    <Select 
                                        label="Leave Type" 
                                        labelPlacement="outside"
                                        size="lg"
                                        radius="lg"
                                        classNames={{ trigger: "bg-black/5 h-14" }}
                                        defaultSelectedKeys={['CASUAL']}
                                        onSelectionChange={(keys) => setNewLeave({...newLeave, leaveType: Array.from(keys)[0] as string})}
                                    >
                                        <SelectItem key="CASUAL">Casual Leave</SelectItem>
                                        <SelectItem key="SICK">Sick Leave</SelectItem>
                                        <SelectItem key="EARNED">Earned Leave</SelectItem>
                                        <SelectItem key="UNPAID">Unpaid Leave</SelectItem>
                                    </Select>
                                    <div className="space-y-1">
                                         <p className="text-xs font-black opacity-40 ml-1">Balance</p>
                                         <div className="h-14 bg-warning/5 rounded-2xl flex items-center px-4 border border-warning/10">
                                            <span className="font-black text-warning">12 Days Remaining</span>
                                         </div>
                                    </div>
                                    <Input 
                                        label="From Date" 
                                        type="date"
                                        labelPlacement="outside"
                                        size="lg"
                                        radius="lg"
                                        classNames={{ inputWrapper: "bg-black/5 h-14 text-xs" }}
                                        value={newLeave.startDate}
                                        onValueChange={(val) => setNewLeave({...newLeave, startDate: val})}
                                    />
                                    <Input 
                                        label="To Date" 
                                        type="date"
                                        labelPlacement="outside"
                                        size="lg"
                                        radius="lg"
                                        classNames={{ inputWrapper: "bg-black/5 h-14 text-xs" }}
                                        value={newLeave.endDate}
                                        onValueChange={(val) => setNewLeave({...newLeave, endDate: val})}
                                    />
                                </div>
                                <Textarea 
                                    label="Reason for Absence"
                                    placeholder="Briefly describe why you are requesting this leave..."
                                    labelPlacement="outside"
                                    classNames={{ inputWrapper: "bg-black/5 p-4 rounded-2xl" }}
                                    value={newLeave.reason}
                                    onValueChange={(val) => setNewLeave({...newLeave, reason: val})}
                                />
                            </ModalBody>
                            <ModalFooter className="border-t border-black/5 pt-6">
                                <Button variant="light" className="font-bold h-12 px-8" onPress={onClose}>Cancel</Button>
                                <Button color="warning" className="font-black h-12 px-10 shadow-xl shadow-warning/20 text-white" radius="full" onClick={handleSubmitLeave} isLoading={isLoading}>
                                    Submit Request
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
