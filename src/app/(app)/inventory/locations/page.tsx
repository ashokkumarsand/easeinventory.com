'use client';

import {
    Button,
    Chip,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Select,
    SelectItem,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    useDisclosure
} from '@heroui/react';
import {
    Building2,
    Plus,
    Store,
    Warehouse,
    Wrench
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function LocationsPage() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [locations, setLocations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newLocation, setNewLocation] = useState({
        name: '',
        code: '',
        address: '',
        city: '',
        type: 'STORE'
    });

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/inventory/locations');
            const data = await response.json();
            setLocations(data.locations || []);
        } catch (error) {
            console.error('Fetch locations error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            const response = await fetch('/api/inventory/locations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newLocation),
            });

            if (response.ok) {
                fetchLocations();
                onOpenChange();
                setNewLocation({ name: '', code: '', address: '', city: '', type: 'STORE' });
            } else {
                alert('Failed to create location');
            }
        } catch (error) {
            alert('Error creating location');
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'WAREHOUSE': return <Warehouse size={18} />;
            case 'SERVICE_CENTER': return <Wrench size={18} />;
            default: return <Store size={18} />;
        }
    };

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                            <Building2 size={22} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-secondary">Inventory Locations</h1>
                    </div>
                    <p className="text-black/40 dark:text-white/40 font-bold ml-1">Define your physical stores and regional hubs.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button color="secondary" radius="full" size="lg" className="font-black px-8 shadow-xl shadow-secondary/20" startContent={<Plus size={20} />} onClick={onOpen}>
                        Add Location
                    </Button>
                </div>
            </div>

            {/* Locations Table */}
            <div className="space-y-6">
                <Table 
                    aria-label="Locations Table"
                    className="modern-card border-none"
                    classNames={{
                        wrapper: "p-0 modern-card theme-table-wrapper border border-black/5 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-none",
                        th: "bg-black/[0.02] dark:bg-white/[0.02] h-16 font-black uppercase tracking-wider text-[10px] opacity-40 px-8",
                        td: "py-6 px-8 font-bold",
                    }}
                >
                    <TableHeader>
                        <TableColumn>LOCATION NAME</TableColumn>
                        <TableColumn>CODE</TableColumn>
                        <TableColumn>TYPE</TableColumn>
                        <TableColumn>ADDRESS</TableColumn>
                        <TableColumn>STOCK ITEMS</TableColumn>
                        <TableColumn align="center">STATUS</TableColumn>
                    </TableHeader>
                    <TableBody>
                        {locations.map((loc) => (
                            <TableRow key={loc.id} className="border-b last:border-none border-black/5 dark:border-white/10 hover:bg-black/[0.01] transition-colors">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-black/5 flex items-center justify-center opacity-40">
                                            {getTypeIcon(loc.type)}
                                        </div>
                                        <span className="font-black">{loc.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-xs font-black opacity-30 uppercase tracking-widest">{loc.code || 'N/A'}</span>
                                </TableCell>
                                <TableCell>
                                    <Chip variant="flat" size="sm" className="font-black text-[10px] uppercase">
                                        {loc.type}
                                    </Chip>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold leading-tight">{loc.address}</span>
                                        <span className="text-[10px] opacity-30 uppercase font-black">{loc.city}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm font-black text-secondary">{loc._count?.stock || 0} Products</span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 justify-center">
                                       <div className="w-2 h-2 rounded-full bg-success" />
                                       <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Operational</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Add Location Modal */}
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="xl">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <h2 className="text-2xl font-black">Register New Point</h2>
                                <p className="text-xs font-bold opacity-30 uppercase">Identify a new physical site for supply chains</p>
                            </ModalHeader>
                            <ModalBody className="space-y-6 py-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <Input 
                                        label="Location Name" 
                                        placeholder="Main Warehouse" 
                                        labelPlacement="outside"
                                        radius="lg"
                                        size="lg"
                                        value={newLocation.name}
                                        onValueChange={(val) => setNewLocation({...newLocation, name: val})}
                                        classNames={{ inputWrapper: "bg-black/5 h-14" }}
                                    />
                                    <Input 
                                        label="Location Code" 
                                        placeholder="WH-01" 
                                        labelPlacement="outside"
                                        radius="lg"
                                        size="lg"
                                        value={newLocation.code}
                                        onValueChange={(val) => setNewLocation({...newLocation, code: val})}
                                        classNames={{ inputWrapper: "bg-black/5 h-14" }}
                                    />
                                </div>
                                <Select 
                                    label="Site Type" 
                                    placeholder="Select type" 
                                    labelPlacement="outside"
                                    radius="lg"
                                    size="lg"
                                    selectedKeys={[newLocation.type]}
                                    onSelectionChange={(keys) => setNewLocation({...newLocation, type: Array.from(keys)[0] as string})}
                                    classNames={{ trigger: "bg-black/5 h-14" }}
                                >
                                    <SelectItem key="STORE">Retail Store</SelectItem>
                                    <SelectItem key="WAREHOUSE">Warehouse / Hub</SelectItem>
                                    <SelectItem key="SERVICE_CENTER">Service Center</SelectItem>
                                </Select>
                                <Input 
                                    label="Address" 
                                    placeholder="Full street address" 
                                    labelPlacement="outside"
                                    radius="lg"
                                    size="lg"
                                    value={newLocation.address}
                                    onValueChange={(val) => setNewLocation({...newLocation, address: val})}
                                    classNames={{ inputWrapper: "bg-black/5 h-14" }}
                                />
                                <Input 
                                    label="City" 
                                    placeholder="Mumbai" 
                                    labelPlacement="outside"
                                    radius="lg"
                                    size="lg"
                                    value={newLocation.city}
                                    onValueChange={(val) => setNewLocation({...newLocation, city: val})}
                                    classNames={{ inputWrapper: "bg-black/5 h-14" }}
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose} className="font-bold">Cancel</Button>
                                <Button color="secondary" className="font-black px-10" radius="full" onClick={handleCreate}>Save Location</Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
