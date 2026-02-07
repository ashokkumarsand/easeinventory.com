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
  Wrench,
  RefreshCw,
  AlertTriangle,
  Package,
  DollarSign,
  TrendingUp,
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

interface SparePartUsage {
  productId: string;
  productName: string;
  sku: string | null;
  currentStock: number;
  totalUsed: number;
  repairCount: number;
  avgQtyPerRepair: number;
  lastUsedAt: string | null;
  monthlyUsageRate: number;
  daysUntilStockout: number;
  isCritical: boolean;
}

interface Summary {
  totalPartsTracked: number;
  totalValueUsed: number;
  criticalCount: number;
  avgMonthlySpend: number;
}

// ============================================================
// Helpers
// ============================================================

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

// ============================================================
// Main Page
// ============================================================

export default function SparePartsPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [parts, setParts] = useState<SparePartUsage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/spare-parts');
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary);
        setParts(data.parts);
      }
    } catch (err) {
      console.error('Failed to fetch spare parts data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const chartData = parts.slice(0, 15).map((p) => ({
    name: p.productName.length > 18 ? p.productName.slice(0, 18) + '...' : p.productName,
    used: p.totalUsed,
    stock: p.currentStock,
  }));

  const statCards = [
    { label: 'Parts Tracked', value: summary?.totalPartsTracked?.toString() ?? '—', icon: Package, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    { label: 'Total Value Used', value: summary ? formatCurrency(summary.totalValueUsed) : '—', icon: DollarSign, color: 'text-green-500', bgColor: 'bg-green-500/10' },
    { label: 'Critical Stock', value: summary?.criticalCount?.toString() ?? '—', icon: AlertTriangle, color: 'text-red-500', bgColor: 'bg-red-500/10' },
    { label: 'Avg Monthly Spend', value: summary ? formatCurrency(summary.avgMonthlySpend) : '—', icon: TrendingUp, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Wrench className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight font-heading">Spare Parts</h1>
            <p className="text-sm text-muted-foreground">Track parts usage across repairs and forecast demand</p>
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

      {/* Usage Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Parts — Usage vs Current Stock</CardTitle>
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
                />
                <Bar dataKey="used" name="Total Used" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="stock" name="Current Stock" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Parts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Parts Demand Forecast</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">Loading...</div>
          ) : parts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
              <Wrench className="w-8 h-8 opacity-50" />
              <p>No spare parts data yet. Add parts to repair tickets to start tracking.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Part</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-right">Total Used</TableHead>
                    <TableHead className="text-right">Repairs</TableHead>
                    <TableHead className="text-right">Avg/Repair</TableHead>
                    <TableHead className="text-right">Monthly Rate</TableHead>
                    <TableHead className="text-right">Days to Stockout</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parts.map((part) => (
                    <TableRow key={part.productId}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{part.productName}</p>
                          {part.sku && <p className="text-xs text-muted-foreground">{part.sku}</p>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{part.currentStock}</TableCell>
                      <TableCell className="text-right">{part.totalUsed}</TableCell>
                      <TableCell className="text-right">{part.repairCount}</TableCell>
                      <TableCell className="text-right">{part.avgQtyPerRepair}</TableCell>
                      <TableCell className="text-right">{part.monthlyUsageRate}</TableCell>
                      <TableCell className="text-right">
                        {part.daysUntilStockout >= 999 ? '—' : part.daysUntilStockout}
                      </TableCell>
                      <TableCell className="text-center">
                        {part.isCritical ? (
                          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                            Critical
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                            OK
                          </Badge>
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
