'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Download,
    FileSearch,
    Loader2,
    RefreshCw,
    Search,
    Shield,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import AuditLogTable from '@/components/audit/AuditLogTable';
import ActivityFeed from '@/components/audit/ActivityFeed';

interface AuditLog {
    id: string;
    action: string;
    resource: string | null;
    userId: string | null;
    userName: string;
    ipAddress: string | null;
    details: any;
    createdAt: string;
}

interface FilterUser {
    id: string;
    name: string | null;
    email: string | null;
}

export default function AuditTrailPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 50,
        total: 0,
        totalPages: 0,
    });

    // Filters
    const [actionFilter, setActionFilter] = useState<string>('');
    const [userFilter, setUserFilter] = useState<string>('');
    const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Filter options
    const [availableActions, setAvailableActions] = useState<string[]>([]);
    const [availableUsers, setAvailableUsers] = useState<FilterUser[]>([]);

    const fetchLogs = useCallback(async (page = 1) => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '50',
            });

            if (actionFilter) params.append('action', actionFilter);
            if (userFilter) params.append('userId', userFilter);
            if (dateRange?.start) params.append('startDate', dateRange.start);
            if (dateRange?.end) params.append('endDate', dateRange.end);

            const response = await fetch(`/api/security/logs?${params}`);
            if (response.ok) {
                const data = await response.json();
                setLogs(data.logs || []);
                setPagination(data.pagination);
                setAvailableActions(data.filters?.actions || []);
                setAvailableUsers(data.filters?.users || []);
            }
        } catch (error) {
            console.error('Failed to fetch audit logs:', error);
        } finally {
            setIsLoading(false);
        }
    }, [actionFilter, userFilter, dateRange]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const handlePageChange = (page: number) => {
        fetchLogs(page);
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const params = new URLSearchParams();
            if (actionFilter) params.append('action', actionFilter);
            if (userFilter) params.append('userId', userFilter);
            if (dateRange?.start) params.append('startDate', dateRange.start);
            if (dateRange?.end) params.append('endDate', dateRange.end);

            const response = await fetch(`/api/security/logs/export?${params}`);
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove();
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to export');
            }
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export logs');
        } finally {
            setIsExporting(false);
        }
    };

    const handleClearFilters = () => {
        setActionFilter('');
        setUserFilter('');
        setDateRange(null);
        setSearchTerm('');
    };

    // Filter logs by search term (client-side)
    const filteredLogs = searchTerm
        ? logs.filter(log =>
            log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (log.resource?.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        : logs;

    const totalLogCount = pagination.total;
    const hasActiveFilters = actionFilter || userFilter || dateRange;

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <Shield size={22} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-black tracking-tight font-heading">Audit Trail</h1>
                    </div>
                    <p className="text-foreground/50 font-bold ml-1">
                        Track all security-relevant actions in your workspace
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="secondary"
                        className="font-bold rounded-2xl"
                        onClick={() => fetchLogs()}
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw size={18} className="mr-2" />}
                        Refresh
                    </Button>
                    <Button
                        variant="secondary"
                        className="font-bold rounded-2xl bg-primary/10 text-primary hover:bg-primary/20"
                        onClick={handleExport}
                        disabled={isExporting}
                    >
                        {isExporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download size={18} className="mr-2" />}
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="modern-card bg-primary text-white p-6 rounded-lg">
                    <CardContent className="p-0">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 text-white">
                            Total Events
                        </p>
                        <h2 className="text-4xl font-black">{totalLogCount.toLocaleString()}</h2>
                        <p className="text-xs font-bold opacity-60">All time</p>
                    </CardContent>
                </Card>
                <Card className="modern-card p-6 border border-black/5 dark:border-white/10 rounded-lg">
                    <CardContent className="p-0">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">
                            Actions Tracked
                        </p>
                        <h2 className="text-4xl font-black text-primary">{availableActions.length}</h2>
                        <p className="text-xs font-bold opacity-40">Unique types</p>
                    </CardContent>
                </Card>
                <Card className="modern-card p-6 border border-black/5 dark:border-white/10 rounded-lg">
                    <CardContent className="p-0">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">
                            Active Users
                        </p>
                        <h2 className="text-4xl font-black text-secondary">{availableUsers.length}</h2>
                        <p className="text-xs font-bold opacity-40">With activity</p>
                    </CardContent>
                </Card>
                <Card className="modern-card p-6 border border-black/5 dark:border-white/10 rounded-lg">
                    <CardContent className="p-0">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">
                            Current View
                        </p>
                        <h2 className="text-4xl font-black text-warning">{filteredLogs.length}</h2>
                        <p className="text-xs font-bold opacity-40">
                            {hasActiveFilters ? 'Filtered results' : 'This page'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Main Content */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Filters */}
                    <Card className="modern-card p-6 rounded-lg">
                        <CardContent className="p-0 space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <FileSearch size={18} className="text-primary" />
                                <h3 className="text-sm font-black uppercase tracking-widest">Filters</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="relative">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                                    <Input
                                        placeholder="Search logs..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="bg-black/5 h-12 rounded-2xl pl-10"
                                    />
                                </div>

                                <Select
                                    value={actionFilter || 'all'}
                                    onValueChange={(value) => setActionFilter(value === 'all' ? '' : value)}
                                >
                                    <SelectTrigger className="bg-black/5 h-12 rounded-2xl">
                                        <SelectValue placeholder="All actions" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All actions</SelectItem>
                                        {availableActions.map((action) => (
                                            <SelectItem key={action} value={action}>
                                                {action.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={userFilter || 'all'}
                                    onValueChange={(value) => setUserFilter(value === 'all' ? '' : value)}
                                >
                                    <SelectTrigger className="bg-black/5 h-12 rounded-2xl">
                                        <SelectValue placeholder="All users" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All users</SelectItem>
                                        {availableUsers.map((user) => (
                                            <SelectItem key={user.id} value={user.id}>
                                                {user.name || user.email || 'Unknown'}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Button
                                    variant="secondary"
                                    className="h-12 rounded-2xl font-bold bg-destructive/10 text-destructive hover:bg-destructive/20"
                                    onClick={handleClearFilters}
                                    disabled={!hasActiveFilters && !searchTerm}
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Log Table */}
                    <AuditLogTable
                        logs={filteredLogs}
                        isLoading={isLoading}
                        pagination={pagination}
                        onPageChange={handlePageChange}
                    />
                </div>

                {/* Activity Feed Sidebar */}
                <div className="lg:col-span-4">
                    <ActivityFeed limit={15} refreshInterval={30000} />
                </div>
            </div>
        </div>
    );
}
