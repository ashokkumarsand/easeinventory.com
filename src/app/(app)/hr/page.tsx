'use client';

import { useDisclosure } from '@/hooks/useDisclosure';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Briefcase,
    Calculator,
    ChevronRight,
    Download,
    Loader2,
    Search,
    UserPlus,
    Users
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import PayrollTab from './payroll-tab';

export default function HRDashboardPage() {
    const t = useTranslations('HR');
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [employees, setEmployees] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // New Employee State
    const [newEmployee, setNewEmployee] = useState({
        employeeId: '',
        name: '',
        email: '',
        phone: '',
        designation: '',
        department: '',
        baseSalary: '',
        joinDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/hr/employees');
            const data = await response.json();
            setEmployees(data.employees || []);
        } catch (error) {
            console.error('Fetch employees error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddEmployee = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/hr/employees', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newEmployee),
            });

            if (response.ok) {
                fetchEmployees();
                onOpenChange(false);
                setNewEmployee({
                    employeeId: '',
                    name: '',
                    email: '',
                    phone: '',
                    designation: '',
                    department: '',
                    baseSalary: '',
                    joinDate: new Date().toISOString().split('T')[0]
                });
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to add employee');
            }
        } catch (error) {
            alert('Error creating employee record');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalSalary = employees.reduce((acc, emp) => acc + Number(emp.baseSalary), 0);

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                            <Users size={22} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-secondary">{t('title')}</h1>
                    </div>
                    <p className="text-black/40 dark:text-white/40 font-bold ml-1">{t('subtitle')}</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="secondary" className="font-bold rounded-2xl">
                        <Download size={18} className="mr-2" />
                        {t('export')}
                    </Button>
                    <Button onClick={onOpen} className="font-black px-8 shadow-xl shadow-secondary/20 rounded-full">
                        <UserPlus size={20} className="mr-2" />
                        {t('add_employee')}
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-secondary text-white p-6 rounded-lg">
                    <CardContent className="p-0">
                        <p className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-3">{t('stats.active')}</p>
                        <h2 className="text-4xl font-bold mb-1">{employees.length}</h2>
                        <p className="text-sm opacity-70">{t('stats.departments', { count: new Set(employees.map(e => e.department)).size })}</p>
                    </CardContent>
                </Card>
                <Card className="bg-card border border-border p-6 rounded-lg">
                    <CardContent className="p-0">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">{t('stats.commitment')}</p>
                        <h2 className="text-4xl font-bold mb-1 text-secondary">{totalSalary.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</h2>
                        <p className="text-sm text-muted-foreground">{t('stats.salary_base')}</p>
                    </CardContent>
                </Card>
                <Card className="bg-card border border-border p-6 rounded-lg">
                    <CardContent className="p-0">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">{t('stats.leaves')}</p>
                        <h2 className="text-4xl font-bold text-destructive">2</h2>
                        <p className="text-sm text-muted-foreground">{t('stats.absence')}</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="roster" className="w-full">
                <TabsList className="w-full justify-start gap-6 bg-transparent border-b border-border rounded-none p-0 h-auto">
                    <TabsTrigger
                        value="roster"
                        className="data-[state=active]:border-b-2 data-[state=active]:border-secondary data-[state=active]:text-secondary rounded-none px-0 h-12 font-black uppercase tracking-widest text-[10px] bg-transparent"
                    >
                        <Users size={16} className="mr-2" />
                        {t('tabs.roster')}
                    </TabsTrigger>
                    <TabsTrigger
                        value="payroll"
                        className="data-[state=active]:border-b-2 data-[state=active]:border-secondary data-[state=active]:text-secondary rounded-none px-0 h-12 font-black uppercase tracking-widest text-[10px] bg-transparent"
                    >
                        <Calculator size={16} className="mr-2" />
                        {t('tabs.payroll')}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="roster" className="pt-6">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 max-w-md">
                            <div className="relative flex-1">
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name or ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 pl-10"
                                />
                            </div>
                        </div>

                        <div className="bg-card border border-border rounded-2xl overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="bg-transparent h-14 font-semibold uppercase tracking-wider text-xs text-muted-foreground px-6 text-left">EMPLOYEE</th>
                                        <th className="bg-transparent h-14 font-semibold uppercase tracking-wider text-xs text-muted-foreground px-6 text-left">DEPARTMENT</th>
                                        <th className="bg-transparent h-14 font-semibold uppercase tracking-wider text-xs text-muted-foreground px-6 text-left">JOIN DATE</th>
                                        <th className="bg-transparent h-14 font-semibold uppercase tracking-wider text-xs text-muted-foreground px-6 text-left">SALARY</th>
                                        <th className="bg-transparent h-14 font-semibold uppercase tracking-wider text-xs text-muted-foreground px-6 text-left">STATUS</th>
                                        <th className="bg-transparent h-14 font-semibold uppercase tracking-wider text-xs text-muted-foreground px-6 text-center">ACTION</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEmployees.map((emp) => (
                                        <tr key={emp.id} className="border-b border-border last:border-none hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                            <td className="py-5 px-6">
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="bg-secondary/10 text-secondary font-black rounded-lg">
                                                        <AvatarFallback className="rounded-lg">{emp.name[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="font-black tracking-tight">{emp.name}</span>
                                                        <span className="text-[10px] font-bold opacity-30 uppercase tracking-widest">{emp.employeeId}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-5 px-6">
                                                <div className="flex items-center gap-2">
                                                    <Briefcase size={14} className="opacity-30" />
                                                    <span className="text-xs">{emp.designation || 'Staff'}</span>
                                                </div>
                                            </td>
                                            <td className="py-5 px-6 text-[10px] font-black opacity-40 uppercase">{new Date(emp.joinDate).toLocaleDateString()}</td>
                                            <td className="py-5 px-6">
                                                <span className="font-black text-lg">{Number(emp.baseSalary).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</span>
                                            </td>
                                            <td className="py-5 px-6">
                                                <Badge variant={emp.isActive ? "default" : "destructive"} className="font-black text-[10px] uppercase">
                                                    {emp.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </td>
                                            <td className="py-5 px-6 text-center">
                                                <Button variant="ghost" size="icon" className="rounded-full">
                                                    <ChevronRight size={18} className="opacity-30" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="payroll" className="pt-6">
                    <PayrollTab />
                </TabsContent>
            </Tabs>

            {/* Add Employee Modal */}
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>{t('modal.title')}</DialogTitle>
                        <DialogDescription>{t('modal.subtitle')}</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g. John Doe"
                                className="h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700"
                                value={newEmployee.name}
                                onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="employeeId">Employee ID (Alpha-numeric)</Label>
                            <Input
                                id="employeeId"
                                placeholder="e.g. EMP-101"
                                className="h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700"
                                value={newEmployee.employeeId}
                                onChange={(e) => setNewEmployee({...newEmployee, employeeId: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                placeholder="johndoe@example.com"
                                className="h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700"
                                value={newEmployee.email}
                                onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                placeholder="+91 00000 00000"
                                className="h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700"
                                value={newEmployee.phone}
                                onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="designation">Designation</Label>
                            <Input
                                id="designation"
                                placeholder="e.g. Senior Technician"
                                className="h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700"
                                value={newEmployee.designation}
                                onChange={(e) => setNewEmployee({...newEmployee, designation: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Department</Label>
                            <Select onValueChange={(val) => setNewEmployee({...newEmployee, department: val})}>
                                <SelectTrigger className="h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
                                    <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Operations">Operations</SelectItem>
                                    <SelectItem value="Repairs">Repairs & Tech</SelectItem>
                                    <SelectItem value="Inventory">Inventory Control</SelectItem>
                                    <SelectItem value="Accounting">Accounting & GST</SelectItem>
                                    <SelectItem value="Logistics">Logistics & Delivery</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="baseSalary">Monthly Base Salary</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rs.</span>
                                <Input
                                    id="baseSalary"
                                    placeholder="0.00"
                                    className="h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 pl-10"
                                    value={newEmployee.baseSalary}
                                    onChange={(e) => setNewEmployee({...newEmployee, baseSalary: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="joinDate">Join Date</Label>
                            <Input
                                id="joinDate"
                                type="date"
                                className="h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700"
                                value={newEmployee.joinDate}
                                onChange={(e) => setNewEmployee({...newEmployee, joinDate: e.target.value})}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => onOpenChange(false)}>{t('modal.cancel')}</Button>
                        <Button onClick={handleAddEmployee} disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('modal.confirm')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
