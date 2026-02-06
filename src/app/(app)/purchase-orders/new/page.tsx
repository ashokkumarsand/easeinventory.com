'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormRow, StyledInput, StyledSelect } from '@/components/ui/FormField';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Loader2, Plus, Search, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface POItem {
  productId?: string;
  productName: string;
  sku?: string;
  hsnCode?: string;
  orderedQty: number;
  unitCost: number;
  taxRate: number;
}

export default function NewPurchaseOrderPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);

  // PO fields
  const [supplierId, setSupplierId] = useState('');
  const [deliveryLocationId, setDeliveryLocationId] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [ewayBillNumber, setEwayBillNumber] = useState('');
  const [transporterName, setTransporterName] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [items, setItems] = useState<POItem[]>([]);

  // Product search
  const [productSearch, setProductSearch] = useState('');

  useEffect(() => {
    fetchSuppliers();
    fetchProducts();
    fetchLocations();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await fetch('/api/settings?section=suppliers');
      const data = await res.json();
      setSuppliers(data.suppliers || []);
    } catch {}
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      setProducts(data.products || []);
    } catch {}
  };

  const fetchLocations = async () => {
    try {
      const res = await fetch('/api/inventory/locations');
      const data = await res.json();
      setLocations(data.locations || []);
    } catch {}
  };

  const addItem = (product?: any) => {
    if (product) {
      setItems([
        ...items,
        {
          productId: product.id,
          productName: product.name,
          sku: product.sku || '',
          hsnCode: product.hsnCode || '',
          orderedQty: 1,
          unitCost: Number(product.purchasePrice || product.modalPrice || 0),
          taxRate: Number(product.gstRate || 18),
        },
      ]);
    } else {
      setItems([
        ...items,
        {
          productName: '',
          orderedQty: 1,
          unitCost: 0,
          taxRate: 18,
        },
      ]);
    }
    setProductSearch('');
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof POItem, value: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    setItems(updated);
  };

  const getLineTotal = (item: POItem) => {
    const subtotal = item.orderedQty * item.unitCost;
    return subtotal + (subtotal * item.taxRate) / 100;
  };

  const getSubtotal = () =>
    items.reduce((sum, i) => sum + i.orderedQty * i.unitCost, 0);

  const getTotalTax = () =>
    items.reduce((sum, i) => {
      const lineSub = i.orderedQty * i.unitCost;
      return sum + (lineSub * i.taxRate) / 100;
    }, 0);

  const getTotal = () => getSubtotal() + getTotalTax();

  const handleSubmit = async () => {
    if (!supplierId) {
      alert('Please select a supplier');
      return;
    }
    if (items.length === 0) {
      alert('Please add at least one item');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId,
          deliveryLocationId: deliveryLocationId || undefined,
          paymentTerms: paymentTerms || undefined,
          dueDate: dueDate || undefined,
          notes: notes || undefined,
          internalNotes: internalNotes || undefined,
          ewayBillNumber: ewayBillNumber || undefined,
          transporterName: transporterName || undefined,
          vehicleNumber: vehicleNumber || undefined,
          items: items.map((item) => ({
            productId: item.productId || undefined,
            productName: item.productName,
            sku: item.sku || undefined,
            hsnCode: item.hsnCode || undefined,
            orderedQty: item.orderedQty,
            unitCost: item.unitCost,
            taxRate: item.taxRate,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/purchase-orders/${data.purchaseOrder.id}`);
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to create purchase order');
      }
    } catch {
      alert('Failed to create purchase order');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      productSearch &&
      (p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.sku?.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.barcode?.includes(productSearch)),
  );

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">New Purchase Order</h1>
          <p className="text-foreground/50">Create a purchase order for your supplier</p>
        </div>
      </div>

      {/* Supplier Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Supplier</CardTitle>
        </CardHeader>
        <CardContent>
          <StyledSelect
            label="Select Supplier *"
            value={supplierId}
            onChange={setSupplierId}
            options={[
              { value: '', label: 'Choose a supplier...' },
              ...suppliers.map((s) => ({ value: s.id, label: s.name })),
            ]}
            required
          />
        </CardContent>
      </Card>

      {/* Delivery Info */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Info</CardTitle>
        </CardHeader>
        <CardContent>
          <FormRow columns={3}>
            <StyledSelect
              label="Delivery Location"
              value={deliveryLocationId}
              onChange={setDeliveryLocationId}
              options={[
                { value: '', label: 'Default' },
                ...locations.map((l: any) => ({ value: l.id, label: l.name })),
              ]}
            />
            <StyledInput
              label="Payment Terms"
              placeholder="Net 30, Net 60..."
              value={paymentTerms}
              onChange={setPaymentTerms}
            />
            <StyledInput
              label="Due Date"
              type="date"
              value={dueDate}
              onChange={setDueDate}
            />
          </FormRow>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Product Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <Input
              placeholder="Search products by name, SKU, or barcode..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="pl-10"
            />
            {filteredProducts.length > 0 && (
              <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-card border rounded-xl shadow-lg max-h-60 overflow-y-auto">
                {filteredProducts.slice(0, 10).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => addItem(p)}
                    className="w-full px-4 py-3 text-left hover:bg-muted flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-sm text-foreground/50">
                        {p.sku} | Stock: {p.quantity}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        ₹{Number(p.purchasePrice || p.modalPrice || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Items Table */}
          {items.length > 0 && (
            <div className="border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left">Product</th>
                    <th className="px-4 py-3 text-left w-24">SKU</th>
                    <th className="px-4 py-3 text-left w-24">HSN</th>
                    <th className="px-4 py-3 text-right w-20">Qty</th>
                    <th className="px-4 py-3 text-right w-28">Unit Cost</th>
                    <th className="px-4 py-3 text-right w-24">Tax %</th>
                    <th className="px-4 py-3 text-right w-28">Line Total</th>
                    <th className="px-4 py-3 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => {
                    const lineTotal = getLineTotal(item);
                    return (
                      <tr key={idx} className="border-t">
                        <td className="px-4 py-3">
                          <Input
                            value={item.productName}
                            onChange={(e) =>
                              updateItem(idx, 'productName', e.target.value)
                            }
                            placeholder="Product name"
                            className="h-9"
                          />
                        </td>
                        <td className="px-4 py-3 text-foreground/60 text-xs">
                          {item.sku || '-'}
                        </td>
                        <td className="px-4 py-3 text-foreground/60 text-xs">
                          {item.hsnCode || '-'}
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            value={item.orderedQty}
                            onChange={(e) =>
                              updateItem(idx, 'orderedQty', parseInt(e.target.value) || 0)
                            }
                            min={1}
                            className="h-9 text-right"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            value={item.unitCost}
                            onChange={(e) =>
                              updateItem(idx, 'unitCost', parseFloat(e.target.value) || 0)
                            }
                            className="h-9 text-right"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            value={item.taxRate}
                            onChange={(e) =>
                              updateItem(idx, 'taxRate', parseFloat(e.target.value) || 0)
                            }
                            className="h-9 text-right"
                          />
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          ₹{lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <Button variant="outline" onClick={() => addItem()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Custom Item
          </Button>

          {/* Totals */}
          {items.length > 0 && (
            <div className="flex justify-end">
              <div className="w-64 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground/60">Subtotal</span>
                  <span>
                    ₹{getSubtotal().toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/60">Tax</span>
                  <span>
                    ₹{getTotalTax().toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-base border-t pt-2">
                  <span>Total</span>
                  <span>
                    ₹{getTotal().toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* E-Way Bill (Optional) */}
      <Card>
        <CardHeader>
          <CardTitle>E-Way Bill (Optional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <StyledInput
            label="E-Way Bill Number"
            value={ewayBillNumber}
            onChange={setEwayBillNumber}
          />
          <FormRow columns={2}>
            <StyledInput
              label="Transporter Name"
              value={transporterName}
              onChange={setTransporterName}
            />
            <StyledInput
              label="Vehicle Number"
              value={vehicleNumber}
              onChange={setVehicleNumber}
            />
          </FormRow>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <StyledInput
            label="Notes"
            placeholder="Notes visible to supplier..."
            value={notes}
            onChange={setNotes}
          />
          <StyledInput
            label="Internal Notes"
            placeholder="Internal notes (not shared with supplier)..."
            value={internalNotes}
            onChange={setInternalNotes}
          />
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
            'Create PO'
          )}
        </Button>
      </div>
    </div>
  );
}
