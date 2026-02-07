'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Loader2, RefreshCw, Search, Settings2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'secondary',
  IN_PROGRESS: 'default',
  COMPLETED: 'default',
  CANCELLED: 'destructive',
};

export default function AssemblyOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchValue) params.set('search', searchValue);

      const res = await fetch(`/api/assembly-orders?${params.toString()}`);
      const data = await res.json();
      setOrders(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch assembly orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    fetchOrders();
  };

  const handleComplete = async (orderId: string) => {
    if (!confirm('Complete this assembly order? Stock will be updated.')) return;
    setActionLoading(orderId);
    try {
      const res = await fetch(`/api/assembly-orders/${orderId}/complete`, {
        method: 'POST',
      });
      if (res.ok) {
        fetchOrders();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to complete');
      }
    } catch {
      alert('Failed to complete order');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (orderId: string) => {
    if (!confirm('Cancel this assembly order?')) return;
    setActionLoading(orderId);
    try {
      const res = await fetch(`/api/assembly-orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });
      if (res.ok) {
        fetchOrders();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to cancel');
      }
    } catch {
      alert('Failed to cancel order');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/bom')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Settings2 className="w-8 h-8" />
              Assembly Orders
            </h1>
            <p className="text-foreground/50 mt-1">
              Manage assembly and disassembly operations &middot; {total} orders
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={fetchOrders}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Status Tabs */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="DRAFT">Draft</TabsTrigger>
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
            placeholder="Search by assembly number or product..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
      </div>

      {/* Orders */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Settings2 className="w-12 h-12 text-foreground/20 mb-4" />
          <p className="text-foreground/50 text-lg">No assembly orders found</p>
          <p className="text-foreground/30 text-sm mt-1">
            Create assembly orders from a BOM detail page
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order: any) => (
            <Card key={order.id} className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{order.assemblyNumber}</CardTitle>
                    <p className="text-sm text-foreground/60 mt-0.5">
                      {order.bom?.product?.name}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Badge variant={order.type === 'ASSEMBLY' ? 'default' : 'secondary'}>
                      {order.type}
                    </Badge>
                    <Badge
                      variant={(STATUS_COLORS[order.status] || 'outline') as any}
                    >
                      {order.status?.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/60">Quantity</span>
                  <span className="font-medium">{order.quantity}</span>
                </div>
                {order.location && (
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/60">Location</span>
                    <span className="font-medium">
                      {order.location.name} {order.location.code ? `(${order.location.code})` : ''}
                    </span>
                  </div>
                )}
                <div className="text-xs text-foreground/40 pt-1">
                  Created{' '}
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </div>

                {/* Actions */}
                {(order.status === 'DRAFT' || order.status === 'IN_PROGRESS') && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => handleComplete(order.id)}
                      disabled={actionLoading === order.id}
                    >
                      {actionLoading === order.id ? (
                        <Loader2 className="w-3 h-3 animate-spin mr-1" />
                      ) : null}
                      Complete
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancel(order.id)}
                      disabled={actionLoading === order.id}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
