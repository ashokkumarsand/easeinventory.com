'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, RefreshCw, Search, Shield } from 'lucide-react';
import { ColDef } from 'ag-grid-community';

interface SafetyStockRow {
  id: string;
  name: string;
  sku: string | null;
  quantity: number;
  costPrice: number;
  reorderPoint: number | null;
  safetyStock: number | null;
  economicOrderQty: number | null;
  leadTimeDays: number | null;
  abcClass: string | null;
  supplier: { id: string; name: string; avgLeadTimeDays: number | null } | null;
}

export function SafetyStockCalculator() {
  const [data, setData] = useState<SafetyStockRow[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [serviceLevel, setServiceLevel] = useState(0.95);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', '50');
      if (search) params.set('search', search);

      const res = await fetch(`/api/analytics/safety-stock?${params}`);
      const json = await res.json();
      setData(json.data || []);
      setTotal(json.total || 0);
    } catch (err) {
      console.error('Failed to fetch safety stock data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleBulkRecalculate = async () => {
    setIsRecalculating(true);
    try {
      await fetch('/api/analytics/safety-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceLevel }),
      });
      await fetchData();
    } finally {
      setIsRecalculating(false);
    }
  };

  const configuredCount = data.filter(d => d.safetyStock != null).length;
  const belowRopCount = data.filter(d => d.reorderPoint != null && d.quantity <= d.reorderPoint).length;

  const columns: ColDef<SafetyStockRow>[] = [
    {
      headerName: 'Product',
      field: 'name',
      flex: 2,
      minWidth: 200,
      cellRenderer: (params: any) => (
        <div className="flex flex-col justify-center h-full">
          <span className="font-semibold text-sm">{params.data.name}</span>
          {params.data.sku && <span className="text-xs text-muted-foreground">{params.data.sku}</span>}
        </div>
      ),
    },
    {
      headerName: 'Stock',
      field: 'quantity',
      width: 90,
      cellRenderer: (params: any) => {
        const belowRop = params.data.reorderPoint != null && params.value <= params.data.reorderPoint;
        return (
          <span className={`font-mono text-sm ${belowRop ? 'text-destructive font-bold' : ''}`}>
            {params.value}
          </span>
        );
      },
    },
    {
      headerName: 'Safety Stock',
      field: 'safetyStock',
      width: 120,
      cellRenderer: (params: any) => (
        <span className="font-mono text-sm">{params.value ?? '—'}</span>
      ),
    },
    {
      headerName: 'Reorder Point',
      field: 'reorderPoint',
      width: 130,
      cellRenderer: (params: any) => (
        <span className="font-mono text-sm">{params.value ?? '—'}</span>
      ),
    },
    {
      headerName: 'EOQ',
      field: 'economicOrderQty',
      width: 90,
      cellRenderer: (params: any) => (
        <span className="font-mono text-sm">{params.value ?? '—'}</span>
      ),
    },
    {
      headerName: 'Lead Time',
      field: 'leadTimeDays',
      width: 100,
      cellRenderer: (params: any) => (
        <span className="font-mono text-sm">{params.value != null ? `${params.value}d` : '—'}</span>
      ),
    },
    {
      headerName: 'Supplier',
      width: 150,
      cellRenderer: (params: any) => (
        <span className="text-sm text-muted-foreground truncate">
          {params.data.supplier?.name || '—'}
        </span>
      ),
    },
    {
      headerName: 'Status',
      width: 130,
      cellRenderer: (params: any) => {
        if (params.data.reorderPoint == null) return <Badge variant="outline" className="text-[10px]">Not Set</Badge>;
        if (params.data.quantity <= 0) return <Badge variant="destructive" className="text-[10px]">Out of Stock</Badge>;
        if (params.data.quantity <= params.data.reorderPoint) return <Badge variant="default" className="text-[10px]">Below ROP</Badge>;
        return <Badge variant="secondary" className="text-[10px]">OK</Badge>;
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-black">{total}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Configured</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-black">{configuredCount}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Below Reorder Point</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-black text-destructive">{belowRopCount}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Service Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <select
                value={serviceLevel}
                onChange={(e) => setServiceLevel(Number(e.target.value))}
                className="text-sm font-bold bg-transparent border rounded px-2 py-1"
              >
                <option value={0.85}>85%</option>
                <option value={0.90}>90%</option>
                <option value={0.95}>95%</option>
                <option value={0.97}>97%</option>
                <option value={0.99}>99%</option>
              </select>
            </div>
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
          />
        </div>
        <Button onClick={handleBulkRecalculate} disabled={isRecalculating}>
          <Calculator className={`w-4 h-4 mr-2 ${isRecalculating ? 'animate-spin' : ''}`} />
          {isRecalculating ? 'Calculating...' : 'Recalculate All'}
        </Button>
      </div>

      {/* Table */}
      <DataTable
        data={data}
        columns={columns}
        isLoading={isLoading}
        height={500}
        emptyMessage="No products found. Add products to your inventory first."
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
