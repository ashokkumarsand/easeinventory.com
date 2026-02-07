'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
  Activity,
  TrendingDown,
  AlertTriangle,
  Package,
  Settings2,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from 'recharts';

// ============================================================
// Types
// ============================================================

interface DashboardSummary {
  avgBullwhipIndex: number;
  avgReductionPct: number;
  productsWithAmplification: number;
  productsAnalyzed: number;
}

interface SmoothedProduct {
  productId: string;
  productName: string;
  sku: string | null;
  currentStock: number;
  alpha: number;
  reviewPeriodDays: number;
  leadTimeDays: number;
  avgDailyDemand: number;
  smoothedDailyDemand: number;
  orderUpToLevel: number;
  recommendedQty: number;
  naiveQty: number;
  reductionPct: number;
  bullwhipIndex: number;
  bullwhipSeverity: string;
  demandTimeSeries: { date: string; actual: number; smoothed: number }[];
}

interface BullwhipItem {
  productId: string;
  productName: string;
  sku: string | null;
  bullwhipIndex: number;
  severity: string;
  demandVariance: number;
  poVariance: number;
}

interface DashboardData {
  summary: DashboardSummary;
  products: SmoothedProduct[];
  total: number;
  page: number;
  pageSize: number;
}

// ============================================================
// Helpers
// ============================================================

const PERIOD_OPTIONS = [
  { value: 30, label: '30 days' },
  { value: 60, label: '60 days' },
  { value: 90, label: '90 days' },
];

function severityColor(severity: string) {
  switch (severity) {
    case 'LOW':
      return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'MODERATE':
      return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'HIGH':
      return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    case 'SEVERE':
      return 'bg-red-500/10 text-red-500 border-red-500/20';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

function bullwhipBarColor(index: number) {
  if (index < 1) return '#22c55e';
  if (index < 2) return '#f59e0b';
  return '#ef4444';
}

// ============================================================
// Stat Cards
// ============================================================

function StatCards({
  summary,
  isLoading,
}: {
  summary: DashboardSummary | null;
  isLoading: boolean;
}) {
  const cards = [
    {
      label: 'Avg Bullwhip Index',
      value: summary?.avgBullwhipIndex?.toFixed(2) ?? '—',
      icon: Activity,
      color:
        (summary?.avgBullwhipIndex ?? 0) < 1
          ? 'text-green-500'
          : (summary?.avgBullwhipIndex ?? 0) < 2
            ? 'text-amber-500'
            : 'text-red-500',
      bgColor:
        (summary?.avgBullwhipIndex ?? 0) < 1
          ? 'bg-green-500/10'
          : (summary?.avgBullwhipIndex ?? 0) < 2
            ? 'bg-amber-500/10'
            : 'bg-red-500/10',
    },
    {
      label: 'Smoothing Reduction',
      value: summary ? `${summary.avgReductionPct}%` : '—',
      icon: TrendingDown,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'w/ Amplification',
      value: summary?.productsWithAmplification?.toString() ?? '—',
      icon: AlertTriangle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      label: 'Products Analyzed',
      value: summary?.productsAnalyzed?.toString() ?? '—',
      icon: Package,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className={`text-2xl font-bold mt-1 ${isLoading ? 'animate-pulse' : ''}`}>
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
  );
}

// ============================================================
// Bullwhip Chart
// ============================================================

function BullwhipChart({
  data,
  isLoading,
}: {
  data: BullwhipItem[] | null;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bullwhip Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex items-center justify-center text-muted-foreground">
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bullwhip Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex items-center justify-center text-muted-foreground">
            No data available. Products need sales and purchase order history.
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((item) => ({
    name: item.productName.length > 20 ? item.productName.slice(0, 20) + '...' : item.productName,
    bullwhipIndex: item.bullwhipIndex,
    fill: bullwhipBarColor(item.bullwhipIndex),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Bullwhip Analysis — Top Products</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis type="number" domain={[0, 'auto']} />
            <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value) => [Number(value).toFixed(2), 'Bullwhip Index']}
            />
            <ReferenceLine x={1} stroke="#f59e0b" strokeDasharray="3 3" label="No amplification" />
            <Bar dataKey="bullwhipIndex" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ============================================================
// Demand vs Smoothed Line Chart (Expandable row detail)
// ============================================================

function DemandChart({ timeSeries }: { timeSeries: { date: string; actual: number; smoothed: number }[] }) {
  // Sample to max 60 points for readability
  const step = Math.max(1, Math.floor(timeSeries.length / 60));
  const sampled = timeSeries.filter((_, i) => i % step === 0);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={sampled} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
        <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
        <YAxis tick={{ fontSize: 10 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            fontSize: '12px',
          }}
        />
        <Legend />
        <Line type="monotone" dataKey="actual" stroke="#3b82f6" dot={false} name="Actual Demand" />
        <Line
          type="monotone"
          dataKey="smoothed"
          stroke="#f97316"
          strokeDasharray="5 5"
          dot={false}
          name="EMA Smoothed"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ============================================================
// Configure Dialog
// ============================================================

function ConfigureDialog({
  product,
  open,
  onClose,
  onSave,
}: {
  product: SmoothedProduct | null;
  open: boolean;
  onClose: () => void;
  onSave: (productId: string, alpha: number, reviewPeriodDays: number) => void;
}) {
  const [alpha, setAlpha] = useState(0.2);
  const [reviewDays, setReviewDays] = useState(7);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setAlpha(product.alpha);
      setReviewDays(product.reviewPeriodDays);
    }
  }, [product]);

  const handleSave = async () => {
    if (!product) return;
    setSaving(true);
    await onSave(product.productId, alpha, reviewDays);
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configure Smoothing — {product?.productName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="alpha">
              EMA Alpha ({alpha.toFixed(2)})
            </Label>
            <Input
              id="alpha"
              type="range"
              min="0.01"
              max="0.99"
              step="0.01"
              value={alpha}
              onChange={(e) => setAlpha(parseFloat(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Lower = smoother (more stable). Higher = more responsive to recent demand.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reviewDays">Review Period (days)</Label>
            <Input
              id="reviewDays"
              type="number"
              min={1}
              max={365}
              value={reviewDays}
              onChange={(e) => setReviewDays(parseInt(e.target.value) || 7)}
            />
            <p className="text-xs text-muted-foreground">
              How often you review and place orders for this product.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Smoothing Table
// ============================================================

function SmoothingTable({
  products,
  isLoading,
  onConfigure,
}: {
  products: SmoothedProduct[];
  isLoading: boolean;
  onConfigure: (product: SmoothedProduct) => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Smoothing Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Smoothing Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            No products to analyze. Add products with sales and purchase history.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Smoothing Recommendations</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Raw Demand</TableHead>
                <TableHead className="text-right">Smoothed</TableHead>
                <TableHead className="text-center">Bullwhip</TableHead>
                <TableHead className="text-right">Recommended</TableHead>
                <TableHead className="text-right">Naive</TableHead>
                <TableHead className="text-right">Reduction</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <React.Fragment key={p.productId}>
                  <TableRow
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() =>
                      setExpandedId(expandedId === p.productId ? null : p.productId)
                    }
                  >
                    <TableCell>
                      {expandedId === p.productId ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{p.productName}</p>
                        {p.sku && (
                          <p className="text-xs text-muted-foreground">{p.sku}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{p.currentStock}</TableCell>
                    <TableCell className="text-right">{p.avgDailyDemand}/day</TableCell>
                    <TableCell className="text-right">{p.smoothedDailyDemand}/day</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={severityColor(p.bullwhipSeverity)}>
                        {p.bullwhipIndex.toFixed(2)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{p.recommendedQty}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {p.naiveQty}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={
                          p.reductionPct > 0
                            ? 'text-green-500'
                            : p.reductionPct < 0
                              ? 'text-red-500'
                              : ''
                        }
                      >
                        {p.reductionPct > 0 ? '-' : ''}
                        {p.reductionPct}%
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onConfigure(p);
                        }}
                      >
                        <Settings2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  {expandedId === p.productId && (
                    <TableRow>
                      <TableCell colSpan={10} className="bg-muted/30 p-4">
                        <div className="space-y-2">
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>Alpha: {p.alpha}</span>
                            <span>Review: {p.reviewPeriodDays}d</span>
                            <span>Lead: {p.leadTimeDays}d</span>
                            <span>Order-up-to: {p.orderUpToLevel}</span>
                          </div>
                          <DemandChart timeSeries={p.demandTimeSeries} />
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// Main Dashboard
// ============================================================

export function OrderSmoothingDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [bullwhipData, setBullwhipData] = useState<BullwhipItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [days, setDays] = useState(90);
  const [configProduct, setConfigProduct] = useState<SmoothedProduct | null>(null);

  const fetchData = useCallback(async (period: number) => {
    setIsLoading(true);
    try {
      const [dashRes, bullRes] = await Promise.all([
        fetch(`/api/analytics/order-smoothing?lookbackDays=${period}`),
        fetch(`/api/analytics/order-smoothing/bullwhip?lookbackDays=${period}`),
      ]);
      if (dashRes.ok) setData(await dashRes.json());
      if (bullRes.ok) {
        const result = await bullRes.json();
        setBullwhipData(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch order smoothing data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(days);
  }, [days, fetchData]);

  const handleSaveConfig = async (productId: string, alpha: number, reviewPeriodDays: number) => {
    try {
      const res = await fetch(`/api/analytics/order-smoothing/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ smoothingAlpha: alpha, reviewPeriodDays }),
      });
      if (res.ok) {
        fetchData(days);
      }
    } catch (err) {
      console.error('Failed to update config:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-end gap-2">
        <div className="flex items-center gap-1 bg-foreground/[0.06] rounded-lg p-1">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDays(opt.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                days === opt.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchData(days)} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stat Cards */}
      <StatCards summary={data?.summary ?? null} isLoading={isLoading} />

      {/* Bullwhip Chart */}
      <BullwhipChart data={bullwhipData} isLoading={isLoading} />

      {/* Smoothing Table */}
      <SmoothingTable
        products={data?.products ?? []}
        isLoading={isLoading}
        onConfigure={setConfigProduct}
      />

      {/* Configure Dialog */}
      <ConfigureDialog
        product={configProduct}
        open={configProduct !== null}
        onClose={() => setConfigProduct(null)}
        onSave={handleSaveConfig}
      />
    </div>
  );
}
