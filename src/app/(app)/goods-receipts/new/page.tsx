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

interface GRNItem {
  productId?: string;
  productName: string;
  expectedQty: number;
  unitCost: number;
  lotNumber: string;
  batchNumber: string;
  expiryDate: string;
}

export default function NewGoodsReceiptPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const poId = searchParams.get('poId');

  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingPO, setIsLoadingPO] = useState(false);

  // PO-based creation state
  const [poDetails, setPODetails] = useState<any>(null);

  // Manual creation state
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // Form fields
  const [supplierId, setSupplierId] = useState('');
  const [receivingLocationId, setReceivingLocationId] = useState('');
  const [supplierInvoiceNumber, setSupplierInvoiceNumber] = useState('');
  const [supplierInvoiceDate, setSupplierInvoiceDate] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<GRNItem[]>([]);

  // Product search for manual mode
  const [productSearch, setProductSearch] = useState('');

  useEffect(() => {
    if (poId) {
      fetchPODetails();
    } else {
      fetchSuppliers();
      fetchProducts();
    }
    fetchLocations();
  }, [poId]);

  const fetchPODetails = async () => {
    setIsLoadingPO(true);
    try {
      const res = await fetch(`/api/purchase-orders/${poId}`);
      if (!res.ok) throw new Error('Failed to fetch PO');
      const data = await res.json();
      const po = data.purchaseOrder;
      setPODetails(po);

      // Pre-fill items from PO — only items with remaining qty
      const poItems: GRNItem[] = (po.items || [])
        .filter((item: any) => item.orderedQty > (item.receivedQty || 0))
        .map((item: any) => ({
          productId: item.productId,
          productName: item.productName || item.product?.name || '',
          expectedQty: item.orderedQty - (item.receivedQty || 0),
          unitCost: Number(item.unitCost || 0),
          lotNumber: '',
          batchNumber: '',
          expiryDate: '',
        }));
      setItems(poItems);

      // Pre-fill supplier from PO
      setSupplierId(po.supplierId || '');
    } catch (err) {
      console.error('Failed to fetch PO details:', err);
      alert('Failed to load purchase order details');
    } finally {
      setIsLoadingPO(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await fetch('/api/settings?section=suppliers');
      const data = await res.json();
      setSuppliers(data.suppliers || []);
    } catch {}
  };

  const fetchLocations = async () => {
    try {
      const res = await fetch('/api/inventory/locations');
      const data = await res.json();
      setLocations(data.locations || []);
    } catch {}
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      setProducts(data.products || []);
    } catch {}
  };

  const addItem = (product?: any) => {
    if (product) {
      setItems([
        ...items,
        {
          productId: product.id,
          productName: product.name,
          expectedQty: 1,
          unitCost: Number(product.costPrice || product.modalPrice || 0),
          lotNumber: '',
          batchNumber: '',
          expiryDate: '',
        },
      ]);
    } else {
      setItems([
        ...items,
        {
          productName: '',
          expectedQty: 1,
          unitCost: 0,
          lotNumber: '',
          batchNumber: '',
          expiryDate: '',
        },
      ]);
    }
    setProductSearch('');
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof GRNItem, value: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    setItems(updated);
  };

  const filteredProducts = products.filter(
    (p) =>
      productSearch &&
      (p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.sku?.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.barcode?.includes(productSearch)),
  );

  const handleSubmit = async () => {
    if (poId) {
      // Create from PO
      setIsSaving(true);
      try {
        const res = await fetch('/api/goods-receipts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fromPO: true,
            poId,
            receivingLocationId: receivingLocationId || undefined,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          router.push(`/goods-receipts/${data.grn.id}`);
        } else {
          const err = await res.json();
          alert(err.message || 'Failed to create GRN');
        }
      } catch {
        alert('Failed to create GRN');
      } finally {
        setIsSaving(false);
      }
    } else {
      // Manual creation
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
        const res = await fetch('/api/goods-receipts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            supplierId,
            receivingLocationId: receivingLocationId || undefined,
            supplierInvoiceNumber: supplierInvoiceNumber || undefined,
            supplierInvoiceDate: supplierInvoiceDate || undefined,
            notes: notes || undefined,
            items: items.map((item) => ({
              productId: item.productId || undefined,
              productName: item.productName,
              expectedQty: item.expectedQty,
              unitCost: item.unitCost,
              lotNumber: item.lotNumber || undefined,
              batchNumber: item.batchNumber || undefined,
              expiryDate: item.expiryDate || undefined,
            })),
          }),
        });
        if (res.ok) {
          const data = await res.json();
          router.push(`/goods-receipts/${data.grn.id}`);
        } else {
          const err = await res.json();
          alert(err.message || 'Failed to create GRN');
        }
      } catch {
        alert('Failed to create GRN');
      } finally {
        setIsSaving(false);
      }
    }
  };

  if (poId && isLoadingPO) {
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
            {poId && poDetails
              ? `Creating GRN for PO #${poDetails.poNumber}`
              : 'New Goods Receipt'}
          </h1>
          <p className="text-foreground/50">
            {poId
              ? 'Review and confirm receiving details for this purchase order'
              : 'Create a new goods receipt note for incoming stock'}
          </p>
        </div>
      </div>

      {/* Supplier Selection (manual mode only) */}
      {!poId && (
        <Card>
          <CardHeader>
            <CardTitle>Supplier</CardTitle>
          </CardHeader>
          <CardContent>
            <StyledSelect
              label="Select Supplier"
              value={supplierId}
              onChange={setSupplierId}
              required
              options={[
                { value: '', label: 'Choose a supplier...' },
                ...suppliers.map((s) => ({ value: s.id, label: s.name })),
              ]}
            />
          </CardContent>
        </Card>
      )}

      {/* PO Supplier Info (PO mode) */}
      {poId && poDetails && (
        <Card>
          <CardHeader>
            <CardTitle>Supplier</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{poDetails.supplier?.name || 'Unknown Supplier'}</p>
            {poDetails.supplier?.phone && (
              <p className="text-sm text-foreground/50">{poDetails.supplier.phone}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Receipt Details */}
      <Card>
        <CardHeader>
          <CardTitle>Receipt Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormRow columns={2}>
            <StyledSelect
              label="Receiving Location"
              value={receivingLocationId}
              onChange={setReceivingLocationId}
              options={[
                { value: '', label: 'Select location (optional)' },
                ...locations.map((l: any) => ({ value: l.id, label: l.name })),
              ]}
            />
            {!poId && (
              <StyledInput
                label="Supplier Invoice Number"
                value={supplierInvoiceNumber}
                onChange={setSupplierInvoiceNumber}
                placeholder="e.g. INV-2024-001"
              />
            )}
          </FormRow>
          {!poId && (
            <FormRow columns={2}>
              <StyledInput
                label="Supplier Invoice Date"
                type="date"
                value={supplierInvoiceDate}
                onChange={setSupplierInvoiceDate}
              />
              <StyledInput
                label="Notes"
                value={notes}
                onChange={setNotes}
                placeholder="Optional notes..."
              />
            </FormRow>
          )}
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Product Search (manual mode) */}
          {!poId && (
            <div className="relative">
              <Input
                placeholder="Search products by name, SKU, or barcode..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="pl-4"
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
                          ₹{Number(p.costPrice || 0).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Items Table */}
          {items.length > 0 && (
            <div className="border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-3 text-left">Product</th>
                      <th className="px-4 py-3 text-right w-24">Expected Qty</th>
                      <th className="px-4 py-3 text-right w-28">Unit Cost</th>
                      <th className="px-4 py-3 text-left w-28">Lot #</th>
                      <th className="px-4 py-3 text-left w-28">Batch #</th>
                      <th className="px-4 py-3 text-left w-36">Expiry Date</th>
                      {!poId && <th className="px-4 py-3 w-12"></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-4 py-3">
                          {poId ? (
                            <span className="font-medium">{item.productName}</span>
                          ) : (
                            <Input
                              value={item.productName}
                              onChange={(e) => updateItem(idx, 'productName', e.target.value)}
                              placeholder="Product name"
                              className="h-9"
                            />
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            value={item.expectedQty}
                            onChange={(e) =>
                              updateItem(idx, 'expectedQty', parseInt(e.target.value) || 0)
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
                            min={0}
                            className="h-9 text-right"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            value={item.lotNumber}
                            onChange={(e) => updateItem(idx, 'lotNumber', e.target.value)}
                            placeholder="Lot #"
                            className="h-9"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            value={item.batchNumber}
                            onChange={(e) => updateItem(idx, 'batchNumber', e.target.value)}
                            placeholder="Batch #"
                            className="h-9"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="date"
                            value={item.expiryDate}
                            onChange={(e) => updateItem(idx, 'expiryDate', e.target.value)}
                            className="h-9"
                          />
                        </td>
                        {!poId && (
                          <td className="px-4 py-3">
                            <Button variant="ghost" size="sm" onClick={() => removeItem(idx)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!poId && (
            <Button variant="outline" onClick={() => addItem()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          )}

          {items.length === 0 && (
            <p className="text-foreground/40 text-center py-8">
              {poId ? 'No remaining items to receive from this PO.' : 'No items added yet. Search for products or add a custom item.'}
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
            'Create GRN'
          )}
        </Button>
      </div>
    </div>
  );
}
