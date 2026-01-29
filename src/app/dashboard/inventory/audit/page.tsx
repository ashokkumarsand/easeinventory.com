'use client';

import BarcodeScanner from '@/components/ui/BarcodeScanner';

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
    Pagination,
    Select,
    SelectItem,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Textarea,
    useDisclosure
} from '@heroui/react';
import {
    ArrowDownCircle,
    ArrowUpCircle,
    Calendar,
    Download,
    FileText,
    Filter,
    Plus,
    RefreshCw,
    ScanLine,
    Search,
    TrendingDown
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface StockMovement {
    id: string;
    type: string;
    quantity: number;
    notes: string | null;
    createdAt: string;
    product: { id: string; name: string; sku: string | null };
    user: { id: string; name: string | null; email: string | null };
    supplier: { id: string; name: string } | null;
}

const MOVEMENT_TYPES = [
    { key: 'PURCHASE', label: 'Purchase', color: 'success', icon: ArrowDownCircle },
    { key: 'SALE', label: 'Sale', color: 'primary', icon: ArrowUpCircle },
    { key: 'RETURN_IN', label: 'Return In', color: 'success', icon: ArrowDownCircle },
    { key: 'RETURN_OUT', label: 'Return Out', color: 'warning', icon: ArrowUpCircle },
    { key: 'ADJUSTMENT', label: 'Adjustment', color: 'secondary', icon: RefreshCw },
    { key: 'TRANSFER', label: 'Transfer', color: 'default', icon: RefreshCw },
    { key: 'DAMAGE', label: 'Damage', color: 'danger', icon: TrendingDown },
    { key: 'REPAIR_IN', label: 'Repair In', color: 'success', icon: ArrowDownCircle },
    { key: 'REPAIR_OUT', label: 'Repair Out', color: 'warning', icon: ArrowUpCircle },
];

export default function AuditTrailPage() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [movements, setMovements] = useState<StockMovement[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [stats, setStats] = useState<any[]>([]);

    // Filters
    const [filterType, setFilterType] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // New Adjustment
    const [newAdjustment, setNewAdjustment] = useState({
        productId: '',
        type: 'ADJUSTMENT',
        quantity: '',
        notes: ''
    });

    // Scanner State
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    const handleScanSuccess = async (barcode: string) => {
        try {
            const response = await fetch(`/api/products?search=${barcode}&limit=1`);
            const data = await response.json();
            
            if (data.products && data.products.length > 0) {
                const product = data.products[0];
                setNewAdjustment(prev => ({ ...prev, productId: product.id }));
            } else {
                alert(`No product found with barcode: ${barcode}`);
            }
        } catch (error) {
            console.error('Barcode lookup error:', error);
        }
    };

    useEffect(() => {
        fetchMovements();
        fetchProducts();
    }, [page, filterType, filterStartDate, filterEndDate]);

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/products');
            const data = await response.json();
            setProducts(data.products || []);
        } catch (error) {
            console.error('Fetch products error:', error);
        }
    };

    const fetchMovements = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('page', page.toString());
            if (filterType) params.set('type', filterType);
            if (filterStartDate) params.set('startDate', filterStartDate);
            if (filterEndDate) params.set('endDate', filterEndDate);

            const response = await fetch(`/api/inventory/audit?${params.toString()}`);
            const data = await response.json();
            setMovements(data.movements || []);
            setTotalPages(data.pagination?.pages || 1);
            setStats(data.stats || []);
        } catch (error) {
            console.error('Fetch movements error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAdjustment = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/inventory/audit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAdjustment),
            });

            if (response.ok) {
                fetchMovements();
                onOpenChange();
                setNewAdjustment({ productId: '', type: 'ADJUSTMENT', quantity: '', notes: '' });
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to create adjustment');
            }
        } catch (error) {
            alert('Error creating adjustment');
        } finally {
            setIsLoading(false);
        }
    };

    const getTypeConfig = (type: string) => {
        return MOVEMENT_TYPES.find(t => t.key === type) || { label: type, color: 'default', icon: RefreshCw };
    };

    const getTotalByType = (type: string) => {
        const stat = stats.find((s: any) => s.type === type);
        return stat?._sum?.quantity || 0;
    };

    const filteredMovements = movements.filter(m => 
        !searchTerm || 
        m.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.user.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                            <FileText size={22} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-secondary">Audit Trail</h1>
                    </div>
                    <p className="text-black/40 dark:text-white/40 font-bold ml-1">Complete history of all stock movements.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="flat" color="default" className="font-bold rounded-2xl" startContent={<Download size={18} />}>
                        Export CSV
                    </Button>
                    <Button color="secondary" radius="full" size="lg" className="font-black px-8 shadow-xl shadow-secondary/20" startContent={<Plus size={20} />} onClick={onOpen}>
                        Manual Adjustment
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="modern-card bg-success text-white p-4" radius="lg">
                    <CardBody className="p-0">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Stock In</p>
                        <h2 className="text-2xl font-black">{getTotalByType('PURCHASE') + getTotalByType('RETURN_IN')}</h2>
                    </CardBody>
                </Card>
                <Card className="modern-card bg-primary text-white p-4" radius="lg">
                    <CardBody className="p-0">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Stock Out</p>
                        <h2 className="text-2xl font-black">{getTotalByType('SALE') + getTotalByType('RETURN_OUT')}</h2>
                    </CardBody>
                </Card>
                <Card className="modern-card bg-warning text-white p-4" radius="lg">
                    <CardBody className="p-0">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Transfers</p>
                        <h2 className="text-2xl font-black">{getTotalByType('TRANSFER')}</h2>
                    </CardBody>
                </Card>
                <Card className="modern-card bg-danger text-white p-4" radius="lg">
                    <CardBody className="p-0">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Damage</p>
                        <h2 className="text-2xl font-black">{getTotalByType('DAMAGE')}</h2>
                    </CardBody>
                </Card>
                <Card className="modern-card bg-secondary text-white p-4" radius="lg">
                    <CardBody className="p-0">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Adjustments</p>
                        <h2 className="text-2xl font-black">{getTotalByType('ADJUSTMENT')}</h2>
                    </CardBody>
                </Card>
            </div>

            {/* Filters */}
            <Card className="modern-card p-6" radius="lg">
                <CardBody className="p-0">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Filter size={16} className="opacity-40" />
                            <span className="text-xs font-black uppercase tracking-widest opacity-40">Filters:</span>
                        </div>
                        <Input
                            placeholder="Search product or user..."
                            size="sm"
                            radius="lg"
                            className="max-w-[200px]"
                            classNames={{ inputWrapper: "bg-black/5 h-10" }}
                            startContent={<Search size={14} className="opacity-30" />}
                            value={searchTerm}
                            onValueChange={setSearchTerm}
                        />
                        <Select
                            placeholder="Movement Type"
                            size="sm"
                            radius="lg"
                            className="max-w-[160px]"
                            classNames={{ trigger: "bg-black/5 h-10" }}
                            selectedKeys={filterType ? [filterType] : []}
                            onSelectionChange={(keys) => setFilterType(Array.from(keys)[0] as string || '')}
                        >
                            {MOVEMENT_TYPES.map((type) => (
                                <SelectItem key={type.key}>{type.label}</SelectItem>
                            ))}
                        </Select>
                        <div className="flex items-center gap-2">
                            <Calendar size={14} className="opacity-40" />
                            <Input
                                type="date"
                                size="sm"
                                radius="lg"
                                className="w-[140px]"
                                classNames={{ inputWrapper: "bg-black/5 h-10" }}
                                value={filterStartDate}
                                onValueChange={setFilterStartDate}
                            />
                            <span className="text-xs opacity-40">to</span>
                            <Input
                                type="date"
                                size="sm"
                                radius="lg"
                                className="w-[140px]"
                                classNames={{ inputWrapper: "bg-black/5 h-10" }}
                                value={filterEndDate}
                                onValueChange={setFilterEndDate}
                            />
                        </div>
                        <Button
                            variant="flat"
                            size="sm"
                            radius="lg"
                            onClick={() => {
                                setFilterType('');
                                setFilterStartDate('');
                                setFilterEndDate('');
                                setSearchTerm('');
                            }}
                        >
                            Clear
                        </Button>
                    </div>
                </CardBody>
            </Card>

            {/* Table */}
            <Table
                aria-label="Audit Trail"
                bottomContent={
                    totalPages > 1 && (
                        <div className="flex w-full justify-center">
                            <Pagination
                                isCompact
                                showControls
                                showShadow
                                color="secondary"
                                page={page}
                                total={totalPages}
                                onChange={setPage}
                            />
                        </div>
                    )
                }
                classNames={{
                    wrapper: "modern-card bg-white dark:bg-[#111318] border border-black/5 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-none",
                    th: "bg-black/[0.02] dark:bg-white/[0.02] h-14 font-black uppercase tracking-wider text-[10px] opacity-40 px-6",
                    td: "py-4 px-6 font-bold",
                }}
            >
                <TableHeader>
                    <TableColumn>DATE</TableColumn>
                    <TableColumn>PRODUCT</TableColumn>
                    <TableColumn>TYPE</TableColumn>
                    <TableColumn>QUANTITY</TableColumn>
                    <TableColumn>BY</TableColumn>
                    <TableColumn>NOTES</TableColumn>
                </TableHeader>
                <TableBody isLoading={isLoading} emptyContent="No movements found">
                    {filteredMovements.map((movement) => {
                        const typeConfig = getTypeConfig(movement.type);
                        const TypeIcon = typeConfig.icon;
                        return (
                            <TableRow key={movement.id} className="border-b last:border-none border-black/5">
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black">
                                            {new Date(movement.createdAt).toLocaleDateString()}
                                        </span>
                                        <span className="text-[10px] opacity-40">
                                            {new Date(movement.createdAt).toLocaleTimeString()}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-black text-sm">{movement.product.name}</span>
                                        <span className="text-[10px] opacity-40 uppercase">{movement.product.sku}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        size="sm"
                                        color={typeConfig.color as any}
                                        variant="flat"
                                        startContent={<TypeIcon size={12} />}
                                        className="font-black text-[10px] uppercase"
                                    >
                                        {typeConfig.label}
                                    </Chip>
                                </TableCell>
                                <TableCell>
                                    <span className={`font-black text-lg ${
                                        movement.quantity > 0 ? 'text-success' : 'text-danger'
                                    }`}>
                                        {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span className="text-xs">{movement.user.name || movement.user.email}</span>
                                </TableCell>
                                <TableCell>
                                    <span className="text-xs opacity-60 truncate max-w-[150px] block">
                                        {movement.notes || '-'}
                                    </span>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
            
            <BarcodeScanner 
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                onScanSuccess={handleScanSuccess}
            />

            {/* Manual Adjustment Modal */}
            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                size="lg"
                classNames={{ base: "modern-card p-6" }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <h2 className="text-2xl font-black tracking-tight">Stock Adjustment</h2>
                                <p className="text-xs font-bold opacity-30 uppercase tracking-[0.2em]">Record manual stock change</p>
                            </ModalHeader>
                            <ModalBody className="py-8 space-y-6">
                                <div className="flex gap-2 items-end">
                                    <div className="flex-grow">
                                        <Select
                                            label="Product"
                                            placeholder="Select product"
                                            labelPlacement="outside"
                                            size="lg"
                                            radius="lg"
                                            classNames={{ trigger: "bg-black/5 h-14" }}
                                            selectedKeys={newAdjustment.productId ? [newAdjustment.productId] : []}
                                            onSelectionChange={(keys) => setNewAdjustment({...newAdjustment, productId: Array.from(keys)[0] as string})}
                                        >
                                            {products.map((product) => (
                                                <SelectItem key={product.id}>{product.name} ({product.quantity} in stock)</SelectItem>
                                            ))}
                                        </Select>
                                    </div>
                                    <Button 
                                        isIconOnly 
                                        variant="flat" 
                                        color="primary" 
                                        size="lg" 
                                        radius="lg" 
                                        className="h-14 w-14"
                                        onClick={() => setIsScannerOpen(true)}
                                    >
                                        <ScanLine size={24} />
                                    </Button>
                                </div>
                                <Select
                                    label="Movement Type"
                                    placeholder="Select type"
                                    labelPlacement="outside"
                                    size="lg"
                                    radius="lg"
                                    classNames={{ trigger: "bg-black/5 h-14" }}
                                    selectedKeys={newAdjustment.type ? [newAdjustment.type] : []}
                                    onSelectionChange={(keys) => setNewAdjustment({...newAdjustment, type: Array.from(keys)[0] as string})}
                                >
                                    {MOVEMENT_TYPES.map((type) => (
                                        <SelectItem key={type.key}>{type.label}</SelectItem>
                                    ))}
                                </Select>
                                <Input
                                    label="Quantity"
                                    placeholder="Enter quantity (use - for decrease)"
                                    labelPlacement="outside"
                                    size="lg"
                                    radius="lg"
                                    type="number"
                                    classNames={{ inputWrapper: "bg-black/5 h-14" }}
                                    value={newAdjustment.quantity}
                                    onValueChange={(val) => setNewAdjustment({...newAdjustment, quantity: val})}
                                />
                                <Textarea
                                    label="Notes"
                                    placeholder="Reason for adjustment..."
                                    labelPlacement="outside"
                                    radius="lg"
                                    classNames={{ inputWrapper: "bg-black/5" }}
                                    value={newAdjustment.notes}
                                    onValueChange={(val) => setNewAdjustment({...newAdjustment, notes: val})}
                                />
                            </ModalBody>
                            <ModalFooter className="border-t border-black/5 pt-6">
                                <Button variant="light" className="font-bold h-12 px-8" onPress={onClose}>Cancel</Button>
                                <Button color="secondary" className="font-black h-12 px-10 shadow-xl shadow-secondary/20" radius="full" onClick={handleAdjustment} isLoading={isLoading}>
                                    Record Adjustment
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
