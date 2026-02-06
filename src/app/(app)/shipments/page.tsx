'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, TextCell } from '@/components/ui/DataTable';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ColDef } from 'ag-grid-community';
import {
  RefreshCw,
  Search,
  Truck,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const STATUS_COLORS: Record<string, string> = {
  CREATED: 'outline',
  PICKUP_SCHEDULED: 'secondary',
  PICKED_UP: 'default',
  IN_TRANSIT: 'default',
  OUT_FOR_DELIVERY: 'default',
  DELIVERED: 'default',
  RTO_INITIATED: 'destructive',
  RTO_DELIVERED: 'destructive',
  CANCELLED: 'destructive',
  LOST: 'destructive',
};

export default function ShipmentsPage() {
  const router = useRouter();
  const [shipments, setShipments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchShipments();
  }, [statusFilter]);

  const fetchShipments = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchValue) params.set('search', searchValue);

      const res = await fetch(`/api/shipments?${params.toString()}`);
      const data = await res.json();
      setShipments(data.shipments || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch shipments:', err);
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
      field: 'order',
      headerName: 'Order',
      width: 150,
      cellRenderer: (props: any) => (
        <TextCell value={props.data.order?.orderNumber || '—'} />
      ),
    },
    {
      field: 'awbNumber',
      headerName: 'AWB',
      width: 140,
      cellRenderer: (props: any) => (
        <TextCell value={props.value || 'Pending'} />
      ),
    },
    {
      field: 'carrierAccount',
      headerName: 'Carrier',
      width: 140,
      cellRenderer: (props: any) => (
        <TextCell value={props.data.carrierName || props.data.carrierAccount?.name || '—'} />
      ),
    },
    {
      field: 'order.shippingName',
      headerName: 'Customer',
      flex: 1,
      cellRenderer: (props: any) => (
        <TextCell value={props.data.order?.shippingName || '—'} />
      ),
    },
    {
      field: 'order.shippingCity',
      headerName: 'City',
      width: 120,
      cellRenderer: (props: any) => (
        <TextCell value={props.data.order?.shippingCity || '—'} />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      cellRenderer: (props: any) => (
        <Badge variant={(STATUS_COLORS[props.value] || 'outline') as any}>
          {props.value?.replace(/_/g, ' ')}
        </Badge>
      ),
    },
    {
      field: 'codAmount',
      headerName: 'COD',
      width: 100,
      cellRenderer: (props: any) =>
        props.value ? (
          <span className="font-medium">₹{Number(props.value).toLocaleString('en-IN')}</span>
        ) : (
          <TextCell value="—" />
        ),
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 120,
      cellRenderer: (props: any) => (
        <TextCell value={new Date(props.value).toLocaleDateString('en-IN')} />
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Truck className="w-8 h-8" />
            Shipments
          </h1>
          <p className="text-foreground/50 mt-1">
            Track all shipments and carrier status ({total} total)
          </p>
        </div>
        <Button variant="outline" onClick={fetchShipments}>
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* Status Tabs */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="CREATED">Created</TabsTrigger>
          <TabsTrigger value="PICKUP_SCHEDULED">Pickup Scheduled</TabsTrigger>
          <TabsTrigger value="IN_TRANSIT">In Transit</TabsTrigger>
          <TabsTrigger value="OUT_FOR_DELIVERY">Out for Delivery</TabsTrigger>
          <TabsTrigger value="DELIVERED">Delivered</TabsTrigger>
          <TabsTrigger value="RTO_INITIATED">RTO</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/40" />
          <Input
            placeholder="Search by shipment #, AWB, or order #..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchShipments()}
            className="pl-10"
          />
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={shipments}
        columns={columns}
        isLoading={isLoading}
        height={600}
        rowHeight={60}
        headerHeight={56}
        onRowClick={(row: any) => router.push(`/shipments/${row.id}`)}
        emptyMessage="No shipments found"
      />
    </div>
  );
}
