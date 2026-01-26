'use client';

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
    Pagination,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    useDisclosure
} from '@heroui/react';
import {
    Download,
    Filter,
    MoreVertical,
    Package,
    Plus,
    Search,
    Tag
} from 'lucide-react';
import { useMemo, useState } from 'react';

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
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [filterValue, setFilterValue] = useState("");
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  
  // New Product State
  const [newProduct, setNewProduct] = useState({
    name: '',
    sn: '',
    category: '',
    cost: 0,
    mrp: 0,
    sale: 0,
    discount: 0,
    stock: 0
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
    return products.filter((item) =>
      item.name.toLowerCase().includes(filterValue.toLowerCase()) ||
      item.sn.toLowerCase().includes(filterValue.toLowerCase())
    );
  }, [filterValue, products]);

  const onSearchChange = (value: string) => {
    setFilterValue(value);
  };

  const handleAddProduct = () => {
    const p = { 
        ...newProduct, 
        id: (products.length + 1).toString(),
        sale: Number(newProduct.sale.toFixed(2)),
        discount: Number(newProduct.discount.toFixed(1))
    };
    setProducts([p, ...products]);
    onOpenChange();
    setNewProduct({ name: '', sn: '', category: '', cost: 0, mrp: 0, sale: 0, discount: 0, stock: 0 });
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

      {/* Data Table */}
      <Table 
        aria-label="Inventory Table"
        className="modern-card border-none"
        classNames={{
            wrapper: "p-0 bg-white dark:bg-[#111318] border border-black/5 dark:border-white/5 rounded-[2.5rem] overflow-hidden",
            th: "bg-black/[0.02] dark:bg-white/[0.02] text-black/50 dark:text-white/40 h-16 font-black uppercase tracking-wider text-[10px] first:pl-8 last:pr-8",
            td: "py-5 first:pl-8 last:pr-8 text-sm font-bold",
        }}
      >
        <TableHeader>
          <TableColumn>PRODUCT / SERIAL</TableColumn>
          <TableColumn>CATEGORY</TableColumn>
          <TableColumn>COST PRICE</TableColumn>
          <TableColumn>MRP / MODAL</TableColumn>
          <TableColumn>SALE PRICE</TableColumn>
          <TableColumn>STOCK</TableColumn>
          <TableColumn>STATUS</TableColumn>
          <TableColumn align="center">ACTIONS</TableColumn>
        </TableHeader>
        <TableBody items={filteredItems}>
          {(item) => (
            <TableRow key={item.id} className="border-b last:border-none border-black/5 dark:border-white/5 hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors">
              <TableCell>
                <div>
                   <p className="font-black text-dark dark:text-white leading-tight">{item.name}</p>
                   <p className="text-[10px] font-black opacity-30 mt-1 uppercase tracking-tighter">{item.sn}</p>
                </div>
              </TableCell>
              <TableCell>
                 <Chip size="sm" variant="flat" className="font-black text-[10px] uppercase">{item.category}</Chip>
              </TableCell>
              <TableCell>₹{item.cost.toLocaleString()}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                   <span className="text-black/40 dark:text-white/40 line-through text-xs">₹{item.mrp.toLocaleString()}</span>
                   <span className="text-secondary font-black">MRP</span>
                </div>
              </TableCell>
              <TableCell>
                 <div className="flex flex-col">
                    <span className="font-black text-lg">₹{item.sale.toLocaleString()}</span>
                    <span className="text-success text-[10px] font-black">-{item.discount}% OFF</span>
                 </div>
              </TableCell>
              <TableCell>
                 <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${item.stock < 5 ? 'bg-danger animate-pulse' : 'bg-primary'}`} />
                    <span className="font-black">{item.stock} Units</span>
                 </div>
              </TableCell>
              <TableCell>
                 <Chip color={item.stock > 0 ? 'success' : 'danger'} size="sm" variant="flat" className="font-black">
                    {item.stock > 0 ? 'IN STOCK' : 'OUT'}
                 </Chip>
              </TableCell>
              <TableCell>
                 <div className="flex items-center gap-2">
                    <Button isIconOnly size="sm" variant="light" radius="full"><Tag size={16} className="opacity-40" /></Button>
                    <Button isIconOnly size="sm" variant="light" radius="full"><MoreVertical size={16} className="opacity-40" /></Button>
                 </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex justify-center">
         <Pagination isCompact showControls showShadow color="primary" radius="full" total={10} initialPage={1} />
      </div>

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
                
                <div className="grid md:grid-cols-2 gap-6">
                   <Input
                     label="Legal Product Name"
                     placeholder="e.g. MacBook Pro M3"
                     labelPlacement="outside"
                     size="lg"
                     radius="lg"
                     value={newProduct.name}
                     onValueChange={(val) => setNewProduct({...newProduct, name: val})}
                     classNames={{ label: "font-black opacity-40", inputWrapper: "bg-black/5 h-14" }}
                   />
                   <Input
                     label="Permanent Serial Number"
                     placeholder="SN-67890-XYZ"
                     labelPlacement="outside"
                     size="lg"
                     radius="lg"
                     value={newProduct.sn}
                     onValueChange={(val) => setNewProduct({...newProduct, sn: val})}
                     classNames={{ label: "font-black opacity-40", inputWrapper: "bg-black/5 h-14" }}
                   />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                   <Input
                     label="Category Track"
                     placeholder="Laptops / Mobiles"
                     labelPlacement="outside"
                     size="lg"
                     radius="lg"
                     value={newProduct.category}
                     onValueChange={(val) => setNewProduct({...newProduct, category: val})}
                     classNames={{ label: "font-black opacity-40", inputWrapper: "bg-black/5 h-14" }}
                   />
                   <Input
                     label="Current In-Stock"
                     type="number"
                     placeholder="0"
                     labelPlacement="outside"
                     size="lg"
                     radius="lg"
                     value={newProduct.stock.toString()}
                     onValueChange={(val) => setNewProduct({...newProduct, stock: parseInt(val) || 0})}
                     classNames={{ label: "font-black opacity-40", inputWrapper: "bg-black/5 h-14" }}
                   />
                </div>

                <Divider className="opacity-50" />

                <div>
                   <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center text-success"><Tag size={18} /></div>
                      <h4 className="text-sm font-black uppercase tracking-widest">Pricing Intelligence</h4>
                   </div>

                   <div className="space-y-6">
                      <div className="grid md:grid-cols-3 gap-6 text-center">
                         <Input
                           label="Total Cost Price"
                           placeholder="0.00"
                           labelPlacement="outside"
                           startContent={<span className="text-default-400 text-xs font-black">₹</span>}
                           size="lg"
                           radius="lg"
                           value={newProduct.cost.toString()}
                           onValueChange={(val) => setNewProduct({...newProduct, cost: parseFloat(val) || 0})}
                           classNames={{ label: "font-black opacity-40", inputWrapper: "bg-black/5 h-14" }}
                         />
                         <Input
                           label="Modal Price (MRP)"
                           placeholder="0.00"
                           labelPlacement="outside"
                           startContent={<span className="text-default-400 text-xs font-black">₹</span>}
                           size="lg"
                           radius="lg"
                           value={newProduct.mrp.toString()}
                           onValueChange={(val) => handlePriceChange('mrp', parseFloat(val) || 0)}
                           classNames={{ label: "font-black opacity-40", inputWrapper: "bg-black/5 h-14 focus-within:ring-2 ring-secondary" }}
                         />
                         <Input
                           label="Sale Discount (% OFF)"
                           placeholder="0"
                           labelPlacement="outside"
                           endContent={<span className="text-default-400 text-xs font-black">%</span>}
                           size="lg"
                           radius="lg"
                           value={newProduct.discount.toString()}
                           onValueChange={(val) => handlePriceChange('discount', parseFloat(val) || 0)}
                           classNames={{ label: "font-black opacity-40", inputWrapper: "bg-black/5 h-14" }}
                         />
                      </div>

                      <div className="p-8 rounded-[2rem] bg-black/[0.03] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 flex items-center justify-between">
                         <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Projected Unit Sale Price</p>
                            <h3 className="text-4xl font-black leading-none">₹{Number(newProduct.sale.toFixed(2)).toLocaleString()}</h3>
                         </div>
                         <div className="text-right space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Gross Profit / Unit</p>
                            <h4 className={`text-xl font-black ${(newProduct.sale - newProduct.cost) > 0 ? 'text-success' : 'text-danger'}`}>
                               ₹{(newProduct.sale - newProduct.cost).toLocaleString()}
                            </h4>
                         </div>
                      </div>
                   </div>
                </div>

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
