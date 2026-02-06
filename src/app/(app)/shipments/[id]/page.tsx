'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Download,
  ExternalLink,
  Loader2,
  MapPin,
  Package,
  RefreshCw,
  Truck,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
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

export default function ShipmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const shipmentId = params.id as string;

  const [shipment, setShipment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => {
    fetchShipment();
  }, [shipmentId]);

  const fetchShipment = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/shipments/${shipmentId}`);
      const data = await res.json();
      setShipment(data.shipment);
    } catch (err) {
      console.error('Failed to fetch shipment:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (action: string) => {
    setActionLoading(action);
    try {
      const res = await fetch(`/api/shipments/${shipmentId}/${action}`, { method: 'POST' });
      if (res.ok) {
        fetchShipment();
      } else {
        const err = await res.json();
        alert(err.message || `Failed to ${action}`);
      }
    } catch {
      alert(`Failed to ${action}`);
    } finally {
      setActionLoading('');
    }
  };

  const handleTrackSync = async () => {
    setActionLoading('track');
    try {
      const res = await fetch(`/api/shipments/${shipmentId}/track`);
      if (res.ok) {
        const data = await res.json();
        setShipment(data.shipment);
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to sync tracking');
      }
    } catch {
      alert('Failed to sync tracking');
    } finally {
      setActionLoading('');
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this shipment?')) return;
    setActionLoading('cancel');
    try {
      const res = await fetch(`/api/shipments/${shipmentId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchShipment();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to cancel');
      }
    } catch {
      alert('Failed to cancel');
    } finally {
      setActionLoading('');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="p-6 text-center">
        <p className="text-foreground/50">Shipment not found</p>
        <Button variant="outline" onClick={() => router.push('/shipments')} className="mt-4">
          Back to Shipments
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/shipments')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{shipment.shipmentNumber}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={(STATUS_COLORS[shipment.status] || 'outline') as any}>
                {shipment.status?.replace(/_/g, ' ')}
              </Badge>
              {shipment.awbNumber && (
                <span className="text-foreground/50">AWB: {shipment.awbNumber}</span>
              )}
              {shipment.ndrStatus && (
                <Badge variant="destructive">NDR: {shipment.ndrStatus}</Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={handleTrackSync} disabled={!!actionLoading}>
            {actionLoading === 'track' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Sync Tracking
          </Button>
          {!shipment.awbNumber && (
            <Button onClick={() => handleAction('awb')} disabled={!!actionLoading}>
              Assign AWB
            </Button>
          )}
          {!shipment.labelUrl && shipment.awbNumber && (
            <Button variant="outline" onClick={() => handleAction('label')} disabled={!!actionLoading}>
              <Download className="w-4 h-4 mr-2" /> Generate Label
            </Button>
          )}
          {shipment.labelUrl && (
            <Button variant="outline" asChild>
              <a href={shipment.labelUrl} target="_blank" rel="noopener noreferrer">
                <Download className="w-4 h-4 mr-2" /> Download Label
              </a>
            </Button>
          )}
          {shipment.status === 'CREATED' && (
            <Button onClick={() => handleAction('pickup')} disabled={!!actionLoading}>
              Schedule Pickup
            </Button>
          )}
          {!['DELIVERED', 'CANCELLED', 'RTO_DELIVERED', 'LOST'].includes(shipment.status) && (
            <Button variant="destructive" onClick={handleCancel} disabled={!!actionLoading}>
              <XCircle className="w-4 h-4 mr-2" /> Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tracking Timeline */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Tracking Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {shipment.trackingEvents?.length > 0 ? (
                <div className="space-y-0">
                  {shipment.trackingEvents.map((event: any, idx: number) => (
                    <div key={event.id} className="flex gap-4">
                      {/* Timeline line */}
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${idx === 0 ? 'bg-primary' : 'bg-foreground/20'}`} />
                        {idx < shipment.trackingEvents.length - 1 && (
                          <div className="w-0.5 h-full bg-foreground/10 min-h-[40px]" />
                        )}
                      </div>
                      {/* Event content */}
                      <div className="pb-6">
                        <div className="font-medium">{event.status}</div>
                        {event.description && (
                          <div className="text-sm text-foreground/60">{event.description}</div>
                        )}
                        <div className="flex items-center gap-2 text-xs text-foreground/40 mt-1">
                          {event.city && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {event.city}
                            </span>
                          )}
                          <span>{new Date(event.eventAt).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-foreground/50 text-center py-8">
                  No tracking events yet. Click "Sync Tracking" to fetch latest status.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Info */}
          <Card>
            <CardHeader>
              <CardTitle>Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Link href={`/orders/${shipment.order?.id}`} className="text-primary hover:underline font-medium">
                {shipment.order?.orderNumber || '—'}
              </Link>
              <div><span className="text-foreground/60">Customer:</span> {shipment.order?.customer?.name || '—'}</div>
              <div><span className="text-foreground/60">Items:</span> {shipment.order?.items?.length || 0}</div>
              <div><span className="text-foreground/60">Total:</span> ₹{Number(shipment.order?.total || 0).toLocaleString('en-IN')}</div>
            </CardContent>
          </Card>

          {/* Carrier Info */}
          <Card>
            <CardHeader>
              <CardTitle>Carrier</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div><span className="text-foreground/60">Provider:</span> {shipment.carrierAccount?.provider || '—'}</div>
              <div><span className="text-foreground/60">Courier:</span> {shipment.carrierName || '—'}</div>
              <div><span className="text-foreground/60">AWB:</span> {shipment.awbNumber || 'Pending'}</div>
              {shipment.trackingUrl && (
                <a href={shipment.trackingUrl} target="_blank" rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1">
                  Track on carrier site <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </CardContent>
          </Card>

          {/* Package */}
          <Card>
            <CardHeader>
              <CardTitle>Package</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-foreground/60">Weight</span><span>{shipment.weightGrams || '—'}g</span></div>
              <div className="flex justify-between"><span className="text-foreground/60">Dimensions</span><span>{shipment.lengthCm || '—'}×{shipment.breadthCm || '—'}×{shipment.heightCm || '—'} cm</span></div>
            </CardContent>
          </Card>

          {/* COD Info */}
          {shipment.codAmount && (
            <Card>
              <CardHeader>
                <CardTitle>COD Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-foreground/60">COD Amount</span><span className="font-medium">₹{Number(shipment.codAmount).toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span className="text-foreground/60">Collected</span><Badge variant={shipment.codCollected ? 'default' : 'outline'}>{shipment.codCollected ? 'Yes' : 'No'}</Badge></div>
                {shipment.codRemittedAt && (
                  <div className="flex justify-between"><span className="text-foreground/60">Remitted</span><span>{new Date(shipment.codRemittedAt).toLocaleDateString('en-IN')}</span></div>
                )}
              </CardContent>
            </Card>
          )}

          {/* NDR Info */}
          {shipment.ndrStatus && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">NDR Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div><span className="text-foreground/60">Status:</span> {shipment.ndrStatus}</div>
                <div><span className="text-foreground/60">Reason:</span> {shipment.ndrReason || '—'}</div>
                <div><span className="text-foreground/60">Attempts:</span> {shipment.ndrAttempts}</div>
                {shipment.ndrActionTaken && <div><span className="text-foreground/60">Action:</span> {shipment.ndrActionTaken}</div>}
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-foreground/60">Created</span><span>{new Date(shipment.createdAt).toLocaleString('en-IN')}</span></div>
              {shipment.pickedUpAt && <div className="flex justify-between"><span className="text-foreground/60">Picked Up</span><span>{new Date(shipment.pickedUpAt).toLocaleString('en-IN')}</span></div>}
              {shipment.inTransitAt && <div className="flex justify-between"><span className="text-foreground/60">In Transit</span><span>{new Date(shipment.inTransitAt).toLocaleString('en-IN')}</span></div>}
              {shipment.outForDeliveryAt && <div className="flex justify-between"><span className="text-foreground/60">Out for Delivery</span><span>{new Date(shipment.outForDeliveryAt).toLocaleString('en-IN')}</span></div>}
              {shipment.deliveredAt && <div className="flex justify-between"><span className="text-foreground/60">Delivered</span><span>{new Date(shipment.deliveredAt).toLocaleString('en-IN')}</span></div>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
