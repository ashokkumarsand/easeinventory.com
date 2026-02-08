'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Layers, Loader2, Search, Plus } from 'lucide-react';
import Link from 'next/link';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  customer: { name: string } | null;
  total: number;
  itemCount: number;
  createdAt: string;
}

export default function NewWavePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [carrierZone, setCarrierZone] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Fetch confirmed/processing orders that can be waved
      const res = await fetch('/api/orders?status=CONFIRMED&pageSize=100');
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (e) {
      console.error('Failed to fetch orders:', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleOrder = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredOrders.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredOrders.map(o => o.id)));
    }
  };

  const handleCreate = async () => {
    if (selectedIds.size === 0) return;
    setCreating(true);
    try {
      const res = await fetch('/api/waves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderIds: Array.from(selectedIds),
          name: name || undefined,
          carrierZone: carrierZone || undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/waves/${data.wave?.id || ''}`);
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to create wave');
      }
    } catch (e) {
      console.error('Failed to create wave:', e);
      alert('Failed to create wave');
    } finally {
      setCreating(false);
    }
  };

  const filteredOrders = orders.filter(o =>
    !search ||
    o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
    o.customer?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/waves">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Layers className="w-6 h-6" />
            Create New Wave
          </h1>
          <p className="text-sm text-muted-foreground">Select orders to include in this fulfillment wave</p>
        </div>
      </div>

      {/* Wave Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Wave Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Wave Name (optional)</Label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Morning Batch, Zone A"
              />
            </div>
            <div className="space-y-2">
              <Label>Carrier Zone (optional)</Label>
              <Input
                value={carrierZone}
                onChange={e => setCarrierZone(e.target.value)}
                placeholder="e.g. North, South, Metro"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Selection */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              Select Orders ({selectedIds.size} selected)
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Loading orders...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <p>No confirmed orders available for wave planning</p>
              <Link href="/orders/new" className="mt-2">
                <Button variant="outline" size="sm">Create Order</Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedIds.size === filteredOrders.length && filteredOrders.length > 0}
                      onCheckedChange={toggleAll}
                    />
                  </TableHead>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-center">Items</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map(order => (
                  <TableRow
                    key={order.id}
                    className={selectedIds.has(order.id) ? 'bg-primary/5' : 'cursor-pointer'}
                    onClick={() => toggleOrder(order.id)}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(order.id)}
                        onCheckedChange={() => toggleOrder(order.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{order.customer?.name || '—'}</TableCell>
                    <TableCell className="text-center">{order.itemCount}</TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(order.total)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-xs">{order.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Button */}
      <div className="flex justify-end gap-3">
        <Link href="/waves">
          <Button variant="outline">Cancel</Button>
        </Link>
        <Button
          onClick={handleCreate}
          disabled={selectedIds.size === 0 || creating}
          size="lg"
        >
          {creating ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Plus className="w-4 h-4 mr-2" />
          )}
          Create Wave ({selectedIds.size} orders)
        </Button>
      </div>
    </div>
  );
}
