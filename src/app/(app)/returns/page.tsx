'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, TextCell, CurrencyCell } from '@/components/ui/DataTable';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ColDef } from 'ag-grid-community';
import {
  Plus,
  Search,
  RotateCcw,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const STATUS_COLORS: Record<string, string> = {
  REQUESTED: 'secondary',
  APPROVED: 'default',
  PICKUP_SCHEDULED: 'default',
  IN_TRANSIT: 'default',
  RECEIVED: 'default',
  INSPECTING: 'default',
  INSPECTED: 'default',
  REFUND_INITIATED: 'default',
  REFUNDED: 'default',
  CLOSED: 'outline',
  REJECTED: 'destructive',
};

export default function ReturnsPage() {
  const router = useRouter();
  const [returns, setReturns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchReturns();
  }, [statusFilter]);

  const fetchReturns = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchValue) params.set('search', searchValue);

      const res = await fetch(`/api/returns?${params.toString()}`);
      const data = await res.json();
      setReturns(data.returns || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch returns:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    fetchReturns();
  };

  const columns: ColDef<any>[] = [
    {
      field: 'returnNumber',
      headerName: 'Return #',
      width: 160,
      cellRenderer: (props: any) => (
        <Link href={`/returns/${props.data.id}`} className="text-primary font-medium hover:underline">
          {props.value}
        </Link>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Date',
      width: 120,
      cellRenderer: (props: any) => (
        <TextCell value={new Date(props.value).toLocaleDateString('en-IN')} />
      ),
    },
    {
      field: 'order',
      headerName: 'Order #',
      width: 160,
      cellRenderer: (props: any) => (
        <Link
          href={`/orders/${props.data.orderId}`}
          className="text-primary font-medium hover:underline"
        >
          {props.data.order?.orderNumber || '-'}
        </Link>
      ),
    },
    {
      field: 'customer',
      headerName: 'Customer',
      flex: 1,
      cellRenderer: (props: any) => (
        <TextCell
          value={
            props.data.customer?.name ||
            props.data.order?.shippingName ||
            '-'
          }
        />
      ),
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 140,
      cellRenderer: (props: any) => (
        <Badge variant="outline">
          {props.value?.replace(/_/g, ' ')}
        </Badge>
      ),
    },
    {
      field: 'items',
      headerName: 'Items',
      width: 80,
      cellRenderer: (props: any) => (
        <TextCell value={`${props.value?.length || 0}`} />
      ),
    },
    {
      field: 'refundAmount',
      headerName: 'Refund',
      width: 130,
      cellRenderer: (props: any) =>
        props.value ? <CurrencyCell value={props.value} /> : <TextCell value="-" />,
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
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <RotateCcw className="w-8 h-8" />
            Returns
          </h1>
          <p className="text-foreground/50 mt-1">
            Manage customer returns, RTO, and exchanges ({total} total)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchReturns}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button onClick={() => router.push('/returns/new')} size="lg">
            <Plus className="w-4 h-4 mr-2" />
            New Return
          </Button>
        </div>
      </div>

      {/* Status Tabs */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="REQUESTED">Requested</TabsTrigger>
          <TabsTrigger value="APPROVED">Approved</TabsTrigger>
          <TabsTrigger value="RECEIVED">Received</TabsTrigger>
          <TabsTrigger value="INSPECTED">Inspected</TabsTrigger>
          <TabsTrigger value="REFUNDED">Refunded</TabsTrigger>
          <TabsTrigger value="CLOSED">Closed</TabsTrigger>
          <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/40" />
          <Input
            placeholder="Search by return #, order #, or reason..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={returns}
        columns={columns}
        isLoading={isLoading}
        height={600}
        rowHeight={60}
        headerHeight={56}
        onRowClick={(row: any) => router.push(`/returns/${row.id}`)}
        emptyMessage="No returns found"
      />
    </div>
  );
}
