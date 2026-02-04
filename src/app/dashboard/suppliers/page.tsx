'use client';

import {
    Avatar,
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
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    useDisclosure
} from '@heroui/react';
import {
    Banknote,
    Briefcase,
    Building2,
    CheckCircle2,
    ChevronRight,
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
                onOpenChange();
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
                            <Truck size={22} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-primary">Vendor Directory</h1>
                    </div>
                    <p className="text-black/40 dark:text-white/40 font-bold ml-1">Manage supply chain partners and procurement channels.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/suppliers/settlements">
                        <Button variant="flat" color="success" className="font-bold rounded-2xl" startContent={<Banknote size={18} />}>
                            Settlement Ledger
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
                    <Button color="primary" radius="full" size="lg" className="font-black px-8 shadow-xl shadow-primary/20" startContent={<Plus size={20} />} onClick={onOpen}>
                        Add Supplier
                    </Button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="bg-card border border-soft p-6" radius="lg">
                    <CardBody className="flex flex-row items-center gap-4 p-0">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <Building2 size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-muted">Active Partners</p>
                            <h2 className="text-2xl font-black">{suppliers.length}</h2>
                        </div>
                    </CardBody>
                </Card>
                <Card className="bg-card border border-soft p-6" radius="lg">
                    <CardBody className="flex flex-row items-center gap-4 p-0">
                        <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center text-success">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-muted">GST Verified</p>
                            <h2 className="text-2xl font-black">{suppliers.filter(s => s.gstNumber).length}</h2>
                        </div>
                    </CardBody>
                </Card>
                <Card className="bg-card border border-soft p-6" radius="lg">
                    <CardBody className="flex flex-row items-center gap-4 p-0">
                        <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                            <Briefcase size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-muted">Consignment Items</p>
                            <h2 className="text-2xl font-black">{suppliers.reduce((acc, s) => acc + (s._count?.products || 0), 0)}</h2>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Supplier List Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-4 max-w-md">
                    <Input
                        placeholder="Search vendors..."
                        labelPlacement="outside"
                        startContent={<Search size={18} className="text-muted" />}
                        value={searchTerm}
                        onValueChange={setSearchTerm}
                        classNames={{
                            inputWrapper: "h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700"
                        }}
                    />
                </div>

                <Table
                    aria-label="Vendor Table"
                    classNames={{
                        wrapper: "p-0 bg-card border border-soft rounded-2xl overflow-hidden shadow-none",
                        th: "bg-transparent h-14 font-semibold uppercase tracking-wider text-xs text-muted px-6",
                        td: "py-5 px-6",
                        tr: "border-b border-soft last:border-none",
                    }}
                >
                    <TableHeader>
                        <TableColumn>VENDOR</TableColumn>
                        <TableColumn>CONTACT PERSON</TableColumn>
                        <TableColumn>CONTACT INFO</TableColumn>
                        <TableColumn>GST NUMBER</TableColumn>
                        <TableColumn>INVENTORY</TableColumn>
                        <TableColumn align="center">ACTION</TableColumn>
                    </TableHeader>
                    <TableBody>
                        {filteredSuppliers.map((sup) => (
                            <TableRow key={sup.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                <TableCell>
                                    <div className="flex items-center gap-4">
                                        <Avatar name={sup.name} radius="lg" className="bg-primary/10 text-primary font-black uppercase" />
                                        <div className="flex flex-col">
                                            <span className="font-black tracking-tight">{sup.name}</span>
                                            <span className="text-[10px] font-bold opacity-30 uppercase tracking-widest">{sup.city || 'N/A'}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <User size={14} className="opacity-30" />
                                        <span className="text-sm">{sup.contactPerson || 'N/A'}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 text-xs opacity-50"><Mail size={12} /> {sup.email || '--'}</div>
                                        <div className="flex items-center gap-2 text-[10px] font-black"><Phone size={10} /> {sup.phone || '--'}</div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {sup.gstNumber ? (
                                        <Chip variant="flat" size="sm" color="success" className="font-black text-[10px]">
                                            {sup.gstNumber}
                                        </Chip>
                                    ) : (
                                        <span className="text-[10px] opacity-20 font-black italic uppercase">Unregistered</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <span className="font-black opacity-30 text-lg">{sup._count?.products || 0}</span>
                                </TableCell>
                                <TableCell>
                                    <Button isIconOnly radius="full" variant="light" size="sm"><ChevronRight size={18} className="opacity-30" /></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Add Supplier Modal */}
            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                size="3xl"
                scrollBehavior="inside"
                classNames={{
                    backdrop: "bg-black/50 backdrop-blur-sm",
                    base: "theme-modal rounded-2xl",
                    header: "border-b border-zinc-200 dark:border-zinc-800",
                    body: "py-6",
                    footer: "border-t border-zinc-200 dark:border-zinc-800",
                }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <h2 className="text-xl font-bold">Onboard Supplier</h2>
                                <p className="text-sm text-muted font-normal">Partner and Vendor Registration</p>
                            </ModalHeader>
                            <ModalBody className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Business Name"
                                        placeholder="e.g. Acme Parts Corp"
                                        labelPlacement="outside"
                                        size="lg"
                                        radius="lg"
                                        classNames={{
                                            inputWrapper: "h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700"
                                        }}
                                        value={newSupplier.name}
                                        onValueChange={(val) => setNewSupplier({...newSupplier, name: val})}
                                    />
                                    <Input
                                        label="GST Number"
                                        placeholder="e.g. 07AAAAA0000A1Z5"
                                        labelPlacement="outside"
                                        size="lg"
                                        radius="lg"
                                        classNames={{
                                            inputWrapper: "h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700"
                                        }}
                                        value={newSupplier.gstNumber}
                                        onValueChange={(val) => setNewSupplier({...newSupplier, gstNumber: val})}
                                    />
                                    <Input
                                        label="Contact Person"
                                        placeholder="Full Name"
                                        labelPlacement="outside"
                                        size="lg"
                                        radius="lg"
                                        classNames={{
                                            inputWrapper: "h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700"
                                        }}
                                        value={newSupplier.contactPerson}
                                        onValueChange={(val) => setNewSupplier({...newSupplier, contactPerson: val})}
                                    />
                                    <Input
                                        label="Email Address"
                                        placeholder="vendor@example.com"
                                        labelPlacement="outside"
                                        size="lg"
                                        radius="lg"
                                        classNames={{
                                            inputWrapper: "h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700"
                                        }}
                                        value={newSupplier.email}
                                        onValueChange={(val) => setNewSupplier({...newSupplier, email: val})}
                                    />
                                    <Input
                                        label="Phone Number"
                                        placeholder="+91 00000 00000"
                                        labelPlacement="outside"
                                        size="lg"
                                        radius="lg"
                                        classNames={{
                                            inputWrapper: "h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700"
                                        }}
                                        value={newSupplier.phone}
                                        onValueChange={(val) => setNewSupplier({...newSupplier, phone: val})}
                                    />
                                    <Input
                                        label="WhatsApp Number"
                                        placeholder="Optional"
                                        labelPlacement="outside"
                                        size="lg"
                                        radius="lg"
                                        classNames={{
                                            inputWrapper: "h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700"
                                        }}
                                        value={newSupplier.whatsapp}
                                        onValueChange={(val) => setNewSupplier({...newSupplier, whatsapp: val})}
                                    />
                                    <Input
                                        label="City"
                                        placeholder="Noida"
                                        labelPlacement="outside"
                                        size="lg"
                                        radius="lg"
                                        classNames={{
                                            inputWrapper: "h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700"
                                        }}
                                        value={newSupplier.city}
                                        onValueChange={(val) => setNewSupplier({...newSupplier, city: val})}
                                    />
                                    <Input
                                        label="State/Region"
                                        placeholder="Delhi NCR"
                                        labelPlacement="outside"
                                        size="lg"
                                        radius="lg"
                                        classNames={{
                                            inputWrapper: "h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700"
                                        }}
                                        value={newSupplier.state}
                                        onValueChange={(val) => setNewSupplier({...newSupplier, state: val})}
                                    />
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="flat" className="font-semibold" onPress={onClose}>Cancel</Button>
                                <Button color="primary" className="font-semibold" onClick={handleAddSupplier} isLoading={isLoading}>
                                    Register Partner
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
