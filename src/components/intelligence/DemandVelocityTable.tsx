'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw, Search, TrendingDown, TrendingUp, Minus, ArrowRight } from 'lucide-react';
import { ColDef } from 'ag-grid-community';
import Link from 'next/link';

interface DemandRow {
  productId: string;
  productName: string;
  sku: string | null;
  currentStock: number;
  abcClass: string | null;
  xyzClass: string | null;
  avgDailyDemand: number;
  avgWeeklyDemand: number;
  movingAvg7d: number;
  movingAvg30d: number;
  stdDeviation: number;
  totalQuantitySold: number;
}

const TREND_ICON = {
  UP: <TrendingUp className="w-3.5 h-3.5 text-green-500" />,
  DOWN: <TrendingDown className="w-3.5 h-3.5 text-red-500" />,
  STABLE: <Minus className="w-3.5 h-3.5 text-muted-foreground" />,
};

export function DemandVelocityTable() {
  const [data, setData] = useState<DemandRow[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', '50');
      if (debouncedSearch) params.set('search', debouncedSearch);

      const res = await fetch(`/api/analytics/demand?${params}`);
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const json = await res.json();
      setData(json.data || []);
      setTotal(json.total || 0);
    } catch (err) {
      console.error('Failed to fetch demand data:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetch('/api/analytics/demand', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lookbackDays: 90 }) });
      await fetchData();
    } finally {
      setIsRefreshing(false);
    }
  };

  const columns: ColDef<DemandRow>[] = [
    {
      headerName: 'Product',
      field: 'productName',
      flex: 2,
      minWidth: 200,
      cellRenderer: (params: any) => (
        <div className="flex flex-col justify-center h-full">
          <Link href={`/intelligence/demand/${params.data.productId}`} className="font-semibold text-sm hover:text-primary transition-colors">
            {params.data.productName}
          </Link>
          {params.data.sku && <span className="text-xs text-muted-foreground">{params.data.sku}</span>}
        </div>
      ),
    },
    {
      headerName: 'Stock',
      field: 'currentStock',
      width: 100,
      cellRenderer: (params: any) => (
        <span className={`font-mono text-sm ${params.value <= 0 ? 'text-destructive font-bold' : ''}`}>
          {params.value}
        </span>
      ),
    },
    {
      headerName: 'Class',
      width: 100,
      cellRenderer: (params: any) => (
        <div className="flex gap-1">
          {params.data.abcClass && (
            <Badge variant={params.data.abcClass === 'A' ? 'default' : params.data.abcClass === 'B' ? 'secondary' : 'outline'} className="text-[10px] px-1.5">
              {params.data.abcClass}
            </Badge>
          )}
          {params.data.xyzClass && (
            <Badge variant="outline" className="text-[10px] px-1.5">
              {params.data.xyzClass}
            </Badge>
          )}
        </div>
      ),
    },
    {
      headerName: 'Avg Daily',
      field: 'avgDailyDemand',
      width: 110,
      cellRenderer: (params: any) => <span className="font-mono text-sm">{params.value}</span>,
    },
    {
      headerName: 'Avg Weekly',
      field: 'avgWeeklyDemand',
      width: 110,
      cellRenderer: (params: any) => <span className="font-mono text-sm">{params.value}</span>,
    },
    {
      headerName: 'MA-7d',
      field: 'movingAvg7d',
      width: 100,
      cellRenderer: (params: any) => <span className="font-mono text-sm">{params.value}</span>,
    },
    {
      headerName: 'MA-30d',
      field: 'movingAvg30d',
      width: 100,
      cellRenderer: (params: any) => <span className="font-mono text-sm">{params.value}</span>,
    },
    {
      headerName: 'Std Dev',
      field: 'stdDeviation',
      width: 100,
      cellRenderer: (params: any) => <span className="font-mono text-sm text-muted-foreground">{params.value}</span>,
    },
    {
      headerName: 'Total Sold',
      field: 'totalQuantitySold',
      width: 110,
      cellRenderer: (params: any) => <span className="font-mono text-sm font-semibold">{params.value}</span>,
    },
    {
      headerName: '',
      width: 60,
      cellRenderer: (params: any) => (
        <Link href={`/intelligence/demand/${params.data.productId}`}>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      ),
    },
  ];

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <AlertCircle className="w-10 h-10 mb-3 text-destructive opacity-70" />
          <p className="font-medium text-foreground">Failed to load demand velocity data</p>
          <p className="text-sm mt-1">{error}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Products Tracked</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-black">{total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sold (Period)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-black">{data.reduce((s, d) => s + d.totalQuantitySold, 0).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Zero-Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-black text-destructive">{data.filter(d => d.currentStock <= 0).length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
            aria-label="Search products"
          />
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Snapshots'}
        </Button>
      </div>

      {/* Table */}
      <DataTable
        data={data}
        columns={columns}
        isLoading={isLoading}
        height={500}
        emptyMessage="No demand data yet. Click 'Refresh Snapshots' to aggregate sales data."
        onRowClick={(row) => {
          window.location.href = `/intelligence/demand/${row.productId}`;
        }}
      />

      {/* Pagination */}
      {total > 50 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * 50 + 1}–{Math.min(page * 50, total)} of {total}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page * 50 >= total} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
