'use client';

import React, { useEffect, useState } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, AlertTriangle, Clock, RefreshCw, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ColDef } from 'ag-grid-community';

interface ExpiringLot {
  id: string;
  lotNumber: string;
  quantity: number;
  costPrice: number;
  expiryDate: string;
  daysUntilExpiry: number;
  urgency: 'EXPIRED' | 'CRITICAL' | 'WARNING' | 'NOTICE';
  product: { id: string; name: string; sku: string | null };
}

interface ExpiryAlerts {
  critical: { count: number; lots: ExpiringLot[] };
  warning: { count: number; lots: ExpiringLot[] };
  notice: { count: number; lots: ExpiringLot[] };
  totalAlerts: number;
}

interface WasteMetrics {
  expiredLotCount: number;
  expiredQuantity: number;
  expiredValue: number;
  wasteRate: number;
}

const URGENCY_BADGE: Record<string, 'destructive' | 'default' | 'secondary' | 'outline'> = {
  EXPIRED: 'destructive',
  CRITICAL: 'destructive',
  WARNING: 'default',
  NOTICE: 'secondary',
};

export function ExpiringLotsTable() {
  const [alerts, setAlerts] = useState<ExpiryAlerts | null>(null);
  const [waste, setWaste] = useState<WasteMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [alertsRes, wasteRes] = await Promise.all([
        fetch('/api/analytics/expiring-lots'),
        fetch('/api/analytics/waste'),
      ]);
      if (alertsRes.ok) setAlerts(await alertsRes.json());
      if (wasteRes.ok) setWaste(await wasteRes.json());
    } catch (err) {
      console.error('Failed to fetch perishable data:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const allLots = alerts
    ? [...alerts.critical.lots, ...alerts.warning.lots, ...alerts.notice.lots]
    : [];

  const columns: ColDef<ExpiringLot>[] = [
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
      headerName: 'Lot #',
      field: 'lotNumber',
      width: 120,
      cellRenderer: (params: any) => <span className="font-mono text-sm">{params.value}</span>,
    },
    {
      headerName: 'Qty',
      field: 'quantity',
      width: 80,
      cellRenderer: (params: any) => <span className="font-mono text-sm">{params.value}</span>,
    },
    {
      headerName: 'Expiry Date',
      field: 'expiryDate',
      width: 130,
      cellRenderer: (params: any) => (
        <span className="text-sm">
          {new Date(params.value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      ),
    },
    {
      headerName: 'Days Left',
      field: 'daysUntilExpiry',
      width: 110,
      cellRenderer: (params: any) => (
        <span className={`font-mono text-sm font-bold ${params.value <= 0 ? 'text-destructive' : params.value <= 7 ? 'text-red-500' : params.value <= 30 ? 'text-amber-500' : ''}`}>
          {params.value <= 0 ? 'EXPIRED' : `${params.value}d`}
        </span>
      ),
    },
    {
      headerName: 'Urgency',
      field: 'urgency',
      width: 110,
      cellRenderer: (params: any) => (
        <Badge variant={URGENCY_BADGE[params.value] || 'outline'} className="text-[10px]">
          {params.value}
        </Badge>
      ),
    },
    {
      headerName: 'Value',
      width: 120,
      cellRenderer: (params: any) => (
        <span className="font-mono text-sm">
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
          <p className="font-medium text-foreground">Failed to load expiring lots</p>
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" aria-label="Critical or expired lots" />
              <div>
                <p className="text-xs text-muted-foreground">Critical/Expired</p>
                <p className="text-2xl font-black text-destructive">{alerts?.critical.count ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" aria-label="Warning: expiring within 30 days" />
              <div>
                <p className="text-xs text-muted-foreground">Warning (≤30d)</p>
                <p className="text-2xl font-black text-amber-500">{alerts?.warning.count ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" aria-label="Notice: expiring within 90 days" />
              <div>
                <p className="text-xs text-muted-foreground">Notice (≤90d)</p>
                <p className="text-2xl font-black">{alerts?.notice.count ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div>
              <p className="text-xs text-muted-foreground">Waste Rate</p>
              <p className="text-2xl font-black">
                {waste ? `${(waste.wasteRate * 100).toFixed(1)}%` : '—'}
              </p>
              {waste && (
                <p className="text-xs text-muted-foreground">
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(waste.expiredValue)} expired
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <DataTable
        data={allLots}
        columns={columns}
        isLoading={isLoading}
        height={450}
        emptyMessage="No expiring lots found. Products with expiry dates will appear here."
      />
    </div>
  );
}
