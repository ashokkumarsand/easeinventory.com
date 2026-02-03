'use client';

import { Card, CardBody, Spinner } from '@heroui/react';
import {
    AlertTriangle,
    Check,
    FileText,
    Key,
    Lock,
    LogIn,
    LogOut,
    Package,
    Settings,
    Shield,
    Trash2,
    UserCog,
    UserPlus,
    Users,
    Eye,
    Activity,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface ActivityItem {
    id: string;
    action: string;
    userName: string;
    resource: string | null;
    createdAt: string;
}

interface ActivityFeedProps {
    limit?: number;
    refreshInterval?: number;
    className?: string;
}

const ACTION_ICONS: Record<string, any> = {
    LOGIN_SUCCESS: LogIn,
    LOGIN_FAILED: AlertTriangle,
    LOGOUT: LogOut,
    PASSWORD_CHANGE: Key,
    PASSWORD_RESET: Key,
    USER_CREATED: UserPlus,
    USER_UPDATED: UserCog,
    USER_DELETED: Trash2,
    USER_ROLE_CHANGED: Shield,
    PERMISSIONS_UPDATED: Lock,
    ROLE_CREATED: Shield,
    ROLE_UPDATED: Shield,
    ROLE_DELETED: Shield,
    SENSITIVE_DATA_UPDATE: Lock,
    DATA_EXPORT: FileText,
    BULK_DELETE: Trash2,
    PRODUCT_CREATED: Package,
    PRODUCT_UPDATED: Package,
    PRODUCT_DELETED: Package,
    STOCK_ADJUSTMENT: Package,
    STOCK_TRANSFER: Package,
    INVOICE_CREATED: FileText,
    INVOICE_UPDATED: FileText,
    INVOICE_VOIDED: FileText,
    PAYMENT_RECORDED: Check,
    GSP_API_ACCESS: Settings,
    EXPORT_GSTR1: FileText,
    EINVOICE_GENERATED: FileText,
    EMPLOYEE_CREATED: Users,
    EMPLOYEE_UPDATED: Users,
    LEAVE_APPROVED: Check,
    LEAVE_REJECTED: AlertTriangle,
    PAYSLIP_GENERATED: FileText,
    TENANT_SETTINGS_UPDATED: Settings,
    INTEGRATION_CONFIGURED: Settings,
    API_KEY_GENERATED: Key,
    API_KEY_REVOKED: Key,
};

export default function ActivityFeed({ limit = 10, refreshInterval = 30000, className = '' }: ActivityFeedProps) {
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchActivities = async () => {
        try {
            const response = await fetch(`/api/security/logs?limit=${limit}`);
            if (response.ok) {
                const data = await response.json();
                setActivities(data.logs || []);
            }
        } catch (error) {
            console.error('Failed to fetch activities:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities();

        // Set up polling for real-time updates
        const interval = setInterval(fetchActivities, refreshInterval);
        return () => clearInterval(interval);
    }, [limit, refreshInterval]);

    const formatTimeAgo = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    };

    const formatActionMessage = (action: string, resource: string | null) => {
        const actionParts = action.toLowerCase().split('_');
        const verb = actionParts.pop();
        const subject = actionParts.join(' ');

        let message = `${subject} ${verb}`;
        if (resource) {
            message += `: ${resource}`;
        }

        return message.charAt(0).toUpperCase() + message.slice(1);
    };

    if (isLoading) {
        return (
            <Card className={`modern-card p-6 ${className}`} radius="lg">
                <CardBody className="flex items-center justify-center p-8">
                    <Spinner color="primary" />
                </CardBody>
            </Card>
        );
    }

    return (
        <Card className={`modern-card p-6 ${className}`} radius="lg">
            <CardBody className="p-0 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                    <Activity size={18} className="text-primary" />
                    <h3 className="text-sm font-black uppercase tracking-widest">Recent Activity</h3>
                </div>

                {activities.length === 0 ? (
                    <p className="text-sm opacity-40 text-center py-8">No recent activity</p>
                ) : (
                    <div className="space-y-1">
                        {activities.map((activity, index) => {
                            const Icon = ACTION_ICONS[activity.action] || Eye;
                            const isLast = index === activities.length - 1;

                            return (
                                <div key={activity.id} className="flex gap-3 group">
                                    <div className="flex flex-col items-center">
                                        <div className="w-8 h-8 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                            <Icon size={14} className="opacity-40 group-hover:opacity-100 group-hover:text-primary transition-all" />
                                        </div>
                                        {!isLast && (
                                            <div className="w-[2px] flex-1 bg-black/5 dark:bg-white/10 my-1" />
                                        )}
                                    </div>
                                    <div className="flex-1 pb-4">
                                        <p className="text-xs font-bold">
                                            <span className="text-primary">{activity.userName}</span>
                                            {' '}
                                            <span className="opacity-60">{formatActionMessage(activity.action, activity.resource)}</span>
                                        </p>
                                        <p className="text-[10px] font-bold opacity-30 mt-1">{formatTimeAgo(activity.createdAt)}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardBody>
        </Card>
    );
}
