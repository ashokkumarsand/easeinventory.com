'use client';

import { Card, CardBody, Progress } from '@heroui/react';
import { Calendar, HeartPulse, Star, Umbrella } from 'lucide-react';

interface LeaveBalance {
    casualTotal: number;
    casualUsed: number;
    sickTotal: number;
    sickUsed: number;
    earnedTotal: number;
    earnedUsed: number;
}

interface LeaveBalanceWidgetProps {
    balance: LeaveBalance | null;
    year: number;
    compact?: boolean;
}

export default function LeaveBalanceWidget({ balance, year, compact = false }: LeaveBalanceWidgetProps) {
    if (!balance) {
        return (
            <Card className="modern-card p-6" radius="lg">
                <CardBody className="p-0">
                    <p className="text-sm font-bold opacity-40 text-center py-8">
                        No leave balance data for {year}
                    </p>
                </CardBody>
            </Card>
        );
    }

    const leaveTypes = [
        {
            key: 'casual',
            label: 'Casual Leave',
            icon: Umbrella,
            color: 'primary',
            total: balance.casualTotal,
            used: balance.casualUsed,
        },
        {
            key: 'sick',
            label: 'Sick Leave',
            icon: HeartPulse,
            color: 'danger',
            total: balance.sickTotal,
            used: balance.sickUsed,
        },
        {
            key: 'earned',
            label: 'Earned Leave',
            icon: Star,
            color: 'warning',
            total: balance.earnedTotal,
            used: balance.earnedUsed,
        },
    ];

    if (compact) {
        return (
            <div className="grid grid-cols-3 gap-4">
                {leaveTypes.map((type) => {
                    const available = type.total - type.used;
                    const Icon = type.icon;
                    return (
                        <div
                            key={type.key}
                            className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/10"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Icon size={14} className={`text-${type.color}`} />
                                <span className="text-[10px] font-bold opacity-40 uppercase">{type.label}</span>
                            </div>
                            <p className="text-2xl font-black">{available}</p>
                            <p className="text-[10px] font-bold opacity-30">of {type.total} remaining</p>
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <Card className="modern-card p-6" radius="lg">
            <CardBody className="p-0 space-y-6">
                <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-primary" />
                    <h3 className="text-sm font-black uppercase tracking-widest">Leave Balance {year}</h3>
                </div>

                <div className="space-y-4">
                    {leaveTypes.map((type) => {
                        const available = type.total - type.used;
                        const percentage = (type.used / type.total) * 100;
                        const Icon = type.icon;

                        return (
                            <div key={type.key} className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/10">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-8 h-8 rounded-xl bg-${type.color}/10 flex items-center justify-center`}>
                                            <Icon size={16} className={`text-${type.color}`} />
                                        </div>
                                        <span className="font-bold text-sm">{type.label}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-lg">{available}</p>
                                        <p className="text-[10px] font-bold opacity-30">of {type.total}</p>
                                    </div>
                                </div>
                                <Progress
                                    value={percentage}
                                    color={type.color as any}
                                    size="sm"
                                    className="max-w-full"
                                />
                                <div className="flex justify-between mt-2">
                                    <span className="text-[10px] font-bold opacity-40">Used: {type.used}</span>
                                    <span className="text-[10px] font-bold opacity-40">Available: {available}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardBody>
        </Card>
    );
}
