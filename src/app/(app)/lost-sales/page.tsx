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
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  TrendingDown,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

// ============================================================
// Types
// ============================================================

interface LostSaleEvent {
  id: string;
  productName: string;
  sku: string | null;
  requestedQty: number;
  availableQty: number;
  shortfallQty: number;
  estimatedRevenue: number;
  source: string | null;
  notes: string | null;
  createdAt: string;
}

interface Summary {
  totalEvents: number;
  totalLostRevenue: number;
  totalShortfallUnits: number;
  topProducts: { productName: string; lostRevenue: number; events: number }[];
  bySource: Record<string, number>;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

const PERIOD_OPTIONS = [
  { value: 30, label: '30 days' },
  { value: 60, label: '60 days' },
  { value: 90, label: '90 days' },
];

// ============================================================
// Main Page
// ============================================================

export default function LostSalesPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [events, setEvents] = useState<LostSaleEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [days, setDays] = useState(90);

  const fetchData = useCallback(async (period: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/lost-sales?days=${period}`);
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary);
        setEvents(data.events);
      }
    } catch (err) {
      console.error('Failed to fetch lost sales data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(days); }, [days, fetchData]);

  const chartData = summary?.topProducts.map((p) => ({
    name: p.productName.length > 18 ? p.productName.slice(0, 18) + '...' : p.productName,
    revenue: Math.round(p.lostRevenue),
    events: p.events,
  })) ?? [];

  const statCards = [
    { label: 'Stockout Events', value: summary?.totalEvents?.toString() ?? '—', icon: AlertTriangle, color: 'text-red-500', bgColor: 'bg-red-500/10' },
    { label: 'Lost Revenue', value: summary ? formatCurrency(summary.totalLostRevenue) : '—', icon: DollarSign, color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
    { label: 'Units Short', value: summary?.totalShortfallUnits?.toLocaleString() ?? '—', icon: TrendingDown, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
    { label: 'Products Affected', value: summary?.topProducts.length.toString() ?? '—', icon: ShoppingCart, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-500/10">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight font-heading">Lost Sales</h1>
            <p className="text-sm text-muted-foreground">Track stockout events and lost revenue</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
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

      {/* Top Products Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Products by Lost Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => [formatCurrency(Number(value)), 'Lost Revenue']}
                />
                <Bar dataKey="revenue" name="Lost Revenue" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Events Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Stockout Events</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">Loading...</div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
              <ShoppingCart className="w-8 h-8 opacity-50" />
              <p>No lost sales recorded yet. Events are logged when orders are rejected due to stockouts.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Requested</TableHead>
                    <TableHead className="text-right">Available</TableHead>
                    <TableHead className="text-right">Shortfall</TableHead>
                    <TableHead className="text-right">Lost Revenue</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{e.productName}</p>
                          {e.sku && <p className="text-xs text-muted-foreground">{e.sku}</p>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{e.requestedQty}</TableCell>
                      <TableCell className="text-right">{e.availableQty}</TableCell>
                      <TableCell className="text-right font-medium text-red-500">{e.shortfallQty}</TableCell>
                      <TableCell className="text-right">{formatCurrency(e.estimatedRevenue)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{e.source ?? 'MANUAL'}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(e.createdAt).toLocaleDateString()}
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
