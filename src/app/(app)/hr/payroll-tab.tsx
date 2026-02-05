'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
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
            <Card className="modern-card p-8 border border-black/5 dark:border-white/10 rounded-lg">
                <CardContent className="p-0 flex flex-col md:flex-row items-end gap-6">
                    <div className="grid grid-cols-2 gap-4 flex-grow">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Payroll Month</label>
                            <Select value={month} onValueChange={setMonth}>
                                <SelectTrigger className="bg-black/5 h-14">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">October</SelectItem>
                                    <SelectItem value="11">November</SelectItem>
                                    <SelectItem value="12">December</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Payroll Year</label>
                            <Select value={year} onValueChange={setYear}>
                                <SelectTrigger className="bg-black/5 h-14">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="2024">2024</SelectItem>
                                    <SelectItem value="2025">2025</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <Button
                        variant="secondary"
                        size="lg"
                        className="h-14 font-black px-10 shadow-xl shadow-secondary/20 rounded-full"
                        onClick={handleCalculate}
                        disabled={isCalculating}
                    >
                        {isCalculating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Calculator size={20} className="mr-2" />
                        Run Payroll Engine
                    </Button>
                </CardContent>
            </Card>

            {/* Payslips Table */}
            {payslips.length > 0 && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black">Generated Payslips</h3>
                        <Button variant="secondary" size="sm" className="font-bold">
                            <Download size={16} className="mr-2" />
                            Bulk Export PDF
                        </Button>
                    </div>

                    <div className="modern-card theme-table-wrapper border border-black/5 dark:border-white/10 rounded-[2.5rem] overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-black/[0.02] dark:bg-white/[0.02]">
                                    <th className="h-16 font-black uppercase tracking-wider text-[10px] opacity-40 px-8 text-left">EMPLOYEE</th>
                                    <th className="h-16 font-black uppercase tracking-wider text-[10px] opacity-40 px-8 text-left">WORKING DAYS</th>
                                    <th className="h-16 font-black uppercase tracking-wider text-[10px] opacity-40 px-8 text-left">PRESENT</th>
                                    <th className="h-16 font-black uppercase tracking-wider text-[10px] opacity-40 px-8 text-left">LEAVES</th>
                                    <th className="h-16 font-black uppercase tracking-wider text-[10px] opacity-40 px-8 text-left">NET SALARY</th>
                                    <th className="h-16 font-black uppercase tracking-wider text-[10px] opacity-40 px-8 text-center">STATUS</th>
                                    <th className="h-16 font-black uppercase tracking-wider text-[10px] opacity-40 px-8 text-center">ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payslips.map((ps) => (
                                    <tr key={ps.id} className="border-b last:border-none border-black/5 dark:border-white/10 hover:bg-black/[0.01] transition-colors">
                                        <td className="py-6 px-8 font-bold">
                                            <span className="font-black text-xs">EMP ID: {ps.employeeId.slice(-4).toUpperCase()}</span>
                                        </td>
                                        <td className="py-6 px-8 font-bold">{ps.workingDays} Days</td>
                                        <td className="py-6 px-8 font-bold text-success">{ps.presentDays}</td>
                                        <td className="py-6 px-8 font-bold text-warning">{ps.leaveDays}</td>
                                        <td className="py-6 px-8 font-bold">
                                            <span className="text-lg font-black text-secondary">{Number(ps.netSalary).toLocaleString()}</span>
                                        </td>
                                        <td className="py-6 px-8 font-bold text-center">
                                            <Badge variant="secondary" className="font-black text-[10px] uppercase bg-success/10 text-success">
                                                <CheckCircle2 size={12} className="mr-1" />
                                                {ps.status}
                                            </Badge>
                                        </td>
                                        <td className="py-6 px-8 font-bold text-center">
                                            <Button variant="ghost" size="icon" className="rounded-full">
                                                <FileText size={18} className="opacity-40" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
