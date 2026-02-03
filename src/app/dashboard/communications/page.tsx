'use client';

import {
    Button,
    Card,
    CardBody,
    Chip,
    Select,
    SelectItem,
} from '@heroui/react';
import {
    Check,
    CheckCheck,
    Clock,
    IndianRupee,
    MessageCircle,
    RefreshCw,
    Send,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import MessageHistoryTable from '@/components/whatsapp/MessageHistoryTable';
import WhatsAppWidget from '@/components/whatsapp/WhatsAppWidget';

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

interface Stats {
    pending: number;
    sent: number;
    delivered: number;
    read: number;
    failed: number;
    retryScheduled: number;
    monthlyCostPaise: number;
}

export default function CommunicationsPage() {
    const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<Stats>({
        pending: 0,
        sent: 0,
        delivered: 0,
        read: 0,
        failed: 0,
        retryScheduled: 0,
        monthlyCostPaise: 0,
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 50,
        total: 0,
        totalPages: 0,
    });
    const [statusFilter, setStatusFilter] = useState<string>('');

    const fetchMessages = useCallback(async (page = 1) => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '50',
            });

            if (statusFilter) params.append('status', statusFilter);

            const response = await fetch(`/api/whatsapp/messages?${params}`);
            if (response.ok) {
                const data = await response.json();
                setMessages(data.messages || []);
                setPagination(data.pagination);
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            setIsLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    const handlePageChange = (page: number) => {
        fetchMessages(page);
    };

    const handleRetry = async (messageId: string) => {
        try {
            const response = await fetch('/api/whatsapp/retry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messageId }),
            });

            if (response.ok) {
                fetchMessages(pagination.page);
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to schedule retry');
            }
        } catch (error) {
            alert('Error scheduling retry');
        }
    };

    const handleSendMessage = async (data: {
        phone: string;
        templateName: string;
        referenceType?: string;
        referenceId?: string;
    }) => {
        const response = await fetch('/api/whatsapp/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phone: data.phone,
                templateName: data.templateName,
                templateParams: [],
                messageType: 'utility',
                referenceType: data.referenceType,
                referenceId: data.referenceId,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to send message');
        }

        fetchMessages();
    };

    const formatCurrency = (paise: number) => {
        return (paise / 100).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const totalMessages = stats.pending + stats.sent + stats.delivered + stats.read + stats.failed + stats.retryScheduled;
    const successRate = totalMessages > 0
        ? (((stats.delivered + stats.read) / totalMessages) * 100).toFixed(1)
        : '0';

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-success/10 flex items-center justify-center text-success">
                            <MessageCircle size={22} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-success">
                            Communications
                        </h1>
                    </div>
                    <p className="text-black/40 dark:text-white/40 font-bold ml-1">
                        WhatsApp message history and analytics
                    </p>
                </div>
                <Button
                    variant="flat"
                    color="default"
                    className="font-bold rounded-2xl"
                    startContent={<RefreshCw size={18} />}
                    onClick={() => fetchMessages()}
                    isLoading={isLoading}
                >
                    Refresh
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <Card className="modern-card bg-success text-white p-4" radius="lg">
                    <CardBody className="p-0">
                        <div className="flex items-center gap-2 mb-2">
                            <Send size={16} className="opacity-60" />
                            <span className="text-[10px] font-black uppercase opacity-60">Total Sent</span>
                        </div>
                        <h2 className="text-2xl font-black">{totalMessages}</h2>
                    </CardBody>
                </Card>

                <Card className="modern-card p-4 border border-black/5" radius="lg">
                    <CardBody className="p-0">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock size={16} className="text-warning" />
                            <span className="text-[10px] font-black uppercase opacity-40">Pending</span>
                        </div>
                        <h2 className="text-2xl font-black text-warning">{stats.pending}</h2>
                    </CardBody>
                </Card>

                <Card className="modern-card p-4 border border-black/5" radius="lg">
                    <CardBody className="p-0">
                        <div className="flex items-center gap-2 mb-2">
                            <Check size={16} className="text-primary" />
                            <span className="text-[10px] font-black uppercase opacity-40">Sent</span>
                        </div>
                        <h2 className="text-2xl font-black text-primary">{stats.sent}</h2>
                    </CardBody>
                </Card>

                <Card className="modern-card p-4 border border-black/5" radius="lg">
                    <CardBody className="p-0">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCheck size={16} className="text-success" />
                            <span className="text-[10px] font-black uppercase opacity-40">Delivered</span>
                        </div>
                        <h2 className="text-2xl font-black text-success">{stats.delivered + stats.read}</h2>
                    </CardBody>
                </Card>

                <Card className="modern-card p-4 border border-black/5" radius="lg">
                    <CardBody className="p-0">
                        <div className="flex items-center gap-2 mb-2">
                            <X size={16} className="text-danger" />
                            <span className="text-[10px] font-black uppercase opacity-40">Failed</span>
                        </div>
                        <h2 className="text-2xl font-black text-danger">{stats.failed}</h2>
                    </CardBody>
                </Card>

                <Card className="modern-card p-4 border border-black/5" radius="lg">
                    <CardBody className="p-0">
                        <div className="flex items-center gap-2 mb-2">
                            <IndianRupee size={16} className="text-secondary" />
                            <span className="text-[10px] font-black uppercase opacity-40">This Month</span>
                        </div>
                        <h2 className="text-2xl font-black text-secondary">
                            ₹{formatCurrency(stats.monthlyCostPaise)}
                        </h2>
                    </CardBody>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Message History */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black uppercase tracking-widest opacity-40">
                            Message History
                        </h3>
                        <div className="flex items-center gap-2">
                            <Chip
                                size="sm"
                                color="success"
                                variant="flat"
                                className="font-bold text-[10px]"
                            >
                                {successRate}% delivery rate
                            </Chip>
                            <Select
                                size="sm"
                                placeholder="All Status"
                                selectedKeys={statusFilter ? [statusFilter] : []}
                                onSelectionChange={(keys) =>
                                    setStatusFilter(Array.from(keys)[0] as string || '')
                                }
                                classNames={{ trigger: 'bg-black/5 h-10 min-w-[140px] rounded-xl' }}
                            >
                                <SelectItem key="">All Status</SelectItem>
                                <SelectItem key="PENDING">Pending</SelectItem>
                                <SelectItem key="SENT">Sent</SelectItem>
                                <SelectItem key="DELIVERED">Delivered</SelectItem>
                                <SelectItem key="READ">Read</SelectItem>
                                <SelectItem key="FAILED">Failed</SelectItem>
                                <SelectItem key="RETRY_SCHEDULED">Retry Scheduled</SelectItem>
                            </Select>
                        </div>
                    </div>

                    <MessageHistoryTable
                        messages={messages}
                        isLoading={isLoading}
                        pagination={pagination}
                        onPageChange={handlePageChange}
                        onRetry={handleRetry}
                    />
                </div>

                {/* Quick Send Widget */}
                <div className="lg:col-span-4 space-y-6">
                    <WhatsAppWidget onSend={handleSendMessage} />

                    {/* Quick Stats */}
                    <Card className="modern-card p-6" radius="lg">
                        <CardBody className="p-0 space-y-4">
                            <h3 className="text-sm font-black uppercase tracking-widest opacity-40">
                                Quick Stats
                            </h3>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-black/[0.02]">
                                    <span className="text-xs font-bold">Retry Scheduled</span>
                                    <Chip size="sm" color="warning" variant="flat" className="font-black">
                                        {stats.retryScheduled}
                                    </Chip>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl bg-black/[0.02]">
                                    <span className="text-xs font-bold">Messages Read</span>
                                    <Chip size="sm" color="success" variant="flat" className="font-black">
                                        {stats.read}
                                    </Chip>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl bg-black/[0.02]">
                                    <span className="text-xs font-bold">Avg. Cost/Message</span>
                                    <Chip size="sm" color="default" variant="flat" className="font-black">
                                        ₹{totalMessages > 0
                                            ? (stats.monthlyCostPaise / 100 / totalMessages).toFixed(2)
                                            : '0.00'}
                                    </Chip>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
}
