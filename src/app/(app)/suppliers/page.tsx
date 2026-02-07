'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { useDisclosure } from '@/hooks/useDisclosure';
import {
    Banknote,
    Briefcase,
    Building2,
    CheckCircle2,
    ChevronRight,
    IndianRupee,
    Loader2,
    Mail,
    Phone,
    Plus,
    Search,
    Truck,
    User
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import CSVImport from '@/components/ui/CSVImport';

export default function SuppliersPage() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // New Supplier State
    const [newSupplier, setNewSupplier] = useState({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        whatsapp: '',
        gstNumber: '',
        address: '',
        city: '',
        state: ''
    });

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/suppliers');
            const data = await response.json();
            setSuppliers(data.suppliers || []);
        } catch (error) {
            console.error('Fetch suppliers error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddSupplier = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/suppliers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSupplier),
            });

            if (response.ok) {
                fetchSuppliers();
                onOpenChange(false);
                setNewSupplier({
                    name: '',
                    contactPerson: '',
                    email: '',
                    phone: '',
                    whatsapp: '',
                    gstNumber: '',
                    address: '',
                    city: '',
                    state: ''
                });
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to add supplier');
            }
        } catch (error) {
            alert('Error creating supplier record');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredSuppliers = suppliers.filter(sup =>
        sup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sup.contactPerson && sup.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <Truck size={22} strokeWidth={2.5} aria-hidden="true" />
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-black tracking-tight font-heading">Vendor Directory</h1>
                    </div>
                    <p className="text-foreground/40 font-bold ml-1">Manage supply chain partners and procurement channels.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/suppliers/performance">
                        <Button variant="secondary" className="font-bold rounded-full gap-2">
                            <Briefcase size={18} aria-hidden="true" />
                            Performance
                        </Button>
                    </Link>
                    <Link href="/suppliers/settlements">
                        <Button variant="secondary" className="font-bold rounded-full gap-2">
                            <Banknote size={18} aria-hidden="true" />
                            Settlement Ledger
                        </Button>
                    </Link>
                    <Link href="/suppliers/payables">
                        <Button variant="secondary" className="font-bold rounded-full gap-2">
                            <IndianRupee size={18} aria-hidden="true" />
                            Payables
                        </Button>
                    </Link>
                    <CSVImport
                        title="Import Suppliers"
                        description="Bulk import vendors from CSV file"
                        templateUrl="/api/suppliers/import"
                        importUrl="/api/suppliers/import"
                        onSuccess={fetchSuppliers}
                        requiredFields={['name']}
                        fieldMappings={{
                            'Business Name': 'name',
                            'Contact Person': 'contactPerson',
                            'Email': 'email',
                            'Phone': 'phone',
                            'WhatsApp': 'whatsapp',
                            'Address': 'address',
                            'City': 'city',
                            'State': 'state',
                            'Pincode': 'pincode',
                            'GST Number': 'gstNumber',
                            'PAN Number': 'panNumber',
                            'Bank Name': 'bankName',
                            'Account Number': 'accountNumber',
                            'IFSC Code': 'ifscCode',
                        }}
                    />
                    <Button className="font-black px-8 shadow-xl shadow-primary/20 rounded-full gap-2" size="lg" onClick={onOpen}>
                        <Plus size={20} aria-hidden="true" />
                        Add Supplier
                    </Button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="modern-card p-6">
                    <CardContent className="flex flex-row items-center gap-4 p-0">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <Building2 size={24} aria-hidden="true" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-muted-foreground">Active Partners</p>
                            <h2 className="text-2xl font-black">{suppliers.length}</h2>
                        </div>
                    </CardContent>
                </Card>
                <Card className="modern-card p-6">
                    <CardContent className="flex flex-row items-center gap-4 p-0">
                        <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500">
                            <CheckCircle2 size={24} aria-hidden="true" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-muted-foreground">GST Verified</p>
                            <h2 className="text-2xl font-black">{suppliers.filter(s => s.gstNumber).length}</h2>
                        </div>
                    </CardContent>
                </Card>
                <Card className="modern-card p-6">
                    <CardContent className="flex flex-row items-center gap-4 p-0">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <Briefcase size={24} aria-hidden="true" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-muted-foreground">Consignment Items</p>
                            <h2 className="text-2xl font-black">{suppliers.reduce((acc, s) => acc + (s._count?.products || 0), 0)}</h2>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Supplier List Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-4 max-w-md">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" />
                        <Input
                            placeholder="Search vendors..."
                            className="pl-10 h-12 rounded-xl border border-foreground/10 bg-background"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                    <table className="w-full" aria-label="Vendor Table">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="bg-transparent h-14 font-semibold uppercase tracking-wider text-xs text-muted-foreground px-6 text-left">VENDOR</th>
                                <th className="bg-transparent h-14 font-semibold uppercase tracking-wider text-xs text-muted-foreground px-6 text-left">CONTACT PERSON</th>
                                <th className="bg-transparent h-14 font-semibold uppercase tracking-wider text-xs text-muted-foreground px-6 text-left">CONTACT INFO</th>
                                <th className="bg-transparent h-14 font-semibold uppercase tracking-wider text-xs text-muted-foreground px-6 text-left">GST NUMBER</th>
                                <th className="bg-transparent h-14 font-semibold uppercase tracking-wider text-xs text-muted-foreground px-6 text-left">INVENTORY</th>
                                <th className="bg-transparent h-14 font-semibold uppercase tracking-wider text-xs text-muted-foreground px-6 text-center">ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSuppliers.map((sup) => (
                                <tr key={sup.id} className="border-b border-border last:border-none hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                    <td className="py-5 px-6">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="bg-primary/10 text-primary font-black uppercase rounded-lg">
                                                <AvatarFallback className="bg-primary/10 text-primary font-black uppercase rounded-lg">
                                                    {sup.name?.charAt(0) || '?'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-black tracking-tight">{sup.name}</span>
                                                <span className="text-[10px] font-bold opacity-30 uppercase tracking-widest">{sup.city || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-5 px-6">
                                        <div className="flex items-center gap-2">
                                            <User size={14} className="opacity-30" />
                                            <span className="text-sm">{sup.contactPerson || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td className="py-5 px-6">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-xs opacity-50"><Mail size={12} /> {sup.email || '--'}</div>
                                            <div className="flex items-center gap-2 text-[10px] font-black"><Phone size={10} /> {sup.phone || '--'}</div>
                                        </div>
                                    </td>
                                    <td className="py-5 px-6">
                                        {sup.gstNumber ? (
                                            <Badge variant="secondary" className="font-black text-[10px] bg-green-500/10 text-green-600">
                                                {sup.gstNumber}
                                            </Badge>
                                        ) : (
                                            <span className="text-[10px] opacity-20 font-black italic uppercase">Unregistered</span>
                                        )}
                                    </td>
                                    <td className="py-5 px-6">
                                        <span className="font-black opacity-30 text-lg">{sup._count?.products || 0}</span>
                                    </td>
                                    <td className="py-5 px-6 text-center">
                                        <Link href={`/suppliers/${sup.id}`}>
                                            <Button variant="ghost" size="icon" className="rounded-full">
                                                <ChevronRight size={18} className="opacity-30" />
                                            </Button>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Supplier Modal */}
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="border-b border-foreground/5 px-8 py-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Truck size={20} className="text-primary" aria-hidden="true" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold">Add Supplier</DialogTitle>
                                <DialogDescription className="text-sm text-foreground/50 font-normal">Register a new vendor partner</DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    {/* Business Details */}
                    <div className="px-8 py-6 border-b border-foreground/5">
                        <div className="flex items-center gap-2 mb-5">
                            <Building2 size={16} className="text-primary" aria-hidden="true" />
                            <h4 className="text-sm font-bold text-foreground/70">Business Details</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="flex flex-col gap-1.5">
                                <Label className="text-sm font-semibold text-foreground/70">
                                    Business Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    placeholder="Enter company name"
                                    className="h-12 border border-foreground/10 hover:border-foreground/20 focus:border-primary bg-background"
                                    value={newSupplier.name}
                                    onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label className="text-sm font-semibold text-foreground/70">GST Number</Label>
                                <Input
                                    placeholder="e.g. 07AAAAA0000A1Z5"
                                    className="h-12 border border-foreground/10 hover:border-foreground/20 focus:border-primary bg-background"
                                    value={newSupplier.gstNumber}
                                    onChange={(e) => setNewSupplier({...newSupplier, gstNumber: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="px-8 py-6 border-b border-foreground/5">
                        <div className="flex items-center gap-2 mb-5">
                            <User size={16} className="text-primary" aria-hidden="true" />
                            <h4 className="text-sm font-bold text-foreground/70">Contact Information</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="flex flex-col gap-1.5">
                                <Label className="text-sm font-semibold text-foreground/70">Contact Person</Label>
                                <Input
                                    placeholder="Enter full name"
                                    className="h-12 border border-foreground/10 hover:border-foreground/20 focus:border-primary bg-background"
                                    value={newSupplier.contactPerson}
                                    onChange={(e) => setNewSupplier({...newSupplier, contactPerson: e.target.value})}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label className="text-sm font-semibold text-foreground/70">Email Address</Label>
                                <Input
                                    placeholder="vendor@example.com"
                                    className="h-12 border border-foreground/10 hover:border-foreground/20 focus:border-primary bg-background"
                                    value={newSupplier.email}
                                    onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label className="text-sm font-semibold text-foreground/70">Phone Number</Label>
                                <Input
                                    placeholder="+91 98765 43210"
                                    className="h-12 border border-foreground/10 hover:border-foreground/20 focus:border-primary bg-background"
                                    value={newSupplier.phone}
                                    onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label className="text-sm font-semibold text-foreground/70">WhatsApp</Label>
                                <Input
                                    placeholder="Optional"
                                    className="h-12 border border-foreground/10 hover:border-foreground/20 focus:border-primary bg-background"
                                    value={newSupplier.whatsapp}
                                    onChange={(e) => setNewSupplier({...newSupplier, whatsapp: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="px-8 py-6">
                        <div className="flex items-center gap-2 mb-5">
                            <Building2 size={16} className="text-primary" aria-hidden="true" />
                            <h4 className="text-sm font-bold text-foreground/70">Location</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="flex flex-col gap-1.5">
                                <Label className="text-sm font-semibold text-foreground/70">City</Label>
                                <Input
                                    placeholder="Enter city"
                                    className="h-12 border border-foreground/10 hover:border-foreground/20 focus:border-primary bg-background"
                                    value={newSupplier.city}
                                    onChange={(e) => setNewSupplier({...newSupplier, city: e.target.value})}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label className="text-sm font-semibold text-foreground/70">State / Region</Label>
                                <Input
                                    placeholder="Enter state"
                                    className="h-12 border border-foreground/10 hover:border-foreground/20 focus:border-primary bg-background"
                                    value={newSupplier.state}
                                    onChange={(e) => setNewSupplier({...newSupplier, state: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="border-t border-foreground/5 px-8 py-4">
                        <Button variant="secondary" className="font-semibold rounded-full" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button className="font-semibold px-6 rounded-full" onClick={handleAddSupplier} disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add Supplier
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
