'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FormRow,
  StyledInput,
  StyledSelect,
} from '@/components/ui/FormField';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ReturnItem {
  productId?: string;
  productName: string;
  quantity: number;
}

export default function NewReturnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);

  // Order details
  const [orderDetails, setOrderDetails] = useState<any>(null);

  // Form fields
  const [type, setType] = useState('CUSTOMER_RETURN');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<ReturnItem[]>([]);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const fetchOrderDetails = async () => {
    setIsLoadingOrder(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (!res.ok) throw new Error('Failed to fetch order');
      const data = await res.json();
      const order = data.order || data;
      setOrderDetails(order);

      // Pre-fill items from order items
      const orderItems: ReturnItem[] = (order.items || []).map((item: any) => ({
        productId: item.productId || undefined,
        productName: item.productName || item.product?.name || '',
        quantity: item.quantity || 1,
      }));
      setItems(orderItems);
    } catch (err) {
      console.error('Failed to fetch order details:', err);
      alert('Failed to load order details');
    } finally {
      setIsLoadingOrder(false);
    }
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        productName: '',
        quantity: 1,
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof ReturnItem, value: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    setItems(updated);
  };

  const handleSubmit = async () => {
    if (!orderId && !orderDetails) {
      alert('An order must be selected to create a return.');
      return;
    }
    if (!reason.trim()) {
      alert('Please enter a reason for the return.');
      return;
    }
    if (items.length === 0) {
      alert('Please add at least one item.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderId || orderDetails?.id,
          type,
          reason,
          notes: notes || undefined,
          items: items.map((item) => ({
            productId: item.productId || undefined,
            productName: item.productName,
            quantity: item.quantity,
          })),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/returns/${data.returnOrder.id}`);
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to create return');
      }
    } catch {
      alert('Failed to create return');
    } finally {
      setIsSaving(false);
    }
  };

  if (orderId && isLoadingOrder) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {orderId && orderDetails
              ? `New Return for Order #${orderDetails.orderNumber}`
              : 'New Return'}
          </h1>
          <p className="text-foreground/50">
            {orderId
              ? 'Create a return request for this order'
              : 'Create a new return request'}
          </p>
        </div>
      </div>

      {/* Order Info (if pre-filled) */}
      {orderId && orderDetails && (
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">
              <span className="text-muted-foreground">Order Number: </span>
              <span className="font-medium">{orderDetails.orderNumber}</span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Customer: </span>
              <span className="font-medium">
                {orderDetails.customer?.name ||
                  orderDetails.shippingName ||
                  '-'}
              </span>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Return Details */}
      <Card>
        <CardHeader>
          <CardTitle>Return Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormRow columns={2}>
            <StyledSelect
              label="Return Type"
              required
              value={type}
              onChange={setType}
              options={[
                { value: 'CUSTOMER_RETURN', label: 'Customer Return' },
                { value: 'RTO', label: 'RTO (Return to Origin)' },
                { value: 'EXCHANGE', label: 'Exchange' },
              ]}
            />
            <StyledInput
              label="Reason"
              required
              value={reason}
              onChange={setReason}
              placeholder="Reason for return..."
            />
          </FormRow>
          <StyledInput
            label="Notes"
            value={notes}
            onChange={setNotes}
            placeholder="Additional notes (optional)"
          />
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.length > 0 && (
            <div className="border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-3 text-left">Product</th>
                      <th className="px-4 py-3 text-right w-28">Quantity</th>
                      <th className="px-4 py-3 w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-4 py-3">
                          {orderId ? (
                            <span className="font-medium">
                              {item.productName}
                            </span>
                          ) : (
                            <Input
                              value={item.productName}
                              onChange={(e) =>
                                updateItem(idx, 'productName', e.target.value)
                              }
                              placeholder="Product name"
                              className="h-9"
                            />
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(
                                idx,
                                'quantity',
                                parseInt(e.target.value) || 0,
                              )
                            }
                            min={1}
                            className="h-9 text-right"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(idx)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <Button variant="outline" onClick={addItem}>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>

          {items.length === 0 && (
            <p className="text-foreground/40 text-center py-8">
              No items added yet. Add items to include in this return.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSaving} size="lg">
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Creating...
            </>
          ) : (
            'Create Return'
          )}
        </Button>
      </div>
    </div>
  );
}
