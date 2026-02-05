'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Check,
    CheckCheck,
    Clock,
    IndianRupee,
    Loader2,
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
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <MessageCircle size={22} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-black tracking-tight font-heading">
                            Communications
                        </h1>
                    </div>
                    <p className="text-foreground/50 font-bold ml-1">
                        WhatsApp message history and analytics
                    </p>
                </div>
                <Button
                    variant="secondary"
                    className="font-bold rounded-2xl"
                    onClick={() => fetchMessages()}
                    disabled={isLoading}
                >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw size={18} className="mr-2" />}
                    Refresh
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <Card className="modern-card bg-success text-white p-4 rounded-lg">
                    <CardContent className="p-0">
                        <div className="flex items-center gap-2 mb-2">
                            <Send size={16} className="opacity-60" />
                            <span className="text-[10px] font-black uppercase opacity-60">Total Sent</span>
                        </div>
                        <h2 className="text-2xl font-black">{totalMessages}</h2>
                    </CardContent>
                </Card>

                <Card className="modern-card p-4 border border-black/5 rounded-lg">
                    <CardContent className="p-0">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock size={16} className="text-warning" />
                            <span className="text-[10px] font-black uppercase opacity-40">Pending</span>
                        </div>
                        <h2 className="text-2xl font-black text-warning">{stats.pending}</h2>
                    </CardContent>
                </Card>

                <Card className="modern-card p-4 border border-black/5 rounded-lg">
                    <CardContent className="p-0">
                        <div className="flex items-center gap-2 mb-2">
                            <Check size={16} className="text-primary" />
                            <span className="text-[10px] font-black uppercase opacity-40">Sent</span>
                        </div>
                        <h2 className="text-2xl font-black text-primary">{stats.sent}</h2>
                    </CardContent>
                </Card>

                <Card className="modern-card p-4 border border-black/5 rounded-lg">
                    <CardContent className="p-0">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCheck size={16} className="text-success" />
                            <span className="text-[10px] font-black uppercase opacity-40">Delivered</span>
                        </div>
                        <h2 className="text-2xl font-black text-success">{stats.delivered + stats.read}</h2>
                    </CardContent>
                </Card>

                <Card className="modern-card p-4 border border-black/5 rounded-lg">
                    <CardContent className="p-0">
                        <div className="flex items-center gap-2 mb-2">
                            <X size={16} className="text-destructive" />
                            <span className="text-[10px] font-black uppercase opacity-40">Failed</span>
                        </div>
                        <h2 className="text-2xl font-black text-destructive">{stats.failed}</h2>
                    </CardContent>
                </Card>

                <Card className="modern-card p-4 border border-black/5 rounded-lg">
                    <CardContent className="p-0">
                        <div className="flex items-center gap-2 mb-2">
                            <IndianRupee size={16} className="text-secondary" />
                            <span className="text-[10px] font-black uppercase opacity-40">This Month</span>
                        </div>
                        <h2 className="text-2xl font-black text-secondary">
                            ₹{formatCurrency(stats.monthlyCostPaise)}
                        </h2>
                    </CardContent>
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
                            <Badge
                                variant="secondary"
                                className="bg-success/10 text-success font-bold text-[10px]"
                            >
                                {successRate}% delivery rate
                            </Badge>
                            <Select
                                value={statusFilter}
                                onValueChange={(value) => setStatusFilter(value === 'all' ? '' : value)}
                            >
                                <SelectTrigger className="bg-black/5 h-10 min-w-[140px] rounded-xl">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="SENT">Sent</SelectItem>
                                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                                    <SelectItem value="READ">Read</SelectItem>
                                    <SelectItem value="FAILED">Failed</SelectItem>
                                    <SelectItem value="RETRY_SCHEDULED">Retry Scheduled</SelectItem>
                                </SelectContent>
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
                    <Card className="modern-card p-6 rounded-lg">
                        <CardContent className="p-0 space-y-4">
                            <h3 className="text-sm font-black uppercase tracking-widest opacity-40">
                                Quick Stats
                            </h3>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-black/[0.02]">
                                    <span className="text-xs font-bold">Retry Scheduled</span>
                                    <Badge variant="secondary" className="bg-warning/10 text-warning font-black">
                                        {stats.retryScheduled}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl bg-black/[0.02]">
                                    <span className="text-xs font-bold">Messages Read</span>
                                    <Badge variant="secondary" className="bg-success/10 text-success font-black">
                                        {stats.read}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl bg-black/[0.02]">
                                    <span className="text-xs font-bold">Avg. Cost/Message</span>
                                    <Badge variant="secondary" className="font-black">
                                        ₹{totalMessages > 0
                                            ? (stats.monthlyCostPaise / 100 / totalMessages).toFixed(2)
                                            : '0.00'}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
