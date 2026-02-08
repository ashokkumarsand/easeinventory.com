'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { ABCXYZMatrix } from './ABCXYZMatrix';
import { ClassificationStrategyCard } from './ClassificationStrategyCard';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Grid3X3, AlertCircle, X } from 'lucide-react';
import { ColDef } from 'ag-grid-community';

interface ClassifiedProduct {
  id: string;
  name: string;
  sku: string | null;
  quantity: number;
  costPrice: number;
  salePrice: number;
  abcClass: string | null;
  xyzClass: string | null;
  category: { name: string } | null;
}

const ABC_VARIANTS: Record<string, 'default' | 'secondary' | 'outline'> = {
  A: 'default',
  B: 'secondary',
  C: 'outline',
};

export function ClassificationTable() {
  const [data, setData] = useState<ClassifiedProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [matrix, setMatrix] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState<{ abc: string; xyz: string } | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('pageSize', '100');
      if (selectedCombo) {
        params.set('abcClass', selectedCombo.abc);
        params.set('xyzClass', selectedCombo.xyz);
      }

      const res = await fetch(`/api/analytics/abc-xyz?${params}`);
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const json = await res.json();
      setData(json.data || []);
      setTotal(json.total || 0);
      if (json.matrix) setMatrix(json.matrix);
    } catch (err) {
      console.error('Failed to fetch classification data:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCombo]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleClassify = async () => {
    setIsClassifying(true);
    try {
      await fetch('/api/analytics/abc-xyz', { method: 'POST' });
      setSelectedCombo(null);
      await fetchData();
    } finally {
      setIsClassifying(false);
    }
  };

  const handleCellClick = (abc: string, xyz: string) => {
    if (selectedCombo?.abc === abc && selectedCombo?.xyz === xyz) {
      setSelectedCombo(null);
    } else {
      setSelectedCombo({ abc, xyz });
    }
  };

  const columns: ColDef<ClassifiedProduct>[] = [
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
      headerName: 'Category',
      width: 130,
      cellRenderer: (params: any) => (
        <span className="text-sm text-muted-foreground">{params.data.category?.name || '—'}</span>
      ),
    },
    {
      headerName: 'ABC',
      field: 'abcClass',
      width: 80,
      cellRenderer: (params: any) => params.value ? (
        <Badge variant={ABC_VARIANTS[params.value] || 'outline'}>{params.value}</Badge>
      ) : <span className="text-muted-foreground">—</span>,
    },
    {
      headerName: 'XYZ',
      field: 'xyzClass',
      width: 80,
      cellRenderer: (params: any) => params.value ? (
        <Badge variant="outline">{params.value}</Badge>
      ) : <span className="text-muted-foreground">—</span>,
    },
    {
      headerName: 'Stock',
      field: 'quantity',
      width: 90,
      cellRenderer: (params: any) => <span className="font-mono text-sm">{params.value}</span>,
    },
    {
      headerName: 'Cost Price',
      field: 'costPrice',
      width: 110,
      cellRenderer: (params: any) => (
        <span className="font-mono text-sm">
          {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(params.value))}
        </span>
      ),
    },
    {
      headerName: 'Stock Value',
      width: 130,
      cellRenderer: (params: any) => (
        <span className="font-mono text-sm font-semibold">
          {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(params.data.quantity * Number(params.data.costPrice))}
        </span>
      ),
    },
  ];

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <AlertCircle className="w-10 h-10 mb-3 text-destructive opacity-70" />
          <p className="font-medium text-foreground">Failed to load classification data</p>
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
      <div className="flex items-center justify-between">
        <div>
          {selectedCombo && (
            <Badge variant="secondary" className="gap-1">
              Filtered: {selectedCombo.abc}{selectedCombo.xyz}
              <button onClick={() => setSelectedCombo(null)} className="ml-1 hover:text-destructive" aria-label="Close"><X className="w-4 h-4" /></button>
            </Badge>
          )}
        </div>
        <Button onClick={handleClassify} disabled={isClassifying}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isClassifying ? 'animate-spin' : ''}`} />
          {isClassifying ? 'Classifying...' : 'Run Classification'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ABCXYZMatrix matrix={matrix} onCellClick={handleCellClick} />
        {selectedCombo ? (
          <ClassificationStrategyCard abc={selectedCombo.abc} xyz={selectedCombo.xyz} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Strategy Recommendation</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-8">
              <p className="text-sm text-muted-foreground">Click a cell in the matrix to see the recommended strategy</p>
            </CardContent>
          </Card>
        )}
      </div>

      <DataTable
        data={data}
        columns={columns}
        isLoading={isLoading}
        height={400}
        emptyMessage="No classified products. Click 'Run Classification' to analyze your inventory."
      />
    </div>
  );
}
