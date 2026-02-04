'use client';

import {
  Button,
  Card,
  CardBody,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Spinner,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
  useDisclosure,
} from '@heroui/react';
import {
  Calendar,
  Edit,
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
          color="primary"
          className="font-black rounded-2xl"
          startContent={<Plus size={18} />}
          onClick={() => {
            resetForm();
            onOpen();
          }}
        >
          Create Discount
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="modern-card p-6 border border-black/5 dark:border-white/10" radius="lg">
          <CardBody className="p-0">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Total Discounts</p>
            <h2 className="text-4xl font-black text-primary">{discounts.length}</h2>
          </CardBody>
        </Card>
        <Card className="modern-card p-6 border border-black/5 dark:border-white/10" radius="lg">
          <CardBody className="p-0">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Active Now</p>
            <h2 className="text-4xl font-black text-success">{discounts.filter(isDiscountActive).length}</h2>
          </CardBody>
        </Card>
        <Card className="modern-card p-6 border border-black/5 dark:border-white/10" radius="lg">
          <CardBody className="p-0">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Total Usage</p>
            <h2 className="text-4xl font-black text-warning">{discounts.reduce((sum, d) => sum + d.usageCount, 0)}</h2>
          </CardBody>
        </Card>
      </div>

      {/* Discounts Table */}
      <Card className="modern-card" radius="lg">
        <CardBody className="p-0">
          <Table
            aria-label="Blanket Discounts"
            classNames={{
              wrapper: 'p-0 bg-transparent shadow-none',
              th: 'bg-black/[0.02] dark:bg-white/[0.02] h-14 font-black uppercase tracking-wider text-[10px] opacity-40 px-6',
              td: 'py-4 px-6',
            }}
          >
            <TableHeader>
              <TableColumn>DISCOUNT</TableColumn>
              <TableColumn>TYPE</TableColumn>
              <TableColumn>SCOPE</TableColumn>
              <TableColumn>VALIDITY</TableColumn>
              <TableColumn>USAGE</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody
              isLoading={isLoading}
              loadingContent={<Spinner color="primary" />}
              emptyContent="No discounts created yet"
            >
              {discounts.map((discount) => (
                <TableRow key={discount.id}>
                  <TableCell>
                    <div>
                      <p className="font-bold">{discount.name}</p>
                      {discount.description && (
                        <p className="text-xs opacity-50 truncate max-w-[200px]">{discount.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      variant="flat"
                      color={discount.discountType === 'PERCENTAGE' ? 'primary' : 'secondary'}
                      startContent={discount.discountType === 'PERCENTAGE' ? <Percent size={12} /> : null}
                    >
                      {discount.discountType === 'PERCENTAGE'
                        ? `${discount.discountValue}%`
                        : `₹${discount.discountValue}`}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-xs font-bold">
                        {SCOPE_OPTIONS.find(s => s.key === discount.scope)?.label}
                      </p>
                      {discount.scopeName && (
                        <p className="text-[10px] opacity-50">{discount.scopeName}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-[10px]">
                      <Calendar size={12} className="opacity-40" />
                      <span>{formatDate(discount.startDate)}</span>
                      {discount.endDate && (
                        <>
                          <span className="opacity-30">→</span>
                          <span>{formatDate(discount.endDate)}</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-bold">
                      {discount.usageCount}
                      {discount.maxUsageCount && ` / ${discount.maxUsageCount}`}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Switch
                      size="sm"
                      isSelected={discount.isActive}
                      onValueChange={() => handleToggleActive(discount)}
                      color={isDiscountActive(discount) ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onClick={() => handleEdit(discount)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        onClick={() => handleDelete(discount.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Create/Edit Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="font-black">
                {editingId ? 'Edit Discount' : 'Create Blanket Discount'}
              </ModalHeader>
              <ModalBody className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Discount Name"
                    placeholder="e.g., Summer Sale"
                    value={formData.name}
                    onValueChange={(v) => setFormData({ ...formData, name: v })}
                    isRequired
                  />
                  <Select
                    label="Discount Type"
                    selectedKeys={[formData.discountType]}
                    onSelectionChange={(keys) => setFormData({ ...formData, discountType: Array.from(keys)[0] as any })}
                  >
                    <SelectItem key="PERCENTAGE">Percentage (%)</SelectItem>
                    <SelectItem key="FIXED">Fixed Amount (₹)</SelectItem>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label={formData.discountType === 'PERCENTAGE' ? 'Discount (%)' : 'Discount (₹)'}
                    type="number"
                    placeholder={formData.discountType === 'PERCENTAGE' ? '10' : '100'}
                    value={formData.discountValue}
                    onValueChange={(v) => setFormData({ ...formData, discountValue: v })}
                    isRequired
                  />
                  <Input
                    label="Priority"
                    type="number"
                    placeholder="0"
                    description="Higher priority wins"
                    value={formData.priority}
                    onValueChange={(v) => setFormData({ ...formData, priority: v })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Applies To"
                    selectedKeys={[formData.scope]}
                    onSelectionChange={(keys) => setFormData({ ...formData, scope: Array.from(keys)[0] as any, scopeId: '' })}
                  >
                    {SCOPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.key}>{opt.label}</SelectItem>
                    ))}
                  </Select>

                  {formData.scope === 'CATEGORY' && (
                    <Select
                      label="Select Category"
                      selectedKeys={formData.scopeId ? [formData.scopeId] : []}
                      onSelectionChange={(keys) => setFormData({ ...formData, scopeId: Array.from(keys)[0] as string })}
                    >
                      {categories.map((cat) => (
                        <SelectItem key={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </Select>
                  )}

                  {formData.scope === 'SUPPLIER' && (
                    <Select
                      label="Select Supplier"
                      selectedKeys={formData.scopeId ? [formData.scopeId] : []}
                      onSelectionChange={(keys) => setFormData({ ...formData, scopeId: Array.from(keys)[0] as string })}
                    >
                      {suppliers.map((sup) => (
                        <SelectItem key={sup.id}>{sup.name}</SelectItem>
                      ))}
                    </Select>
                  )}

                  {formData.scope === 'BRAND' && (
                    <Input
                      label="Brand Name"
                      placeholder="e.g., Samsung"
                      value={formData.scopeId}
                      onValueChange={(v) => setFormData({ ...formData, scopeId: v })}
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Start Date"
                    type="date"
                    value={formData.startDate}
                    onValueChange={(v) => setFormData({ ...formData, startDate: v })}
                    isRequired
                  />
                  <Input
                    label="End Date (Optional)"
                    type="date"
                    value={formData.endDate}
                    onValueChange={(v) => setFormData({ ...formData, endDate: v })}
                  />
                </div>

                <Textarea
                  label="Description (Optional)"
                  placeholder="Describe this discount..."
                  value={formData.description}
                  onValueChange={(v) => setFormData({ ...formData, description: v })}
                />

                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="Min Quantity"
                    type="number"
                    placeholder="No minimum"
                    value={formData.minQuantity}
                    onValueChange={(v) => setFormData({ ...formData, minQuantity: v })}
                  />
                  <Input
                    label="Min Order Value (₹)"
                    type="number"
                    placeholder="No minimum"
                    value={formData.minOrderValue}
                    onValueChange={(v) => setFormData({ ...formData, minOrderValue: v })}
                  />
                  <Input
                    label="Max Usage"
                    type="number"
                    placeholder="Unlimited"
                    value={formData.maxUsageCount}
                    onValueChange={(v) => setFormData({ ...formData, maxUsageCount: v })}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    isSelected={formData.isActive}
                    onValueChange={(v) => setFormData({ ...formData, isActive: v })}
                  />
                  <span className="text-sm font-bold">Active</span>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleSubmit} isLoading={isSaving}>
                  {editingId ? 'Update' : 'Create'} Discount
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
