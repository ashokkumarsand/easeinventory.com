'use client';

import CSVImport from '@/components/ui/CSVImport';
import { DataTable } from '@/components/ui/DataTable';
import { FormRow, FormSection, StyledInput } from '@/components/ui/FormField';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectOption,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useDisclosure } from '@/hooks/useDisclosure';
import { Loader2 } from 'lucide-react';
import { ColDef } from 'ag-grid-community';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Download,
  Filter,
  MoreVertical,
  Package,
  Plus,
  Search,
  Tag,
  Truck,
  X
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useMemo, useState } from 'react';

export default function InventoryPage() {
  const { data: session } = useSession();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [filterValue, setFilterValue] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [categories, setCategories] = useState<SelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);

  // Quick add form visibility
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  // Quick add form state
  const [quickAdd, setQuickAdd] = useState({
    name: '',
    sn: '',
    category: '',
    stock: 1,
    cost: 0,
    mrp: 0,
    lotNumber: '',
    expiryDate: '',
  });

  // Full form state (modal)
  const [newProduct, setNewProduct] = useState({
    name: '',
    sn: '',
    category: '',
    cost: 0,
    mrp: 0,
    sale: 0,
    discount: 0,
    stock: 0,
    supplierId: '',
    initialLocationId: '',
    isConsignment: false,
    consignmentCommission: 10,
    lotNumber: '',
    batchNumber: '',
    expiryDate: '',
    manufacturingDate: '',
  });

  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
    fetchLocations();
    fetchCategories();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/inventory/locations');
      const data = await response.json();
      setLocations(data.locations || []);
    } catch (error) {
      console.error('Fetch locations error:', error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers');
      const data = await response.json();
      setSuppliers(data.suppliers || []);
    } catch (error) {
      console.error('Fetch suppliers error:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();

      // Combine existing categories with suggestions
      const categoryOptions: SelectOption[] = [];

      if (data.categories?.length > 0) {
        data.categories.forEach((cat: any) => {
          categoryOptions.push({
            value: cat.id,
            label: cat.name,
            description: cat._count?.products ? `${cat._count.products} products` : undefined,
          });
        });
      }

      // Add suggestions if available
      if (data.suggestions?.length > 0) {
        data.suggestions.forEach((sug: any) => {
          categoryOptions.push({
            value: `new:${sug.name}`,
            label: sug.name,
            description: 'Suggested',
          });
        });
      }

      setCategories(categoryOptions);
    } catch (error) {
      console.error('Fetch categories error:', error);
      // Fallback default categories
      setCategories([
        { value: 'new:General', label: 'General' },
        { value: 'new:Electronics', label: 'Electronics' },
        { value: 'new:Accessories', label: 'Accessories' },
      ]);
    }
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Fetch products error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Create category if it's new
  const ensureCategory = async (categoryValue: string): Promise<string> => {
    if (categoryValue.startsWith('new:')) {
      const categoryName = categoryValue.replace('new:', '');
      try {
        const response = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: categoryName }),
        });
        const data = await response.json();
        if (data.category?.id) {
          // Refresh categories
          fetchCategories();
          return data.category.id;
        }
      } catch (error) {
        console.error('Create category error:', error);
      }
    }
    return categoryValue;
  };

  // Handle creating a new category from the select
  const handleCreateCategory = async (name: string) => {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await response.json();
      if (data.category) {
        setCategories(prev => [...prev, {
          value: data.category.id,
          label: data.category.name,
        }]);
        // Set the newly created category as selected
        setNewProduct(prev => ({ ...prev, category: data.category.id }));
        setQuickAdd(prev => ({ ...prev, category: data.category.id }));
      }
    } catch (error) {
      console.error('Create category error:', error);
    }
  };

  // Calculate prices logic
  const handlePriceChange = (field: string, value: number) => {
    let updated = { ...newProduct, [field]: value };

    if (field === 'mrp' || field === 'discount') {
      const disc = field === 'discount' ? value : updated.discount;
      const mrp = field === 'mrp' ? value : updated.mrp;
      updated.sale = mrp - (mrp * (disc / 100));
    } else if (field === 'sale') {
      updated.discount = ((updated.mrp - value) / updated.mrp) * 100;
    }

    setNewProduct(updated);
  };

  const filteredItems = useMemo(() => {
    if (!filterValue) return products;
    return products.filter((item) =>
      item.name.toLowerCase().includes(filterValue.toLowerCase()) ||
      (item.sku || item.sn || '').toLowerCase().includes(filterValue.toLowerCase())
    );
  }, [filterValue, products]);

  // Quick add handler
  const handleQuickAdd = async () => {
    if (!quickAdd.name) return;

    setIsSaving(true);
    try {
      const categoryId = await ensureCategory(quickAdd.category);

      // Create product first (with 0 quantity if lot is being added)
      const hasLot = !!quickAdd.lotNumber;
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: quickAdd.name,
          sku: quickAdd.sn,
          categoryId: categoryId || undefined,
          costPrice: quickAdd.cost,
          mrp: quickAdd.mrp,
          salePrice: quickAdd.mrp,
          quantity: hasLot ? 0 : quickAdd.stock, // If adding lot, product qty will be updated by lot API
          unit: 'pcs',
        }),
      });

      if (response.ok) {
        const productData = await response.json();

        // If lot number is provided, create the lot
        if (hasLot && productData.product?.id) {
          await fetch('/api/inventory/lots', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId: productData.product.id,
              lotNumber: quickAdd.lotNumber,
              quantity: quickAdd.stock,
              costPrice: quickAdd.cost,
              expiryDate: quickAdd.expiryDate || null,
            }),
          });
        }

        fetchProducts();
        // Reset form but keep it open for next entry
        setQuickAdd({
          name: '',
          sn: '',
          category: quickAdd.category,
          stock: 1,
          cost: 0,
          mrp: 0,
          lotNumber: '',
          expiryDate: '',
        });
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to add product');
      }
    } catch (error) {
      alert('Error adding product');
    } finally {
      setIsSaving(false);
    }
  };

  // Full add handler with "Save & Add Another" option
  const handleAddProduct = async (closeAfter = true) => {
    setIsSaving(true);
    try {
      const categoryId = await ensureCategory(newProduct.category);

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProduct.name,
          sku: newProduct.sn,
          categoryId: categoryId || undefined,
          costPrice: newProduct.cost,
          mrp: newProduct.mrp,
          salePrice: newProduct.sale,
          discountPercent: newProduct.discount,
          quantity: newProduct.stock,
          unit: 'pcs',
          supplierId: newProduct.supplierId || undefined,
          initialLocationId: newProduct.initialLocationId || undefined,
          isConsignment: newProduct.isConsignment,
          consignmentCommission: newProduct.consignmentCommission
        }),
      });

      if (response.ok) {
        fetchProducts();
        if (closeAfter) {
          onClose();
          resetNewProduct();
        } else {
          // Save & Add Another - just reset the form
          resetNewProduct();
        }
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to add product');
      }
    } catch (error) {
      alert('Error adding product');
    } finally {
      setIsSaving(false);
    }
  };

  const resetNewProduct = () => {
    setNewProduct({
      name: '',
      sn: '',
      category: newProduct.category, // Keep selected category
      cost: 0,
      mrp: 0,
      sale: 0,
      discount: 0,
      stock: 0,
      supplierId: newProduct.supplierId, // Keep selected supplier
      initialLocationId: newProduct.initialLocationId, // Keep selected location
      isConsignment: false,
      consignmentCommission: 10,
      lotNumber: '',
      batchNumber: '',
      expiryDate: '',
      manufacturingDate: '',
    });
  };

  // AG Grid Column Definitions
  const columnDefs: ColDef[] = useMemo(() => [
    {
      headerName: 'Product / Serial',
      field: 'name',
      minWidth: 250,
      flex: 2,
      cellRenderer: (params: any) => {
        const item = params.data;
        return (
          <div className="py-2">
            <p className="font-black text-foreground leading-tight">{item.name}</p>
            <p className="text-[10px] font-black opacity-30 mt-1 uppercase tracking-tighter inline-flex items-center gap-2">
              {item.sku || item.sn}
              {item.supplier && (
                <span className="text-primary flex items-center gap-1">
                  <Truck size={8} /> {item.supplier.name}
                </span>
              )}
              {item.isConsignment && (
                <Badge variant="outline" className="h-4 text-[8px] font-black uppercase bg-warning/10 text-warning border-warning/20">Consignment</Badge>
              )}
            </p>
          </div>
        );
      },
    },
    {
      headerName: 'Category',
      field: 'category',
      minWidth: 120,
      cellRenderer: (params: any) => (
        <Badge variant="secondary" className="font-black text-[10px] uppercase">
          {params.data.category?.name || params.data.category || 'General'}
        </Badge>
      ),
    },
    {
      headerName: 'Cost Price',
      field: 'costPrice',
      minWidth: 120,
      cellRenderer: (params: any) => (
        <span className="font-bold">₹{(params.data.costPrice || params.data.cost || 0).toLocaleString()}</span>
      ),
    },
    {
      headerName: 'MRP',
      field: 'mrp',
      minWidth: 100,
      cellRenderer: (params: any) => (
        <div className="flex flex-col">
          <span className="text-foreground/40 line-through text-xs">₹{(params.data.mrp || 0).toLocaleString()}</span>
          <span className="text-secondary font-black text-xs">MRP</span>
        </div>
      ),
    },
    {
      headerName: 'Sale Price',
      field: 'salePrice',
      minWidth: 130,
      cellRenderer: (params: any) => (
        <div className="flex flex-col">
          <span className="font-black text-lg">₹{(params.data.salePrice || params.data.sale || 0).toLocaleString()}</span>
          <span className="text-success text-[10px] font-black">-{params.data.discountPercent || params.data.discount || 0}% OFF</span>
        </div>
      ),
    },
    {
      headerName: 'Stock',
      field: 'quantity',
      minWidth: 100,
      cellRenderer: (params: any) => {
        const stock = params.data.quantity || params.data.stock || 0;
        const isLowStock = stock < 5;
        return (
          <div className="flex items-center gap-2" role="status" aria-label={`${stock} units ${isLowStock ? '- low stock warning' : 'in stock'}`}>
            <span
              className={`w-2 h-2 rounded-full ${isLowStock ? 'bg-danger animate-pulse' : 'bg-primary'}`}
              aria-hidden="true"
            />
            <span className="font-black">{stock} Units</span>
            {isLowStock && (
              <span className="text-[9px] font-black text-danger uppercase">Low</span>
            )}
          </div>
        );
      },
    },
    {
      headerName: 'Status',
      field: 'stock',
      minWidth: 100,
      cellRenderer: (params: any) => {
        const stock = params.data.quantity || params.data.stock || 0;
        return (
          <Badge variant={stock > 0 ? 'default' : 'destructive'} className={`font-black ${stock > 0 ? 'bg-success/10 text-success hover:bg-success/20' : ''}`}>
            {stock > 0 ? 'IN STOCK' : 'OUT'}
          </Badge>
        );
      },
    },
    {
      headerName: 'Actions',
      field: 'id',
      minWidth: 100,
      sortable: false,
      cellRenderer: (params: any) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" aria-label={`Add tag to ${params.data.name}`}>
            <Tag size={16} className="opacity-40" aria-hidden="true" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" aria-label={`More actions for ${params.data.name}`}>
            <MoreVertical size={16} className="opacity-40" aria-hidden="true" />
          </Button>
        </div>
      ),
    },
  ], []);

  const onSearchChange = (value: string) => {
    setFilterValue(value);
  };

  // Supplier options for select
  const supplierOptions: SelectOption[] = suppliers.map(sup => ({
    value: sup.id,
    label: sup.name,
    description: sup.city || undefined,
  }));

  // Location options for select
  const locationOptions: SelectOption[] = locations.map(loc => ({
    value: loc.id,
    label: loc.name,
    description: loc.type,
  }));

  return (
    <div className="space-y-6 pb-10">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
             <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Package size={22} strokeWidth={2.5} aria-hidden="true" />
             </div>
             <h1 className="text-3xl font-black tracking-tight">Inventory Engine</h1>
           </div>
           <p className="text-foreground/40 font-bold ml-1">Centralized stock control and pricing intelligence.</p>
        </div>
        <div className="flex items-center gap-3">
           <CSVImport
             title="Import Products"
             description="Bulk import products from CSV file"
             templateUrl="/api/products/import"
             importUrl="/api/products/import"
             onSuccess={fetchProducts}
             requiredFields={['name']}
             fieldMappings={{
               'Product Name': 'name',
               'SKU': 'sku',
               'Barcode': 'barcode',
               'Description': 'description',
               'Category': 'category',
               'HSN Code': 'hsnCode',
               'GST Rate': 'gstRate',
               'MRP': 'mrp',
               'Cost Price': 'costPrice',
               'Sale Price': 'salePrice',
               'Quantity': 'quantity',
               'Unit': 'unit',
             }}
           />
           <Button variant="outline" className="font-bold rounded-full">
              <Download size={18} aria-hidden="true" />
              Export
           </Button>
           <Button variant="default" size="lg" className="font-black px-8 shadow-xl shadow-primary/20 rounded-full" onClick={onOpen}>
              <Plus size={20} />
              Add Product
           </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="p-6 rounded-2xl modern-card space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted">Total Valuation</p>
            <div className="flex items-end gap-3">
               <h3 className="text-2xl font-black">₹{products.reduce((acc, p) => acc + ((p.costPrice || p.cost || 0) * (p.quantity || p.stock || 0)), 0).toLocaleString()}</h3>
               <span className="text-xs font-bold text-success pb-1">Asset Value</span>
            </div>
         </div>
         <div className="p-6 rounded-2xl modern-card space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted">Low Stock Alerts</p>
            <div className="flex items-end gap-3">
               <h3 className="text-2xl font-black text-warning">{products.filter(p => (p.quantity || p.stock || 0) < 5).length} items</h3>
               <span className="text-xs font-bold text-warning pb-1">Under 5 units</span>
            </div>
         </div>
         <div className="p-6 rounded-2xl bg-primary text-white space-y-2 shadow-xl shadow-primary/10">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Products</p>
            <div className="flex items-end gap-3">
               <h3 className="text-2xl font-black">{products.length}</h3>
               <span className="text-xs font-bold opacity-80 pb-1">Items in inventory</span>
            </div>
         </div>
      </div>

      {/* Quick Add Toggle & Search */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
           <div className="relative w-full md:max-w-[400px]">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" />
              <Input
                placeholder="Search by product name or serial..."
                className="h-12 pl-10 pr-10 border border-foreground/10 rounded-xl bg-background text-sm font-medium"
                value={filterValue}
                onChange={(e) => onSearchChange(e.target.value)}
              />
              {filterValue && (
                <button
                  onClick={() => onSearchChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground"
                >
                  <X size={16} />
                </button>
              )}
           </div>
           <div className="flex gap-3 w-full md:w-auto">
              <Button
                variant={showQuickAdd ? 'default' : 'outline'}
                className="font-bold rounded-full"
                onClick={() => setShowQuickAdd(!showQuickAdd)}
              >
                {showQuickAdd ? <ChevronUp size={18} /> : <Plus size={18} />}
                Quick Add
              </Button>
              <Button variant="outline" size="icon" className="h-10 w-10 rounded-2xl shrink-0" aria-label="Filter products">
                <Filter size={20} aria-hidden="true" />
              </Button>
              <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="lg" className="rounded-2xl font-bold flex-grow md:flex-grow-0">
                       Categories
                       <ChevronDown size={18} />
                    </Button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent>
                    <DropdownMenuItem>All Products</DropdownMenuItem>
                    {categories.slice(0, 8).map(cat => (
                      <DropdownMenuItem key={cat.value}>{cat.label}</DropdownMenuItem>
                    ))}
                 </DropdownMenuContent>
              </DropdownMenu>
           </div>
        </div>

        {/* Quick Add Form */}
        {showQuickAdd && (
          <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-bold text-primary">Quick Add Mode</span>
              <span className="text-xs text-foreground/40 ml-2">Add products with lot/batch tracking</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-8 gap-4 items-end">
              <div className="col-span-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-foreground/70">Product Name *</label>
                  <Input
                    placeholder="Enter product name"
                    className="h-12 border border-foreground/10 bg-background rounded-lg"
                    value={quickAdd.name}
                    onChange={(e) => setQuickAdd({...quickAdd, name: e.target.value})}
                    onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-foreground/70">Category</label>
                <Select value={quickAdd.category} onValueChange={(val) => setQuickAdd({...quickAdd, category: val})}>
                  <SelectTrigger className="h-12 border border-foreground/10 bg-background rounded-lg">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-foreground/70">Lot No.</label>
                  <Input
                    placeholder="LOT-001"
                    className="h-12 border border-foreground/10 bg-background rounded-lg"
                    value={quickAdd.lotNumber}
                    onChange={(e) => setQuickAdd({...quickAdd, lotNumber: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-foreground/70">Qty</label>
                  <Input
                    type="number"
                    placeholder="1"
                    className="h-12 border border-foreground/10 bg-background rounded-lg"
                    value={quickAdd.stock.toString()}
                    onChange={(e) => setQuickAdd({...quickAdd, stock: parseInt(e.target.value) || 1})}
                  />
                </div>
              </div>
              <div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-foreground/70">Cost</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40 text-sm">₹</span>
                    <Input
                      type="number"
                      placeholder="0"
                      className="h-12 pl-7 border border-foreground/10 bg-background rounded-lg"
                      value={quickAdd.cost.toString()}
                      onChange={(e) => setQuickAdd({...quickAdd, cost: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>
              </div>
              <div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-foreground/70">Expiry</label>
                  <Input
                    type="date"
                    className="h-12 border border-foreground/10 bg-background rounded-lg"
                    value={quickAdd.expiryDate}
                    onChange={(e) => setQuickAdd({...quickAdd, expiryDate: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="default"
                  className="flex-1 font-bold h-12 rounded-lg"
                  onClick={handleQuickAdd}
                  disabled={!quickAdd.name || isSaving}
                >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />} Add
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-lg"
                  onClick={() => setShowQuickAdd(false)}
                >
                  <X size={18} />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Data Table - AG Grid */}
      <DataTable
        data={filteredItems}
        columns={columnDefs}
        isLoading={isLoading}
        rowHeight={72}
        height={500}
        onAddFirst={onOpen}
        emptyMessage="No products found"
      />

      {/* Add Product Modal */}
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b border-foreground/5 px-8 py-6">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                 <Package size={20} className="text-primary" aria-hidden="true" />
               </div>
               <div>
                 <DialogTitle className="text-xl font-bold">Add New Product</DialogTitle>
                 <DialogDescription className="text-sm text-foreground/50 font-normal">Enter product details and pricing</DialogDescription>
               </div>
             </div>
          </DialogHeader>
          <div className="p-0">

                {/* Product Details Section */}
                <div className="px-8 py-6 border-b border-foreground/5">
                  <FormSection title="Product Details" description="Basic product information">
                    <FormRow>
                      <StyledInput
                        label="Product Name"
                        placeholder="e.g. MacBook Pro M3"
                        value={newProduct.name}
                        onChange={(val) => setNewProduct({...newProduct, name: val})}
                        required
                      />
                      <StyledInput
                        label="Serial Number"
                        placeholder="Enter serial or SKU"
                        value={newProduct.sn}
                        onChange={(val) => setNewProduct({...newProduct, sn: val})}
                      />
                    </FormRow>
                    <FormRow>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-foreground/70">Category</label>
                        <Select value={newProduct.category} onValueChange={(val) => setNewProduct({...newProduct, category: val})}>
                          <SelectTrigger className="h-12 rounded-xl border-foreground/10 hover:border-foreground/20">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <StyledInput
                        label="Initial Stock"
                        type="number"
                        placeholder="0"
                        value={newProduct.stock.toString()}
                        onChange={(val) => setNewProduct({...newProduct, stock: parseInt(val) || 0})}
                      />
                    </FormRow>
                  </FormSection>
                </div>

                {/* Supplier & Location Section */}
                <div className="px-8 py-6 border-b border-foreground/5">
                  <FormSection title="Supplier & Location" description="Vendor and storage information">
                    <FormRow>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-foreground/70">Supplier</label>
                        <Select value={newProduct.supplierId} onValueChange={(val) => setNewProduct({...newProduct, supplierId: val})}>
                          <SelectTrigger className="h-12 rounded-xl border-foreground/10 hover:border-foreground/20">
                            <SelectValue placeholder="Select vendor" />
                          </SelectTrigger>
                          <SelectContent>
                            {supplierOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-foreground/70">Storage Location</label>
                        <Select value={newProduct.initialLocationId} onValueChange={(val) => setNewProduct({...newProduct, initialLocationId: val})}>
                          <SelectTrigger className="h-12 rounded-xl border-foreground/10 hover:border-foreground/20">
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                          <SelectContent>
                            {locationOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </FormRow>

                    <div className="p-4 rounded-xl bg-warning/5 border border-warning/20">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="font-semibold text-sm text-warning">Consignment Mode</h4>
                          <p className="text-xs text-foreground/50">Stock owned by vendor until sold</p>
                        </div>
                        <div className="flex items-center gap-4">
                          {newProduct.isConsignment && (
                            <div className="w-20">
                              <label className="text-xs text-foreground/50">Commission %</label>
                              <Input
                                type="number"
                                className="h-8 text-sm"
                                value={newProduct.consignmentCommission.toString()}
                                onChange={(e) => setNewProduct({...newProduct, consignmentCommission: parseFloat(e.target.value) || 0})}
                              />
                            </div>
                          )}
                          <Switch
                            checked={newProduct.isConsignment}
                            onCheckedChange={(checked) => setNewProduct({...newProduct, isConsignment: checked})}
                            aria-label="Enable consignment mode"
                          />
                        </div>
                      </div>
                    </div>
                  </FormSection>
                </div>

                {/* Pricing Section */}
                <div className="px-8 py-6">
                  <FormSection title="Pricing" description="Cost and sale price configuration">
                    <FormRow columns={3}>
                      <StyledInput
                        label="Cost Price"
                        placeholder="0.00"
                        type="number"
                        value={newProduct.cost.toString()}
                        onChange={(val) => setNewProduct({...newProduct, cost: parseFloat(val) || 0})}
                        startContent={<span className="text-foreground/40 text-sm">₹</span>}
                      />
                      <StyledInput
                        label="MRP"
                        placeholder="0.00"
                        type="number"
                        value={newProduct.mrp.toString()}
                        onChange={(val) => handlePriceChange('mrp', parseFloat(val) || 0)}
                        startContent={<span className="text-foreground/40 text-sm">₹</span>}
                      />
                      <StyledInput
                        label="Discount"
                        placeholder="0"
                        type="number"
                        value={newProduct.discount.toString()}
                        onChange={(val) => handlePriceChange('discount', parseFloat(val) || 0)}
                        endContent={<span className="text-foreground/40 text-sm">%</span>}
                      />
                    </FormRow>

                    <div className="p-5 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-foreground/50">Sale Price</p>
                        <h3 className="text-3xl font-black leading-none">₹{Number(newProduct.sale.toFixed(2)).toLocaleString()}</h3>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-xs font-semibold text-foreground/50">Gross Profit</p>
                        <h4 className={`text-xl font-black ${(newProduct.sale - newProduct.cost) > 0 ? 'text-success' : 'text-danger'}`}>
                          ₹{(newProduct.sale - newProduct.cost).toLocaleString()}
                        </h4>
                      </div>
                    </div>
                  </FormSection>
                </div>

              </div>
              <DialogFooter className="flex justify-between border-t border-foreground/5 px-8 py-4">
                <Button variant="outline" onClick={onClose} className="font-semibold rounded-full">
                  Cancel
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    className="font-semibold rounded-full"
                    onClick={() => handleAddProduct(false)}
                    disabled={!newProduct.name || isSaving}
                  >
                    {isSaving && <Loader2 size={16} className="animate-spin mr-2" />}
                    Save & Add Another
                  </Button>
                  <Button
                    variant="default"
                    className="font-semibold px-6 rounded-full"
                    onClick={() => handleAddProduct(true)}
                    disabled={!newProduct.name || isSaving}
                  >
                    {isSaving && <Loader2 size={16} className="animate-spin mr-2" />}
                    Add Product
                  </Button>
                </div>
              </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
