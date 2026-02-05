'use client';

import BarcodeScanner from '@/components/ui/BarcodeScanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { useDisclosure } from '@/hooks/useDisclosure';
import {
    ArrowDownCircle,
    ArrowUpCircle,
    Calendar,
    Download,
    FileText,
    Filter,
    Loader2,
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
                onOpenChange(false);
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

    const getBadgeVariant = (color: string) => {
        switch (color) {
            case 'success':
            case 'primary':
            case 'secondary':
                return 'secondary';
            case 'danger':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <FileText size={22} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-black tracking-tight font-heading">Audit Trail</h1>
                    </div>
                    <p className="text-foreground/50 font-bold ml-1">Complete history of all stock movements.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="secondary" className="font-bold rounded-2xl">
                        <Download size={18} />
                        Export CSV
                    </Button>
                    <Button className="font-black px-8 shadow-xl shadow-secondary/20 rounded-full" size="lg" onClick={onOpen}>
                        <Plus size={20} />
                        Manual Adjustment
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="modern-card bg-success text-white p-4 rounded-lg">
                    <CardContent className="p-0">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Stock In</p>
                        <h2 className="text-2xl font-black">{getTotalByType('PURCHASE') + getTotalByType('RETURN_IN')}</h2>
                    </CardContent>
                </Card>
                <Card className="modern-card bg-primary text-white p-4 rounded-lg">
                    <CardContent className="p-0">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Stock Out</p>
                        <h2 className="text-2xl font-black">{getTotalByType('SALE') + getTotalByType('RETURN_OUT')}</h2>
                    </CardContent>
                </Card>
                <Card className="modern-card bg-warning text-white p-4 rounded-lg">
                    <CardContent className="p-0">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Transfers</p>
                        <h2 className="text-2xl font-black">{getTotalByType('TRANSFER')}</h2>
                    </CardContent>
                </Card>
                <Card className="modern-card bg-danger text-white p-4 rounded-lg">
                    <CardContent className="p-0">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Damage</p>
                        <h2 className="text-2xl font-black">{getTotalByType('DAMAGE')}</h2>
                    </CardContent>
                </Card>
                <Card className="modern-card bg-secondary text-white p-4 rounded-lg">
                    <CardContent className="p-0">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Adjustments</p>
                        <h2 className="text-2xl font-black">{getTotalByType('ADJUSTMENT')}</h2>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="modern-card p-6 rounded-lg">
                <CardContent className="p-0">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Filter size={16} className="opacity-40" />
                            <span className="text-xs font-black uppercase tracking-widest opacity-40">Filters:</span>
                        </div>
                        <div className="relative max-w-[200px]">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                            <Input
                                placeholder="Search product or user..."
                                className="bg-black/5 h-10 pl-9 rounded-lg"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select
                            value={filterType}
                            onValueChange={(val) => setFilterType(val)}
                        >
                            <SelectTrigger className="bg-black/5 h-10 max-w-[160px] rounded-lg">
                                <SelectValue placeholder="Movement Type" />
                            </SelectTrigger>
                            <SelectContent>
                                {MOVEMENT_TYPES.map((type) => (
                                    <SelectItem key={type.key} value={type.key}>{type.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="flex items-center gap-2">
                            <Calendar size={14} className="opacity-40" />
                            <Input
                                type="date"
                                className="bg-black/5 h-10 w-[140px] rounded-lg"
                                value={filterStartDate}
                                onChange={(e) => setFilterStartDate(e.target.value)}
                            />
                            <span className="text-xs opacity-40">to</span>
                            <Input
                                type="date"
                                className="bg-black/5 h-10 w-[140px] rounded-lg"
                                value={filterEndDate}
                                onChange={(e) => setFilterEndDate(e.target.value)}
                            />
                        </div>
                        <Button
                            variant="secondary"
                            size="sm"
                            className="rounded-lg"
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
                </CardContent>
            </Card>

            {/* Table */}
            <div className="modern-card theme-table-wrapper border border-black/5 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-none">
                <table className="w-full">
                    <thead>
                        <tr className="bg-black/[0.02] dark:bg-white/[0.02]">
                            <th className="h-14 font-black uppercase tracking-wider text-[10px] opacity-40 px-6 text-left">DATE</th>
                            <th className="h-14 font-black uppercase tracking-wider text-[10px] opacity-40 px-6 text-left">PRODUCT</th>
                            <th className="h-14 font-black uppercase tracking-wider text-[10px] opacity-40 px-6 text-left">TYPE</th>
                            <th className="h-14 font-black uppercase tracking-wider text-[10px] opacity-40 px-6 text-left">QUANTITY</th>
                            <th className="h-14 font-black uppercase tracking-wider text-[10px] opacity-40 px-6 text-left">BY</th>
                            <th className="h-14 font-black uppercase tracking-wider text-[10px] opacity-40 px-6 text-left">NOTES</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} className="py-8 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                </td>
                            </tr>
                        ) : filteredMovements.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-8 text-center text-muted-foreground">No movements found</td>
                            </tr>
                        ) : (
                            filteredMovements.map((movement) => {
                                const typeConfig = getTypeConfig(movement.type);
                                const TypeIcon = typeConfig.icon;
                                return (
                                    <tr key={movement.id} className="border-b last:border-none border-black/5">
                                        <td className="py-4 px-6 font-bold">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black">
                                                    {new Date(movement.createdAt).toLocaleDateString()}
                                                </span>
                                                <span className="text-[10px] opacity-40">
                                                    {new Date(movement.createdAt).toLocaleTimeString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 font-bold">
                                            <div className="flex flex-col">
                                                <span className="font-black text-sm">{movement.product.name}</span>
                                                <span className="text-[10px] opacity-40 uppercase">{movement.product.sku}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 font-bold">
                                            <Badge
                                                variant={getBadgeVariant(typeConfig.color)}
                                                className="font-black text-[10px] uppercase"
                                            >
                                                <TypeIcon size={12} className="mr-1" />
                                                {typeConfig.label}
                                            </Badge>
                                        </td>
                                        <td className="py-4 px-6 font-bold">
                                            <span className={`font-black text-lg ${
                                                movement.quantity > 0 ? 'text-success' : 'text-danger'
                                            }`}>
                                                {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 font-bold">
                                            <span className="text-xs">{movement.user.name || movement.user.email}</span>
                                        </td>
                                        <td className="py-4 px-6 font-bold">
                                            <span className="text-xs opacity-60 truncate max-w-[150px] block">
                                                {movement.notes || '-'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
                {totalPages > 1 && (
                    <div className="flex w-full justify-center py-4 border-t border-black/5">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                Previous
                            </Button>
                            <span className="text-sm font-medium px-4">
                                Page {page} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <BarcodeScanner
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                onScanSuccess={handleScanSuccess}
            />

            {/* Manual Adjustment Modal */}
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-lg modern-card p-6">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black tracking-tight">Stock Adjustment</DialogTitle>
                        <DialogDescription className="text-xs font-bold opacity-30 uppercase tracking-[0.2em]">Record manual stock change</DialogDescription>
                    </DialogHeader>
                    <div className="py-8 space-y-6">
                        <div className="flex gap-2 items-end">
                            <div className="flex-grow space-y-2">
                                <Label>Product</Label>
                                <Select
                                    value={newAdjustment.productId}
                                    onValueChange={(val) => setNewAdjustment({...newAdjustment, productId: val})}
                                >
                                    <SelectTrigger className="bg-black/5 h-14 rounded-lg">
                                        <SelectValue placeholder="Select product" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {products.map((product) => (
                                            <SelectItem key={product.id} value={product.id}>{product.name} ({product.quantity} in stock)</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                variant="secondary"
                                size="icon"
                                className="h-14 w-14 rounded-lg"
                                onClick={() => setIsScannerOpen(true)}
                            >
                                <ScanLine size={24} />
                            </Button>
                        </div>
                        <div className="space-y-2">
                            <Label>Movement Type</Label>
                            <Select
                                value={newAdjustment.type}
                                onValueChange={(val) => setNewAdjustment({...newAdjustment, type: val})}
                            >
                                <SelectTrigger className="bg-black/5 h-14 rounded-lg">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {MOVEMENT_TYPES.map((type) => (
                                        <SelectItem key={type.key} value={type.key}>{type.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Quantity</Label>
                            <Input
                                placeholder="Enter quantity (use - for decrease)"
                                type="number"
                                className="bg-black/5 h-14 rounded-lg"
                                value={newAdjustment.quantity}
                                onChange={(e) => setNewAdjustment({...newAdjustment, quantity: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Textarea
                                placeholder="Reason for adjustment..."
                                className="bg-black/5 rounded-lg"
                                value={newAdjustment.notes}
                                onChange={(e) => setNewAdjustment({...newAdjustment, notes: e.target.value})}
                            />
                        </div>
                    </div>
                    <DialogFooter className="border-t border-black/5 pt-6">
                        <Button variant="ghost" className="font-bold h-12 px-8" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button className="font-black h-12 px-10 shadow-xl shadow-secondary/20 rounded-full" onClick={handleAdjustment} disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Record Adjustment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
