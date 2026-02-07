'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  RefreshCw,
  Lightbulb,
  AlertTriangle,
  AlertCircle,
  Info,
  ArrowRight,
  Package,
  TrendingDown,
  Clock,
  Truck,
  ShoppingCart,
  Flame,
  Activity,
} from 'lucide-react';
import Link from 'next/link';

// ============================================================
// Types
// ============================================================

type NudgeSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
type NudgeCategory =
  | 'STOCKOUT_RISK'
  | 'OVERSTOCK'
  | 'DEMAND_SHIFT'
  | 'SUPPLY_CHAIN'
  | 'LOST_REVENUE'
  | 'EXPIRY'
  | 'PRICING'
  | 'PIPELINE';

interface Nudge {
  id: string;
  category: NudgeCategory;
  severity: NudgeSeverity;
  title: string;
  message: string;
  metric?: string;
  actionLabel?: string;
  actionHref?: string;
  productName?: string;
  sku?: string;
}

interface PipelineItem {
  poNumber: string;
  poId: string;
  supplierName: string;
  status: string;
  itemCount: number;
  totalValue: number;
  dueDate: string | null;
  isOverdue: boolean;
}

interface Dashboard {
  nudges: Nudge[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
    total: number;
  };
  pipeline: PipelineItem[];
}

// ============================================================
// Helpers
// ============================================================

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

const SEVERITY_CONFIG: Record<
  NudgeSeverity,
  { label: string; color: string; bg: string; border: string }
> = {
  CRITICAL: { label: 'Critical', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  HIGH: { label: 'High', color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  MEDIUM: { label: 'Medium', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  LOW: { label: 'Low', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  INFO: { label: 'Info', color: 'text-slate-500', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
};

const CATEGORY_ICON: Record<NudgeCategory, React.ElementType> = {
  STOCKOUT_RISK: AlertTriangle,
  OVERSTOCK: Package,
  DEMAND_SHIFT: Activity,
  SUPPLY_CHAIN: Truck,
  LOST_REVENUE: TrendingDown,
  EXPIRY: Clock,
  PRICING: ShoppingCart,
  PIPELINE: Truck,
};

const CATEGORY_LABELS: Record<NudgeCategory, string> = {
  STOCKOUT_RISK: 'Stockout Risk',
  OVERSTOCK: 'Overstock',
  DEMAND_SHIFT: 'Demand Shift',
  SUPPLY_CHAIN: 'Supply Chain',
  LOST_REVENUE: 'Lost Revenue',
  EXPIRY: 'Expiry',
  PRICING: 'Pricing',
  PIPELINE: 'Pipeline',
};

// ============================================================
// Main Page
// ============================================================

export default function DecisionSupportPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<NudgeCategory | 'ALL'>('ALL');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/decision-nudges');
      if (res.ok) {
        setData(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch nudges:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredNudges =
    filter === 'ALL'
      ? data?.nudges ?? []
      : (data?.nudges ?? []).filter((n) => n.category === filter);

  const categories = Array.from(new Set(data?.nudges.map((n) => n.category) ?? []));

  const statCards = [
    {
      label: 'Critical',
      value: data?.summary.critical ?? 0,
      icon: Flame,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      label: 'High Priority',
      value: data?.summary.high ?? 0,
      icon: AlertTriangle,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      label: 'Actionable',
      value: (data?.summary.medium ?? 0) + (data?.summary.low ?? 0),
      icon: AlertCircle,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      label: 'POs In Transit',
      value: data?.pipeline.length ?? 0,
      icon: Truck,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10">
            <Lightbulb className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight font-heading">
              Decision Support
            </h1>
            <p className="text-sm text-muted-foreground">
              Smart nudges, pipeline visibility, and ordering recommendations
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p
                    className={`text-2xl font-bold mt-1 ${isLoading ? 'animate-pulse' : ''}`}
                  >
                    {isLoading ? '...' : card.value}
                  </p>
                </div>
                <div className={`p-2.5 rounded-xl ${card.bgColor}`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-1 bg-foreground/[0.06] rounded-lg p-1 overflow-x-auto">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            filter === 'ALL'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          All ({data?.summary.total ?? 0})
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              filter === cat
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {CATEGORY_LABELS[cat]} (
            {data?.nudges.filter((n) => n.category === cat).length ?? 0})
          </button>
        ))}
      </div>

      {/* Nudge Cards */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            Loading nudges...
          </div>
        ) : filteredNudges.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center text-muted-foreground gap-2">
                <Lightbulb className="w-8 h-8 opacity-50" />
                <p className="font-medium">No nudges right now</p>
                <p className="text-xs">
                  Everything looks healthy. Nudges appear when action is needed.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredNudges.map((nudge) => {
            const sev = SEVERITY_CONFIG[nudge.severity];
            const Icon = CATEGORY_ICON[nudge.category];
            return (
              <Card key={nudge.id} className={`border ${sev.border}`}>
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${sev.bg} mt-0.5`}>
                      <Icon className={`w-4 h-4 ${sev.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{nudge.title}</span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${sev.color} ${sev.border}`}
                        >
                          {sev.label}
                        </Badge>
                        {nudge.metric && (
                          <span className="text-xs font-mono text-muted-foreground">
                            {nudge.metric}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{nudge.message}</p>
                      {nudge.productName && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {nudge.productName}
                          {nudge.sku && ` (${nudge.sku})`}
                        </p>
                      )}
                    </div>
                    {nudge.actionHref && nudge.actionLabel && (
                      <Link href={nudge.actionHref}>
                        <Button variant="outline" size="sm" className="shrink-0">
                          {nudge.actionLabel}
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Pipeline Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Truck className="w-4 h-4" />
            Procurement Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              Loading...
            </div>
          ) : (data?.pipeline.length ?? 0) === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
              <Truck className="w-8 h-8 opacity-50" />
              <p>No active purchase orders in transit.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Items</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead>Due Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.pipeline.map((po) => (
                    <TableRow key={po.poId}>
                      <TableCell>
                        <Link
                          href={`/purchase-orders/${po.poId}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {po.poNumber}
                        </Link>
                      </TableCell>
                      <TableCell>{po.supplierName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {po.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{po.itemCount}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(po.totalValue)}
                      </TableCell>
                      <TableCell>
                        {po.dueDate ? (
                          <span
                            className={`text-xs ${po.isOverdue ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}
                          >
                            {new Date(po.dueDate).toLocaleDateString()}
                            {po.isOverdue && ' (Overdue)'}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
