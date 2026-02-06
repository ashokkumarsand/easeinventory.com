'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, TextCell, CurrencyCell } from '@/components/ui/DataTable';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ColDef } from 'ag-grid-community';
import { Plus, Search, PackageCheck, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'secondary',
  IN_PROGRESS: 'default',
  COMPLETED: 'default',
  CANCELLED: 'destructive',
};

export default function GoodsReceiptsPage() {
  const router = useRouter();
  const [goodsReceipts, setGoodsReceipts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchGoodsReceipts();
  }, [statusFilter]);

  const fetchGoodsReceipts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchValue) params.set('search', searchValue);

      const res = await fetch(`/api/goods-receipts?${params.toString()}`);
      const data = await res.json();
      setGoodsReceipts(data.goodsReceipts || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch goods receipts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    fetchGoodsReceipts();
  };

  const columns: ColDef<any>[] = [
    {
      field: 'grnNumber',
      headerName: 'GRN #',
      width: 160,
      cellRenderer: (props: any) => (
        <Link href={`/goods-receipts/${props.data.id}`} className="text-primary font-medium hover:underline">
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
      field: 'supplier',
      headerName: 'Supplier',
      flex: 1,
      cellRenderer: (props: any) => (
        <TextCell value={props.data.supplier?.name || '-'} />
      ),
    },
    {
      field: 'po',
      headerName: 'PO #',
      width: 160,
      cellRenderer: (props: any) => {
        const po = props.data.po;
        if (po) {
          return (
            <Link href={`/purchase-orders/${po.id}`} className="text-primary font-medium hover:underline">
              {po.poNumber}
            </Link>
          );
        }
        return <TextCell value="-" />;
      },
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
            <PackageCheck className="w-8 h-8" />
            Goods Receipts
          </h1>
          <p className="text-foreground/50 mt-1">
            Manage goods receipt notes and incoming stock ({total} total)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchGoodsReceipts}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button onClick={() => router.push('/goods-receipts/new')} size="lg">
            <Plus className="w-4 h-4 mr-2" />
            New GRN
          </Button>
        </div>
      </div>

      {/* Status Tabs */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="PENDING">Pending</TabsTrigger>
          <TabsTrigger value="IN_PROGRESS">In Progress</TabsTrigger>
          <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
          <TabsTrigger value="CANCELLED">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/40" />
          <Input
            placeholder="Search by GRN #, supplier name..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={goodsReceipts}
        columns={columns}
        isLoading={isLoading}
        height={600}
        rowHeight={60}
        headerHeight={56}
        onRowClick={(row: any) => router.push(`/goods-receipts/${row.id}`)}
        emptyMessage="No goods receipts found"
      />
    </div>
  );
}
