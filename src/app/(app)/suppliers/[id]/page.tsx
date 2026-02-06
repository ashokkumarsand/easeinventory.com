'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Building2,
  Loader2,
  Mail,
  MapPin,
  Package,
  Phone,
  Plus,
  Search,
  Shield,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SupplierDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [supplier, setSupplier] = useState<any>(null);
  const [productSuppliers, setProductSuppliers] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Add product dialog
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [addForm, setAddForm] = useState({
    unitCost: '',
    leadTimeDays: '',
    moq: '1',
    priority: 'BACKUP',
    supplierSku: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchSupplierDetails();
      fetchPerformance();
    }
  }, [id]);

  const fetchSupplierDetails = async () => {
    setIsLoading(true);
    try {
      const [supRes, psRes] = await Promise.all([
        fetch(`/api/suppliers/${id}`),
        fetch(`/api/suppliers/${id}`), // We'll use the supplier API response
      ]);

      if (supRes.ok) {
        const supData = await supRes.json();
        setSupplier(supData.supplier || supData);
      }

      // Fetch products linked to this supplier
      const allProducts = await fetch('/api/products?limit=1000');
      if (allProducts.ok) {
        const prodData = await allProducts.json();
        setProducts(prodData.products || []);
      }
    } catch (err) {
      console.error('Failed to fetch supplier:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPerformance = async () => {
    try {
      const [metricsRes] = await Promise.all([
        fetch(`/api/analytics/supplier-performance/${id}?days=90`),
      ]);
      if (metricsRes.ok) {
        const data = await metricsRes.json();
        setMetrics(data);
      }
    } catch (err) {
      console.error('Failed to fetch supplier performance:', err);
    }
  };

  const fetchProductSuppliers = async () => {
    // We need to fetch from each product that has this supplier
    // Instead, let's search through products
    try {
      const res = await fetch('/api/products?limit=1000');
      if (!res.ok) return;
      const data = await res.json();
      const allProducts = data.products || [];

      const linked: any[] = [];
      for (const prod of allProducts) {
        const psRes = await fetch(`/api/products/${prod.id}/suppliers`);
        if (psRes.ok) {
          const psData = await psRes.json();
          const match = (psData.productSuppliers || []).find((ps: any) => ps.supplierId === id);
          if (match) {
            linked.push({ ...match, product: prod });
          }
        }
      }
      setProductSuppliers(linked);
    } catch (err) {
      console.error('Failed to fetch product-suppliers:', err);
    }
  };

  useEffect(() => {
    if (id && supplier) {
      fetchProductSuppliers();
    }
  }, [id, supplier]);

  const handleAddProduct = async () => {
    if (!selectedProduct || !addForm.unitCost || !addForm.leadTimeDays) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/products/${selectedProduct}/suppliers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: id,
          unitCost: parseFloat(addForm.unitCost),
          leadTimeDays: parseInt(addForm.leadTimeDays),
          moq: parseInt(addForm.moq) || 1,
          priority: addForm.priority,
          supplierSku: addForm.supplierSku || null,
        }),
      });

      if (res.ok) {
        setShowAddDialog(false);
        setSelectedProduct('');
        setAddForm({ unitCost: '', leadTimeDays: '', moq: '1', priority: 'BACKUP', supplierSku: '' });
        fetchProductSuppliers();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to add product');
      }
    } catch (err) {
      alert('Error adding product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveProduct = async (productId: string) => {
    if (!confirm('Remove this product from the supplier?')) return;
    try {
      await fetch(`/api/products/${productId}/suppliers/${id}`, { method: 'DELETE' });
      fetchProductSuppliers();
    } catch (err) {
      console.error('Failed to remove product:', err);
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'PREFERRED': return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Preferred</Badge>;
      case 'BACKUP': return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Backup</Badge>;
      case 'EMERGENCY': return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Emergency</Badge>;
      default: return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return '';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const filteredProducts = products.filter(p =>
    !productSuppliers.some(ps => ps.product?.id === p.id) &&
    (p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
     (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase())))
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="text-center py-20">
        <p className="text-foreground/50">Supplier not found</p>
        <Button variant="link" onClick={() => router.push('/suppliers')}>Back to Suppliers</Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <Link href="/suppliers" className="flex items-center gap-2 text-sm text-foreground/50 hover:text-foreground mb-4 transition-colors">
            <ArrowLeft size={16} /> Back to Suppliers
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Building2 size={22} strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight font-heading">{supplier.name}</h1>
          </div>
          {supplier.city && (
            <p className="text-foreground/40 font-bold ml-1 flex items-center gap-1">
              <MapPin size={14} /> {supplier.city}{supplier.state ? `, ${supplier.state}` : ''}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Link href="/suppliers/performance">
            <Button variant="secondary" className="font-bold rounded-full gap-2">
              <Shield size={16} /> Performance Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Supplier Info + Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Info */}
        <Card className="modern-card">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-foreground/60">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {supplier.contactPerson && (
              <div className="flex items-center gap-2 text-sm">
                <Building2 size={14} className="text-foreground/40" />
                <span>{supplier.contactPerson}</span>
              </div>
            )}
            {supplier.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail size={14} className="text-foreground/40" />
                <span>{supplier.email}</span>
              </div>
            )}
            {supplier.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone size={14} className="text-foreground/40" />
                <span>{supplier.phone}</span>
              </div>
            )}
            {supplier.gstNumber && (
              <div className="mt-3">
                <Badge variant="secondary" className="font-mono text-xs">GST: {supplier.gstNumber}</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card className="modern-card">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-foreground/60">Performance (Last 90 days)</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics && metrics.completedPOs > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground">Reliability</p>
                  <p className={`text-2xl font-black ${getScoreColor(metrics.reliabilityScore)}`}>
                    {metrics.reliabilityScore.toFixed(1)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground">Avg Lead Time</p>
                  <p className="text-2xl font-black">
                    {metrics.avgLeadTimeDays !== null ? `${metrics.avgLeadTimeDays}d` : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground">On-Time</p>
                  <p className={`text-2xl font-black ${getScoreColor(metrics.onTimeRate)}`}>
                    {metrics.onTimeRate !== null ? `${metrics.onTimeRate}%` : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground">Quality</p>
                  <p className={`text-2xl font-black ${getScoreColor(metrics.qualityScore)}`}>
                    {metrics.qualityScore !== null ? `${metrics.qualityScore}%` : '—'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-24 flex items-center justify-center text-foreground/30">
                No completed POs — metrics will appear after goods receipts
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Products Supplied */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black tracking-tight">Products Supplied</h2>
          <Button className="font-bold rounded-full gap-2" onClick={() => setShowAddDialog(true)}>
            <Plus size={16} /> Add Product
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            {productSuppliers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-foreground/10">
                      <th className="text-left py-3 px-2 font-semibold text-foreground/60">Product</th>
                      <th className="text-left py-3 px-2 font-semibold text-foreground/60">SKU</th>
                      <th className="text-center py-3 px-2 font-semibold text-foreground/60">Priority</th>
                      <th className="text-right py-3 px-2 font-semibold text-foreground/60">Unit Cost</th>
                      <th className="text-right py-3 px-2 font-semibold text-foreground/60">MOQ</th>
                      <th className="text-right py-3 px-2 font-semibold text-foreground/60">Lead Time</th>
                      <th className="text-center py-3 px-2 font-semibold text-foreground/60">Status</th>
                      <th className="text-center py-3 px-2 font-semibold text-foreground/60">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productSuppliers.map((ps: any) => (
                      <tr key={ps.id} className="border-b border-foreground/5 hover:bg-accent/50 transition-colors">
                        <td className="py-3 px-2 font-semibold">{ps.product?.name || ps.supplierProductName || '—'}</td>
                        <td className="py-3 px-2 text-foreground/50 font-mono text-xs">{ps.supplierSku || ps.product?.sku || '—'}</td>
                        <td className="py-3 px-2 text-center">{getPriorityBadge(ps.priority)}</td>
                        <td className="py-3 px-2 text-right font-mono">
                          {ps.unitCost ? `₹${Number(ps.unitCost).toLocaleString('en-IN')}` : '—'}
                        </td>
                        <td className="py-3 px-2 text-right">{ps.moq}</td>
                        <td className="py-3 px-2 text-right">{ps.leadTimeDays}d</td>
                        <td className="py-3 px-2 text-center">
                          <Badge variant={ps.isActive ? 'default' : 'secondary'} className={ps.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}>
                            {ps.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={() => handleRemoveProduct(ps.product?.id || ps.productId)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="h-32 flex flex-col items-center justify-center gap-3 text-foreground/30">
                <Package size={32} />
                <p>No products linked to this supplier yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Product Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Product to Supplier</DialogTitle>
            <DialogDescription>Link a product with supplier-specific pricing and terms</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Product Search */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Product</Label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" />
                <Input
                  placeholder="Search products..."
                  className="pl-9"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
              </div>
              {productSearch && filteredProducts.length > 0 && (
                <div className="border rounded-lg max-h-40 overflow-y-auto">
                  {filteredProducts.slice(0, 10).map(p => (
                    <div
                      key={p.id}
                      className={`px-3 py-2 cursor-pointer hover:bg-accent text-sm ${selectedProduct === p.id ? 'bg-primary/10' : ''}`}
                      onClick={() => { setSelectedProduct(p.id); setProductSearch(p.name); }}
                    >
                      <span className="font-medium">{p.name}</span>
                      {p.sku && <span className="text-foreground/40 ml-2 text-xs">{p.sku}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Unit Cost (₹) <span className="text-destructive">*</span></Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={addForm.unitCost}
                  onChange={(e) => setAddForm({ ...addForm, unitCost: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Lead Time (days) <span className="text-destructive">*</span></Label>
                <Input
                  type="number"
                  placeholder="7"
                  value={addForm.leadTimeDays}
                  onChange={(e) => setAddForm({ ...addForm, leadTimeDays: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">MOQ</Label>
                <Input
                  type="number"
                  placeholder="1"
                  value={addForm.moq}
                  onChange={(e) => setAddForm({ ...addForm, moq: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Priority</Label>
                <Select value={addForm.priority} onValueChange={(v) => setAddForm({ ...addForm, priority: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PREFERRED">Preferred</SelectItem>
                    <SelectItem value="BACKUP">Backup</SelectItem>
                    <SelectItem value="EMERGENCY">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Supplier SKU</Label>
              <Input
                placeholder="Supplier's product code (optional)"
                value={addForm.supplierSku}
                onChange={(e) => setAddForm({ ...addForm, supplierSku: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddProduct} disabled={isSubmitting || !selectedProduct || !addForm.unitCost || !addForm.leadTimeDays}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
