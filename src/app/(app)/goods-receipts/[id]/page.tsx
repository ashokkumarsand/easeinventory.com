'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Check, Loader2, Package, X } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'secondary',
  IN_PROGRESS: 'default',
  COMPLETED: 'default',
  CANCELLED: 'destructive',
};

interface GRNItem {
  id: string;
  productId?: string;
  productName: string;
  expectedQty: number;
  receivedQty: number;
  rejectedQty: number;
  rejectionReason?: string;
  lotNumber?: string;
  batchNumber?: string;
  unitCost: number;
  product?: { name: string; sku?: string };
}

export default function GoodsReceiptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [grn, setGrn] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [savingItemId, setSavingItemId] = useState<string | null>(null);

  // Editable item state keyed by item ID
  const [editedItems, setEditedItems] = useState<Record<string, {
    receivedQty: number;
    rejectedQty: number;
    rejectionReason: string;
  }>>({});

  useEffect(() => {
    fetchGRN();
  }, [id]);

  const fetchGRN = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/goods-receipts/${id}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setGrn(data.grn);

      // Initialize editable state from fetched items
      const itemState: Record<string, { receivedQty: number; rejectedQty: number; rejectionReason: string }> = {};
      for (const item of data.grn.items || []) {
        itemState[item.id] = {
          receivedQty: item.receivedQty || 0,
          rejectedQty: item.rejectedQty || 0,
          rejectionReason: item.rejectionReason || '',
        };
      }
      setEditedItems(itemState);
    } catch (err) {
      console.error('Failed to fetch GRN:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!confirm('Are you sure you want to complete this GRN? Stock levels will be updated.')) return;
    setIsCompleting(true);
    try {
      const res = await fetch(`/api/goods-receipts/${id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qcStatus: 'PASSED' }),
      });
      if (res.ok) {
        await fetchGRN();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to complete GRN');
      }
    } catch {
      alert('Failed to complete GRN');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this GRN?')) return;
    setIsCancelling(true);
    try {
      const res = await fetch(`/api/goods-receipts/${id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        await fetchGRN();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to cancel GRN');
      }
    } catch {
      alert('Failed to cancel GRN');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleSaveItem = async (itemId: string) => {
    const edited = editedItems[itemId];
    if (!edited) return;

    setSavingItemId(itemId);
    try {
      const res = await fetch(`/api/goods-receipts/${id}/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receivedQty: edited.receivedQty,
          rejectedQty: edited.rejectedQty,
          rejectionReason: edited.rejectionReason || undefined,
        }),
      });
      if (res.ok) {
        await fetchGRN();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to update item');
      }
    } catch {
      alert('Failed to update item');
    } finally {
      setSavingItemId(null);
    }
  };

  const updateEditedItem = (itemId: string, field: string, value: any) => {
    setEditedItems((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value,
      },
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!grn) {
    return (
      <div className="p-6">
        <p className="text-foreground/50">Goods receipt not found.</p>
        <Button variant="ghost" onClick={() => router.push('/goods-receipts')} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Goods Receipts
        </Button>
      </div>
    );
  }

  const isEditable = grn.status === 'PENDING' || grn.status === 'IN_PROGRESS';

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/goods-receipts')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Package className="w-8 h-8" />
              {grn.grnNumber}
              <Badge variant={(STATUS_COLORS[grn.status] || 'outline') as any}>
                {grn.status?.replace(/_/g, ' ')}
              </Badge>
            </h1>
            <p className="text-foreground/50 mt-1">
              Created {new Date(grn.createdAt).toLocaleDateString('en-IN')}
            </p>
          </div>
        </div>
        {isEditable && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <X className="w-4 h-4 mr-2" />
              )}
              Cancel
            </Button>
            <Button
              onClick={handleComplete}
              disabled={isCompleting}
            >
              {isCompleting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Complete GRN
            </Button>
          </div>
        )}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Supplier Info */}
        <Card>
          <CardHeader>
            <CardTitle>Supplier Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-foreground/50">Name</span>
              <span className="font-medium">{grn.supplier?.name || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/50">Phone</span>
              <span className="font-medium">{grn.supplier?.phone || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/50">Email</span>
              <span className="font-medium">{grn.supplier?.email || '-'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Receipt Info */}
        <Card>
          <CardHeader>
            <CardTitle>Receipt Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-foreground/50">PO Number</span>
              <span className="font-medium">
                {grn.po ? (
                  <Link href={`/purchase-orders/${grn.po.id}`} className="text-primary hover:underline">
                    {grn.po.poNumber}
                  </Link>
                ) : (
                  '-'
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/50">Receiving Location</span>
              <span className="font-medium">{grn.receivingLocation?.name || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/50">Supplier Invoice #</span>
              <span className="font-medium">{grn.supplierInvoiceNumber || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/50">Supplier Invoice Date</span>
              <span className="font-medium">
                {grn.supplierInvoiceDate
                  ? new Date(grn.supplierInvoiceDate).toLocaleDateString('en-IN')
                  : '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/50">QC Status</span>
              <span className="font-medium">{grn.qcStatus || '-'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left">Product</th>
                    <th className="px-4 py-3 text-right w-24">Expected Qty</th>
                    <th className="px-4 py-3 text-right w-28">Received Qty</th>
                    <th className="px-4 py-3 text-right w-28">Rejected Qty</th>
                    <th className="px-4 py-3 text-left w-40">Rejection Reason</th>
                    <th className="px-4 py-3 text-left w-28">Lot #</th>
                    <th className="px-4 py-3 text-left w-28">Batch #</th>
                    <th className="px-4 py-3 text-right w-28">Unit Cost</th>
                    {isEditable && <th className="px-4 py-3 w-20"></th>}
                  </tr>
                </thead>
                <tbody>
                  {(grn.items || []).map((item: GRNItem) => {
                    const edited = editedItems[item.id];
                    const receivedQty = edited?.receivedQty ?? item.receivedQty;
                    const qtyColorClass =
                      receivedQty === item.expectedQty
                        ? 'text-green-600'
                        : receivedQty < item.expectedQty
                          ? 'text-amber-600'
                          : '';

                    return (
                      <tr key={item.id} className="border-t">
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium">
                              {item.product?.name || item.productName}
                            </div>
                            {item.product?.sku && (
                              <div className="text-xs text-foreground/40">{item.product.sku}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {item.expectedQty}
                        </td>
                        <td className="px-4 py-3">
                          {isEditable ? (
                            <Input
                              type="number"
                              value={edited?.receivedQty ?? 0}
                              onChange={(e) =>
                                updateEditedItem(item.id, 'receivedQty', parseInt(e.target.value) || 0)
                              }
                              min={0}
                              className={`h-9 text-right ${qtyColorClass}`}
                            />
                          ) : (
                            <span className={`block text-right font-medium ${qtyColorClass}`}>
                              {item.receivedQty}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {isEditable ? (
                            <Input
                              type="number"
                              value={edited?.rejectedQty ?? 0}
                              onChange={(e) =>
                                updateEditedItem(item.id, 'rejectedQty', parseInt(e.target.value) || 0)
                              }
                              min={0}
                              className="h-9 text-right"
                            />
                          ) : (
                            <span className="block text-right font-medium">
                              {item.rejectedQty}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {isEditable ? (
                            <Input
                              value={edited?.rejectionReason ?? ''}
                              onChange={(e) =>
                                updateEditedItem(item.id, 'rejectionReason', e.target.value)
                              }
                              placeholder="Reason..."
                              className="h-9"
                            />
                          ) : (
                            <span className="text-foreground/70">
                              {item.rejectionReason || '-'}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-foreground/70">
                          {item.lotNumber || '-'}
                        </td>
                        <td className="px-4 py-3 text-foreground/70">
                          {item.batchNumber || '-'}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          ₹{Number(item.unitCost || 0).toLocaleString('en-IN')}
                        </td>
                        {isEditable && (
                          <td className="px-4 py-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSaveItem(item.id)}
                              disabled={savingItemId === item.id}
                            >
                              {savingItemId === item.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                'Save'
                              )}
                            </Button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  {(!grn.items || grn.items.length === 0) && (
                    <tr>
                      <td colSpan={isEditable ? 9 : 8} className="px-4 py-8 text-center text-foreground/40">
                        No items in this GRN
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {grn.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/70 whitespace-pre-wrap">{grn.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
