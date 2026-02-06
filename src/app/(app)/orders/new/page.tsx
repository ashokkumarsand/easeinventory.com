'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FormRow,
  FormSection,
  StyledInput,
  StyledSelect,
} from '@/components/ui/FormField';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface OrderItem {
  productId?: string;
  productName: string;
  sku?: string;
  hsnCode?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
}

export default function NewOrderPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);

  // Order fields
  const [customerId, setCustomerId] = useState('');
  const [shippingName, setShippingName] = useState('');
  const [shippingPhone, setShippingPhone] = useState('');
  const [shippingEmail, setShippingEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingState, setShippingState] = useState('');
  const [shippingPincode, setShippingPincode] = useState('');
  const [isCOD, setIsCOD] = useState(false);
  const [paymentMode, setPaymentMode] = useState('');
  const [sourceLocationId, setSourceLocationId] = useState('');
  const [notes, setNotes] = useState('');
  const [weightGrams, setWeightGrams] = useState<number>(500);
  const [lengthCm, setLengthCm] = useState<number>(20);
  const [breadthCm, setBreadthCm] = useState<number>(15);
  const [heightCm, setHeightCm] = useState<number>(10);
  const [items, setItems] = useState<OrderItem[]>([]);

  // Product search
  const [productSearch, setProductSearch] = useState('');

  useEffect(() => {
    fetchCustomers();
    fetchProducts();
    fetchLocations();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/invoices?getCustomers=true');
      // Fallback: try the customers endpoint
      const res2 = await fetch('/api/settings?section=customers');
      const data = await res2.json();
      setCustomers(data.customers || []);
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

  const handleCustomerSelect = (id: string) => {
    setCustomerId(id);
    const customer = customers.find((c) => c.id === id);
    if (customer) {
      setShippingName(customer.name || '');
      setShippingPhone(customer.phone || '');
      setShippingEmail(customer.email || '');
      setShippingAddress(customer.address || '');
      setShippingCity(customer.city || '');
      setShippingState(customer.state || '');
      setShippingPincode(customer.pincode || '');
    }
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
          quantity: 1,
          unitPrice: Number(product.salePrice || product.modalPrice || 0),
          discount: 0,
          taxRate: Number(product.gstRate || 18),
        },
      ]);
    } else {
      setItems([
        ...items,
        {
          productName: '',
          quantity: 1,
          unitPrice: 0,
          discount: 0,
          taxRate: 18,
        },
      ]);
    }
    setProductSearch('');
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof OrderItem, value: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    setItems(updated);
  };

  const getSubtotal = () => items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const getTotalDiscount = () => items.reduce((sum, i) => sum + i.discount, 0);
  const getTotalTax = () =>
    items.reduce((sum, i) => {
      const taxable = i.quantity * i.unitPrice - i.discount;
      return sum + (taxable * i.taxRate) / 100;
    }, 0);
  const getTotal = () => getSubtotal() - getTotalDiscount() + getTotalTax();

  const handleSubmit = async () => {
    if (!shippingName || !shippingPhone || !shippingAddress || !shippingCity || !shippingState || !shippingPincode) {
      alert('Please fill all shipping details');
      return;
    }
    if (items.length === 0) {
      alert('Please add at least one item');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customerId || undefined,
          shippingName,
          shippingPhone,
          shippingEmail,
          shippingAddress,
          shippingCity,
          shippingState,
          shippingPincode,
          isCOD,
          paymentMode: paymentMode || undefined,
          sourceLocationId: sourceLocationId || undefined,
          notes,
          weightGrams,
          lengthCm,
          breadthCm,
          heightCm,
          items,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/orders/${data.order.id}`);
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to create order');
      }
    } catch (err) {
      alert('Failed to create order');
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
          <h1 className="text-3xl font-bold">New Order</h1>
          <p className="text-foreground/50">Create a new sales order</p>
        </div>
      </div>

      {/* Customer Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Customer</CardTitle>
        </CardHeader>
        <CardContent>
          <StyledSelect
            label="Select Customer (optional)"
            value={customerId}
            onChange={(v) => { setCustomerId(v); handleCustomerSelect(v); }}
            options={[
              { value: '', label: 'Walk-in Customer' },
              ...customers.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />
        </CardContent>
      </Card>

      {/* Shipping Address */}
      <Card>
        <CardHeader>
          <CardTitle>Shipping Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormRow columns={2}>
            <StyledInput label="Full Name *" value={shippingName} onChange={setShippingName} required />
            <StyledInput label="Phone *" value={shippingPhone} onChange={setShippingPhone} required />
          </FormRow>
          <StyledInput label="Email" value={shippingEmail} onChange={setShippingEmail} />
          <StyledInput label="Address *" value={shippingAddress} onChange={setShippingAddress} required />
          <FormRow columns={3}>
            <StyledInput label="City *" value={shippingCity} onChange={setShippingCity} required />
            <StyledInput label="State *" value={shippingState} onChange={setShippingState} required />
            <StyledInput label="Pincode *" value={shippingPincode} onChange={setShippingPincode} required />
          </FormRow>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
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
                      <div className="text-sm text-foreground/50">{p.sku} | Stock: {p.quantity}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">₹{Number(p.salePrice || 0).toLocaleString('en-IN')}</div>
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
                    <th className="px-4 py-3 text-right w-20">Qty</th>
                    <th className="px-4 py-3 text-right w-28">Price</th>
                    <th className="px-4 py-3 text-right w-24">Tax %</th>
                    <th className="px-4 py-3 text-right w-28">Total</th>
                    <th className="px-4 py-3 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => {
                    const lineTotal = item.quantity * item.unitPrice - item.discount +
                      ((item.quantity * item.unitPrice - item.discount) * item.taxRate) / 100;
                    return (
                      <tr key={idx} className="border-t">
                        <td className="px-4 py-3">
                          <Input
                            value={item.productName}
                            onChange={(e) => updateItem(idx, 'productName', e.target.value)}
                            placeholder="Product name"
                            className="h-9"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 0)}
                            min={1}
                            className="h-9 text-right"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="h-9 text-right"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            value={item.taxRate}
                            onChange={(e) => updateItem(idx, 'taxRate', parseFloat(e.target.value) || 0)}
                            className="h-9 text-right"
                          />
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          ₹{lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3">
                          <Button variant="ghost" size="sm" onClick={() => removeItem(idx)}>
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
                  <span>₹{getSubtotal().toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/60">Tax</span>
                  <span>₹{getTotalTax().toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-bold text-base border-t pt-2">
                  <span>Total</span>
                  <span>₹{getTotal().toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment & Shipping */}
      <Card>
        <CardHeader>
          <CardTitle>Payment & Package</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormRow columns={3}>
            <StyledSelect
              label="Payment Mode"
              value={paymentMode}
              onChange={setPaymentMode}
              options={[
                { value: '', label: 'Select...' },
                { value: 'CASH', label: 'Cash' },
                { value: 'UPI', label: 'UPI' },
                { value: 'CARD', label: 'Card' },
                { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
                { value: 'CREDIT', label: 'Credit' },
              ]}
            />
            <div className="flex items-end gap-2 pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isCOD}
                  onChange={(e) => setIsCOD(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="font-medium">Cash on Delivery (COD)</span>
              </label>
            </div>
            <StyledSelect
              label="Source Location"
              value={sourceLocationId}
              onChange={setSourceLocationId}
              options={[
                { value: '', label: 'Default' },
                ...locations.map((l: any) => ({ value: l.id, label: l.name })),
              ]}
            />
          </FormRow>
          <FormRow columns={4}>
            <StyledInput label="Weight (grams)" type="number" value={String(weightGrams)} onChange={(v) => setWeightGrams(parseInt(v) || 0)} />
            <StyledInput label="Length (cm)" type="number" value={String(lengthCm)} onChange={(v) => setLengthCm(parseInt(v) || 0)} />
            <StyledInput label="Breadth (cm)" type="number" value={String(breadthCm)} onChange={(v) => setBreadthCm(parseInt(v) || 0)} />
            <StyledInput label="Height (cm)" type="number" value={String(heightCm)} onChange={(v) => setHeightCm(parseInt(v) || 0)} />
          </FormRow>
          <StyledInput label="Notes" value={notes} onChange={setNotes} />
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
            'Create Order'
          )}
        </Button>
      </div>
    </div>
  );
}
