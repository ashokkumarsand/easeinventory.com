'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
    Award,
    CheckCircle,
    Clock,
    Fingerprint,
    MapPin,
    TrendingUp
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AttendancePage() {
    const [time, setTime] = useState(new Date());
    const [attendances, setAttendances] = useState<any[]>([]);
    const [currentAttendance, setCurrentAttendance] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [location, setLocation] = useState<{lat: number | null, lng: number | null}>({lat: null, lng: null});

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        fetchTodayAttendance();
        getUserLocation();
        return () => clearInterval(timer);
    }, []);

    const fetchTodayAttendance = async () => {
        try {
            const response = await fetch('/api/hr/attendance');
            const data = await response.json();
            setAttendances(data.attendances || []);
            // Find today's record for current user
            const today = new Date().toISOString().split('T')[0];
            const record = data.attendances.find((a: any) => a.date.startsWith(today));
            setCurrentAttendance(record || null);
        } catch (error) {
            console.error('Fetch attendance error:', error);
        }
    };

    const getUserLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            }, (error) => {
                console.warn("Location access denied or unavailable", error);
            });
        }
    };

    const handlePunch = async () => {
        setIsLoading(true);
        const type = (currentAttendance && currentAttendance.checkIn && !currentAttendance.checkOut) ? 'OUT' : 'IN';

        try {
            const response = await fetch('/api/hr/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type,
                    lat: location.lat,
                    lng: location.lng
                })
            });

            const data = await response.json();
            if (response.ok) {
                fetchTodayAttendance();
            } else {
                alert(data.message || 'Punch failed');
            }
        } catch (error) {
            alert('Error during punch operation');
        } finally {
            setIsLoading(false);
        }
    };

    const isPunchedIn = currentAttendance && currentAttendance.checkIn && !currentAttendance.checkOut;

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <Fingerprint size={22} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-black tracking-tight font-heading">Punch Station</h1>
                </div>
                <p className="text-foreground/50 font-bold ml-1">Digital time tracking with geolocation verification.</p>
            </div>

            <div className="grid lg:grid-cols-1 gap-8">
                {/* Punching System Card */}
                <Card className="bg-primary p-6 lg:p-14 shadow-2xl shadow-primary/20 text-white relative overflow-hidden rounded-lg">
                    <CardContent className="p-0 relative z-10">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                            <div className="text-center md:text-left space-y-2">
                                <p className="text-sm font-black uppercase tracking-[0.3em] opacity-60">System Time</p>
                                <h2 className="text-6xl lg:text-8xl font-black tracking-tighter">
                                    {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </h2>
                                <p className="text-xl font-bold opacity-80">{time.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                            </div>

                            <div className="flex flex-col items-center gap-8">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handlePunch}
                                    disabled={isLoading || (currentAttendance?.checkIn && currentAttendance?.checkOut)}
                                    className={`w-40 h-40 rounded-full flex flex-col items-center justify-center gap-2 border-4 transition-all shadow-xl ${
                                        isPunchedIn
                                        ? 'bg-destructive/20 border-destructive hover:bg-destructive/30 shadow-destructive/20'
                                        : 'bg-white/20 border-white hover:bg-white/30 shadow-white/20'
                                    } ${(currentAttendance?.checkIn && currentAttendance?.checkOut) ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                                >
                                    <Fingerprint size={48} />
                                    <span className="text-xs font-black uppercase tracking-widest">
                                        {isLoading ? 'Processing...' :
                                         (currentAttendance?.checkIn && currentAttendance?.checkOut) ? 'Shift Ended' :
                                         isPunchedIn ? 'Punch Out' : 'Punch In'}
                                    </span>
                                </motion.button>

                                <div className="flex items-center gap-2 text-sm font-bold px-6 py-3 bg-black/20 rounded-full border border-white/10">
                                    <MapPin size={16} className={location.lat ? "text-green-400" : "text-white/50"} />
                                    {location.lat ? `Verified: ${location.lat.toFixed(4)}, ${location.lng?.toFixed(4)}` : "Acquiring Position..."}
                                </div>
                            </div>
                        </div>

                        <div className="mt-14 pt-10 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-10">
                            {[
                                { label: 'Today In', val: currentAttendance?.checkIn ? new Date(currentAttendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--', icon: Clock },
                                { label: 'Today Out', val: currentAttendance?.checkOut ? new Date(currentAttendance.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--', icon: TrendingUp },
                                { label: 'Shift Status', val: isPunchedIn ? 'ACTIVE' : (currentAttendance?.checkOut ? 'COMPLETED' : 'OFF DUTY'), icon: CheckCircle },
                                { label: 'Weekly Compliance', val: '98%', icon: Award },
                            ].map(it => (
                                <div key={it.label} className="space-y-1">
                                    <p className="text-[10px] font-black uppercase opacity-50 tracking-widest flex items-center gap-1">
                                        <it.icon size={12} /> {it.label}
                                    </p>
                                    <p className="text-xl font-bold">{it.val}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent History Table */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-primary rounded-full" />
                        <h3 className="text-xl font-black tracking-tight text-secondary">My Attendance Logs</h3>
                    </div>

                    <div className="bg-card border border-black/5 dark:border-white/10 rounded-[2.5rem] overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-black/5 dark:border-white/10">
                                    <th className="bg-black/[0.02] dark:bg-white/[0.02] h-16 font-black uppercase tracking-wider text-[10px] opacity-40 px-8 text-left">DATE</th>
                                    <th className="bg-black/[0.02] dark:bg-white/[0.02] h-16 font-black uppercase tracking-wider text-[10px] opacity-40 px-8 text-left">PUNCH IN</th>
                                    <th className="bg-black/[0.02] dark:bg-white/[0.02] h-16 font-black uppercase tracking-wider text-[10px] opacity-40 px-8 text-left">PUNCH OUT</th>
                                    <th className="bg-black/[0.02] dark:bg-white/[0.02] h-16 font-black uppercase tracking-wider text-[10px] opacity-40 px-8 text-left">TOTAL HOURS</th>
                                    <th className="bg-black/[0.02] dark:bg-white/[0.02] h-16 font-black uppercase tracking-wider text-[10px] opacity-40 px-8 text-left">STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendances.length > 0 ? attendances.map((att: any) => (
                                    <tr key={att.id} className="border-b last:border-none border-black/5 dark:border-white/10 hover:bg-black/[0.01] transition-colors">
                                        <td className="py-6 px-8 font-bold text-xs font-black opacity-40 italic">{new Date(att.date).toLocaleDateString()}</td>
                                        <td className="py-6 px-8 font-bold">{att.checkIn ? new Date(att.checkIn).toLocaleTimeString() : '--'}</td>
                                        <td className="py-6 px-8 font-bold">{att.checkOut ? new Date(att.checkOut).toLocaleTimeString() : '--'}</td>
                                        <td className="py-6 px-8 font-bold">
                                            {att.checkIn && att.checkOut ?
                                                `${Math.round((new Date(att.checkOut).getTime() - new Date(att.checkIn).getTime()) / (1000 * 60 * 60))}h ${Math.round(((new Date(att.checkOut).getTime() - new Date(att.checkIn).getTime()) / (1000 * 60)) % 60)}m`
                                                : '--'}
                                        </td>
                                        <td className="py-6 px-8 font-bold">
                                            <Badge variant={att.status === 'PRESENT' ? 'default' : 'secondary'} className="font-black text-[10px] uppercase">
                                                {att.status}
                                            </Badge>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="text-center py-10 opacity-30">No attendance logs found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
