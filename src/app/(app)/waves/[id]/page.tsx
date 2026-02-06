'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft,
  Check,
  Loader2,
  Layers,
  Package,
  Play,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'secondary',
  IN_PROGRESS: 'default',
  COMPLETED: 'default',
  CANCELLED: 'destructive',
};

const ORDER_STATUS_COLORS: Record<string, string> = {
  DRAFT: 'secondary',
  CONFIRMED: 'default',
  PROCESSING: 'default',
  SHIPPED: 'default',
  DELIVERED: 'default',
  CANCELLED: 'destructive',
  ON_HOLD: 'outline',
};

export default function WaveDetailPage() {
  const params = useParams();
  const router = useRouter();
  const waveId = params.id as string;

  const [wave, setWave] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => {
    fetchWave();
  }, [waveId]);

  const fetchWave = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/waves/${waveId}`);
      const data = await res.json();
      setWave(data.wave);
    } catch (err) {
      console.error('Failed to fetch wave:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStart = async () => {
    setActionLoading('start');
    try {
      const res = await fetch(`/api/waves/${waveId}/start`, { method: 'POST' });
      if (res.ok) {
        fetchWave();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to start wave');
      }
    } catch {
      alert('Failed to start wave');
    } finally {
      setActionLoading('');
    }
  };

  const handleComplete = async () => {
    setActionLoading('complete');
    try {
      const res = await fetch(`/api/waves/${waveId}/complete`, {
        method: 'POST',
      });
      if (res.ok) {
        fetchWave();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to complete wave');
      }
    } catch {
      alert('Failed to complete wave');
    } finally {
      setActionLoading('');
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this wave?')) return;
    setActionLoading('cancel');
    try {
      const res = await fetch(`/api/waves/${waveId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchWave();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to cancel wave');
      }
    } catch {
      alert('Failed to cancel wave');
    } finally {
      setActionLoading('');
    }
  };

  const computeTotalValue = (): number => {
    if (!wave?.orders || wave.orders.length === 0) return 0;
    return wave.orders.reduce(
      (sum: number, wo: any) => sum + Number(wo.order?.total || 0),
      0
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!wave) {
    return (
      <div className="p-6 text-center">
        <p className="text-foreground/50">Wave not found</p>
        <Button
          variant="outline"
          onClick={() => router.push('/waves')}
          className="mt-4"
        >
          Back to Waves
        </Button>
      </div>
    );
  }

  const totalValue = computeTotalValue();
  const orderCount = wave.orders?.length || 0;
  const sortedOrders = [...(wave.orders || [])].sort(
    (a: any, b: any) => (a.sequence || 0) - (b.sequence || 0)
  );

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/waves')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              {wave.waveNumber}
              {wave.name && (
                <span className="text-foreground/60 font-normal text-xl">
                  - {wave.name}
                </span>
              )}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant={(STATUS_COLORS[wave.status] || 'outline') as any}
              >
                {wave.status?.replace(/_/g, ' ')}
              </Badge>
              {wave.carrierZone && (
                <span className="text-foreground/50 text-sm">
                  Zone: {wave.carrierZone}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          {wave.status === 'DRAFT' && (
            <>
              <Button onClick={handleStart} disabled={!!actionLoading}>
                {actionLoading === 'start' ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                Start Wave
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={!!actionLoading}
              >
                {actionLoading === 'cancel' ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <X className="w-4 h-4 mr-2" />
                )}
                Cancel
              </Button>
            </>
          )}
          {wave.status === 'IN_PROGRESS' && (
            <>
              <Button onClick={handleComplete} disabled={!!actionLoading}>
                {actionLoading === 'complete' ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Complete Wave
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={!!actionLoading}
              >
                {actionLoading === 'cancel' ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <X className="w-4 h-4 mr-2" />
                )}
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Orders List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Orders ({orderCount})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sortedOrders.length === 0 ? (
                <div className="text-center py-8 text-foreground/50">
                  No orders assigned to this wave
                </div>
              ) : (
                <div className="border rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-3 text-left w-16">#</th>
                        <th className="px-4 py-3 text-left">Order</th>
                        <th className="px-4 py-3 text-left">Customer</th>
                        <th className="px-4 py-3 text-left">Location</th>
                        <th className="px-4 py-3 text-right">Amount</th>
                        <th className="px-4 py-3 text-center">Status</th>
                        <th className="px-4 py-3 text-left">Shipment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedOrders.map((wo: any) => {
                        const order = wo.order;
                        if (!order) return null;
                        const shipment = order.shipments?.[0];

                        return (
                          <tr key={wo.id} className="border-t">
                            <td className="px-4 py-3 text-foreground/50">
                              {wo.sequence || '-'}
                            </td>
                            <td className="px-4 py-3">
                              <Link
                                href={`/orders/${order.id}`}
                                className="text-primary font-medium hover:underline"
                              >
                                {order.orderNumber}
                              </Link>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-medium">
                                {order.customer?.name || order.shippingName}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-foreground/60">
                              <div>
                                {order.shippingCity}
                                {order.shippingPincode &&
                                  ` - ${order.shippingPincode}`}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right font-medium">
                              {'\u20B9'}
                              {Number(order.total || 0).toLocaleString(
                                'en-IN',
                                { minimumFractionDigits: 2 }
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Badge
                                variant={
                                  (ORDER_STATUS_COLORS[order.status] ||
                                    'outline') as any
                                }
                              >
                                {order.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              {shipment ? (
                                <div className="text-xs space-y-0.5">
                                  <div className="font-medium">
                                    {shipment.awbNumber || 'AWB Pending'}
                                  </div>
                                  <div className="text-foreground/50">
                                    {shipment.carrierName || '-'}
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] px-1.5 py-0"
                                  >
                                    {shipment.status?.replace(/_/g, ' ')}
                                  </Badge>
                                </div>
                              ) : (
                                <span className="text-foreground/30 text-xs">
                                  No shipment
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Wave Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Wave Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground/60">Wave Number</span>
                <span className="font-medium">{wave.waveNumber}</span>
              </div>
              {wave.name && (
                <div className="flex justify-between">
                  <span className="text-foreground/60">Name</span>
                  <span className="font-medium">{wave.name}</span>
                </div>
              )}
              {wave.carrierZone && (
                <div className="flex justify-between">
                  <span className="text-foreground/60">Carrier Zone</span>
                  <span className="font-medium">{wave.carrierZone}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-foreground/60">Created</span>
                <span>
                  {new Date(wave.createdAt).toLocaleString('en-IN')}
                </span>
              </div>
              {wave.startedAt && (
                <div className="flex justify-between">
                  <span className="text-foreground/60">Started</span>
                  <span>
                    {new Date(wave.startedAt).toLocaleString('en-IN')}
                  </span>
                </div>
              )}
              {wave.completedAt && (
                <div className="flex justify-between">
                  <span className="text-foreground/60">Completed</span>
                  <span>
                    {new Date(wave.completedAt).toLocaleString('en-IN')}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground/60">Total Orders</span>
                <span className="font-bold text-base">{orderCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/60">Total Value</span>
                <span className="font-bold text-base">
                  {totalValue > 0
                    ? `\u20B9${totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                    : '\u2014'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
