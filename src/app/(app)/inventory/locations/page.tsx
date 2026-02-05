'use client';

import { Button } from '@/components/ui/button';
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
import { useDisclosure } from '@/hooks/useDisclosure';
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
                onOpenChange(false);
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
                    <Button className="font-black px-8 shadow-xl shadow-secondary/20 rounded-full" size="lg" onClick={onOpen}>
                        <Plus size={20} />
                        Add Location
                    </Button>
                </div>
            </div>

            {/* Locations Table */}
            <div className="space-y-6">
                <div className="modern-card theme-table-wrapper border border-black/5 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-none">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-black/[0.02] dark:bg-white/[0.02]">
                                <th className="h-16 font-black uppercase tracking-wider text-[10px] opacity-40 px-8 text-left">LOCATION NAME</th>
                                <th className="h-16 font-black uppercase tracking-wider text-[10px] opacity-40 px-8 text-left">CODE</th>
                                <th className="h-16 font-black uppercase tracking-wider text-[10px] opacity-40 px-8 text-left">TYPE</th>
                                <th className="h-16 font-black uppercase tracking-wider text-[10px] opacity-40 px-8 text-left">ADDRESS</th>
                                <th className="h-16 font-black uppercase tracking-wider text-[10px] opacity-40 px-8 text-left">STOCK ITEMS</th>
                                <th className="h-16 font-black uppercase tracking-wider text-[10px] opacity-40 px-8 text-center">STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {locations.map((loc) => (
                                <tr key={loc.id} className="border-b last:border-none border-black/5 dark:border-white/10 hover:bg-black/[0.01] transition-colors">
                                    <td className="py-6 px-8 font-bold">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-black/5 flex items-center justify-center opacity-40">
                                                {getTypeIcon(loc.type)}
                                            </div>
                                            <span className="font-black">{loc.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-6 px-8 font-bold">
                                        <span className="text-xs font-black opacity-30 uppercase tracking-widest">{loc.code || 'N/A'}</span>
                                    </td>
                                    <td className="py-6 px-8 font-bold">
                                        <Badge variant="secondary" className="font-black text-[10px] uppercase">
                                            {loc.type}
                                        </Badge>
                                    </td>
                                    <td className="py-6 px-8 font-bold">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold leading-tight">{loc.address}</span>
                                            <span className="text-[10px] opacity-30 uppercase font-black">{loc.city}</span>
                                        </div>
                                    </td>
                                    <td className="py-6 px-8 font-bold">
                                        <span className="text-sm font-black text-secondary">{loc._count?.stock || 0} Products</span>
                                    </td>
                                    <td className="py-6 px-8 font-bold">
                                        <div className="flex items-center gap-2 justify-center">
                                           <div className="w-2 h-2 rounded-full bg-success" />
                                           <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Operational</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Location Modal */}
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">Register New Point</DialogTitle>
                        <DialogDescription className="text-xs font-bold opacity-30 uppercase">Identify a new physical site for supply chains</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Location Name</Label>
                                <Input
                                    placeholder="Main Warehouse"
                                    className="bg-black/5 h-14 rounded-lg"
                                    value={newLocation.name}
                                    onChange={(e) => setNewLocation({...newLocation, name: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Location Code</Label>
                                <Input
                                    placeholder="WH-01"
                                    className="bg-black/5 h-14 rounded-lg"
                                    value={newLocation.code}
                                    onChange={(e) => setNewLocation({...newLocation, code: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Site Type</Label>
                            <Select
                                value={newLocation.type}
                                onValueChange={(val) => setNewLocation({...newLocation, type: val})}
                            >
                                <SelectTrigger className="bg-black/5 h-14 rounded-lg">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="STORE">Retail Store</SelectItem>
                                    <SelectItem value="WAREHOUSE">Warehouse / Hub</SelectItem>
                                    <SelectItem value="SERVICE_CENTER">Service Center</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Address</Label>
                            <Input
                                placeholder="Full street address"
                                className="bg-black/5 h-14 rounded-lg"
                                value={newLocation.address}
                                onChange={(e) => setNewLocation({...newLocation, address: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>City</Label>
                            <Input
                                placeholder="Mumbai"
                                className="bg-black/5 h-14 rounded-lg"
                                value={newLocation.city}
                                onChange={(e) => setNewLocation({...newLocation, city: e.target.value})}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => onOpenChange(false)} className="font-bold">Cancel</Button>
                        <Button className="font-black px-10 rounded-full" onClick={handleCreate}>Save Location</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
