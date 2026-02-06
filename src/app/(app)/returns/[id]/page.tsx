'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  Check,
  Loader2,
  Package,
  RotateCcw,
  X,
} from 'lucide-react';
import { StyledSelect } from '@/components/ui/FormField';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
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

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatCurrency(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(num);
}

export default function ReturnDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [returnOrder, setReturnOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Inspection state
  const [inspectionItems, setInspectionItems] = useState<
    { itemId: string; conditionGrade: string }[]
  >([]);
  const [inspectionNotes, setInspectionNotes] = useState('');

  // Refund state
  const [refundAmount, setRefundAmount] = useState('');
  const [refundMode, setRefundMode] = useState('');
  const [restockApproved, setRestockApproved] = useState(false);

  const fetchReturn = async () => {
    try {
      const res = await fetch(`/api/returns/${id}`);
      if (!res.ok) throw new Error('Failed to fetch return');
      const data = await res.json();
      setReturnOrder(data);

      // Initialize inspection items from return items
      if (data.items) {
        setInspectionItems(
          data.items.map((item: any) => ({
            itemId: item.id,
            conditionGrade: item.conditionGrade || 'A',
          })),
        );
      }
    } catch (error) {
      console.error('Error fetching return:', error);
      alert('Failed to load return.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchReturn();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleApprove = async () => {
    setActionLoading('approve');
    try {
      const res = await fetch(`/api/returns/${id}/approve`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to approve return');
      }
      await fetchReturn();
    } catch (error: any) {
      alert(error.message || 'Failed to approve return');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    setActionLoading('reject');
    try {
      const res = await fetch(`/api/returns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', reason }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to reject return');
      }
      await fetchReturn();
    } catch (error: any) {
      alert(error.message || 'Failed to reject return');
    } finally {
      setActionLoading(null);
    }
  };

  const handleInspection = async () => {
    setActionLoading('inspect');
    try {
      const res = await fetch(`/api/returns/${id}/inspect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: inspectionItems,
          inspectionNotes: inspectionNotes || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to submit inspection');
      }
      await fetchReturn();
    } catch (error: any) {
      alert(error.message || 'Failed to submit inspection');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefund = async () => {
    if (!refundAmount || !refundMode) {
      alert('Please enter refund amount and select refund mode.');
      return;
    }

    setActionLoading('refund');
    try {
      const res = await fetch(`/api/returns/${id}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refundAmount: parseFloat(refundAmount),
          refundMode,
          restockApproved,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to initiate refund');
      }
      await fetchReturn();
    } catch (error: any) {
      alert(error.message || 'Failed to initiate refund');
    } finally {
      setActionLoading(null);
    }
  };

  const handleClose = async () => {
    if (!confirm('Are you sure you want to close this return?')) return;

    setActionLoading('close');
    try {
      const res = await fetch(`/api/returns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'close' }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to close return');
      }
      await fetchReturn();
    } catch (error: any) {
      alert(error.message || 'Failed to close return');
    } finally {
      setActionLoading(null);
    }
  };

  const updateInspectionGrade = (itemId: string, grade: string) => {
    setInspectionItems((prev) =>
      prev.map((item) =>
        item.itemId === itemId ? { ...item, conditionGrade: grade } : item,
      ),
    );
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!returnOrder) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <Package className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Return not found.</p>
        <Button variant="outline" asChild>
          <Link href="/returns">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Returns
          </Link>
        </Button>
      </div>
    );
  }

  const status = returnOrder.status;
  const canInspect = ['APPROVED', 'RECEIVED', 'INSPECTING'].includes(status);
  const canRefund = status === 'INSPECTED';
  const canClose = status === 'REFUND_INITIATED';

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/returns">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                {returnOrder.returnNumber}
              </h1>
              <Badge
                variant={
                  (STATUS_COLORS[status] || 'outline') as any
                }
              >
                {status?.replace(/_/g, ' ')}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Created on {formatDate(returnOrder.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {status === 'REQUESTED' && (
            <>
              <Button
                onClick={handleApprove}
                disabled={actionLoading !== null}
              >
                {actionLoading === 'approve' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                Approve
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={actionLoading !== null}
              >
                {actionLoading === 'reject' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <X className="mr-2 h-4 w-4" />
                )}
                Reject
              </Button>
            </>
          )}

          {canClose && (
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
              Close Return
            </Button>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Order Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">
              <span className="text-muted-foreground">Order: </span>
              <Link
                href={`/orders/${returnOrder.orderId}`}
                className="font-medium text-primary hover:underline"
              >
                {returnOrder.order?.orderNumber || '-'}
              </Link>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Customer: </span>
              <span className="font-medium">
                {returnOrder.customer?.name ||
                  returnOrder.order?.shippingName ||
                  '-'}
              </span>
            </p>
          </CardContent>
        </Card>

        {/* Return Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Return Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">
              <span className="text-muted-foreground">Type: </span>
              <Badge variant="outline">
                {returnOrder.type?.replace(/_/g, ' ')}
              </Badge>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Reason: </span>
              <span className="font-medium">{returnOrder.reason}</span>
            </p>
            {returnOrder.returnAwb && (
              <p className="text-sm">
                <span className="text-muted-foreground">Return AWB: </span>
                <span className="font-medium">{returnOrder.returnAwb}</span>
              </p>
            )}
            {returnOrder.refundAmount && (
              <p className="text-sm">
                <span className="text-muted-foreground">Refund Amount: </span>
                <span className="font-medium">
                  {formatCurrency(returnOrder.refundAmount)}
                </span>
              </p>
            )}
            {returnOrder.refundMode && (
              <p className="text-sm">
                <span className="text-muted-foreground">Refund Mode: </span>
                <span className="font-medium">
                  {returnOrder.refundMode.replace(/_/g, ' ')}
                </span>
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
                  <th className="pb-3 pr-4 text-right font-medium">Qty</th>
                  <th className="pb-3 pr-4 font-medium">Condition Grade</th>
                  <th className="pb-3 font-medium">Restocked</th>
                </tr>
              </thead>
              <tbody>
                {returnOrder.items?.map((item: any) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="py-3 pr-4">
                      <div>
                        <p className="font-medium">
                          {item.productName ||
                            item.product?.name ||
                            '-'}
                        </p>
                        {item.product?.sku && (
                          <p className="text-xs text-muted-foreground">
                            {item.product.sku}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-right">{item.quantity}</td>
                    <td className="py-3 pr-4">
                      {canInspect ? (
                        <select
                          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                          value={
                            inspectionItems.find(
                              (i) => i.itemId === item.id,
                            )?.conditionGrade || 'A'
                          }
                          onChange={(e) =>
                            updateInspectionGrade(item.id, e.target.value)
                          }
                        >
                          <option value="A">A - Like New</option>
                          <option value="B">B - Minor Defects</option>
                          <option value="C">C - Damaged</option>
                        </select>
                      ) : (
                        <span>
                          {item.conditionGrade
                            ? `Grade ${item.conditionGrade}`
                            : '-'}
                        </span>
                      )}
                    </td>
                    <td className="py-3">
                      {item.restocked ? (
                        <Badge variant="default">Restocked</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Inspection Submit */}
          {canInspect && (
            <div className="mt-4 space-y-3 border-t pt-4">
              <Input
                placeholder="Inspection notes (optional)"
                value={inspectionNotes}
                onChange={(e) => setInspectionNotes(e.target.value)}
              />
              <Button
                onClick={handleInspection}
                disabled={actionLoading !== null}
              >
                {actionLoading === 'inspect' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                Submit Inspection
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Refund Section */}
      {canRefund && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Initiate Refund</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-foreground/70">
                  Refund Amount <span className="text-destructive ml-1">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="Enter refund amount"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  min={0}
                  step="0.01"
                />
              </div>
              <StyledSelect
                label="Refund Mode"
                required
                value={refundMode}
                onChange={setRefundMode}
                placeholder="Select refund mode"
                options={[
                  { value: 'ORIGINAL_PAYMENT', label: 'Original Payment Method' },
                  { value: 'STORE_CREDIT', label: 'Store Credit' },
                  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
                ]}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="restockApproved"
                checked={restockApproved}
                onChange={(e) => setRestockApproved(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label
                htmlFor="restockApproved"
                className="text-sm font-medium"
              >
                Restock A-grade items back to inventory
              </label>
            </div>
            <Button
              onClick={handleRefund}
              disabled={actionLoading !== null}
            >
              {actionLoading === 'refund' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="mr-2 h-4 w-4" />
              )}
              Initiate Refund
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {(returnOrder.notes || returnOrder.inspectionNotes) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {returnOrder.notes && (
              <div>
                <p className="mb-1 text-sm font-medium text-muted-foreground">
                  Notes
                </p>
                <p className="whitespace-pre-wrap text-sm">
                  {returnOrder.notes}
                </p>
              </div>
            )}
            {returnOrder.inspectionNotes && (
              <div>
                <p className="mb-1 text-sm font-medium text-muted-foreground">
                  Inspection Notes
                </p>
                <p className="whitespace-pre-wrap text-sm">
                  {returnOrder.inspectionNotes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
