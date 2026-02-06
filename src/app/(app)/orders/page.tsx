'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, TextCell, CurrencyCell } from '@/components/ui/DataTable';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDisclosure } from '@/hooks/useDisclosure';
import type { ColDef } from 'ag-grid-community';
import {
  Plus,
  Search,
  ShoppingCart,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'secondary',
  CONFIRMED: 'default',
  PROCESSING: 'default',
  SHIPPED: 'default',
  DELIVERED: 'default',
  CANCELLED: 'destructive',
  ON_HOLD: 'outline',
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchValue) params.set('search', searchValue);

      const res = await fetch(`/api/orders?${params.toString()}`);
      const data = await res.json();
      setOrders(data.orders || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    fetchOrders();
  };

  const columns: ColDef<any>[] = [
    {
      field: 'orderNumber',
      headerName: 'Order #',
      width: 160,
      cellRenderer: (props: any) => (
        <Link href={`/orders/${props.data.id}`} className="text-primary font-medium hover:underline">
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
      field: 'customer',
      headerName: 'Customer',
      flex: 1,
      cellRenderer: (props: any) => (
        <TextCell value={props.data.customer?.name || props.data.shippingName} />
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
      field: 'total',
      headerName: 'Total',
      width: 130,
      cellRenderer: (props: any) => <CurrencyCell value={props.value} />,
    },
    {
      field: 'paymentStatus',
      headerName: 'Payment',
      width: 110,
      cellRenderer: (props: any) => (
        <Badge variant={props.value === 'PAID' ? 'default' : 'outline'}>
          {props.value}
        </Badge>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      cellRenderer: (props: any) => (
        <Badge variant={(STATUS_COLORS[props.value] || 'outline') as any}>
          {props.value}
        </Badge>
      ),
    },
    {
      field: 'fulfillmentStatus',
      headerName: 'Fulfillment',
      width: 150,
      cellRenderer: (props: any) => (
        <Badge variant={props.value === 'FULFILLED' ? 'default' : 'outline'}>
          {props.value?.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      field: 'isCOD',
      headerName: 'COD',
      width: 70,
      cellRenderer: (props: any) => (
        <TextCell value={props.value ? 'Yes' : 'No'} />
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-8 h-8" />
            Orders
          </h1>
          <p className="text-foreground/50 mt-1">
            Manage sales orders, fulfillment, and shipping ({total} total)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchOrders}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button onClick={() => router.push('/orders/new')} size="lg">
            <Plus className="w-4 h-4 mr-2" />
            New Order
          </Button>
        </div>
      </div>

      {/* Status Tabs */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="DRAFT">Draft</TabsTrigger>
          <TabsTrigger value="CONFIRMED">Confirmed</TabsTrigger>
          <TabsTrigger value="PROCESSING">Processing</TabsTrigger>
          <TabsTrigger value="SHIPPED">Shipped</TabsTrigger>
          <TabsTrigger value="DELIVERED">Delivered</TabsTrigger>
          <TabsTrigger value="CANCELLED">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/40" />
          <Input
            placeholder="Search by order #, customer name, or phone..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={orders}
        columns={columns}
        isLoading={isLoading}
        height={600}
        rowHeight={60}
        headerHeight={56}
        onRowClick={(row: any) => router.push(`/orders/${row.id}`)}
        emptyMessage="No orders found"
      />
    </div>
  );
}
