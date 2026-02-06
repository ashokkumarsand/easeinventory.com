'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, TextCell, CurrencyCell } from '@/components/ui/DataTable';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ColDef } from 'ag-grid-community';
import { Plus, Search, ClipboardList, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'secondary',
  SENT: 'default',
  PARTIALLY_RECEIVED: 'default',
  RECEIVED: 'default',
  CANCELLED: 'destructive',
  CLOSED: 'outline',
};

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchPurchaseOrders();
  }, [statusFilter]);

  const fetchPurchaseOrders = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchValue) params.set('search', searchValue);

      const res = await fetch(`/api/purchase-orders?${params.toString()}`);
      const data = await res.json();
      setPurchaseOrders(data.purchaseOrders || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch purchase orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    fetchPurchaseOrders();
  };

  const columns: ColDef<any>[] = [
    {
      field: 'poNumber',
      headerName: 'PO #',
      width: 160,
      cellRenderer: (props: any) => (
        <Link href={`/purchase-orders/${props.data.id}`} className="text-primary font-medium hover:underline">
          {props.value}
        </Link>
      ),
    },
    {
      field: 'date',
      headerName: 'Date',
      width: 120,
      cellRenderer: (props: any) => (
        <TextCell value={new Date(props.value).toLocaleDateString('en-IN')} />
      ),
    },
    {
      field: 'supplier',
      headerName: 'Supplier',
      flex: 1,
      cellRenderer: (props: any) => (
        <TextCell value={props.data.supplier?.name || '-'} />
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
      field: 'status',
      headerName: 'Status',
      width: 160,
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
            <ClipboardList className="w-8 h-8" />
            Purchase Orders
          </h1>
          <p className="text-foreground/50 mt-1">
            Manage purchase orders and supplier procurement ({total} total)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchPurchaseOrders}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button onClick={() => router.push('/purchase-orders/new')} size="lg">
            <Plus className="w-4 h-4 mr-2" />
            New PO
          </Button>
        </div>
      </div>

      {/* Status Tabs */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="DRAFT">Draft</TabsTrigger>
          <TabsTrigger value="SENT">Sent</TabsTrigger>
          <TabsTrigger value="PARTIALLY_RECEIVED">Partially Received</TabsTrigger>
          <TabsTrigger value="RECEIVED">Received</TabsTrigger>
          <TabsTrigger value="CANCELLED">Cancelled</TabsTrigger>
          <TabsTrigger value="CLOSED">Closed</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/40" />
          <Input
            placeholder="Search by PO #, supplier name..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={purchaseOrders}
        columns={columns}
        isLoading={isLoading}
        height={600}
        rowHeight={60}
        headerHeight={56}
        onRowClick={(row: any) => router.push(`/purchase-orders/${row.id}`)}
        emptyMessage="No purchase orders found"
      />
    </div>
  );
}
