'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    ArrowDownLeft,
    ArrowUpRight,
    Check,
    CheckCheck,
    ChevronLeft,
    ChevronRight,
    Clock,
    Loader2,
    RefreshCw,
    X,
} from 'lucide-react';

interface WhatsAppMessage {
    id: string;
    direction: 'OUTBOUND' | 'INBOUND';
    phone: string;
    templateName: string | null;
    messageType: string;
    content: string | null;
    status: string;
    sentAt: string | null;
    deliveredAt: string | null;
    readAt: string | null;
    failedAt: string | null;
    errorMessage: string | null;
    referenceType: string | null;
    referenceId: string | null;
    retryCount: number;
    createdAt: string;
}

interface MessageHistoryTableProps {
    messages: WhatsAppMessage[];
    isLoading: boolean;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    onPageChange: (page: number) => void;
    onRetry?: (messageId: string) => void;
}

const STATUS_CONFIG: Record<string, { icon: any; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
    PENDING: { icon: Clock, variant: 'secondary', className: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
    SENT: { icon: Check, variant: 'secondary', className: 'bg-primary/10 text-primary border-primary/20' },
    DELIVERED: { icon: CheckCheck, variant: 'secondary', className: 'bg-green-500/10 text-green-500 border-green-500/20' },
    READ: { icon: CheckCheck, variant: 'secondary', className: 'bg-green-500/10 text-green-500 border-green-500/20' },
    FAILED: { icon: X, variant: 'destructive', className: 'bg-destructive/10 text-destructive border-destructive/20' },
    RETRY_SCHEDULED: { icon: RefreshCw, variant: 'secondary', className: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
};

export default function MessageHistoryTable({
    messages,
    isLoading,
    pagination,
    onPageChange,
    onRetry,
}: MessageHistoryTableProps) {
    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatPhone = (phone: string) => {
        // Format as +91 XXXXX XXXXX
        if (phone.startsWith('+91')) {
            return phone.replace(/(\+91)(\d{5})(\d{5})/, '$1 $2 $3');
        }
        if (phone.length === 10) {
            return `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;
        }
        return phone;
    };

    const getTooltipContent = (msg: WhatsAppMessage) => {
        if (msg.errorMessage) {
            return <p className="text-xs text-destructive">{msg.errorMessage}</p>;
        }
        if (msg.status === 'READ') {
            return `Read at ${formatDate(msg.readAt)}`;
        }
        if (msg.status === 'DELIVERED') {
            return `Delivered at ${formatDate(msg.deliveredAt)}`;
        }
        return msg.status;
    };

    return (
        <TooltipProvider>
            <div className="space-y-4">
                <div className="modern-card theme-table-wrapper border border-black/5 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-none">
                    <table className="w-full" aria-label="WhatsApp Message History">
                        <thead>
                            <tr className="bg-black/[0.02] dark:bg-white/[0.02]">
                                <th className="h-14 font-black uppercase tracking-wider text-[10px] opacity-40 px-6 text-left">DIRECTION</th>
                                <th className="h-14 font-black uppercase tracking-wider text-[10px] opacity-40 px-6 text-left">PHONE</th>
                                <th className="h-14 font-black uppercase tracking-wider text-[10px] opacity-40 px-6 text-left">TEMPLATE</th>
                                <th className="h-14 font-black uppercase tracking-wider text-[10px] opacity-40 px-6 text-left">REFERENCE</th>
                                <th className="h-14 font-black uppercase tracking-wider text-[10px] opacity-40 px-6 text-left">STATUS</th>
                                <th className="h-14 font-black uppercase tracking-wider text-[10px] opacity-40 px-6 text-left">TIMESTAMP</th>
                                <th className="h-14 font-black uppercase tracking-wider text-[10px] opacity-40 px-6 text-left">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                            <span className="text-sm text-muted-foreground">Loading...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : messages.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                                        No messages found
                                    </td>
                                </tr>
                            ) : (
                                messages.map((msg) => {
                                    const statusConfig = STATUS_CONFIG[msg.status] || STATUS_CONFIG.PENDING;
                                    const StatusIcon = statusConfig.icon;

                                    return (
                                        <tr
                                            key={msg.id}
                                            className="border-b last:border-none border-black/5 dark:border-white/10 hover:bg-black/[0.01] transition-colors"
                                        >
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                                                            msg.direction === 'OUTBOUND'
                                                                ? 'bg-primary/10'
                                                                : 'bg-green-500/10'
                                                        }`}
                                                    >
                                                        {msg.direction === 'OUTBOUND' ? (
                                                            <ArrowUpRight size={14} className="text-primary" />
                                                        ) : (
                                                            <ArrowDownLeft size={14} className="text-green-500" />
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] font-bold opacity-40">
                                                        {msg.direction === 'OUTBOUND' ? 'Sent' : 'Received'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="font-mono text-sm">{formatPhone(msg.phone)}</span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-sm">
                                                        {msg.templateName || '-'}
                                                    </span>
                                                    <Badge variant="secondary" className="text-[8px] font-bold">
                                                        {msg.messageType}
                                                    </Badge>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                {msg.referenceType && msg.referenceId ? (
                                                    <span className="text-xs font-medium opacity-60">
                                                        {msg.referenceType}: {msg.referenceId}
                                                    </span>
                                                ) : (
                                                    <span className="opacity-30">-</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Badge
                                                            variant="outline"
                                                            className={`font-bold text-[10px] cursor-help ${statusConfig.className}`}
                                                        >
                                                            <StatusIcon size={12} className="mr-1" />
                                                            {msg.status.replace('_', ' ')}
                                                        </Badge>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="max-w-xs">
                                                        {getTooltipContent(msg)}
                                                    </TooltipContent>
                                                </Tooltip>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="text-[10px] font-bold opacity-40">
                                                    {formatDate(msg.createdAt)}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                {(msg.status === 'FAILED' || msg.status === 'RETRY_SCHEDULED') &&
                                                    msg.retryCount < 3 &&
                                                    onRetry && (
                                                        <Button
                                                            size="icon"
                                                            variant="secondary"
                                                            className="h-8 w-8 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                                                            onClick={() => onRetry(msg.id)}
                                                        >
                                                            <RefreshCw size={14} />
                                                        </Button>
                                                    )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {pagination.totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 pt-4">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onPageChange(pagination.page - 1)}
                            disabled={pagination.page <= 1}
                        >
                            <ChevronLeft size={16} />
                        </Button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                let pageNum;
                                if (pagination.totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (pagination.page <= 3) {
                                    pageNum = i + 1;
                                } else if (pagination.page >= pagination.totalPages - 2) {
                                    pageNum = pagination.totalPages - 4 + i;
                                } else {
                                    pageNum = pagination.page - 2 + i;
                                }
                                return (
                                    <Button
                                        key={pageNum}
                                        variant={pagination.page === pageNum ? 'default' : 'outline'}
                                        size="icon"
                                        className="h-8 w-8 font-black"
                                        onClick={() => onPageChange(pageNum)}
                                    >
                                        {pageNum}
                                    </Button>
                                );
                            })}
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onPageChange(pagination.page + 1)}
                            disabled={pagination.page >= pagination.totalPages}
                        >
                            <ChevronRight size={16} />
                        </Button>
                    </div>
                )}
            </div>
        </TooltipProvider>
    );
}
