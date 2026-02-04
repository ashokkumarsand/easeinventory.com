'use client';

import {
    Button,
    Card,
    CardBody,
    Chip,
    Select,
    SelectItem,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow
} from '@heroui/react';
import {
    Calculator,
    CheckCircle2,
    Download,
    FileText
} from 'lucide-react';
import { useState } from 'react';

export default function PayrollTab() {
    const [month, setMonth] = useState('11'); // November
    const [year, setYear] = useState('2024');
    const [isCalculating, setIsCalculating] = useState(false);
    const [payslips, setPayslips] = useState<any[]>([]);

    const handleCalculate = async () => {
        setIsCalculating(true);
        try {
            const response = await fetch('/api/hr/payroll/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ month: parseInt(month), year: parseInt(year) }),
            });
            const data = await response.json();
            setPayslips(data.payslips || []);
        } catch (error) {
            alert('Error calculating payroll');
        } finally {
            setIsCalculating(false);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* Control Panel */}
            <Card className="modern-card p-8 border border-black/5 dark:border-white/10" radius="lg">
                <CardBody className="p-0 flex flex-col md:flex-row items-end gap-6">
                    <div className="grid grid-cols-2 gap-4 flex-grow">
                        <Select 
                            label="Payroll Month" 
                            labelPlacement="outside"
                            selectedKeys={[month]}
                            onSelectionChange={(keys) => setMonth(Array.from(keys)[0] as string)}
                            classNames={{ trigger: "bg-black/5 h-14" }}
                        >
                            <SelectItem key="10">October</SelectItem>
                            <SelectItem key="11">November</SelectItem>
                            <SelectItem key="12">December</SelectItem>
                        </Select>
                        <Select 
                            label="Payroll Year" 
                            labelPlacement="outside"
                            selectedKeys={[year]}
                            onSelectionChange={(keys) => setYear(Array.from(keys)[0] as string)}
                            classNames={{ trigger: "bg-black/5 h-14" }}
                        >
                            <SelectItem key="2024">2024</SelectItem>
                            <SelectItem key="2025">2025</SelectItem>
                        </Select>
                    </div>
                    <Button 
                        color="secondary" 
                        size="lg" 
                        radius="full" 
                        className="h-14 font-black px-10 shadow-xl shadow-secondary/20"
                        startContent={<Calculator size={20} />}
                        onClick={handleCalculate}
                        isLoading={isCalculating}
                    >
                        Run Payroll Engine
                    </Button>
                </CardBody>
            </Card>

            {/* Payslips Table */}
            {payslips.length > 0 && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black">Generated Payslips</h3>
                        <Button variant="flat" size="sm" color="secondary" className="font-bold" startContent={<Download size={16} />}>
                            Bulk Export PDF
                        </Button>
                    </div>
                    
                    <Table 
                        aria-label="Payslips Table"
                        className="modern-card border-none"
                        classNames={{
                            wrapper: "p-0 modern-card theme-table-wrapper border border-black/5 dark:border-white/10 rounded-[2.5rem] overflow-hidden",
                            th: "bg-black/[0.02] dark:bg-white/[0.02] h-16 font-black uppercase tracking-wider text-[10px] opacity-40 px-8",
                            td: "py-6 px-8 font-bold",
                        }}
                    >
                        <TableHeader>
                            <TableColumn>EMPLOYEE</TableColumn>
                            <TableColumn>WORKING DAYS</TableColumn>
                            <TableColumn>PRESENT</TableColumn>
                            <TableColumn>LEAVES</TableColumn>
                            <TableColumn>NET SALARY</TableColumn>
                            <TableColumn align="center">STATUS</TableColumn>
                            <TableColumn align="center">ACTION</TableColumn>
                        </TableHeader>
                        <TableBody>
                            {payslips.map((ps) => (
                                <TableRow key={ps.id} className="border-b last:border-none border-black/5 dark:border-white/10 hover:bg-black/[0.01] transition-colors">
                                    <TableCell>
                                        <span className="font-black text-xs">EMP ID: {ps.employeeId.slice(-4).toUpperCase()}</span>
                                    </TableCell>
                                    <TableCell>{ps.workingDays} Days</TableCell>
                                    <TableCell className="text-success">{ps.presentDays}</TableCell>
                                    <TableCell className="text-warning">{ps.leaveDays}</TableCell>
                                    <TableCell>
                                        <span className="text-lg font-black text-secondary">₹{Number(ps.netSalary).toLocaleString()}</span>
                                    </TableCell>
                                    <TableCell>
                                        <Chip color="success" variant="flat" size="sm" startContent={<CheckCircle2 size={12} />} className="font-black text-[10px] uppercase">
                                            {ps.status}
                                        </Chip>
                                    </TableCell>
                                    <TableCell>
                                        <Button isIconOnly variant="light" radius="full" size="sm"><FileText size={18} className="opacity-40" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
