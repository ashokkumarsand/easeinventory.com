'use client';

import { DataTable } from '@/components/ui/DataTable';
import { FormRow, FormSection, StyledInput, StyledSelect } from '@/components/ui/FormField';
import {
  Button,
  Chip,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Switch,
  useDisclosure
} from '@heroui/react';
import { ColDef } from 'ag-grid-community';
import {
  Download,
  Filter,
  MoreVertical,
  Package,
  Plus,
  Search,
  Tag,
  Truck
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';

// Mock Data
const INITIAL_PRODUCTS = [
  { id: '1', name: 'iPhone 15 Pro', sn: 'SN-IP15P-4829', category: 'Smartphones', cost: 110000, mrp: 134999, sale: 124999, discount: 7.4, stock: 12 },
  { id: '2', name: 'Samsung S24 Ultra', sn: 'SN-S24U-1029', category: 'Smartphones', cost: 105000, mrp: 129999, sale: 119999, discount: 7.7, stock: 8 },
  { id: '3', name: 'MacBook M3 Pro', sn: 'SN-MBM3P-9920', category: 'Laptops', cost: 180000, mrp: 219999, sale: 204999, discount: 6.8, stock: 5 },
  { id: '4', name: 'Sony WH-1000XM5', sn: 'SN-SYXM5-5510', category: 'Audio', cost: 18000, mrp: 29999, sale: 24999, discount: 16.7, stock: 24 },
  { id: '5', name: 'iPad Pro 12.9', sn: 'SN-IPDP-3321', category: 'Tablets', cost: 85000, mrp: 109999, sale: 99999, discount: 9.1, stock: 15 },
  { id: '6', name: 'Dell XPS 15', sn: 'SN-DXPS-7742', category: 'Laptops', cost: 140000, mrp: 179999, sale: 164999, discount: 8.3, stock: 3 },
  { id: '7', name: 'Apple Watch Ultra 2', sn: 'SN-AWU2-8812', category: 'Wearables', cost: 65000, mrp: 89999, sale: 79999, discount: 11.1, stock: 10 },
];

export default function InventoryPage() {
  const { data: session } = useSession();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [filterValue, setFilterValue] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [locations, setLocations] = useState<any[]>([]);
  
  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
    fetchLocations();
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
  
  // New Product State
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
    consignmentCommission: 10
  });

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
                <Chip size="sm" variant="flat" color="warning" className="h-4 text-[8px] font-black uppercase">Consignment</Chip>
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
        <Chip size="sm" variant="flat" className="font-black text-[10px] uppercase">
          {params.data.category?.name || params.data.category || 'General'}
        </Chip>
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
        return (
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${stock < 5 ? 'bg-danger animate-pulse' : 'bg-primary'}`} />
            <span className="font-black">{stock} Units</span>
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
          <Chip color={stock > 0 ? 'success' : 'danger'} size="sm" variant="flat" className="font-black">
            {stock > 0 ? 'IN STOCK' : 'OUT'}
          </Chip>
        );
      },
    },
    {
      headerName: 'Actions',
      field: 'id',
      minWidth: 100,
      sortable: false,
      cellRenderer: () => (
        <div className="flex items-center gap-1">
          <Button isIconOnly size="sm" variant="light" radius="full"><Tag size={16} className="opacity-40" /></Button>
          <Button isIconOnly size="sm" variant="light" radius="full"><MoreVertical size={16} className="opacity-40" /></Button>
        </div>
      ),
    },
  ], []);

  const onSearchChange = (value: string) => {
    setFilterValue(value);
  };

  const handleAddProduct = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProduct.name,
          sku: newProduct.sn, // Mapping sn to sku for API
          category: newProduct.category,
          costPrice: newProduct.cost,
          mrp: newProduct.mrp,
          salePrice: newProduct.sale,
          discountPercent: newProduct.discount,
          quantity: newProduct.stock,
          unit: 'pcs',
          supplierId: newProduct.supplierId,
          initialLocationId: newProduct.initialLocationId,
          isConsignment: newProduct.isConsignment,
          consignmentCommission: newProduct.consignmentCommission
        }),
      });

      if (response.ok) {
        fetchProducts();
        onOpenChange();
        setNewProduct({ name: '', sn: '', category: '', cost: 0, mrp: 0, sale: 0, discount: 0, stock: 0, supplierId: '', initialLocationId: '', isConsignment: false, consignmentCommission: 10 });
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to add product');
      }
    } catch (error) {
      alert('Error adding product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
             <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Package size={22} strokeWidth={2.5} />
             </div>
             <h1 className="text-3xl font-black tracking-tight">Inventory Engine</h1>
           </div>
           <p className="text-black/40 dark:text-white/40 font-bold ml-1">Centralized stock control and pricing intelligence.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="flat" color="default" className="font-bold rounded-2xl" startContent={<Download size={18} />}>
              Export
           </Button>
           <Button color="primary" radius="full" size="lg" className="font-black px-8 shadow-xl shadow-primary/20" startContent={<Plus size={20} />} onClick={onOpen}>
              Add Asset
           </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="p-6 rounded-[2.5rem] bg-white dark:bg-[#111318] border border-black/5 dark:border-white/5 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Total Valuation</p>
            <div className="flex items-end gap-3">
               <h3 className="text-2xl font-black">₹{products.reduce((acc, p) => acc + (p.cost * p.stock), 0).toLocaleString()}</h3>
               <span className="text-xs font-bold text-success pb-1">Asset Value</span>
            </div>
         </div>
         <div className="p-6 rounded-[2.5rem] bg-white dark:bg-[#111318] border border-black/5 dark:border-white/5 space-y-2 text-warning">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-30 text-black dark:text-white">Low Stock Alerts</p>
            <div className="flex items-end gap-3">
               <h3 className="text-2xl font-black">4 items</h3>
               <span className="text-xs font-bold text-warning pb-1">Under 5 units</span>
            </div>
         </div>
         <div className="p-6 rounded-[2.5rem] bg-primary text-white space-y-2 shadow-xl shadow-primary/10">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Avg. Margin</p>
            <div className="flex items-end gap-3">
               <h3 className="text-2xl font-black">12.4%</h3>
               <span className="text-xs font-bold opacity-80 pb-1">Profitability</span>
            </div>
         </div>
      </div>

      {/* Main Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
         <Input
            isClearable
            classNames={{
              base: "w-full md:max-w-[400px]",
              inputWrapper: "h-14 bg-white dark:bg-[#111318] border border-black/5 dark:border-white/5 rounded-2xl",
              input: "text-sm font-bold",
            }}
            placeholder="Search by product name or serial number..."
            startContent={<Search size={18} className="text-default-400 shrink-0" />}
            value={filterValue}
            onClear={() => onSearchChange("")}
            onValueChange={onSearchChange}
         />
         <div className="flex gap-3 w-full md:w-auto">
            <Button variant="flat" isIconOnly size="lg" className="rounded-2xl shrink-0"><Filter size={20} /></Button>
            <Dropdown>
               <DropdownTrigger>
                  <Button variant="flat" size="lg" className="rounded-2xl font-bold flex-grow md:flex-grow-0" endContent={<MoreVertical size={18} />}>
                     Categories
                  </Button>
               </DropdownTrigger>
               <DropdownMenu variant="flat">
                  <DropdownItem key="all">All Products</DropdownItem>
                  <DropdownItem key="phones">Smartphones</DropdownItem>
                  <DropdownItem key="laptops">Laptops</DropdownItem>
               </DropdownMenu>
            </Dropdown>
         </div>
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
      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        scrollBehavior="inside"
        size="2xl"
        radius="lg"
        classNames={{
            backdrop: "bg-black/40 backdrop-blur-md",
            base: "modern-card p-4",
            header: "border-b border-black/5 dark:border-white/5",
            footer: "border-t border-black/5 dark:border-white/5",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                 <h2 className="text-2xl font-black tracking-tight">Register New Asset</h2>
                 <p className="text-xs font-bold opacity-30 uppercase tracking-widest">Enter serial numbers and pricing metrics</p>
              </ModalHeader>
               <ModalBody className="py-8 space-y-8">
                
                <FormSection title="Product Details" description="Basic product information">
                  <FormRow>
                    <StyledInput
                      label="Legal Product Name"
                      placeholder="e.g. MacBook Pro M3"
                      value={newProduct.name}
                      onChange={(val) => setNewProduct({...newProduct, name: val})}
                      required
                    />
                    <StyledInput
                      label="Permanent Serial Number"
                      placeholder="SN-67890-XYZ"
                      value={newProduct.sn}
                      onChange={(val) => setNewProduct({...newProduct, sn: val})}
                    />
                  </FormRow>
                  <FormRow>
                    <StyledInput
                      label="Category"
                      placeholder="Laptops / Mobiles"
                      value={newProduct.category}
                      onChange={(val) => setNewProduct({...newProduct, category: val})}
                    />
                    <StyledInput
                      label="Initial Stock Quantity"
                      type="number"
                      placeholder="0"
                      value={newProduct.stock.toString()}
                      onChange={(val) => setNewProduct({...newProduct, stock: parseInt(val) || 0})}
                    />
                  </FormRow>
                </FormSection>

                <FormSection title="Supplier & Location" description="Vendor and storage information">
                  <FormRow>
                    <StyledSelect
                      label="Primary Supplier"
                      placeholder="Select vendor"
                      value={newProduct.supplierId}
                      onChange={(val) => setNewProduct({...newProduct, supplierId: val})}
                      options={suppliers.map((sup) => ({ value: sup.id, label: sup.name }))}
                    />
                    <StyledSelect
                      label="Initial Location"
                      placeholder="Select storage point"
                      value={newProduct.initialLocationId}
                      onChange={(val) => setNewProduct({...newProduct, initialLocationId: val})}
                      options={locations.map((loc) => ({ value: loc.id, label: `${loc.name} (${loc.type})` }))}
                    />
                  </FormRow>
                </FormSection>

                <div className="p-6 rounded-2xl bg-warning/5 border border-warning/10">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="font-black text-sm text-warning uppercase tracking-widest">Consignment Mode</h4>
                      <p className="text-[10px] font-bold opacity-40">Stock owned by vendor until sold.</p>
                    </div>
                    <div className="flex items-center gap-4">
                      {newProduct.isConsignment && (
                        <div className="w-24">
                          <Input 
                            label="Our %" 
                            type="number" 
                            size="sm" 
                            variant="bordered"
                            value={newProduct.consignmentCommission.toString()}
                            onValueChange={(val) => setNewProduct({...newProduct, consignmentCommission: parseFloat(val) || 0})}
                          />
                        </div>
                      )}
                      <Switch 
                        color="warning" 
                        isSelected={newProduct.isConsignment} 
                        onValueChange={(val) => setNewProduct({...newProduct, isConsignment: val})}
                      />
                    </div>
                  </div>
                </div>

                <Divider className="opacity-50" />

                <FormSection title="Pricing Intelligence" description="Cost and sale price configuration">
                  <FormRow columns={3}>
                    <StyledInput
                      label="Cost Price"
                      placeholder="0.00"
                      type="number"
                      value={newProduct.cost.toString()}
                      onChange={(val) => setNewProduct({...newProduct, cost: parseFloat(val) || 0})}
                      startContent={<span className="text-foreground/40 text-xs font-black">₹</span>}
                    />
                    <StyledInput
                      label="MRP"
                      placeholder="0.00"
                      type="number"
                      value={newProduct.mrp.toString()}
                      onChange={(val) => handlePriceChange('mrp', parseFloat(val) || 0)}
                      startContent={<span className="text-foreground/40 text-xs font-black">₹</span>}
                    />
                    <StyledInput
                      label="Discount"
                      placeholder="0"
                      type="number"
                      value={newProduct.discount.toString()}
                      onChange={(val) => handlePriceChange('discount', parseFloat(val) || 0)}
                      endContent={<span className="text-foreground/40 text-xs font-black">%</span>}
                    />
                  </FormRow>

                  <div className="p-8 rounded-[2rem] bg-foreground/[0.02] border border-foreground/5 flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Sale Price</p>
                      <h3 className="text-4xl font-black leading-none">₹{Number(newProduct.sale.toFixed(2)).toLocaleString()}</h3>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Gross Profit</p>
                      <h4 className={`text-xl font-black ${(newProduct.sale - newProduct.cost) > 0 ? 'text-success' : 'text-danger'}`}>
                        ₹{(newProduct.sale - newProduct.cost).toLocaleString()}
                      </h4>
                    </div>
                  </div>
                </FormSection>

              </ModalBody>
              <ModalFooter className="py-6">
                <Button variant="light" onPress={onClose} className="font-bold">
                  Cancel
                </Button>
                <Button color="primary" radius="full" className="px-10 font-black h-14 shadow-xl shadow-primary/20" onPress={handleAddProduct}>
                  Commit to Block
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
