'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, PackageX, AlertTriangle } from 'lucide-react';
import { ColDef } from 'ag-grid-community';

interface DeadStockItem {
  productId: string;
  productName: string;
  sku: string | null;
  currentStock: number;
  stockValue: number;
  daysSinceLastSale: number;
  recommendation: { action: string; rationale: string };
  categoryName: string | null;
  abcClass: string | null;
}

const ACTION_VARIANTS: Record<string, 'destructive' | 'default' | 'secondary' | 'outline'> = {
  LIQUIDATE: 'destructive',
  DISCONTINUE: 'destructive',
  MARKDOWN: 'default',
  BUNDLE: 'secondary',
  HOLD: 'outline',
};

export function DeadStockTable() {
  const [data, setData] = useState<DeadStockItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [noSaleDays, setNoSaleDays] = useState('90');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/analytics/dead-stock?noSaleDays=${noSaleDays}`);
      const json = await res.json();
      setData(json.products || []);
      setTotalCount(json.totalCount || 0);
      setTotalValue(json.totalValue || 0);
    } catch (err) {
      console.error('Failed to fetch dead stock:', err);
    } finally {
      setIsLoading(false);
    }
  }, [noSaleDays]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const liquidateCount = data.filter(d => d.recommendation.action === 'LIQUIDATE').length;
  const markdownCount = data.filter(d => d.recommendation.action === 'MARKDOWN' || d.recommendation.action === 'DISCONTINUE').length;

  const columns: ColDef<DeadStockItem>[] = [
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
      headerName: 'Last Sale',
      field: 'daysSinceLastSale',
      width: 110,
      cellRenderer: (params: any) => (
        <span className={`font-mono text-sm font-bold ${params.value >= 365 ? 'text-destructive' : params.value >= 180 ? 'text-amber-500' : ''}`}>
          {params.value >= 999 ? 'Never' : `${params.value}d ago`}
        </span>
      ),
    },
    {
      headerName: 'Action',
      width: 120,
      cellRenderer: (params: any) => (
        <Badge variant={ACTION_VARIANTS[params.data.recommendation.action] || 'outline'} className="text-[10px]">
          {params.data.recommendation.action}
        </Badge>
      ),
    },
    {
      headerName: 'Rationale',
      flex: 2,
      minWidth: 200,
      cellRenderer: (params: any) => (
        <span className="text-xs text-muted-foreground">{params.data.recommendation.rationale}</span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Dead Stock Items</p>
            <p className="text-2xl font-black">{totalCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Capital Locked</p>
            <p className="text-2xl font-black text-destructive">
              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalValue)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Liquidate / Discontinue</p>
            <p className="text-2xl font-black text-destructive">{liquidateCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Markdown Needed</p>
            <p className="text-2xl font-black text-amber-500">{markdownCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">No sales in</span>
          <Select value={noSaleDays} onValueChange={setNoSaleDays}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="60">60 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
              <SelectItem value="180">180 days</SelectItem>
              <SelectItem value="365">1 year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1" />
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
        emptyMessage="No dead stock detected. All products have recent sales activity."
      />
    </div>
  );
}
