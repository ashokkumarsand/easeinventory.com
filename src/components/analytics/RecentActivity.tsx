'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeftRight,
  FileText,
  Package,
  ShoppingCart,
  User,
  Wrench,
} from 'lucide-react';

type ActivityType = 'sale' | 'purchase' | 'repair' | 'transfer' | 'invoice' | 'customer';

interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: Date;
  metadata?: {
    amount?: number;
    status?: string;
  };
}

// Mock data
const recentActivities: Activity[] = [
  {
    id: '1',
    type: 'sale',
    title: 'New sale completed',
    description: 'iPhone 15 Pro Max sold to Rahul Sharma',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    metadata: { amount: 125000, status: 'completed' },
  },
  {
    id: '2',
    type: 'repair',
    title: 'Repair ticket created',
    description: 'Screen replacement for Samsung S23',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    metadata: { status: 'in_progress' },
  },
  {
    id: '3',
    type: 'transfer',
    title: 'Stock transfer initiated',
    description: '25 units moved to Warehouse B',
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    metadata: { status: 'pending' },
  },
  {
    id: '4',
    type: 'invoice',
    title: 'Invoice generated',
    description: 'INV-2024-0847 for Tech Solutions Ltd',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    metadata: { amount: 234500 },
  },
  {
    id: '5',
    type: 'customer',
    title: 'New customer added',
    description: 'Priya Electronics - Mumbai',
    timestamp: new Date(Date.now() - 1000 * 60 * 90),
  },
  {
    id: '6',
    type: 'purchase',
    title: 'Purchase order received',
    description: '50 units of OnePlus 12 from distributor',
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
    metadata: { amount: 3500000 },
  },
];

const activityIcons: Record<ActivityType, React.ReactNode> = {
  sale: <ShoppingCart className="w-4 h-4" />,
  purchase: <Package className="w-4 h-4" />,
  repair: <Wrench className="w-4 h-4" />,
  transfer: <ArrowLeftRight className="w-4 h-4" />,
  invoice: <FileText className="w-4 h-4" />,
  customer: <User className="w-4 h-4" />,
};

const activityColors: Record<ActivityType, string> = {
  sale: 'success',
  purchase: 'primary',
  repair: 'warning',
  transfer: 'secondary',
  invoice: 'default',
  customer: 'primary',
};

const formatTime = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

interface RecentActivityProps {
  isLoading?: boolean;
  limit?: number;
}

export function RecentActivity({ isLoading, limit = 6 }: RecentActivityProps) {
  const activities = recentActivities.slice(0, limit);

  if (isLoading) {
    return (
      <Card className="border border-foreground/5">
        <CardHeader>
          <Skeleton className="h-6 w-32 rounded-lg" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4 rounded-lg" />
                <Skeleton className="h-3 w-1/2 rounded-lg" />
              </div>
              <Skeleton className="h-4 w-12 rounded-lg" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const getStatusBadgeClass = (status: string) => {
    if (status === 'completed') return 'bg-green-500/10 text-green-600 hover:bg-green-500/20';
    if (status === 'in_progress') return 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20';
    return 'bg-muted text-muted-foreground';
  };

  const getActivityColorStyle = (type: ActivityType) => {
    const colorMap: Record<ActivityType, { bg: string; text: string }> = {
      sale: { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e' },
      purchase: { bg: 'hsl(var(--primary) / 0.1)', text: 'hsl(var(--primary))' },
      repair: { bg: 'rgba(234, 179, 8, 0.1)', text: '#eab308' },
      transfer: { bg: 'hsl(var(--secondary) / 0.1)', text: 'hsl(var(--secondary-foreground))' },
      invoice: { bg: 'hsl(var(--muted))', text: 'hsl(var(--muted-foreground))' },
      customer: { bg: 'hsl(var(--primary) / 0.1)', text: 'hsl(var(--primary))' },
    };
    return colorMap[type];
  };

  return (
    <Card className="border border-foreground/5">
      <CardHeader className="pb-3">
        <div>
          <h3 className="text-lg font-bold">Recent Activity</h3>
          <p className="text-sm text-foreground/50">Latest updates across your business</p>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-4 bottom-4 w-px bg-foreground/10" />

          <div className="space-y-4">
            {activities.map((activity) => {
              const colorStyle = getActivityColorStyle(activity.type);
              return (
                <div key={activity.id} className="flex gap-3 relative">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 z-10"
                    style={{
                      backgroundColor: colorStyle.bg,
                      color: colorStyle.text,
                    }}
                  >
                    {activityIcons[activity.type]}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{activity.title}</p>
                        <p className="text-xs text-foreground/50 truncate">{activity.description}</p>
                      </div>
                      <span className="text-[10px] text-foreground/40 shrink-0 pt-0.5">
                        {formatTime(activity.timestamp)}
                      </span>
                    </div>
                    {activity.metadata && (
                      <div className="flex items-center gap-2 mt-1.5">
                        {activity.metadata.amount && (
                          <span className="text-xs font-bold text-primary">
                            {formatCurrency(activity.metadata.amount)}
                          </span>
                        )}
                        {activity.metadata.status && (
                          <Badge
                            variant="secondary"
                            className={`text-[10px] h-5 ${getStatusBadgeClass(activity.metadata.status)}`}
                          >
                            {activity.metadata.status.replace('_', ' ')}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
