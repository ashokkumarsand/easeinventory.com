'use client';

import {
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
    Switch,
    useDisclosure
} from '@heroui/react';
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Gift,
    Plus,
    Trash2
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Holiday {
    id: string;
    name: string;
    date: string;
    isOptional: boolean;
}

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function HolidayCalendarPage() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());

    // New Holiday State
    const [newHoliday, setNewHoliday] = useState({
        name: '',
        date: '',
        isOptional: false
    });

    useEffect(() => {
        fetchHolidays();
    }, [currentYear]);

    const fetchHolidays = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/hr/holidays?year=${currentYear}`);
            const data = await response.json();
            setHolidays(data.holidays || []);
        } catch (error) {
            console.error('Fetch holidays error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddHoliday = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/hr/holidays', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newHoliday),
            });

            if (response.ok) {
                fetchHolidays();
                onOpenChange();
                setNewHoliday({ name: '', date: '', isOptional: false });
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to add holiday');
            }
        } catch (error) {
            alert('Error creating holiday');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteHoliday = async (id: string) => {
        if (!confirm('Are you sure you want to delete this holiday?')) return;
        
        try {
            const response = await fetch(`/api/hr/holidays?id=${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                fetchHolidays();
            }
        } catch (error) {
            alert('Error deleting holiday');
        }
    };

    // Calendar generation
    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    const isHoliday = (day: number) => {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return holidays.find(h => h.date.startsWith(dateStr));
    };

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentYear, currentMonth);
        const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
        const days = [];

        // Empty cells for days before the first day
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-24" />);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const holiday = isHoliday(day);
            const isToday = new Date().getDate() === day && 
                            new Date().getMonth() === currentMonth && 
                            new Date().getFullYear() === currentYear;
            const isSunday = new Date(currentYear, currentMonth, day).getDay() === 0;

            days.push(
                <div
                    key={day}
                    className={`h-24 p-2 border border-black/5 dark:border-white/10 rounded-xl transition-all ${
                        holiday ? 'bg-danger/5 border-danger/20' : 
                        isSunday ? 'bg-warning/5' : 
                        isToday ? 'bg-primary/5 border-primary/20' : ''
                    }`}
                >
                    <div className="flex items-start justify-between">
                        <span className={`text-sm font-black ${
                            holiday ? 'text-danger' : 
                            isSunday ? 'text-warning' : 
                            isToday ? 'text-primary' : 'opacity-60'
                        }`}>
                            {day}
                        </span>
                        {isToday && (
                            <Chip size="sm" color="primary" variant="flat" className="text-[8px] font-black h-5">
                                TODAY
                            </Chip>
                        )}
                    </div>
                    {holiday && (
                        <div className="mt-1">
                            <p className="text-[10px] font-bold text-danger truncate">{holiday.name}</p>
                            {holiday.isOptional && (
                                <Chip size="sm" color="warning" variant="flat" className="text-[8px] font-black h-4 mt-1">
                                    Optional
                                </Chip>
                            )}
                        </div>
                    )}
                </div>
            );
        }

        return days;
    };

    const changeMonth = (delta: number) => {
        let newMonth = currentMonth + delta;
        let newYear = currentYear;
        
        if (newMonth < 0) {
            newMonth = 11;
            newYear--;
        } else if (newMonth > 11) {
            newMonth = 0;
            newYear++;
        }
        
        setCurrentMonth(newMonth);
        if (newYear !== currentYear) {
            setCurrentYear(newYear);
        }
    };

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-danger/10 flex items-center justify-center text-danger">
                            <Calendar size={22} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-danger">Holiday Calendar</h1>
                    </div>
                    <p className="text-black/40 dark:text-white/40 font-bold ml-1">Manage company holidays and off-days.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        color="danger" 
                        radius="full" 
                        size="lg" 
                        className="font-black px-8 shadow-xl shadow-danger/20" 
                        startContent={<Plus size={20} />} 
                        onClick={onOpen}
                    >
                        Add Holiday
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="modern-card bg-danger text-white p-6" radius="lg">
                    <CardBody className="p-0">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 text-white">Total Holidays</p>
                        <h2 className="text-4xl font-black">{holidays.length}</h2>
                        <p className="text-xs font-bold opacity-60">{currentYear}</p>
                    </CardBody>
                </Card>
                <Card className="modern-card p-6 border border-black/5 dark:border-white/10" radius="lg">
                    <CardBody className="p-0">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Mandatory</p>
                        <h2 className="text-4xl font-black text-danger">{holidays.filter(h => !h.isOptional).length}</h2>
                        <p className="text-xs font-bold opacity-40">Paid holidays</p>
                    </CardBody>
                </Card>
                <Card className="modern-card p-6 border border-black/5 dark:border-white/10" radius="lg">
                    <CardBody className="p-0">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Optional</p>
                        <h2 className="text-4xl font-black text-warning">{holidays.filter(h => h.isOptional).length}</h2>
                        <p className="text-xs font-bold opacity-40">Restricted days</p>
                    </CardBody>
                </Card>
                <Card className="modern-card p-6 border border-black/5 dark:border-white/10" radius="lg">
                    <CardBody className="p-0">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Sundays</p>
                        <h2 className="text-4xl font-black text-warning">52</h2>
                        <p className="text-xs font-bold opacity-40">Weekly off</p>
                    </CardBody>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Calendar View */}
                <div className="lg:col-span-8">
                    <Card className="modern-card p-8" radius="lg">
                        <CardBody className="p-0 space-y-6">
                            {/* Month Navigation */}
                            <div className="flex items-center justify-between">
                                <Button isIconOnly variant="flat" radius="full" onClick={() => changeMonth(-1)}>
                                    <ChevronLeft size={20} />
                                </Button>
                                <h3 className="text-xl font-black tracking-tight">
                                    {MONTHS[currentMonth]} {currentYear}
                                </h3>
                                <Button isIconOnly variant="flat" radius="full" onClick={() => changeMonth(1)}>
                                    <ChevronRight size={20} />
                                </Button>
                            </div>

                            {/* Day Headers */}
                            <div className="grid grid-cols-7 gap-2">
                                {DAYS.map(day => (
                                    <div key={day} className="text-center text-[10px] font-black uppercase tracking-widest opacity-40 py-2">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 gap-2">
                                {renderCalendar()}
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Holiday List */}
                <div className="lg:col-span-4">
                    <Card className="modern-card p-6" radius="lg">
                        <CardBody className="p-0 space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                                <Gift size={18} className="text-danger" />
                                <h3 className="text-sm font-black uppercase tracking-widest">Upcoming Holidays</h3>
                            </div>

                            {isLoading ? (
                                <p className="text-sm opacity-40">Loading...</p>
                            ) : holidays.length === 0 ? (
                                <p className="text-sm opacity-40">No holidays defined for {currentYear}</p>
                            ) : (
                                <div className="space-y-3">
                                    {holidays.map(holiday => (
                                        <div 
                                            key={holiday.id} 
                                            className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/10 flex items-center justify-between"
                                        >
                                            <div>
                                                <p className="font-black text-sm">{holiday.name}</p>
                                                <p className="text-[10px] font-bold opacity-40 uppercase">
                                                    {new Date(holiday.date).toLocaleDateString('en-IN', {
                                                        weekday: 'short',
                                                        day: 'numeric',
                                                        month: 'short'
                                                    })}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {holiday.isOptional && (
                                                    <Chip size="sm" color="warning" variant="flat" className="text-[8px] font-black">
                                                        Optional
                                                    </Chip>
                                                )}
                                                <Button 
                                                    isIconOnly 
                                                    size="sm" 
                                                    variant="light" 
                                                    color="danger"
                                                    onClick={() => handleDeleteHoliday(holiday.id)}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </div>
            </div>

            {/* Add Holiday Modal */}
            <Modal 
                isOpen={isOpen} 
                onOpenChange={onOpenChange}
                size="lg"
                classNames={{ base: "modern-card p-6" }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <h2 className="text-2xl font-black tracking-tight">Add New Holiday</h2>
                                <p className="text-xs font-bold opacity-30 uppercase tracking-[0.2em]">Define company-wide holiday</p>
                            </ModalHeader>
                            <ModalBody className="py-8 space-y-6">
                                <Input 
                                    label="Holiday Name" 
                                    placeholder="e.g. Diwali, Republic Day" 
                                    labelPlacement="outside"
                                    size="lg"
                                    radius="lg"
                                    classNames={{ inputWrapper: "bg-black/5 h-14" }}
                                    value={newHoliday.name}
                                    onValueChange={(val) => setNewHoliday({...newHoliday, name: val})}
                                />
                                <Input 
                                    label="Date" 
                                    type="date"
                                    labelPlacement="outside"
                                    size="lg"
                                    radius="lg"
                                    classNames={{ inputWrapper: "bg-black/5 h-14" }}
                                    value={newHoliday.date}
                                    onValueChange={(val) => setNewHoliday({...newHoliday, date: val})}
                                />
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-black/[0.02] border border-black/5">
                                    <div>
                                        <p className="font-black text-sm">Optional Holiday</p>
                                        <p className="text-[10px] font-bold opacity-40">Employees can choose to work</p>
                                    </div>
                                    <Switch 
                                        isSelected={newHoliday.isOptional}
                                        onValueChange={(val) => setNewHoliday({...newHoliday, isOptional: val})}
                                        color="warning"
                                    />
                                </div>
                            </ModalBody>
                            <ModalFooter className="border-t border-black/5 pt-6">
                                <Button variant="light" className="font-bold h-12 px-8" onPress={onClose}>Cancel</Button>
                                <Button color="danger" className="font-black h-12 px-10 shadow-xl shadow-danger/20" radius="full" onClick={handleAddHoliday} isLoading={isLoading}>
                                    Add Holiday
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
