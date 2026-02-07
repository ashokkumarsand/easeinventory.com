'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Loader2, Plus, Search, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface BOMItemRow {
  componentProductId: string;
  productName: string;
  sku: string;
  unit: string;
  costPrice: number;
  quantity: number;
  wastagePercent: number;
  notes: string;
}

export default function NewBOMPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  // BOM fields
  const [productId, setProductId] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<BOMItemRow[]>([]);

  // Component search
  const [componentSearch, setComponentSearch] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      setProducts(data.products || []);
    } catch {}
  };

  const selectFinishedProduct = (product: any) => {
    setProductId(product.id);
    setSelectedProduct(product);
    setProductSearch('');
  };

  const addComponent = (product: any) => {
    // Prevent self-reference
    if (product.id === productId) {
      alert('A product cannot be a component of itself');
      return;
    }
    // Prevent duplicates
    if (items.some((i) => i.componentProductId === product.id)) {
      alert('This component is already added');
      return;
    }
    setItems([
      ...items,
      {
        componentProductId: product.id,
        productName: product.name,
        sku: product.sku || '',
        unit: product.unit || 'pcs',
        costPrice: Number(product.costPrice || 0),
        quantity: 1,
        wastagePercent: 0,
        notes: '',
      },
    ]);
    setComponentSearch('');
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof BOMItemRow, value: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    setItems(updated);
  };

  const getLineCost = (item: BOMItemRow) => {
    return item.quantity * item.costPrice * (1 + item.wastagePercent / 100);
  };

  const getTotalCost = () =>
    items.reduce((sum, item) => sum + getLineCost(item), 0);

  const handleSubmit = async (status: 'DRAFT' | 'ACTIVE') => {
    if (!productId) {
      alert('Please select a finished product');
      return;
    }
    if (items.length === 0) {
      alert('Please add at least one component');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/bom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          name: name || undefined,
          description: description || undefined,
          status,
          items: items.map((item) => ({
            componentProductId: item.componentProductId,
            quantity: item.quantity,
            wastagePercent: item.wastagePercent,
            notes: item.notes || undefined,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/bom/${data.bom.id}`);
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to create BOM');
      }
    } catch {
      alert('Failed to create BOM');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      productSearch &&
      (p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.sku?.toLowerCase().includes(productSearch.toLowerCase())),
  );

  const filteredComponents = products.filter(
    (p) =>
      componentSearch &&
      p.id !== productId &&
      (p.name?.toLowerCase().includes(componentSearch.toLowerCase()) ||
        p.sku?.toLowerCase().includes(componentSearch.toLowerCase())),
  );

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">New Bill of Materials</h1>
          <p className="text-foreground/50">Define which components make up a finished product</p>
        </div>
      </div>

      {/* Finished Product Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Finished Product</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedProduct ? (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">{selectedProduct.name}</p>
                <p className="text-sm text-foreground/60">
                  SKU: {selectedProduct.sku || 'N/A'} &middot; Unit: {selectedProduct.unit}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setProductId('');
                  setSelectedProduct(null);
                }}
              >
                Change
              </Button>
            </div>
          ) : (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/40" />
              <Input
                placeholder="Search for the finished product (name or SKU)..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="pl-10"
              />
              {filteredProducts.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-background border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredProducts.slice(0, 10).map((p) => (
                    <button
                      key={p.id}
                      className="w-full text-left px-4 py-2 hover:bg-muted flex justify-between items-center"
                      onClick={() => selectFinishedProduct(p)}
                    >
                      <span>
                        <span className="font-medium">{p.name}</span>
                        {p.sku && (
                          <span className="text-foreground/50 text-sm ml-2">{p.sku}</span>
                        )}
                      </span>
                      <span className="text-sm text-foreground/50">
                        Stock: {p.quantity} {p.unit}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground/70 mb-1 block">
                BOM Name (optional)
              </label>
              <Input
                placeholder="e.g., Standard Kit Assembly"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/70 mb-1 block">
                Description (optional)
              </label>
              <Input
                placeholder="Brief description of this BOM"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Components */}
      <Card>
        <CardHeader>
          <CardTitle>Components</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add component search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <Input
              placeholder="Search to add a component product..."
              value={componentSearch}
              onChange={(e) => setComponentSearch(e.target.value)}
              className="pl-10"
            />
            {filteredComponents.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-background border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredComponents.slice(0, 10).map((p) => (
                  <button
                    key={p.id}
                    className="w-full text-left px-4 py-2 hover:bg-muted flex justify-between items-center"
                    onClick={() => addComponent(p)}
                  >
                    <span>
                      <span className="font-medium">{p.name}</span>
                      {p.sku && (
                        <span className="text-foreground/50 text-sm ml-2">{p.sku}</span>
                      )}
                    </span>
                    <span className="text-sm text-foreground/50">
                      Cost: {'\u20B9'}{Number(p.costPrice).toLocaleString('en-IN')} &middot; Stock: {p.quantity}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Items table */}
          {items.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-foreground/60">
                    <th className="text-left py-2 pr-4">Component</th>
                    <th className="text-left py-2 pr-4">SKU</th>
                    <th className="text-right py-2 pr-4 w-24">Qty</th>
                    <th className="text-right py-2 pr-4 w-24">Wastage %</th>
                    <th className="text-right py-2 pr-4">Unit Cost</th>
                    <th className="text-right py-2 pr-4">Line Cost</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 pr-4">
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-xs text-foreground/50">{item.unit}</p>
                      </td>
                      <td className="py-2 pr-4 text-foreground/70">{item.sku || '\u2014'}</td>
                      <td className="py-2 pr-4">
                        <Input
                          type="number"
                          min={0.01}
                          step={0.01}
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(index, 'quantity', parseFloat(e.target.value) || 0)
                          }
                          className="w-24 text-right"
                        />
                      </td>
                      <td className="py-2 pr-4">
                        <Input
                          type="number"
                          min={0}
                          step={0.1}
                          value={item.wastagePercent}
                          onChange={(e) =>
                            updateItem(index, 'wastagePercent', parseFloat(e.target.value) || 0)
                          }
                          className="w-24 text-right"
                        />
                      </td>
                      <td className="py-2 pr-4 text-right text-foreground/70">
                        {'\u20B9'}{item.costPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 pr-4 text-right font-medium">
                        {'\u20B9'}{getLineCost(item).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Totals */}
          {items.length > 0 && (
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/60">Total Component Cost</span>
                  <span className="font-medium">
                    {'\u20B9'}{getTotalCost().toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t pt-2">
                  <span>Cost Per Kit</span>
                  <span>
                    {'\u20B9'}{getTotalCost().toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          )}

          {items.length === 0 && (
            <div className="text-center py-8 text-foreground/40">
              <Plus className="w-8 h-8 mx-auto mb-2" />
              <p>Search above to add component products</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.back()} disabled={isSaving}>
          Cancel
        </Button>
        <Button
          variant="outline"
          onClick={() => handleSubmit('DRAFT')}
          disabled={isSaving}
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Save as Draft
        </Button>
        <Button onClick={() => handleSubmit('ACTIVE')} disabled={isSaving}>
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Save as Active
        </Button>
      </div>
    </div>
  );
}
