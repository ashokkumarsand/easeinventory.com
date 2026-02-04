'use client';

import {
    Avatar,
    Button,
    Card,
    CardBody,
    Chip,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Select,
    SelectItem,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Tabs,
    useDisclosure
} from '@heroui/react';
import {
    Briefcase,
    Calculator,
    ChevronRight,
    Download,
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
                onOpenChange();
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
                    <Button variant="flat" color="default" className="font-bold rounded-2xl" startContent={<Download size={18} />}>
                        {t('export')}
                    </Button>
                    <Button color="secondary" radius="full" size="lg" className="font-black px-8 shadow-xl shadow-secondary/20" startContent={<UserPlus size={20} />} onClick={onOpen}>
                        {t('add_employee')}
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-secondary text-white p-6" radius="lg">
                    <CardBody className="p-0">
                        <p className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-3">{t('stats.active')}</p>
                        <h2 className="text-4xl font-bold mb-1">{employees.length}</h2>
                        <p className="text-sm opacity-70">{t('stats.departments', { count: new Set(employees.map(e => e.department)).size })}</p>
                    </CardBody>
                </Card>
                <Card className="bg-card border border-soft p-6" radius="lg">
                    <CardBody className="p-0">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">{t('stats.commitment')}</p>
                        <h2 className="text-4xl font-bold mb-1 text-secondary">₹{totalSalary.toLocaleString()}</h2>
                        <p className="text-sm text-muted">{t('stats.salary_base')}</p>
                    </CardBody>
                </Card>
                <Card className="bg-card border border-soft p-6" radius="lg">
                    <CardBody className="p-0">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">{t('stats.leaves')}</p>
                        <h2 className="text-4xl font-bold text-danger">2</h2>
                        <p className="text-sm text-muted">{t('stats.absence')}</p>
                    </CardBody>
                </Card>
            </div>

            <Tabs 
                aria-label="HR Options" 
                color="secondary" 
                variant="underlined"
                classNames={{
                    tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                    cursor: "w-full bg-secondary",
                    tab: "max-w-fit px-0 h-12",
                    tabContent: "group-data-[selected=true]:text-secondary font-black uppercase tracking-widest text-[10px]"
                }}
            >
                <Tab
                    key="roster"
                    title={
                        <div className="flex items-center space-x-2">
                            <Users size={16}/>
                            <span>{t('tabs.roster')}</span>
                        </div>
                    }
                >
                    <div className="space-y-6 pt-6">
                        <div className="flex items-center gap-4 max-w-md">
                            <Input
                                placeholder="Search by name or ID..."
                                labelPlacement="outside"
                                startContent={<Search size={18} className="text-muted" />}
                                value={searchTerm}
                                onValueChange={setSearchTerm}
                                classNames={{
                                    inputWrapper: "h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700"
                                }}
                            />
                        </div>

                        <Table
                            aria-label="Employee Roster"
                            classNames={{
                                wrapper: "p-0 bg-card border border-soft rounded-2xl overflow-hidden shadow-none",
                                th: "bg-transparent h-14 font-semibold uppercase tracking-wider text-xs text-muted px-6",
                                td: "py-5 px-6",
                                tr: "border-b border-soft last:border-none",
                            }}
                        >
                            <TableHeader>
                                <TableColumn>EMPLOYEE</TableColumn>
                                <TableColumn>DEPARTMENT</TableColumn>
                                <TableColumn>JOIN DATE</TableColumn>
                                <TableColumn>SALARY</TableColumn>
                                <TableColumn>STATUS</TableColumn>
                                <TableColumn align="center">ACTION</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {filteredEmployees.map((emp) => (
                                    <TableRow key={emp.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                        <TableCell>
                                            <div className="flex items-center gap-4">
                                                <Avatar name={emp.name} radius="lg" className="bg-secondary/10 text-secondary font-black" />
                                                <div className="flex flex-col">
                                                    <span className="font-black tracking-tight">{emp.name}</span>
                                                    <span className="text-[10px] font-bold opacity-30 uppercase tracking-widest">{emp.employeeId}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Briefcase size={14} className="opacity-30" />
                                                <span className="text-xs">{emp.designation || 'Staff'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-[10px] font-black opacity-40 uppercase">{new Date(emp.joinDate).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <span className="font-black text-lg">₹{Number(emp.baseSalary).toLocaleString()}</span>
                                        </TableCell>
                                        <TableCell>
                                            <Chip variant="flat" size="sm" color={emp.isActive ? "success" : "danger"} className="font-black text-[10px] uppercase">
                                                {emp.isActive ? 'Active' : 'Inactive'}
                                            </Chip>
                                        </TableCell>
                                        <TableCell>
                                            <Button isIconOnly radius="full" variant="light" size="sm"><ChevronRight size={18} className="opacity-30" /></Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </Tab>
                <Tab
                    key="payroll"
                    title={
                        <div className="flex items-center space-x-2">
                            <Calculator size={16}/>
                            <span>{t('tabs.payroll')}</span>
                        </div>
                    }
                >
                    <div className="pt-6">
                        <PayrollTab />
                    </div>
                </Tab>
            </Tabs>

            {/* Add Employee Modal */}
            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                size="3xl"
                scrollBehavior="inside"
                classNames={{
                    backdrop: "bg-black/50 backdrop-blur-sm",
                    base: "theme-modal rounded-2xl",
                    header: "border-b border-zinc-200 dark:border-zinc-800",
                    body: "py-6",
                    footer: "border-t border-zinc-200 dark:border-zinc-800",
                }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <h2 className="text-xl font-bold">{t('modal.title')}</h2>
                                <p className="text-sm text-muted font-normal">{t('modal.subtitle')}</p>
                            </ModalHeader>
                            <ModalBody className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Full Name"
                                        placeholder="e.g. John Doe"
                                        labelPlacement="outside"
                                        size="lg"
                                        radius="lg"
                                        classNames={{
                                            inputWrapper: "h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700"
                                        }}
                                        value={newEmployee.name}
                                        onValueChange={(val) => setNewEmployee({...newEmployee, name: val})}
                                    />
                                    <Input
                                        label="Employee ID (Alpha-numeric)"
                                        placeholder="e.g. EMP-101"
                                        labelPlacement="outside"
                                        size="lg"
                                        radius="lg"
                                        classNames={{
                                            inputWrapper: "h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700"
                                        }}
                                        value={newEmployee.employeeId}
                                        onValueChange={(val) => setNewEmployee({...newEmployee, employeeId: val})}
                                    />
                                    <Input
                                        label="Email Address"
                                        placeholder="johndoe@example.com"
                                        labelPlacement="outside"
                                        size="lg"
                                        radius="lg"
                                        classNames={{
                                            inputWrapper: "h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700"
                                        }}
                                        value={newEmployee.email}
                                        onValueChange={(val) => setNewEmployee({...newEmployee, email: val})}
                                    />
                                    <Input
                                        label="Phone Number"
                                        placeholder="+91 00000 00000"
                                        labelPlacement="outside"
                                        size="lg"
                                        radius="lg"
                                        classNames={{
                                            inputWrapper: "h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700"
                                        }}
                                        value={newEmployee.phone}
                                        onValueChange={(val) => setNewEmployee({...newEmployee, phone: val})}
                                    />
                                    <Input
                                        label="Designation"
                                        placeholder="e.g. Senior Technician"
                                        labelPlacement="outside"
                                        size="lg"
                                        radius="lg"
                                        classNames={{
                                            inputWrapper: "h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700"
                                        }}
                                        value={newEmployee.designation}
                                        onValueChange={(val) => setNewEmployee({...newEmployee, designation: val})}
                                    />
                                    <Select
                                        label="Department"
                                        placeholder="Select department"
                                        labelPlacement="outside"
                                        size="lg"
                                        radius="lg"
                                        classNames={{
                                            trigger: "h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700"
                                        }}
                                        onSelectionChange={(keys) => setNewEmployee({...newEmployee, department: Array.from(keys)[0] as string})}
                                    >
                                        <SelectItem key="Operations">Operations</SelectItem>
                                        <SelectItem key="Repairs">Repairs & Tech</SelectItem>
                                        <SelectItem key="Inventory">Inventory Control</SelectItem>
                                        <SelectItem key="Accounting">Accounting & GST</SelectItem>
                                        <SelectItem key="Logistics">Logistics & Delivery</SelectItem>
                                    </Select>
                                    <Input
                                        label="Monthly Base Salary"
                                        placeholder="0.00"
                                        labelPlacement="outside"
                                        size="lg"
                                        radius="lg"
                                        startContent={<span className="text-sm text-muted">₹</span>}
                                        classNames={{
                                            inputWrapper: "h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700"
                                        }}
                                        value={newEmployee.baseSalary}
                                        onValueChange={(val) => setNewEmployee({...newEmployee, baseSalary: val})}
                                    />
                                    <Input
                                        label="Join Date"
                                        type="date"
                                        labelPlacement="outside"
                                        size="lg"
                                        radius="lg"
                                        classNames={{
                                            inputWrapper: "h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700"
                                        }}
                                        value={newEmployee.joinDate}
                                        onValueChange={(val) => setNewEmployee({...newEmployee, joinDate: val})}
                                    />
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="flat" className="font-semibold" onPress={onClose}>{t('modal.cancel')}</Button>
                                <Button color="secondary" className="font-semibold" onClick={handleAddEmployee} isLoading={isLoading}>
                                    {t('modal.confirm')}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
