'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Check, Loader2, Package, Send, Truck, X } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface PurchaseOrderItem {
  id: string;
  productName: string;
  sku?: string | null;
  hsnCode?: string | null;
  orderedQty: number;
  receivedQty: number;
  rejectedQty: number;
  unitCost: number | string;
  taxRate: number | string;
  total: number | string;
  product?: { name: string; sku?: string | null } | null;
}

interface Supplier {
  id: string;
  name: string;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
  gstNumber?: string | null;
}

interface Location {
  id: string;
  name: string;
}

interface GoodsReceiptItem {
  id: string;
  productName: string;
  receivedQty: number;
  rejectedQty: number;
}

interface GoodsReceipt {
  id: string;
  grnNumber: string;
  status: string;
  createdAt: string;
  items: GoodsReceiptItem[];
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  status: string;
  subtotal: number | string;
  taxAmount: number | string;
  shipping: number | string;
  total: number | string;
  currency: string;
  paymentTerms?: string | null;
  dueDate?: string | null;
  ewayBillNumber?: string | null;
  transporterName?: string | null;
  vehicleNumber?: string | null;
  notes?: string | null;
  internalNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  supplier: Supplier;
  deliveryLocation?: Location | null;
  items: PurchaseOrderItem[];
  goodsReceipts: GoodsReceipt[];
}

type POStatus = 'DRAFT' | 'SENT' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED' | 'CLOSED';

function getStatusBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'DRAFT':
      return 'secondary';
    case 'SENT':
      return 'default';
    case 'PARTIALLY_RECEIVED':
      return 'default';
    case 'RECEIVED':
      return 'default';
    case 'CANCELLED':
      return 'destructive';
    case 'CLOSED':
      return 'outline';
    default:
      return 'default';
  }
}

function formatStatus(status: string): string {
  return status.replace(/_/g, ' ');
}

function formatCurrency(value: number | string, currency = 'INR'): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(num);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function PurchaseOrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [po, setPo] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPO = async () => {
    try {
      const res = await fetch(`/api/purchase-orders/${id}`);
      if (!res.ok) {
        throw new Error('Failed to fetch purchase order');
      }
      const data = await res.json();
      setPo(data);
    } catch (error) {
      console.error('Error fetching PO:', error);
      alert('Failed to load purchase order.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPO();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSend = async () => {
    setActionLoading('send');
    try {
      const res = await fetch(`/api/purchase-orders/${id}/send`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to send purchase order');
      }
      await fetchPO();
    } catch (error: any) {
      alert(error.message || 'Failed to send purchase order');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this purchase order? This action cannot be undone.')) {
      return;
    }
    setActionLoading('cancel');
    try {
      const res = await fetch(`/api/purchase-orders/${id}/cancel`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to cancel purchase order');
      }
      await fetchPO();
    } catch (error: any) {
      alert(error.message || 'Failed to cancel purchase order');
    } finally {
      setActionLoading(null);
    }
  };

  const handleClose = async () => {
    if (!confirm('Are you sure you want to close this purchase order?')) {
      return;
    }
    setActionLoading('close');
    try {
      const res = await fetch(`/api/purchase-orders/${id}/close`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to close purchase order');
      }
      await fetchPO();
    } catch (error: any) {
      alert(error.message || 'Failed to close purchase order');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!po) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <Package className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Purchase order not found.</p>
        <Button variant="outline" asChild>
          <Link href="/purchase-orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Purchase Orders
          </Link>
        </Button>
      </div>
    );
  }

  const status = po.status as POStatus;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/purchase-orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{po.poNumber}</h1>
              <Badge variant={getStatusBadgeVariant(status)}>
                {status === 'PARTIALLY_RECEIVED' ? (
                  <span className="text-yellow-600 dark:text-yellow-400">{formatStatus(status)}</span>
                ) : (
                  formatStatus(status)
                )}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Created on {formatDate(po.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {status === 'DRAFT' && (
            <>
              <Button
                onClick={handleSend}
                disabled={actionLoading !== null}
              >
                {actionLoading === 'send' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Send to Supplier
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={actionLoading !== null}
              >
                {actionLoading === 'cancel' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <X className="mr-2 h-4 w-4" />
                )}
                Cancel
              </Button>
            </>
          )}

          {status === 'SENT' && (
            <>
              <Button asChild>
                <Link href={`/goods-receipts/new?poId=${po.id}`}>
                  <Truck className="mr-2 h-4 w-4" />
                  Create GRN
                </Link>
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={actionLoading !== null}
              >
                {actionLoading === 'cancel' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <X className="mr-2 h-4 w-4" />
                )}
                Cancel
              </Button>
            </>
          )}

          {status === 'PARTIALLY_RECEIVED' && (
            <>
              <Button asChild>
                <Link href={`/goods-receipts/new?poId=${po.id}`}>
                  <Truck className="mr-2 h-4 w-4" />
                  Create GRN
                </Link>
              </Button>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={actionLoading !== null}
              >
                {actionLoading === 'close' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                Close PO
              </Button>
            </>
          )}

          {status === 'RECEIVED' && (
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={actionLoading !== null}
            >
              {actionLoading === 'close' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Close PO
            </Button>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Supplier Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Supplier</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="font-medium">{po.supplier.name}</p>
            {po.supplier.phone && (
              <p className="text-sm text-muted-foreground">Phone: {po.supplier.phone}</p>
            )}
            {po.supplier.email && (
              <p className="text-sm text-muted-foreground">Email: {po.supplier.email}</p>
            )}
            {po.supplier.gstNumber && (
              <p className="text-sm text-muted-foreground">GSTIN: {po.supplier.gstNumber}</p>
            )}
          </CardContent>
        </Card>

        {/* Delivery Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Delivery Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">
              <span className="text-muted-foreground">Location: </span>
              <span className="font-medium">
                {po.deliveryLocation?.name || 'Not specified'}
              </span>
            </p>
            {po.paymentTerms && (
              <p className="text-sm">
                <span className="text-muted-foreground">Payment Terms: </span>
                <span className="font-medium">{po.paymentTerms}</span>
              </p>
            )}
            {po.dueDate && (
              <p className="text-sm">
                <span className="text-muted-foreground">Due Date: </span>
                <span className="font-medium">{formatDate(po.dueDate)}</span>
              </p>
            )}
            {po.ewayBillNumber && (
              <p className="text-sm">
                <span className="text-muted-foreground">e-Way Bill: </span>
                <span className="font-medium">{po.ewayBillNumber}</span>
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 pr-4 font-medium">Product</th>
                  <th className="pb-3 pr-4 font-medium">HSN</th>
                  <th className="pb-3 pr-4 text-right font-medium">Ordered</th>
                  <th className="pb-3 pr-4 text-right font-medium">Received</th>
                  <th className="pb-3 pr-4 text-right font-medium">Rejected</th>
                  <th className="pb-3 pr-4 text-right font-medium">Unit Cost</th>
                  <th className="pb-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {po.items.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="py-3 pr-4">
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        {item.sku && (
                          <p className="text-xs text-muted-foreground">{item.sku}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {item.hsnCode || '-'}
                    </td>
                    <td className="py-3 pr-4 text-right">{item.orderedQty}</td>
                    <td className="py-3 pr-4 text-right">
                      <span>{item.receivedQty}</span>
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({item.receivedQty}/{item.orderedQty})
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right">{item.rejectedQty}</td>
                    <td className="py-3 pr-4 text-right">
                      {formatCurrency(item.unitCost, po.currency)}
                    </td>
                    <td className="py-3 text-right font-medium">
                      {formatCurrency(item.total, po.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t">
                  <td colSpan={5} />
                  <td className="py-3 pr-4 text-right text-muted-foreground">Subtotal</td>
                  <td className="py-3 text-right font-medium">
                    {formatCurrency(po.subtotal, po.currency)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={5} />
                  <td className="py-1 pr-4 text-right text-muted-foreground">Tax</td>
                  <td className="py-1 text-right">
                    {formatCurrency(po.taxAmount, po.currency)}
                  </td>
                </tr>
                {Number(po.shipping) > 0 && (
                  <tr>
                    <td colSpan={5} />
                    <td className="py-1 pr-4 text-right text-muted-foreground">Shipping</td>
                    <td className="py-1 text-right">
                      {formatCurrency(po.shipping, po.currency)}
                    </td>
                  </tr>
                )}
                <tr className="border-t">
                  <td colSpan={5} />
                  <td className="py-3 pr-4 text-right font-semibold">Total</td>
                  <td className="py-3 text-right text-lg font-bold">
                    {formatCurrency(po.total, po.currency)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Goods Receipts */}
      {po.goodsReceipts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Goods Receipts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {po.goodsReceipts.map((grn) => (
                <div
                  key={grn.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Link
                        href={`/goods-receipts/${grn.id}`}
                        className="font-medium hover:underline"
                      >
                        {grn.grnNumber}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(grn.createdAt)} &middot; {grn.items.length} item{grn.items.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <Badge variant={grn.status === 'COMPLETED' ? 'default' : 'secondary'}>
                    {grn.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {(po.notes || po.internalNotes) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {po.notes && (
              <div>
                <p className="mb-1 text-sm font-medium text-muted-foreground">Notes</p>
                <p className="whitespace-pre-wrap text-sm">{po.notes}</p>
              </div>
            )}
            {po.internalNotes && (
              <div>
                <p className="mb-1 text-sm font-medium text-muted-foreground">Internal Notes</p>
                <p className="whitespace-pre-wrap text-sm">{po.internalNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
