'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { StyledSelect } from '@/components/ui/FormField';
import { Separator } from '@/components/ui/separator';
import { useDisclosure } from '@/hooks/useDisclosure';
import {
  ArrowLeft,
  Check,
  CheckCircle,
  ClipboardList,
  Loader2,
  Package,
  PackageCheck,
  Send,
  Truck,
  X,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
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

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [carriers, setCarriers] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);

  // Ship dialog
  const shipDialog = useDisclosure();
  const [selectedCarrier, setSelectedCarrier] = useState('');

  // Pick dialog
  const pickDialog = useDisclosure();
  const [selectedLocation, setSelectedLocation] = useState('');

  useEffect(() => {
    fetchOrder();
    fetchCarriers();
    fetchLocations();
  }, [orderId]);

  const fetchOrder = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      setOrder(data.order);
    } catch (err) {
      console.error('Failed to fetch order:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCarriers = async () => {
    try {
      const res = await fetch('/api/carriers');
      const data = await res.json();
      setCarriers(data.carriers || []);
    } catch {}
  };

  const fetchLocations = async () => {
    try {
      const res = await fetch('/api/inventory/locations');
      const data = await res.json();
      setLocations(data.locations || []);
    } catch {}
  };

  const handleAction = async (action: string, body?: any) => {
    setActionLoading(action);
    try {
      const res = await fetch(`/api/orders/${orderId}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (res.ok) {
        fetchOrder();
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

  const handleShip = async () => {
    if (!selectedCarrier) {
      alert('Please select a carrier');
      return;
    }
    setActionLoading('ship');
    try {
      const res = await fetch('/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          carrierAccountId: selectedCarrier,
        }),
      });
      if (res.ok) {
        shipDialog.onClose();
        fetchOrder();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to create shipment');
      }
    } catch {
      alert('Failed to create shipment');
    } finally {
      setActionLoading('');
    }
  };

  const handlePick = async () => {
    if (!selectedLocation) {
      alert('Please select a warehouse location');
      return;
    }
    await handleAction('pick', { locationId: selectedLocation });
    pickDialog.onClose();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6 text-center">
        <p className="text-foreground/50">Order not found</p>
        <Button variant="outline" onClick={() => router.push('/orders')} className="mt-4">
          Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/orders')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{order.orderNumber}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={(STATUS_COLORS[order.status] || 'outline') as any}>
                {order.status}
              </Badge>
              <Badge variant={order.fulfillmentStatus === 'FULFILLED' ? 'default' : 'outline'}>
                {order.fulfillmentStatus?.replace('_', ' ')}
              </Badge>
              {order.isCOD && <Badge variant="outline">COD</Badge>}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          {order.status === 'DRAFT' && (
            <>
              <Button onClick={() => handleAction('confirm')} disabled={!!actionLoading}>
                {actionLoading === 'confirm' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
                Confirm Order
              </Button>
              <Button variant="destructive" onClick={() => handleAction('cancel')} disabled={!!actionLoading}>
                <X className="w-4 h-4 mr-1" /> Cancel
              </Button>
            </>
          )}
          {order.status === 'CONFIRMED' && (
            <>
              <Button variant="outline" onClick={pickDialog.onOpen} disabled={!!actionLoading}>
                <ClipboardList className="w-4 h-4 mr-1" /> Generate Pick List
              </Button>
              <Button onClick={shipDialog.onOpen} disabled={!!actionLoading}>
                <Truck className="w-4 h-4 mr-1" /> Ship Order
              </Button>
            </>
          )}
          {order.status === 'PROCESSING' && (
            <>
              <Button variant="outline" onClick={() => handleAction('pack')} disabled={!!actionLoading}>
                <PackageCheck className="w-4 h-4 mr-1" /> Mark Packed
              </Button>
              <Button onClick={shipDialog.onOpen} disabled={!!actionLoading}>
                <Truck className="w-4 h-4 mr-1" /> Ship Order
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>Items ({order.items?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-3 text-left">Product</th>
                      <th className="px-4 py-3 text-right">Qty</th>
                      <th className="px-4 py-3 text-right">Price</th>
                      <th className="px-4 py-3 text-right">Tax</th>
                      <th className="px-4 py-3 text-right">Total</th>
                      <th className="px-4 py-3 text-center">Fulfillment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map((item: any) => (
                      <tr key={item.id} className="border-t">
                        <td className="px-4 py-3">
                          <div className="font-medium">{item.productName}</div>
                          {item.sku && <div className="text-foreground/50 text-xs">{item.sku}</div>}
                        </td>
                        <td className="px-4 py-3 text-right">{item.quantity}</td>
                        <td className="px-4 py-3 text-right">₹{Number(item.unitPrice).toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 text-right">{Number(item.taxRate)}%</td>
                        <td className="px-4 py-3 text-right font-medium">
                          ₹{Number(item.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-center text-xs">
                          <div>Picked: {item.pickedQty}/{item.quantity}</div>
                          <div>Packed: {item.packedQty}/{item.quantity}</div>
                          <div>Shipped: {item.shippedQty}/{item.quantity}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end mt-4">
                <div className="w-64 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-foreground/60">Subtotal</span><span>₹{Number(order.subtotal).toLocaleString('en-IN')}</span></div>
                  {Number(order.discount) > 0 && (
                    <div className="flex justify-between"><span className="text-foreground/60">Discount</span><span>-₹{Number(order.discount).toLocaleString('en-IN')}</span></div>
                  )}
                  <div className="flex justify-between"><span className="text-foreground/60">Tax</span><span>₹{Number(order.taxAmount).toLocaleString('en-IN')}</span></div>
                  <Separator />
                  <div className="flex justify-between font-bold text-base"><span>Total</span><span>₹{Number(order.total).toLocaleString('en-IN')}</span></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pick Lists */}
          {order.pickLists?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Pick Lists</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.pickLists.map((pl: any) => (
                  <div key={pl.id} className="border rounded-xl p-4 flex justify-between items-center">
                    <div>
                      <div className="font-medium">{pl.pickNumber}</div>
                      <div className="text-sm text-foreground/50">
                        {pl.assignedTo?.name || 'Unassigned'} | {pl.items?.length} items
                      </div>
                    </div>
                    <Badge variant={pl.status === 'COMPLETED' ? 'default' : 'outline'}>
                      {pl.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Shipments */}
          {order.shipments?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Shipments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.shipments.map((s: any) => (
                  <Link key={s.id} href={`/shipments/${s.id}`} className="block border rounded-xl p-4 hover:bg-muted transition-colors">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{s.shipmentNumber}</div>
                        <div className="text-sm text-foreground/50">
                          AWB: {s.awbNumber || 'Pending'} | {s.carrierName || 'N/A'}
                        </div>
                      </div>
                      <Badge variant={s.status === 'DELIVERED' ? 'default' : 'outline'}>
                        {s.status?.replace('_', ' ')}
                      </Badge>
                    </div>
                    {s.trackingEvents?.length > 0 && (
                      <div className="mt-2 text-sm text-foreground/60">
                        Latest: {s.trackingEvents[0].description} ({new Date(s.trackingEvents[0].eventAt).toLocaleString('en-IN')})
                      </div>
                    )}
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div><span className="text-foreground/60">Name:</span> {order.customer?.name || order.shippingName}</div>
              <div><span className="text-foreground/60">Phone:</span> {order.shippingPhone}</div>
              {order.shippingEmail && <div><span className="text-foreground/60">Email:</span> {order.shippingEmail}</div>}
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <div>{order.shippingName}</div>
              <div>{order.shippingAddress}</div>
              <div>{order.shippingCity}, {order.shippingState} {order.shippingPincode}</div>
              <div>{order.shippingPhone}</div>
            </CardContent>
          </Card>

          {/* Order Info */}
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground/60">Created</span>
                <span>{new Date(order.createdAt).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/60">Payment</span>
                <Badge variant={order.paymentStatus === 'PAID' ? 'default' : 'outline'}>
                  {order.paymentStatus}
                </Badge>
              </div>
              {order.paymentMode && (
                <div className="flex justify-between">
                  <span className="text-foreground/60">Mode</span>
                  <span>{order.paymentMode}</span>
                </div>
              )}
              {order.channel && (
                <div className="flex justify-between">
                  <span className="text-foreground/60">Channel</span>
                  <span>{order.channel}</span>
                </div>
              )}
              {order.notes && (
                <div className="mt-2">
                  <span className="text-foreground/60">Notes:</span>
                  <p className="mt-1">{order.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Package Info */}
          <Card>
            <CardHeader>
              <CardTitle>Package</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-foreground/60">Weight</span><span>{order.weightGrams || '—'}g</span></div>
              <div className="flex justify-between"><span className="text-foreground/60">Dimensions</span><span>{order.lengthCm || '—'}×{order.breadthCm || '—'}×{order.heightCm || '—'} cm</span></div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Ship Dialog */}
      <Dialog open={shipDialog.isOpen} onOpenChange={shipDialog.onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ship Order</DialogTitle>
          </DialogHeader>
          <StyledSelect
            label="Select Carrier Account"
            value={selectedCarrier}
            onChange={setSelectedCarrier}
            options={[
              { value: '', label: 'Select...' },
              ...carriers.map((c) => ({
                value: c.id,
                label: `${c.name} (${c.provider})${c.isDefault ? ' ★' : ''}`,
              })),
            ]}
          />
          <DialogFooter>
            <Button variant="outline" onClick={shipDialog.onClose}>Cancel</Button>
            <Button onClick={handleShip} disabled={actionLoading === 'ship'}>
              {actionLoading === 'ship' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Truck className="w-4 h-4 mr-2" />}
              Create Shipment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pick Dialog */}
      <Dialog open={pickDialog.isOpen} onOpenChange={pickDialog.onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Pick List</DialogTitle>
          </DialogHeader>
          <StyledSelect
            label="Select Warehouse Location"
            value={selectedLocation}
            onChange={setSelectedLocation}
            options={[
              { value: '', label: 'Select...' },
              ...locations.map((l: any) => ({ value: l.id, label: l.name })),
            ]}
          />
          <DialogFooter>
            <Button variant="outline" onClick={pickDialog.onClose}>Cancel</Button>
            <Button onClick={handlePick} disabled={actionLoading === 'pick'}>
              {actionLoading === 'pick' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ClipboardList className="w-4 h-4 mr-2" />}
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
