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
} from '@heroui/react';
import {
    AlertTriangle,
    Check,
    Eye,
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

const ACTION_CONFIG: Record<string, { icon: any; color: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'; category: string }> = {
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
        <div className="space-y-4">
            <Table
                aria-label="Audit Log Table"
                classNames={{
                    wrapper: 'p-0 modern-card bg-white dark:bg-[#111318] border border-black/5 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-none',
                    th: 'bg-black/[0.02] dark:bg-white/[0.02] h-14 font-black uppercase tracking-wider text-[10px] opacity-40 px-6',
                    td: 'py-4 px-6',
                }}
            >
                <TableHeader>
                    <TableColumn>ACTION</TableColumn>
                    <TableColumn>USER</TableColumn>
                    <TableColumn>RESOURCE</TableColumn>
                    <TableColumn>IP ADDRESS</TableColumn>
                    <TableColumn>TIMESTAMP</TableColumn>
                    <TableColumn>DETAILS</TableColumn>
                </TableHeader>
                <TableBody
                    isLoading={isLoading}
                    loadingContent={<Spinner color="primary" />}
                    emptyContent="No audit logs found"
                >
                    {logs.map((log) => {
                        const config = getActionConfig(log.action);
                        const Icon = config.icon;
                        return (
                            <TableRow key={log.id} className="border-b last:border-none border-black/5 dark:border-white/10 hover:bg-black/[0.01] transition-colors">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-${config.color}/10`}>
                                            <Icon size={16} className={`text-${config.color}`} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">{formatActionLabel(log.action)}</p>
                                            <Chip size="sm" variant="flat" color={config.color} className="text-[8px] font-black h-4 mt-1">
                                                {config.category}
                                            </Chip>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="font-bold text-sm">{log.userName}</span>
                                </TableCell>
                                <TableCell>
                                    <span className="text-xs font-medium opacity-60">{log.resource || '-'}</span>
                                </TableCell>
                                <TableCell>
                                    <span className="text-[10px] font-mono opacity-40">{log.ipAddress || '-'}</span>
                                </TableCell>
                                <TableCell>
                                    <span className="text-[10px] font-bold opacity-40">{formatDate(log.createdAt)}</span>
                                </TableCell>
                                <TableCell>
                                    {log.details && Object.keys(log.details).length > 0 ? (
                                        <Tooltip
                                            content={
                                                <pre className="text-xs max-w-md overflow-auto">
                                                    {JSON.stringify(log.details, null, 2)}
                                                </pre>
                                            }
                                        >
                                            <Chip size="sm" variant="flat" color="default" className="text-[8px] font-bold cursor-pointer">
                                                View Details
                                            </Chip>
                                        </Tooltip>
                                    ) : (
                                        <span className="text-[10px] opacity-30">-</span>
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
                        classNames={{
                            cursor: 'bg-primary font-black',
                        }}
                    />
                </div>
            )}
        </div>
    );
}
