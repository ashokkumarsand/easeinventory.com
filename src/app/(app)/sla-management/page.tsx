'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useDisclosure } from '@/hooks/useDisclosure';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    Check,
    Clock,
    ClipboardCheck,
    IndianRupee,
    Loader2,
    Settings,
    Shield,
    ShieldAlert,
    ShieldCheck,
    Users,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface SlaComplianceRow {
    supplierId: string;
    supplierName: string;
    totalPOs: number;
    onTimePOs: number;
    onTimePct: number;
    avgLeadTimeDays: number;
    targetLeadTimeDays: number;
    avgFillRatePct: number;
    targetFillRatePct: number;
    totalBreaches: number;
    totalPenalty: number;
    complianceScore: number;
    status: 'COMPLIANT' | 'AT_RISK' | 'BREACHED';
}

interface SlaBreachEvent {
    supplierId: string;
    supplierName: string;
    poId: string;
    poNumber: string;
    breachType: 'LEAD_TIME' | 'FILL_RATE' | 'QUALITY';
    target: number;
    actual: number;
    breachDate: string;
    penaltyAmount: number;
}

interface SlaDashboard {
    summary: {
        totalSuppliers: number;
        suppliersWithSla: number;
        compliantSuppliers: number;
        atRiskSuppliers: number;
        breachedSuppliers: number;
        totalBreaches: number;
        totalPenaltyValue: number;
    };
    compliance: SlaComplianceRow[];
    recentBreaches: SlaBreachEvent[];
}

const STATUS_BADGE_MAP: Record<string, { variant: string; className: string }> = {
    COMPLIANT: { variant: 'secondary', className: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20' },
    AT_RISK: { variant: 'secondary', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
    BREACHED: { variant: 'destructive', className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' },
};

const BREACH_TYPE_LABELS: Record<string, string> = {
    LEAD_TIME: 'Lead Time',
    FILL_RATE: 'Fill Rate',
    QUALITY: 'Quality',
};

export default function SlaManagementPage() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [dashboard, setDashboard] = useState<SlaDashboard | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<SlaComplianceRow | null>(null);

    // SLA form state
    const [slaForm, setSlaForm] = useState({
        maxLeadTimeDays: 14,
        minFillRatePct: 90,
        maxDefectRatePct: 5,
        penaltyPerBreachPct: 2,
    });

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/sla');
            const data = await res.json();
            setDashboard(data);
        } catch (error) {
            console.error('Failed to fetch SLA dashboard:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenSlaDialog = async (row: SlaComplianceRow) => {
        setSelectedSupplier(row);
        // Fetch existing SLA definition for this supplier
        try {
            const res = await fetch(`/api/sla?supplierId=${row.supplierId}`);
            const data = await res.json();
            if (data.sla) {
                setSlaForm({
                    maxLeadTimeDays: data.sla.maxLeadTimeDays ?? 14,
                    minFillRatePct: data.sla.minFillRatePct ?? 90,
                    maxDefectRatePct: data.sla.maxDefectRatePct ?? 5,
                    penaltyPerBreachPct: data.sla.penaltyPerBreachPct ?? 2,
                });
            } else {
                setSlaForm({
                    maxLeadTimeDays: 14,
                    minFillRatePct: 90,
                    maxDefectRatePct: 5,
                    penaltyPerBreachPct: 2,
                });
            }
        } catch {
            setSlaForm({
                maxLeadTimeDays: 14,
                minFillRatePct: 90,
                maxDefectRatePct: 5,
                penaltyPerBreachPct: 2,
            });
        }
        onOpen();
    };

    const handleSaveSla = async () => {
        if (!selectedSupplier) return;
        setIsSaving(true);
        try {
            const res = await fetch('/api/sla', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    supplierId: selectedSupplier.supplierId,
                    ...slaForm,
                }),
            });

            if (res.ok) {
                onOpenChange(false);
                setSelectedSupplier(null);
                fetchDashboard();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to save SLA');
            }
        } catch (error) {
            alert('Error saving SLA definition');
        } finally {
            setIsSaving(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(value);
    };

    const summary = dashboard?.summary;
    const compliance = dashboard?.compliance || [];
    const recentBreaches = dashboard?.recentBreaches || [];

    const summaryCards = [
        {
            label: 'Total Suppliers',
            value: summary?.totalSuppliers ?? 0,
            icon: Users,
            color: 'text-primary',
            bgColor: 'bg-primary/10',
        },
        {
            label: 'With SLA',
            value: summary?.suppliersWithSla ?? 0,
            icon: ClipboardCheck,
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
        },
        {
            label: 'Compliant',
            value: summary?.compliantSuppliers ?? 0,
            icon: ShieldCheck,
            color: 'text-green-500',
            bgColor: 'bg-green-500/10',
        },
        {
            label: 'At Risk',
            value: summary?.atRiskSuppliers ?? 0,
            icon: AlertTriangle,
            color: 'text-amber-500',
            bgColor: 'bg-amber-500/10',
        },
        {
            label: 'Breached',
            value: summary?.breachedSuppliers ?? 0,
            icon: ShieldAlert,
            color: 'text-red-500',
            bgColor: 'bg-red-500/10',
        },
        {
            label: 'Total Breaches',
            value: summary?.totalBreaches ?? 0,
            icon: XCircle,
            color: 'text-red-500',
            bgColor: 'bg-red-500/10',
        },
        {
            label: 'Total Penalty',
            value: formatCurrency(summary?.totalPenaltyValue ?? 0),
            icon: IndianRupee,
            color: 'text-orange-500',
            bgColor: 'bg-orange-500/10',
            isFormatted: true,
        },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" aria-label="Loading SLA data" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-10 pb-20"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <Shield size={22} strokeWidth={2.5} aria-hidden="true" />
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-black tracking-tight font-heading">SLA Management</h1>
                    </div>
                    <p className="text-foreground/40 font-bold ml-1">Track supplier compliance, breaches, and penalty enforcement.</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {summaryCards.map((card, idx) => (
                    <motion.div
                        key={card.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                    >
                        <Card className="modern-card p-4">
                            <CardContent className="flex flex-col items-start gap-3 p-0">
                                <div className={`w-10 h-10 rounded-2xl ${card.bgColor} flex items-center justify-center ${card.color}`}>
                                    <card.icon size={20} aria-hidden="true" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{card.label}</p>
                                    <h2 className="text-xl font-black mt-0.5">
                                        {card.isFormatted ? card.value : card.value}
                                    </h2>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <Separator />

            {/* Compliance Table */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <ClipboardCheck size={18} className="text-primary" aria-hidden="true" />
                    <h2 className="text-xl font-black tracking-tight">Supplier Compliance</h2>
                </div>

                {compliance.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-center">
                        <Shield className="w-12 h-12 text-foreground/20 mb-4" aria-hidden="true" />
                        <p className="text-foreground/50 text-lg font-bold">No SLA definitions found</p>
                        <p className="text-foreground/30 text-sm mt-1">
                            Click on a supplier row to set SLA targets
                        </p>
                    </div>
                ) : (
                    <div className="bg-card border border-border rounded-2xl overflow-x-auto">
                        <table className="w-full min-w-[1000px]" aria-label="Supplier Compliance Table">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="bg-transparent h-14 font-semibold uppercase tracking-wider text-xs text-muted-foreground px-4 text-left">Supplier</th>
                                    <th className="bg-transparent h-14 font-semibold uppercase tracking-wider text-xs text-muted-foreground px-4 text-center">POs</th>
                                    <th className="bg-transparent h-14 font-semibold uppercase tracking-wider text-xs text-muted-foreground px-4 text-center">On-Time %</th>
                                    <th className="bg-transparent h-14 font-semibold uppercase tracking-wider text-xs text-muted-foreground px-4 text-center">Lead Time</th>
                                    <th className="bg-transparent h-14 font-semibold uppercase tracking-wider text-xs text-muted-foreground px-4 text-center">Fill Rate</th>
                                    <th className="bg-transparent h-14 font-semibold uppercase tracking-wider text-xs text-muted-foreground px-4 text-center">Breaches</th>
                                    <th className="bg-transparent h-14 font-semibold uppercase tracking-wider text-xs text-muted-foreground px-4 text-right">Penalty</th>
                                    <th className="bg-transparent h-14 font-semibold uppercase tracking-wider text-xs text-muted-foreground px-4 text-center">Score</th>
                                    <th className="bg-transparent h-14 font-semibold uppercase tracking-wider text-xs text-muted-foreground px-4 text-center">Status</th>
                                    <th className="bg-transparent h-14 font-semibold uppercase tracking-wider text-xs text-muted-foreground px-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {compliance.map((row) => {
                                    const statusStyle = STATUS_BADGE_MAP[row.status] || STATUS_BADGE_MAP.COMPLIANT;
                                    const leadTimeOverTarget = row.avgLeadTimeDays > row.targetLeadTimeDays;
                                    const fillRateUnderTarget = row.avgFillRatePct < row.targetFillRatePct;

                                    return (
                                        <tr
                                            key={row.supplierId}
                                            className="border-b border-border last:border-none hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                                        >
                                            <td className="py-4 px-4">
                                                <span className="font-black tracking-tight">{row.supplierName}</span>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className="font-bold">{row.totalPOs}</span>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className={`font-bold ${row.onTimePct >= 90 ? 'text-green-600 dark:text-green-400' : row.onTimePct >= 70 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                                                    {row.onTimePct}%
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <div className="flex flex-col items-center gap-0.5">
                                                    <span className={`font-bold ${leadTimeOverTarget ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`}>
                                                        {row.avgLeadTimeDays}d
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        target: {row.targetLeadTimeDays}d
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <div className="flex flex-col items-center gap-0.5">
                                                    <span className={`font-bold ${fillRateUnderTarget ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`}>
                                                        {row.avgFillRatePct}%
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        target: {row.targetFillRatePct}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className={`font-black ${row.totalBreaches > 0 ? 'text-red-600 dark:text-red-400' : 'text-foreground/30'}`}>
                                                    {row.totalBreaches}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <span className="font-bold text-sm">
                                                    {formatCurrency(row.totalPenalty)}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="font-black text-lg">{row.complianceScore}</span>
                                                    <div className="w-12 bg-foreground/10 rounded-full h-1.5">
                                                        <div
                                                            className={`rounded-full h-1.5 transition-all ${
                                                                row.complianceScore >= 80 ? 'bg-green-500' :
                                                                row.complianceScore >= 60 ? 'bg-amber-500' :
                                                                'bg-red-500'
                                                            }`}
                                                            style={{ width: `${row.complianceScore}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <Badge
                                                    variant={statusStyle.variant as any}
                                                    className={`font-black text-[10px] uppercase tracking-widest ${statusStyle.className}`}
                                                >
                                                    {row.status === 'AT_RISK' ? 'At Risk' : row.status === 'BREACHED' ? 'Breached' : 'Compliant'}
                                                </Badge>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="rounded-full gap-1.5"
                                                    onClick={() => handleOpenSlaDialog(row)}
                                                >
                                                    <Settings size={14} aria-hidden="true" />
                                                    <span className="text-xs font-bold">SLA</span>
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Separator />

            {/* Recent Breaches Table */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <AlertTriangle size={18} className="text-red-500" aria-hidden="true" />
                    <h2 className="text-xl font-black tracking-tight">Recent Breaches</h2>
                    {recentBreaches.length > 0 && (
                        <Badge variant="destructive" className="font-black text-[10px]">
                            {recentBreaches.length}
                        </Badge>
                    )}
                </div>

                {recentBreaches.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-center">
                        <Check className="w-12 h-12 text-green-500/30 mb-4" aria-hidden="true" />
                        <p className="text-foreground/50 text-lg font-bold">No breaches detected</p>
                        <p className="text-foreground/30 text-sm mt-1">
                            All suppliers are meeting their SLA targets
                        </p>
                    </div>
                ) : (
                    <div className="bg-card border border-border rounded-2xl overflow-x-auto">
                        <table className="w-full min-w-[800px]" aria-label="Recent Breaches Table">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="bg-transparent h-14 font-semibold uppercase tracking-wider text-xs text-muted-foreground px-4 text-left">Supplier</th>
                                    <th className="bg-transparent h-14 font-semibold uppercase tracking-wider text-xs text-muted-foreground px-4 text-left">PO Number</th>
                                    <th className="bg-transparent h-14 font-semibold uppercase tracking-wider text-xs text-muted-foreground px-4 text-center">Breach Type</th>
                                    <th className="bg-transparent h-14 font-semibold uppercase tracking-wider text-xs text-muted-foreground px-4 text-center">Target</th>
                                    <th className="bg-transparent h-14 font-semibold uppercase tracking-wider text-xs text-muted-foreground px-4 text-center">Actual</th>
                                    <th className="bg-transparent h-14 font-semibold uppercase tracking-wider text-xs text-muted-foreground px-4 text-center">Date</th>
                                    <th className="bg-transparent h-14 font-semibold uppercase tracking-wider text-xs text-muted-foreground px-4 text-right">Penalty</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentBreaches.map((breach, idx) => {
                                    const isLeadTime = breach.breachType === 'LEAD_TIME';
                                    const targetLabel = isLeadTime ? `${breach.target}d` : `${breach.target}%`;
                                    const actualLabel = isLeadTime ? `${breach.actual}d` : `${breach.actual}%`;

                                    return (
                                        <tr
                                            key={`${breach.poId}-${breach.breachType}-${idx}`}
                                            className="border-b border-border last:border-none hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                                        >
                                            <td className="py-4 px-4">
                                                <span className="font-bold">{breach.supplierName}</span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="text-sm font-mono text-primary">{breach.poNumber}</span>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <Badge
                                                    variant="secondary"
                                                    className={`font-bold text-[10px] uppercase tracking-widest ${
                                                        breach.breachType === 'LEAD_TIME'
                                                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                                            : breach.breachType === 'FILL_RATE'
                                                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                                            : 'bg-red-500/10 text-red-600 dark:text-red-400'
                                                    }`}
                                                >
                                                    <Clock size={10} className="mr-1" aria-hidden="true" />
                                                    {BREACH_TYPE_LABELS[breach.breachType]}
                                                </Badge>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className="text-sm font-bold text-muted-foreground">{targetLabel}</span>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className="text-sm font-black text-red-600 dark:text-red-400">{actualLabel}</span>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className="text-sm text-muted-foreground">
                                                    {new Date(breach.breachDate).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <span className="font-bold text-sm text-red-600 dark:text-red-400">
                                                    {formatCurrency(breach.penaltyAmount)}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Set SLA Dialog */}
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-lg">
                    <DialogHeader className="border-b border-foreground/5 px-8 py-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Settings size={20} className="text-primary" aria-hidden="true" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold">Set SLA Targets</DialogTitle>
                                <DialogDescription className="text-sm text-foreground/50 font-normal">
                                    {selectedSupplier?.supplierName || 'Supplier'}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="px-8 py-6 space-y-6">
                        {/* Max Lead Time */}
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-sm font-semibold text-foreground/70">
                                Max Lead Time (days) <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                type="number"
                                min={1}
                                max={365}
                                placeholder="e.g. 14"
                                className="h-12 border border-foreground/10 hover:border-foreground/20 focus:border-primary bg-background"
                                value={slaForm.maxLeadTimeDays}
                                onChange={(e) => setSlaForm({ ...slaForm, maxLeadTimeDays: parseInt(e.target.value) || 0 })}
                            />
                            <p className="text-[10px] text-muted-foreground">Maximum acceptable days from PO creation to first goods receipt.</p>
                        </div>

                        {/* Min Fill Rate */}
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-sm font-semibold text-foreground/70">
                                Min Fill Rate (%) <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                type="number"
                                min={0}
                                max={100}
                                placeholder="e.g. 90"
                                className="h-12 border border-foreground/10 hover:border-foreground/20 focus:border-primary bg-background"
                                value={slaForm.minFillRatePct}
                                onChange={(e) => setSlaForm({ ...slaForm, minFillRatePct: parseInt(e.target.value) || 0 })}
                            />
                            <p className="text-[10px] text-muted-foreground">Minimum percentage of ordered quantity that must be received.</p>
                        </div>

                        {/* Max Defect Rate */}
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-sm font-semibold text-foreground/70">
                                Max Defect Rate (%)
                            </Label>
                            <Input
                                type="number"
                                min={0}
                                max={100}
                                placeholder="e.g. 5"
                                className="h-12 border border-foreground/10 hover:border-foreground/20 focus:border-primary bg-background"
                                value={slaForm.maxDefectRatePct}
                                onChange={(e) => setSlaForm({ ...slaForm, maxDefectRatePct: parseInt(e.target.value) || 0 })}
                            />
                            <p className="text-[10px] text-muted-foreground">Maximum acceptable defect rate across received goods.</p>
                        </div>

                        {/* Penalty Per Breach */}
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-sm font-semibold text-foreground/70">
                                Penalty Per Breach (% of PO value) <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                type="number"
                                min={0}
                                max={100}
                                step={0.5}
                                placeholder="e.g. 2"
                                className="h-12 border border-foreground/10 hover:border-foreground/20 focus:border-primary bg-background"
                                value={slaForm.penaltyPerBreachPct}
                                onChange={(e) => setSlaForm({ ...slaForm, penaltyPerBreachPct: parseFloat(e.target.value) || 0 })}
                            />
                            <p className="text-[10px] text-muted-foreground">Percentage of PO value charged as penalty for each breach.</p>
                        </div>
                    </div>

                    <DialogFooter className="border-t border-foreground/5 px-8 py-4">
                        <Button variant="secondary" className="font-semibold rounded-full" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button className="font-semibold px-6 rounded-full gap-2" onClick={handleSaveSla} disabled={isSaving}>
                            {isSaving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                            Save SLA
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
