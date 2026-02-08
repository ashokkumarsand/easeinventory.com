'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Activity,
  ShoppingCart,
  Package,
  Truck,
  ClipboardList,
  RotateCcw,
  ArrowLeftRight,
  RefreshCw,
  ChevronDown,
  Clock,
} from 'lucide-react';

// ============================================================
// Types
// ============================================================

interface ActivityEvent {
  id: string;
  type: string;
  entityType: string;
  entityId: string;
  entityName: string | null;
  description: string | null;
  userId: string | null;
  metadata: unknown;
  createdAt: string;
}

interface ActivityListResponse {
  events: ActivityEvent[];
  total: number;
  page: number;
  limit: number;
}

// ============================================================
// Constants & Helpers
// ============================================================

const ENTITY_TYPE_OPTIONS = [
  { value: 'ALL', label: 'All Types' },
  { value: 'SalesOrder', label: 'Sales Order' },
  { value: 'Product', label: 'Product' },
  { value: 'Shipment', label: 'Shipment' },
  { value: 'PurchaseOrder', label: 'Purchase Order' },
  { value: 'ReturnRequest', label: 'Return Request' },
  { value: 'StockMovement', label: 'Stock Movement' },
];

function getEntityIcon(entityType: string) {
  switch (entityType) {
    case 'SalesOrder':
      return ShoppingCart;
    case 'Product':
      return Package;
    case 'Shipment':
      return Truck;
    case 'PurchaseOrder':
      return ClipboardList;
    case 'ReturnRequest':
      return RotateCcw;
    case 'StockMovement':
      return ArrowLeftRight;
    default:
      return Activity;
  }
}

function getEntityColor(entityType: string) {
  switch (entityType) {
    case 'SalesOrder':
      return { text: 'text-blue-500', bg: 'bg-blue-500/10' };
    case 'Product':
      return { text: 'text-emerald-500', bg: 'bg-emerald-500/10' };
    case 'Shipment':
      return { text: 'text-violet-500', bg: 'bg-violet-500/10' };
    case 'PurchaseOrder':
      return { text: 'text-amber-500', bg: 'bg-amber-500/10' };
    case 'ReturnRequest':
      return { text: 'text-rose-500', bg: 'bg-rose-500/10' };
    case 'StockMovement':
      return { text: 'text-cyan-500', bg: 'bg-cyan-500/10' };
    default:
      return { text: 'text-muted-foreground', bg: 'bg-muted' };
  }
}

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatEventType(type: string): string {
  // Convert "order.created" -> "Order Created"
  return type
    .split('.')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

// ============================================================
// Main Page
// ============================================================

export default function ActivityFeedPage() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [entityTypeFilter, setEntityTypeFilter] = useState('ALL');
  const limit = 20;

  const fetchEvents = useCallback(
    async (pageNum: number, append: boolean = false) => {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      try {
        const params = new URLSearchParams();
        params.set('page', pageNum.toString());
        params.set('limit', limit.toString());
        if (entityTypeFilter !== 'ALL') {
          params.set('entityType', entityTypeFilter);
        }

        const res = await fetch(`/api/activity?${params.toString()}`);
        if (res.ok) {
          const data: ActivityListResponse = await res.json();
          if (append) {
            setEvents((prev) => [...prev, ...data.events]);
          } else {
            setEvents(data.events);
          }
          setTotal(data.total);
        }
      } catch (err) {
        console.error('Failed to fetch activity events:', err);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [entityTypeFilter],
  );

  // Reset page and fetch on filter change
  useEffect(() => {
    setPage(1);
    fetchEvents(1);
  }, [entityTypeFilter, fetchEvents]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchEvents(nextPage, true);
  };

  const hasMore = events.length < total;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Activity className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight font-heading">Activity Feed</h1>
            <p className="text-sm text-muted-foreground">
              Recent events and actions across your workspace
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              {ENTITY_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setPage(1);
              fetchEvents(1);
            }}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Timeline */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="py-4">
                <div className="flex items-start gap-4 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/3 bg-muted rounded" />
                    <div className="h-3 w-2/3 bg-muted rounded" />
                  </div>
                  <div className="h-3 w-20 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-muted-foreground gap-3">
              <Activity className="w-10 h-10 opacity-40" />
              <p className="text-sm">No activity events found.</p>
              <p className="text-xs">
                Events will appear here as actions occur across your workspace.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[27px] top-6 bottom-6 w-px bg-border" />

          <div className="space-y-3">
            {events.map((event) => {
              const Icon = getEntityIcon(event.entityType);
              const color = getEntityColor(event.entityType);
              return (
                <Card key={event.id} className="relative">
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`p-2.5 rounded-xl ${color.bg} relative z-10`}>
                        <Icon className={`w-5 h-5 ${color.text}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm text-foreground">
                            {formatEventType(event.type)}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {event.entityType}
                          </Badge>
                        </div>

                        {event.description && (
                          <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                        )}

                        {event.entityName && (
                          <p className="text-xs text-muted-foreground mt-1 font-mono">
                            {event.entityName}
                          </p>
                        )}
                      </div>

                      {/* Timestamp */}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap shrink-0">
                        <Clock className="w-3 h-3" />
                        <span>{formatRelativeTime(event.createdAt)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Load More */}
      {hasMore && !isLoading && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <ChevronDown className="w-4 h-4 mr-2" />
            )}
            Load More ({events.length} of {total})
          </Button>
        </div>
      )}
    </div>
  );
}
