'use client';

import {
    Button,
    Card,
    CardBody,
    DateRangePicker,
    Input,
    Select,
    SelectItem,
} from '@heroui/react';
import {
    Download,
    FileSearch,
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
                        <h1 className="text-3xl font-black tracking-tight text-primary">Audit Trail</h1>
                    </div>
                    <p className="text-black/40 dark:text-white/40 font-bold ml-1">
                        Track all security-relevant actions in your workspace
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="flat"
                        color="default"
                        className="font-bold rounded-2xl"
                        startContent={<RefreshCw size={18} />}
                        onClick={() => fetchLogs()}
                        isLoading={isLoading}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="flat"
                        color="primary"
                        className="font-bold rounded-2xl"
                        startContent={<Download size={18} />}
                        onClick={handleExport}
                        isLoading={isExporting}
                    >
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="modern-card bg-primary text-white p-6" radius="lg">
                    <CardBody className="p-0">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 text-white">
                            Total Events
                        </p>
                        <h2 className="text-4xl font-black">{totalLogCount.toLocaleString()}</h2>
                        <p className="text-xs font-bold opacity-60">All time</p>
                    </CardBody>
                </Card>
                <Card className="modern-card p-6 border border-black/5 dark:border-white/10" radius="lg">
                    <CardBody className="p-0">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">
                            Actions Tracked
                        </p>
                        <h2 className="text-4xl font-black text-primary">{availableActions.length}</h2>
                        <p className="text-xs font-bold opacity-40">Unique types</p>
                    </CardBody>
                </Card>
                <Card className="modern-card p-6 border border-black/5 dark:border-white/10" radius="lg">
                    <CardBody className="p-0">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">
                            Active Users
                        </p>
                        <h2 className="text-4xl font-black text-secondary">{availableUsers.length}</h2>
                        <p className="text-xs font-bold opacity-40">With activity</p>
                    </CardBody>
                </Card>
                <Card className="modern-card p-6 border border-black/5 dark:border-white/10" radius="lg">
                    <CardBody className="p-0">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">
                            Current View
                        </p>
                        <h2 className="text-4xl font-black text-warning">{filteredLogs.length}</h2>
                        <p className="text-xs font-bold opacity-40">
                            {hasActiveFilters ? 'Filtered results' : 'This page'}
                        </p>
                    </CardBody>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Main Content */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Filters */}
                    <Card className="modern-card p-6" radius="lg">
                        <CardBody className="p-0 space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <FileSearch size={18} className="text-primary" />
                                <h3 className="text-sm font-black uppercase tracking-widest">Filters</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <Input
                                    placeholder="Search logs..."
                                    startContent={<Search size={16} className="opacity-30" />}
                                    value={searchTerm}
                                    onValueChange={setSearchTerm}
                                    classNames={{ inputWrapper: 'bg-black/5 h-12 rounded-2xl' }}
                                />

                                <Select
                                    placeholder="All actions"
                                    selectedKeys={actionFilter ? [actionFilter] : []}
                                    onSelectionChange={(keys) => setActionFilter(Array.from(keys)[0] as string || '')}
                                    classNames={{ trigger: 'bg-black/5 h-12 rounded-2xl' }}
                                >
                                    {availableActions.map((action) => (
                                        <SelectItem key={action}>
                                            {action.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')}
                                        </SelectItem>
                                    ))}
                                </Select>

                                <Select
                                    placeholder="All users"
                                    selectedKeys={userFilter ? [userFilter] : []}
                                    onSelectionChange={(keys) => setUserFilter(Array.from(keys)[0] as string || '')}
                                    classNames={{ trigger: 'bg-black/5 h-12 rounded-2xl' }}
                                >
                                    {availableUsers.map((user) => (
                                        <SelectItem key={user.id}>
                                            {user.name || user.email || 'Unknown'}
                                        </SelectItem>
                                    ))}
                                </Select>

                                <Button
                                    variant="flat"
                                    color="danger"
                                    className="h-12 rounded-2xl font-bold"
                                    onClick={handleClearFilters}
                                    isDisabled={!hasActiveFilters && !searchTerm}
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        </CardBody>
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
