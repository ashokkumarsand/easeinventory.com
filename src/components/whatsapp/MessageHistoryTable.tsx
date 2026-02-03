'use client';

import {
    Chip,
    Pagination,
    Spinner,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Tooltip,
    Button,
} from '@heroui/react';
import {
    ArrowDownLeft,
    ArrowUpRight,
    Check,
    CheckCheck,
    Clock,
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

const STATUS_CONFIG: Record<string, { icon: any; color: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' }> = {
    PENDING: { icon: Clock, color: 'warning' },
    SENT: { icon: Check, color: 'primary' },
    DELIVERED: { icon: CheckCheck, color: 'success' },
    READ: { icon: CheckCheck, color: 'success' },
    FAILED: { icon: X, color: 'danger' },
    RETRY_SCHEDULED: { icon: RefreshCw, color: 'warning' },
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

    return (
        <div className="space-y-4">
            <Table
                aria-label="WhatsApp Message History"
                classNames={{
                    wrapper: 'p-0 modern-card bg-white dark:bg-[#111318] border border-black/5 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-none',
                    th: 'bg-black/[0.02] dark:bg-white/[0.02] h-14 font-black uppercase tracking-wider text-[10px] opacity-40 px-6',
                    td: 'py-4 px-6',
                }}
            >
                <TableHeader>
                    <TableColumn>DIRECTION</TableColumn>
                    <TableColumn>PHONE</TableColumn>
                    <TableColumn>TEMPLATE</TableColumn>
                    <TableColumn>REFERENCE</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                    <TableColumn>TIMESTAMP</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody
                    isLoading={isLoading}
                    loadingContent={<Spinner color="primary" />}
                    emptyContent="No messages found"
                >
                    {messages.map((msg) => {
                        const statusConfig = STATUS_CONFIG[msg.status] || STATUS_CONFIG.PENDING;
                        const StatusIcon = statusConfig.icon;

                        return (
                            <TableRow
                                key={msg.id}
                                className="border-b last:border-none border-black/5 dark:border-white/10 hover:bg-black/[0.01] transition-colors"
                            >
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                                                msg.direction === 'OUTBOUND'
                                                    ? 'bg-primary/10'
                                                    : 'bg-success/10'
                                            }`}
                                        >
                                            {msg.direction === 'OUTBOUND' ? (
                                                <ArrowUpRight size={14} className="text-primary" />
                                            ) : (
                                                <ArrowDownLeft size={14} className="text-success" />
                                            )}
                                        </div>
                                        <span className="text-[10px] font-bold opacity-40">
                                            {msg.direction === 'OUTBOUND' ? 'Sent' : 'Received'}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="font-mono text-sm">{formatPhone(msg.phone)}</span>
                                </TableCell>
                                <TableCell>
                                    <div>
                                        <span className="font-bold text-sm">
                                            {msg.templateName || '-'}
                                        </span>
                                        <Chip
                                            size="sm"
                                            variant="flat"
                                            color="default"
                                            className="text-[8px] font-bold ml-2"
                                        >
                                            {msg.messageType}
                                        </Chip>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {msg.referenceType && msg.referenceId ? (
                                        <span className="text-xs font-medium opacity-60">
                                            {msg.referenceType}: {msg.referenceId}
                                        </span>
                                    ) : (
                                        <span className="opacity-30">-</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Tooltip
                                        content={
                                            msg.errorMessage ? (
                                                <div className="max-w-xs">
                                                    <p className="text-xs text-danger">{msg.errorMessage}</p>
                                                </div>
                                            ) : msg.status === 'READ' ? (
                                                `Read at ${formatDate(msg.readAt)}`
                                            ) : msg.status === 'DELIVERED' ? (
                                                `Delivered at ${formatDate(msg.deliveredAt)}`
                                            ) : (
                                                msg.status
                                            )
                                        }
                                    >
                                        <Chip
                                            size="sm"
                                            color={statusConfig.color}
                                            variant="flat"
                                            startContent={<StatusIcon size={12} />}
                                            className="font-bold text-[10px]"
                                        >
                                            {msg.status.replace('_', ' ')}
                                        </Chip>
                                    </Tooltip>
                                </TableCell>
                                <TableCell>
                                    <span className="text-[10px] font-bold opacity-40">
                                        {formatDate(msg.createdAt)}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {(msg.status === 'FAILED' || msg.status === 'RETRY_SCHEDULED') &&
                                        msg.retryCount < 3 &&
                                        onRetry && (
                                            <Button
                                                size="sm"
                                                variant="flat"
                                                color="warning"
                                                isIconOnly
                                                onClick={() => onRetry(msg.id)}
                                            >
                                                <RefreshCw size={14} />
                                            </Button>
                                        )}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>

            {pagination.totalPages > 1 && (
                <div className="flex justify-center pt-4">
                    <Pagination
                        total={pagination.totalPages}
                        page={pagination.page}
                        onChange={onPageChange}
                        color="primary"
                        showControls
                    />
                </div>
            )}
        </div>
    );
}
