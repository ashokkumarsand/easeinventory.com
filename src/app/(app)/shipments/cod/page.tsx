'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, TextCell } from '@/components/ui/DataTable';
import type { ColDef } from 'ag-grid-community';
import {
  IndianRupee,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CODManagementPage() {
  const [pending, setPending] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCODPending();
  }, []);

  const fetchCODPending = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/cod/pending');
      const data = await res.json();
      setPending(data);
    } catch (err) {
      console.error('Failed to fetch COD data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const columns: ColDef<any>[] = [
    {
      field: 'shipmentNumber',
      headerName: 'Shipment #',
      width: 160,
      cellRenderer: (props: any) => (
        <Link href={`/shipments/${props.data.id}`} className="text-primary font-medium hover:underline">
          {props.value}
        </Link>
      ),
    },
    {
      field: 'awbNumber',
      headerName: 'AWB',
      width: 150,
      cellRenderer: (props: any) => <TextCell value={props.value || '—'} />,
    },
    {
      field: 'order',
      headerName: 'Order',
      width: 150,
      cellRenderer: (props: any) => <TextCell value={props.data.order?.orderNumber || '—'} />,
    },
    {
      field: 'order.shippingName',
      headerName: 'Customer',
      flex: 1,
      cellRenderer: (props: any) => <TextCell value={props.data.order?.shippingName || '—'} />,
    },
    {
      field: 'codAmount',
      headerName: 'COD Amount',
      width: 140,
      cellRenderer: (props: any) => (
        <span className="font-bold text-primary">
          ₹{Number(props.value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      field: 'deliveredAt',
      headerName: 'Delivered On',
      width: 140,
      cellRenderer: (props: any) => (
        <TextCell value={props.value ? new Date(props.value).toLocaleDateString('en-IN') : '—'} />
      ),
    },
    {
      field: 'codCollected',
      headerName: 'Collected',
      width: 110,
      cellRenderer: (props: any) => (
        <Badge variant={props.value ? 'default' : 'outline'}>
          {props.value ? 'Yes' : 'Pending'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <IndianRupee className="w-8 h-8" />
            COD Management
          </h1>
          <p className="text-foreground/50 mt-1">
            Track Cash on Delivery collections and carrier remittances
          </p>
        </div>
        <Button variant="outline" onClick={fetchCODPending}>
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-foreground/60">Total Pending COD</div>
            <div className="text-3xl font-bold text-primary mt-1">
              ₹{(pending?.totalPending || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-foreground/60">Pending Shipments</div>
            <div className="text-3xl font-bold mt-1">
              {pending?.count || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-foreground/60">Average COD Value</div>
            <div className="text-3xl font-bold mt-1">
              ₹{pending?.count > 0
                ? ((pending?.totalPending || 0) / pending.count).toLocaleString('en-IN', { minimumFractionDigits: 0 })
                : '0'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending COD Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pending COD Remittance</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={pending?.shipments || []}
            columns={columns}
            isLoading={isLoading}
            height={500}
            rowHeight={56}
            headerHeight={52}
            emptyMessage="No pending COD remittances"
          />
        </CardContent>
      </Card>
    </div>
  );
}
