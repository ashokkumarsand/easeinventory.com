'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, ShoppingCart, XCircle, ArrowRightCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { ColDef } from 'ag-grid-community';

interface ReorderSuggestion {
  id: string;
  suggestedQty: number;
  currentStock: number;
  reorderPoint: number;
  safetyStock: number;
  avgDailyDemand: number;
  leadTimeDays: number;
  estimatedCost: number;
  status: string;
  urgency: string;
  daysUntilStockout: number | null;
  product: { id: string; name: string; sku: string | null };
  supplier: { id: string; name: string } | null;
}

const URGENCY_VARIANTS: Record<string, 'destructive' | 'default' | 'secondary' | 'outline'> = {
  CRITICAL: 'destructive',
  HIGH: 'default',
  NORMAL: 'secondary',
  LOW: 'outline',
};

export function ReorderSuggestionsTable() {
  const [data, setData] = useState<ReorderSuggestion[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusFilter, setStatusFilter] = useState('PENDING');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/api/analytics/reorder-suggestions?${params}`);
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const json = await res.json();
      setData(json.data || []);
      setTotal(json.total || 0);
    } catch (err) {
      console.error('Failed to fetch reorder suggestions:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await fetch('/api/analytics/reorder-suggestions', { method: 'POST' });
      await fetchData();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDismiss = async (id: string) => {
    await fetch(`/api/analytics/reorder-suggestions/${id}`, { method: 'PUT' });
    await fetchData();
  };

  const handleConvert = async (id: string) => {
    const res = await fetch(`/api/analytics/reorder-suggestions/${id}/convert`, { method: 'POST' });
    const json = await res.json();
    if (res.ok) {
      await fetchData();
    } else {
      alert(json.message || 'Failed to convert');
    }
  };

  const criticalCount = data.filter(d => d.urgency === 'CRITICAL').length;
  const highCount = data.filter(d => d.urgency === 'HIGH').length;
  const totalEstCost = data.reduce((s, d) => s + Number(d.estimatedCost), 0);

  const columns: ColDef<ReorderSuggestion>[] = [
    {
      headerName: 'Product',
      flex: 2,
      minWidth: 200,
      cellRenderer: (params: any) => (
        <div className="flex flex-col justify-center h-full">
          <span className="font-semibold text-sm">{params.data.product.name}</span>
          {params.data.product.sku && <span className="text-xs text-muted-foreground">{params.data.product.sku}</span>}
        </div>
      ),
    },
    {
      headerName: 'Urgency',
      field: 'urgency',
      width: 110,
      cellRenderer: (params: any) => (
        <Badge variant={URGENCY_VARIANTS[params.value] || 'outline'} className="text-[10px]">
          {params.value}
        </Badge>
      ),
    },
    {
      headerName: 'Stock',
      field: 'currentStock',
      width: 80,
      cellRenderer: (params: any) => (
        <span className={`font-mono text-sm ${params.value <= 0 ? 'text-destructive font-bold' : ''}`}>
          {params.value}
        </span>
      ),
    },
    {
      headerName: 'ROP',
      field: 'reorderPoint',
      width: 80,
      cellRenderer: (params: any) => <span className="font-mono text-sm">{params.value}</span>,
    },
    {
      headerName: 'Stockout In',
      field: 'daysUntilStockout',
      width: 110,
      cellRenderer: (params: any) => (
        <span className={`font-mono text-sm font-bold ${(params.value ?? 999) <= 3 ? 'text-destructive' : (params.value ?? 999) <= 7 ? 'text-amber-500' : ''}`}>
          {params.value != null ? `${params.value}d` : '—'}
        </span>
      ),
    },
    {
      headerName: 'Suggested Qty',
      field: 'suggestedQty',
      width: 130,
      cellRenderer: (params: any) => <span className="font-mono text-sm font-bold">{params.value}</span>,
    },
    {
      headerName: 'Est. Cost',
      field: 'estimatedCost',
      width: 120,
      cellRenderer: (params: any) => (
        <span className="font-mono text-sm">
          {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(params.value))}
        </span>
      ),
    },
    {
      headerName: 'Supplier',
      width: 130,
      cellRenderer: (params: any) => (
        <span className="text-sm text-muted-foreground truncate">{params.data.supplier?.name || '—'}</span>
      ),
    },
    {
      headerName: 'Actions',
      width: 150,
      cellRenderer: (params: any) => {
        if (params.data.status !== 'PENDING') {
          return <Badge variant="outline" className="text-[10px]">{params.data.status}</Badge>;
        }
        return (
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleConvert(params.data.id)}>
              <ArrowRightCircle className="w-3.5 h-3.5 mr-1" /> Convert
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={() => handleDismiss(params.data.id)}>
              <XCircle className="w-3.5 h-3.5" />
            </Button>
          </div>
        );
      },
    },
  ];

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <AlertCircle className="w-10 h-10 mb-3 text-destructive opacity-70" />
          <p className="font-medium text-foreground">Failed to load reorder suggestions</p>
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
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Total Suggestions</p>
            <p className="text-2xl font-black">{total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Critical</p>
            <p className="text-2xl font-black text-destructive">{criticalCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">High Priority</p>
            <p className="text-2xl font-black text-amber-500">{highCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Estimated Cost</p>
            <p className="text-2xl font-black">
              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalEstCost)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          {['PENDING', 'DISMISSED', 'CONVERTED_TO_PO'].map(status => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              {status.replace(/_/g, ' ')}
            </Button>
          ))}
        </div>
        <div className="flex-1" />
        <Button onClick={handleGenerate} disabled={isGenerating}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Generating...' : 'Generate Suggestions'}
        </Button>
      </div>

      <DataTable
        data={data}
        columns={columns}
        isLoading={isLoading}
        height={450}
        emptyMessage="No reorder suggestions. Click 'Generate Suggestions' to analyze stock levels."
      />
    </div>
  );
}
