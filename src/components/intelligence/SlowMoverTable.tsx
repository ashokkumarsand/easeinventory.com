'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, TrendingDown } from 'lucide-react';
import { ColDef } from 'ag-grid-community';

interface SlowMoverItem {
  productId: string;
  productName: string;
  sku: string | null;
  currentStock: number;
  stockValue: number;
  avgDailyDemand: number;
  totalSold: number;
  velocityVsAvg: number;
  categoryName: string | null;
  abcClass: string | null;
}

export function SlowMoverTable() {
  const [data, setData] = useState<SlowMoverItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [overallAvgVelocity, setOverallAvgVelocity] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/analytics/slow-movers');
      const json = await res.json();
      setData(json.products || []);
      setTotalCount(json.totalCount || 0);
      setTotalValue(json.totalValue || 0);
      setOverallAvgVelocity(json.overallAvgVelocity || 0);
    } catch (err) {
      console.error('Failed to fetch slow movers:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns: ColDef<SlowMoverItem>[] = [
    {
      headerName: 'Product',
      flex: 2,
      minWidth: 200,
      cellRenderer: (params: any) => (
        <div className="flex flex-col justify-center h-full">
          <span className="font-semibold text-sm">{params.data.productName}</span>
          <div className="flex items-center gap-2">
            {params.data.sku && <span className="text-xs text-muted-foreground">{params.data.sku}</span>}
            {params.data.categoryName && <span className="text-xs text-muted-foreground">| {params.data.categoryName}</span>}
          </div>
        </div>
      ),
    },
    {
      headerName: 'ABC',
      field: 'abcClass',
      width: 70,
      cellRenderer: (params: any) => (
        <Badge variant="outline" className="text-[10px]">{params.value || '—'}</Badge>
      ),
    },
    {
      headerName: 'Stock',
      field: 'currentStock',
      width: 80,
      cellRenderer: (params: any) => <span className="font-mono text-sm">{params.value}</span>,
    },
    {
      headerName: 'Stock Value',
      field: 'stockValue',
      width: 130,
      cellRenderer: (params: any) => (
        <span className="font-mono text-sm">
          {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(params.value))}
        </span>
      ),
    },
    {
      headerName: 'Sold (90d)',
      field: 'totalSold',
      width: 100,
      cellRenderer: (params: any) => <span className="font-mono text-sm">{params.value}</span>,
    },
    {
      headerName: 'Avg/Day',
      field: 'avgDailyDemand',
      width: 90,
      cellRenderer: (params: any) => <span className="font-mono text-sm">{params.value}</span>,
    },
    {
      headerName: 'Velocity',
      field: 'velocityVsAvg',
      width: 110,
      cellRenderer: (params: any) => {
        const pct = Math.round(Number(params.value) * 100);
        return (
          <div className="flex items-center gap-1.5">
            <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full ${pct <= 10 ? 'bg-destructive' : pct <= 20 ? 'bg-amber-500' : 'bg-primary'}`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
            <span className="font-mono text-xs text-muted-foreground">{pct}%</span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Slow Movers</p>
            <p className="text-2xl font-black">{totalCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Capital Tied Up</p>
            <p className="text-2xl font-black text-amber-500">
              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalValue)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Avg Fleet Velocity</p>
            <p className="text-2xl font-black">{overallAvgVelocity}/day</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Threshold</p>
            <p className="text-2xl font-black text-muted-foreground">&lt;25% of avg</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" onClick={fetchData} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <DataTable
        data={data}
        columns={columns}
        isLoading={isLoading}
        height={450}
        emptyMessage="No slow movers detected. All products are selling at or above average velocity."
      />
    </div>
  );
}
