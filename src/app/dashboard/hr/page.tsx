'use client';

import {
    Avatar,
    Button,
    Card,
    CardBody,
    Chip,
    Input,
    Progress,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow
} from '@heroui/react';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    Award,
    CalendarCheck,
    CheckCircle,
    Clock,
    Fingerprint,
    MapPin,
    Plus,
    Search,
    TrendingUp,
    Users
} from 'lucide-react';
import { useEffect, useState } from 'react';

// Mock Data
const EMPLOYEES = [
  { id: '1', name: 'Rahul S.', role: 'Technician', salary: 28000, joined: '2023-01-10', attendance: 95, status: 'present' },
  { id: '2', name: 'Priya K.', role: 'Technician', salary: 32000, joined: '2023-03-15', attendance: 88, status: 'present' },
  { id: '3', name: 'Amit Singh', role: 'Sales Lead', salary: 45000, joined: '2022-11-20', attendance: 92, status: 'absent' },
  { id: '4', name: 'Sunita Mehra', role: 'Accountant', salary: 40000, joined: '2023-06-05', attendance: 100, status: 'present' },
];

const holidays = [
  { name: 'Republic Day', date: 'Jan 26, 2024', type: 'Public' },
  { name: 'Holi', date: 'Mar 25, 2024', type: 'Public' },
  { name: 'Good Friday', date: 'Mar 29, 2024', type: 'Regional' },
];

export default function HRPage() {
  const [time, setTime] = useState(new Date());
  const [isPresent, setIsPresent] = useState(false);
  const [punchHistory, setPunchHistory] = useState([
    { type: 'In', time: '09:12 AM', location: 'Noida Hub' },
    { type: 'Out', time: '06:05 PM', location: 'Remote' },
  ]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePunch = () => {
    const newEntry = {
        type: isPresent ? 'Out' : 'In',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        location: 'Current System'
    };
    setPunchHistory([newEntry, ...punchHistory]);
    setIsPresent(!isPresent);
  };

  return (
    <div className="space-y-10 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
             <div className="w-10 h-10 rounded-2xl bg-success/10 flex items-center justify-center text-success">
                <Users size={22} strokeWidth={2.5} />
             </div>
             <h1 className="text-3xl font-black tracking-tight text-success">People Hub</h1>
           </div>
           <p className="text-black/40 dark:text-white/40 font-bold ml-1">Automated attendance punching and integrated payroll engine.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button color="success" radius="full" size="lg" className="font-black px-8 shadow-xl shadow-success/20 text-white" startContent={<Plus size={20} />}>
              Add Employee
           </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-10">
            {/* Punching System Card */}
            <Card className="modern-card bg-primary p-6 lg:p-10 shadow-2xl shadow-primary/20 text-white relative overflow-hidden" radius="lg">
               <CardBody className="p-0 relative z-10">
                  <div className="flex flex-col md:flex-row items-center gap-10">
                     <div className="text-center md:text-left space-y-2">
                        <p className="text-sm font-black uppercase tracking-[0.3em] opacity-60">Digital Punch Clock</p>
                        <h2 className="text-5xl lg:text-7xl font-black tracking-tighter">
                           {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </h2>
                        <p className="text-lg font-bold opacity-80">{time.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                     </div>
                     
                     <div className="w-[2px] h-24 bg-white/20 hidden md:block" />

                     <div className="flex-grow flex flex-col items-center gap-6">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handlePunch}
                          className={`w-32 h-32 rounded-full flex flex-col items-center justify-center gap-2 border-4 transition-all shadow-xl ${
                            isPresent 
                            ? 'bg-danger/20 border-danger hover:bg-danger/30 shadow-danger/20' 
                            : 'bg-white/20 border-white hover:bg-white/30 shadow-white/20'
                          }`}
                        >
                           <Fingerprint size={40} />
                           <span className="text-xs font-black uppercase tracking-widest">{isPresent ? 'Punch Out' : 'Punch In'}</span>
                        </motion.button>
                        <div className="flex items-center gap-2 text-xs font-bold px-4 py-2 bg-black/20 rounded-full">
                           <MapPin size={14} /> Noida HQ • Subnet Verified
                        </div>
                     </div>
                  </div>

                  <div className="mt-10 pt-10 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6">
                     {[
                       { label: 'Work Shifts', val: '09:00 - 18:00', icon: Clock },
                       { label: 'Total Hours', val: '42h 10m', icon: TrendingUp },
                       { label: 'Avg In-time', val: '09:14 AM', icon: Award },
                       { label: 'Status', val: isPresent ? 'ACTIVE' : 'IDLE', icon: CheckCircle },
                     ].map(it => (
                        <div key={it.label} className="space-y-1">
                           <p className="text-[10px] font-black uppercase opacity-50 tracking-widest flex items-center gap-1">
                              <it.icon size={10} /> {it.label}
                           </p>
                           <p className="font-bold">{it.val}</p>
                        </div>
                     ))}
                  </div>
               </CardBody>
            </Card>

            {/* Employee Management Section */}
            <div className="space-y-6">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-1.5 h-6 bg-success rounded-full" />
                     <h3 className="text-xl font-black tracking-tight">Active Workforce</h3>
                  </div>
                  <Input 
                    placeholder="Search personnel..."
                    size="sm"
                    radius="lg"
                    className="max-w-[240px]"
                    startContent={<Search size={16} />}
                  />
               </div>

               <Table 
                 aria-label="Staff Table"
                 classNames={{
                    wrapper: "p-0 modern-card border border-black/5 dark:border-white/5 bg-white dark:bg-[#111318] rounded-[2.5rem] overflow-hidden shadow-none",
                    th: "bg-black/[0.02] dark:bg-white/[0.02] h-14 font-black uppercase text-[10px] first:pl-8 last:pr-8 opacity-40 text-black dark:text-white",
                    td: "py-4 first:pl-8 last:pr-8 font-bold",
                 }}
               >
                 <TableHeader>
                   <TableColumn>EMPLOYEE</TableColumn>
                   <TableColumn>ROLE</TableColumn>
                   <TableColumn>ATTENDANCE</TableColumn>
                   <TableColumn>STATUS</TableColumn>
                   <TableColumn>EST. PAYOUT</TableColumn>
                   <TableColumn align="center">ACTION</TableColumn>
                 </TableHeader>
                 <TableBody>
                   {EMPLOYEES.map(emp => (
                     <TableRow key={emp.id} className="border-b last:border-none border-black/5 dark:border-white/5">
                       <TableCell>
                          <div className="flex items-center gap-3">
                             <Avatar size="sm" name={emp.name[0]} className="bg-primary/10 text-primary font-black" />
                             <span className="font-black tracking-tight">{emp.name}</span>
                          </div>
                       </TableCell>
                       <TableCell><span className="opacity-50">{emp.role}</span></TableCell>
                       <TableCell>
                          <div className="flex flex-col gap-1 w-24">
                             <div className="flex justify-between text-[10px]">
                                <span>{emp.attendance}%</span>
                             </div>
                             <Progress value={emp.attendance} size="sm" color={emp.attendance > 90 ? 'success' : 'warning'} className="h-1" />
                          </div>
                       </TableCell>
                       <TableCell>
                          <Chip size="sm" variant="flat" color={emp.status === 'present' ? 'success' : 'danger'} className="font-black text-[10px] uppercase">
                             {emp.status}
                          </Chip>
                       </TableCell>
                       <TableCell>
                          <div className="flex flex-col">
                             <span className="font-black">₹{(emp.salary * (emp.attendance/100)).toFixed(0).toLocaleString()}</span>
                             <span className="text-[10px] opacity-30 tracking-tight">BASE: ₹{emp.salary.toLocaleString()}</span>
                          </div>
                       </TableCell>
                       <TableCell>
                          <Button isIconOnly variant="light" size="sm" radius="full"><ArrowRight size={16} /></Button>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
            </div>
         </div>

         {/* Sidebar for HR Stats */}
         <div className="space-y-8">
            <Card className="modern-card p-6" radius="lg">
               <CardBody>
                  <div className="flex items-center gap-3 mb-8">
                     <CalendarCheck size={20} className="text-success" />
                     <h4 className="text-sm font-black uppercase tracking-widest">Holiday Calendar</h4>
                  </div>
                  
                  <div className="space-y-6">
                    {holidays.map(holiday => (
                      <div key={holiday.name} className="flex gap-4 p-4 rounded-2xl bg-black/[0.02] dark:bg-white/5 group border border-transparent hover:border-success/10 transition-all">
                        <div className="w-12 h-12 rounded-xl bg-success/5 flex flex-col items-center justify-center text-success shrink-0 group-hover:bg-success group-hover:text-white transition-colors">
                           <span className="text-[10px] font-black uppercase">{holiday.date.split(' ')[0]}</span>
                           <span className="text-lg font-black">{holiday.date.split(' ')[1].replace(',', '')}</span>
                        </div>
                        <div className="flex flex-col justify-center">
                           <h5 className="font-black text-sm">{holiday.name}</h5>
                           <p className="text-[10px] font-bold opacity-30 uppercase">{holiday.type} Holiday</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button variant="flat" color="success" className="w-full mt-8 font-black py-6 rounded-[1.5rem]">
                     Company Calendar
                  </Button>
               </CardBody>
            </Card>

            <Card className="modern-card border border-black/5 dark:border-white/5 p-6" radius="lg">
               <CardBody className="p-0">
                  <div className="flex items-center gap-3 mb-8">
                     <Clock size={20} className="text-primary" />
                     <h4 className="text-sm font-black uppercase tracking-widest">Recent Activity</h4>
                  </div>
                  
                  <div className="space-y-6">
                     {punchHistory.map((punch, idx) => (
                       <div key={idx} className="flex gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${punch.type === 'In' ? 'bg-primary/10 text-primary' : 'bg-black/5 dark:bg-white/10 dark:text-white'}`}>
                             {punch.type === 'In' ? <ArrowRight size={18} /> : <div className="rotate-180"><ArrowRight size={18} /></div>}
                          </div>
                          <div>
                             <p className="text-xs font-black">Punched {punch.type}</p>
                             <p className="text-[10px] font-bold opacity-40 uppercase tracking-tighter">{punch.time} • {punch.location}</p>
                          </div>
                       </div>
                     ))}
                  </div>
               </CardBody>
            </Card>

            <Card className="modern-card bg-success/10 border-none p-6" radius="lg">
               <CardBody className="p-0 flex items-center gap-4">
                  <div className="w-14 h-14 bg-success text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-success/20">
                     <Award size={32} />
                  </div>
                  <div>
                     <h5 className="font-black text-sm">System Recognition</h5>
                     <p className="text-xs opacity-60 font-medium">92% Compliance achieved this week in biometrics.</p>
                  </div>
               </CardBody>
            </Card>
         </div>
      </div>
    </div>
  );
}
