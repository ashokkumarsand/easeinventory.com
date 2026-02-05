'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    AlertTriangle,
    Check,
    ChevronLeft,
    ChevronRight,
    Eye,
    FileText,
    Key,
    Loader2,
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
} from 'lucide-react';

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

interface AuditLogTableProps {
    logs: AuditLog[];
    isLoading: boolean;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    onPageChange: (page: number) => void;
}

type ColorType = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

const ACTION_CONFIG: Record<string, { icon: any; color: ColorType; category: string }> = {
    // Authentication
    LOGIN_SUCCESS: { icon: LogIn, color: 'success', category: 'Auth' },
    LOGIN_FAILED: { icon: AlertTriangle, color: 'danger', category: 'Auth' },
    LOGOUT: { icon: LogOut, color: 'default', category: 'Auth' },
    PASSWORD_CHANGE: { icon: Key, color: 'warning', category: 'Auth' },
    PASSWORD_RESET: { icon: Key, color: 'warning', category: 'Auth' },

    // User Management
    USER_CREATED: { icon: UserPlus, color: 'success', category: 'Users' },
    USER_UPDATED: { icon: UserCog, color: 'primary', category: 'Users' },
    USER_DELETED: { icon: Trash2, color: 'danger', category: 'Users' },
    USER_ROLE_CHANGED: { icon: Shield, color: 'warning', category: 'Users' },
    PERMISSIONS_UPDATED: { icon: Lock, color: 'warning', category: 'Users' },

    // Custom Roles
    ROLE_CREATED: { icon: Shield, color: 'success', category: 'Roles' },
    ROLE_UPDATED: { icon: Shield, color: 'primary', category: 'Roles' },
    ROLE_DELETED: { icon: Shield, color: 'danger', category: 'Roles' },

    // Data Operations
    SENSITIVE_DATA_UPDATE: { icon: Lock, color: 'warning', category: 'Data' },
    DATA_EXPORT: { icon: FileText, color: 'primary', category: 'Data' },
    BULK_DELETE: { icon: Trash2, color: 'danger', category: 'Data' },

    // Inventory
    PRODUCT_CREATED: { icon: Package, color: 'success', category: 'Inventory' },
    PRODUCT_UPDATED: { icon: Package, color: 'primary', category: 'Inventory' },
    PRODUCT_DELETED: { icon: Package, color: 'danger', category: 'Inventory' },
    STOCK_ADJUSTMENT: { icon: Package, color: 'warning', category: 'Inventory' },
    STOCK_TRANSFER: { icon: Package, color: 'secondary', category: 'Inventory' },

    // Invoicing
    INVOICE_CREATED: { icon: FileText, color: 'success', category: 'Invoice' },
    INVOICE_UPDATED: { icon: FileText, color: 'primary', category: 'Invoice' },
    INVOICE_VOIDED: { icon: FileText, color: 'danger', category: 'Invoice' },
    PAYMENT_RECORDED: { icon: Check, color: 'success', category: 'Invoice' },

    // GST & Compliance
    GSP_API_ACCESS: { icon: Settings, color: 'secondary', category: 'GST' },
    EXPORT_GSTR1: { icon: FileText, color: 'primary', category: 'GST' },
    EINVOICE_GENERATED: { icon: FileText, color: 'success', category: 'GST' },

    // HR
    EMPLOYEE_CREATED: { icon: Users, color: 'success', category: 'HR' },
    EMPLOYEE_UPDATED: { icon: Users, color: 'primary', category: 'HR' },
    LEAVE_APPROVED: { icon: Check, color: 'success', category: 'HR' },
    LEAVE_REJECTED: { icon: AlertTriangle, color: 'danger', category: 'HR' },
    PAYSLIP_GENERATED: { icon: FileText, color: 'success', category: 'HR' },

    // Settings
    TENANT_SETTINGS_UPDATED: { icon: Settings, color: 'primary', category: 'Settings' },
    INTEGRATION_CONFIGURED: { icon: Settings, color: 'secondary', category: 'Settings' },
    API_KEY_GENERATED: { icon: Key, color: 'success', category: 'Settings' },
    API_KEY_REVOKED: { icon: Key, color: 'danger', category: 'Settings' },
};

const DEFAULT_CONFIG = { icon: Eye, color: 'default' as const, category: 'Other' };

const colorClasses: Record<ColorType, { bg: string; text: string; badge: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    default: { bg: 'bg-muted', text: 'text-muted-foreground', badge: 'secondary' },
    primary: { bg: 'bg-primary/10', text: 'text-primary', badge: 'default' },
    secondary: { bg: 'bg-secondary/10', text: 'text-secondary-foreground', badge: 'secondary' },
    success: { bg: 'bg-green-500/10', text: 'text-green-600', badge: 'default' },
    warning: { bg: 'bg-yellow-500/10', text: 'text-yellow-600', badge: 'secondary' },
    danger: { bg: 'bg-red-500/10', text: 'text-red-600', badge: 'destructive' },
};

export default function AuditLogTable({ logs, isLoading, pagination, onPageChange }: AuditLogTableProps) {
    const getActionConfig = (action: string) => ACTION_CONFIG[action] || DEFAULT_CONFIG;

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatActionLabel = (action: string) => {
        return action
            .split('_')
            .map(word => word.charAt(0) + word.slice(1).toLowerCase())
            .join(' ');
    };

    return (
        <TooltipProvider>
            <div className="space-y-4">
                <div className="modern-card theme-table-wrapper rounded-[2.5rem] overflow-hidden shadow-none">
                    <table className="w-full" aria-label="Audit Log Table">
                        <thead>
                            <tr className="border-b border-black/5 dark:border-white/10">
                                <th className="bg-black/[0.02] dark:bg-white/[0.02] h-14 font-black uppercase tracking-wider text-[10px] opacity-40 px-6 text-left">ACTION</th>
                                <th className="bg-black/[0.02] dark:bg-white/[0.02] h-14 font-black uppercase tracking-wider text-[10px] opacity-40 px-6 text-left">USER</th>
                                <th className="bg-black/[0.02] dark:bg-white/[0.02] h-14 font-black uppercase tracking-wider text-[10px] opacity-40 px-6 text-left">RESOURCE</th>
                                <th className="bg-black/[0.02] dark:bg-white/[0.02] h-14 font-black uppercase tracking-wider text-[10px] opacity-40 px-6 text-left">IP ADDRESS</th>
                                <th className="bg-black/[0.02] dark:bg-white/[0.02] h-14 font-black uppercase tracking-wider text-[10px] opacity-40 px-6 text-left">TIMESTAMP</th>
                                <th className="bg-black/[0.02] dark:bg-white/[0.02] h-14 font-black uppercase tracking-wider text-[10px] opacity-40 px-6 text-left">DETAILS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="py-8 px-6">
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                            <span className="text-sm text-foreground/50">Loading audit logs...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-8 px-6 text-center text-foreground/50">
                                        No audit logs found
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => {
                                    const config = getActionConfig(log.action);
                                    const Icon = config.icon;
                                    const colors = colorClasses[config.color];
                                    return (
                                        <tr key={log.id} className="border-b last:border-none border-black/5 dark:border-white/10 hover:bg-black/[0.01] transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${colors.bg}`}>
                                                        <Icon size={16} className={colors.text} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm">{formatActionLabel(log.action)}</p>
                                                        <Badge variant={colors.badge} className="text-[8px] font-black h-4 mt-1">
                                                            {config.category}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="font-bold text-sm">{log.userName}</span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="text-xs font-medium opacity-60">{log.resource || '-'}</span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="text-[10px] font-mono opacity-40">{log.ipAddress || '-'}</span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="text-[10px] font-bold opacity-40">{formatDate(log.createdAt)}</span>
                                            </td>
                                            <td className="py-4 px-6">
                                                {log.details && Object.keys(log.details).length > 0 ? (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Badge variant="secondary" className="text-[8px] font-bold cursor-pointer">
                                                                View Details
                                                            </Badge>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="left" className="max-w-md bg-popover text-popover-foreground p-2">
                                                            <pre className="text-xs overflow-auto whitespace-pre-wrap">
                                                                {JSON.stringify(log.details, null, 2)}
                                                            </pre>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                ) : (
                                                    <span className="text-[10px] opacity-30">-</span>
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
                            onClick={() => onPageChange(pagination.page - 1)}
                            disabled={pagination.page <= 1}
                            className="h-9 w-9"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                            .filter(page => {
                                // Show first, last, current, and adjacent pages
                                return page === 1 ||
                                    page === pagination.totalPages ||
                                    Math.abs(page - pagination.page) <= 1;
                            })
                            .map((page, index, array) => {
                                // Add ellipsis
                                const showEllipsisBefore = index > 0 && page - array[index - 1] > 1;
                                return (
                                    <div key={page} className="flex items-center gap-2">
                                        {showEllipsisBefore && (
                                            <span className="text-foreground/40 px-2">...</span>
                                        )}
                                        <Button
                                            variant={pagination.page === page ? 'default' : 'outline'}
                                            size="icon"
                                            onClick={() => onPageChange(page)}
                                            className={`h-9 w-9 ${pagination.page === page ? 'font-black' : ''}`}
                                        >
                                            {page}
                                        </Button>
                                    </div>
                                );
                            })}

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onPageChange(pagination.page + 1)}
                            disabled={pagination.page >= pagination.totalPages}
                            className="h-9 w-9"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
        </TooltipProvider>
    );
}
