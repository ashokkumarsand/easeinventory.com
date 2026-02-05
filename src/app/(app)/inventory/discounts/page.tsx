'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useDisclosure } from '@/hooks/useDisclosure';
import {
  Calendar,
  Edit,
  Loader2,
  Percent,
  Plus,
  Tag,
  Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface BlanketDiscount {
  id: string;
  name: string;
  description: string | null;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  scope: 'ALL' | 'CATEGORY' | 'SUPPLIER' | 'BRAND';
  scopeId: string | null;
  scopeName?: string | null;
  minQuantity: number | null;
  minOrderValue: number | null;
  maxUsageCount: number | null;
  usageCount: number;
  startDate: string;
  endDate: string | null;
  priority: number;
  isActive: boolean;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
}

interface Supplier {
  id: string;
  name: string;
}

const SCOPE_OPTIONS = [
  { key: 'ALL', label: 'All Products' },
  { key: 'CATEGORY', label: 'Specific Category' },
  { key: 'SUPPLIER', label: 'Specific Supplier' },
  { key: 'BRAND', label: 'Specific Brand' },
];

export default function DiscountsPage() {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [discounts, setDiscounts] = useState<BlanketDiscount[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    discountValue: '',
    scope: 'ALL' as 'ALL' | 'CATEGORY' | 'SUPPLIER' | 'BRAND',
    scopeId: '',
    minQuantity: '',
    minOrderValue: '',
    maxUsageCount: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    priority: '0',
    isActive: true,
  });

  const fetchDiscounts = async () => {
    try {
      const response = await fetch('/api/discounts');
      if (response.ok) {
        const data = await response.json();
        setDiscounts(data.discounts || []);
      }
    } catch (error) {
      console.error('Failed to fetch discounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers');
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data.suppliers || data || []);
      }
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
    }
  };

  useEffect(() => {
    fetchDiscounts();
    fetchCategories();
    fetchSuppliers();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      discountType: 'PERCENTAGE',
      discountValue: '',
      scope: 'ALL',
      scopeId: '',
      minQuantity: '',
      minOrderValue: '',
      maxUsageCount: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      priority: '0',
      isActive: true,
    });
    setEditingId(null);
  };

  const handleEdit = (discount: BlanketDiscount) => {
    setEditingId(discount.id);
    setFormData({
      name: discount.name,
      description: discount.description || '',
      discountType: discount.discountType,
      discountValue: discount.discountValue.toString(),
      scope: discount.scope,
      scopeId: discount.scopeId || '',
      minQuantity: discount.minQuantity?.toString() || '',
      minOrderValue: discount.minOrderValue?.toString() || '',
      maxUsageCount: discount.maxUsageCount?.toString() || '',
      startDate: new Date(discount.startDate).toISOString().split('T')[0],
      endDate: discount.endDate ? new Date(discount.endDate).toISOString().split('T')[0] : '',
      priority: discount.priority.toString(),
      isActive: discount.isActive,
    });
    onOpen();
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.discountValue || !formData.startDate) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description || null,
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        scope: formData.scope,
        scopeId: formData.scope === 'ALL' ? null : formData.scopeId || null,
        minQuantity: formData.minQuantity ? parseInt(formData.minQuantity) : null,
        minOrderValue: formData.minOrderValue ? parseFloat(formData.minOrderValue) : null,
        maxUsageCount: formData.maxUsageCount ? parseInt(formData.maxUsageCount) : null,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        priority: parseInt(formData.priority) || 0,
        isActive: formData.isActive,
      };

      const url = editingId ? `/api/discounts/${editingId}` : '/api/discounts';
      const method = editingId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        fetchDiscounts();
        resetForm();
        onClose();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to save discount');
      }
    } catch (error) {
      console.error('Save discount error:', error);
      alert('Failed to save discount');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this discount?')) return;

    try {
      const response = await fetch(`/api/discounts/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchDiscounts();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to delete discount');
      }
    } catch (error) {
      console.error('Delete discount error:', error);
      alert('Failed to delete discount');
    }
  };

  const handleToggleActive = async (discount: BlanketDiscount) => {
    try {
      const response = await fetch(`/api/discounts/${discount.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !discount.isActive }),
      });

      if (response.ok) {
        fetchDiscounts();
      }
    } catch (error) {
      console.error('Toggle discount error:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const isDiscountActive = (discount: BlanketDiscount) => {
    if (!discount.isActive) return false;
    const now = new Date();
    const start = new Date(discount.startDate);
    const end = discount.endDate ? new Date(discount.endDate) : null;
    return now >= start && (!end || now <= end);
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
              <Tag size={22} strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-black tracking-tight">Blanket Discounts</h1>
          </div>
          <p className="text-black/40 dark:text-white/40 font-bold ml-1">
            Create and manage inventory-wide discounts
          </p>
        </div>
        <Button
          className="font-black rounded-2xl"
          onClick={() => {
            resetForm();
            onOpen();
          }}
        >
          <Plus size={18} className="mr-2" />
          Create Discount
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border border-soft p-6 rounded-lg">
          <CardContent className="p-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">Total Discounts</p>
            <h2 className="text-4xl font-bold text-primary">{discounts.length}</h2>
          </CardContent>
        </Card>
        <Card className="bg-card border border-soft p-6 rounded-lg">
          <CardContent className="p-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">Active Now</p>
            <h2 className="text-4xl font-bold text-success">{discounts.filter(isDiscountActive).length}</h2>
          </CardContent>
        </Card>
        <Card className="bg-card border border-soft p-6 rounded-lg">
          <CardContent className="p-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">Total Usage</p>
            <h2 className="text-4xl font-bold text-warning">{discounts.reduce((sum, d) => sum + d.usageCount, 0)}</h2>
          </CardContent>
        </Card>
      </div>

      {/* Discounts Table */}
      <Card className="bg-card border border-soft overflow-hidden rounded-lg">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-soft">
                  <th className="bg-transparent h-14 font-semibold uppercase tracking-wider text-xs text-muted px-6 text-left">DISCOUNT</th>
                  <th className="bg-transparent h-14 font-semibold uppercase tracking-wider text-xs text-muted px-6 text-left">TYPE</th>
                  <th className="bg-transparent h-14 font-semibold uppercase tracking-wider text-xs text-muted px-6 text-left">SCOPE</th>
                  <th className="bg-transparent h-14 font-semibold uppercase tracking-wider text-xs text-muted px-6 text-left">VALIDITY</th>
                  <th className="bg-transparent h-14 font-semibold uppercase tracking-wider text-xs text-muted px-6 text-left">USAGE</th>
                  <th className="bg-transparent h-14 font-semibold uppercase tracking-wider text-xs text-muted px-6 text-left">STATUS</th>
                  <th className="bg-transparent h-14 font-semibold uppercase tracking-wider text-xs text-muted px-6 text-left">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                    </td>
                  </tr>
                ) : discounts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      No discounts created yet
                    </td>
                  </tr>
                ) : (
                  discounts.map((discount) => (
                    <tr key={discount.id} className="border-b border-soft last:border-none hover:bg-card transition-colors">
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-bold">{discount.name}</p>
                          {discount.description && (
                            <p className="text-xs opacity-50 truncate max-w-[200px]">{discount.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <Badge
                          variant="secondary"
                          className={discount.discountType === 'PERCENTAGE' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}
                        >
                          {discount.discountType === 'PERCENTAGE' && <Percent size={12} className="mr-1" />}
                          {discount.discountType === 'PERCENTAGE'
                            ? `${discount.discountValue}%`
                            : `₹${discount.discountValue}`}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="text-xs font-bold">
                            {SCOPE_OPTIONS.find(s => s.key === discount.scope)?.label}
                          </p>
                          {discount.scopeName && (
                            <p className="text-[10px] opacity-50">{discount.scopeName}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1 text-[10px]">
                          <Calendar size={12} className="opacity-40" />
                          <span>{formatDate(discount.startDate)}</span>
                          {discount.endDate && (
                            <>
                              <span className="opacity-30">-</span>
                              <span>{formatDate(discount.endDate)}</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm font-bold">
                          {discount.usageCount}
                          {discount.maxUsageCount && ` / ${discount.maxUsageCount}`}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <Switch
                          checked={discount.isActive}
                          onCheckedChange={() => handleToggleActive(discount)}
                          className={isDiscountActive(discount) ? 'data-[state=checked]:bg-success' : ''}
                        />
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(discount)}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(discount.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border border-soft rounded-2xl">
          <DialogHeader className="border-b border-soft pb-4">
            <DialogTitle className="text-xl font-bold">
              {editingId ? 'Edit Discount' : 'Create Blanket Discount'}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted">
              {editingId ? 'Update the discount details below' : 'Set up a new discount rule for your inventory'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Info Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Discount Name *</Label>
                  <Input
                    placeholder="e.g., Summer Sale"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Discount Type</Label>
                  <Select
                    value={formData.discountType}
                    onValueChange={(value) => setFormData({ ...formData, discountType: value as 'PERCENTAGE' | 'FIXED' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                      <SelectItem value="FIXED">Fixed Amount (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{formData.discountType === 'PERCENTAGE' ? 'Discount Value (%) *' : 'Discount Value (₹) *'}</Label>
                  <Input
                    type="number"
                    placeholder={formData.discountType === 'PERCENTAGE' ? '10' : '100'}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Higher priority wins when multiple discounts apply</p>
                </div>
              </div>
            </div>

            {/* Scope Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Scope & Targeting</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Applies To</Label>
                  <Select
                    value={formData.scope}
                    onValueChange={(value) => setFormData({ ...formData, scope: value as typeof formData.scope, scopeId: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select scope" />
                    </SelectTrigger>
                    <SelectContent>
                      {SCOPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.key} value={opt.key}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.scope === 'CATEGORY' && (
                  <div className="space-y-2">
                    <Label>Select Category</Label>
                    <Select
                      value={formData.scopeId}
                      onValueChange={(value) => setFormData({ ...formData, scopeId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formData.scope === 'SUPPLIER' && (
                  <div className="space-y-2">
                    <Label>Select Supplier</Label>
                    <Select
                      value={formData.scopeId}
                      onValueChange={(value) => setFormData({ ...formData, scopeId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((sup) => (
                          <SelectItem key={sup.id} value={sup.id}>{sup.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formData.scope === 'BRAND' && (
                  <div className="space-y-2">
                    <Label>Brand Name</Label>
                    <Input
                      placeholder="e.g., Samsung"
                      value={formData.scopeId}
                      onChange={(e) => setFormData({ ...formData, scopeId: e.target.value })}
                    />
                  </div>
                )}

                {formData.scope === 'ALL' && (
                  <div className="flex items-end">
                    <p className="text-sm text-muted pb-2">This discount will apply to all products</p>
                  </div>
                )}
              </div>
            </div>

            {/* Validity Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Validity Period</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    placeholder="Optional - leave empty for no end date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Optional - describe this discount for internal reference..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>

            {/* Conditions Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Conditions (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Min Quantity</Label>
                  <Input
                    type="number"
                    placeholder="No minimum"
                    value={formData.minQuantity}
                    onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Min Order Value (₹)</Label>
                  <Input
                    type="number"
                    placeholder="No minimum"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Usage Count</Label>
                  <Input
                    type="number"
                    placeholder="Unlimited"
                    value={formData.maxUsageCount}
                    onChange={(e) => setFormData({ ...formData, maxUsageCount: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-soft">
              <div>
                <p className="font-semibold">Discount Status</p>
                <p className="text-sm text-muted">Enable or disable this discount</p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                className="data-[state=checked]:bg-success"
              />
            </div>
          </div>

          <DialogFooter className="border-t border-soft pt-4">
            <Button variant="secondary" onClick={onClose} className="font-semibold">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving} className="font-semibold">
              {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editingId ? 'Update' : 'Create'} Discount
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
