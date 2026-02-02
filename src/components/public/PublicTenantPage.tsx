'use client';

import {
    Button,
    Card,
    CardBody,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalHeader,
    useDisclosure
} from '@heroui/react';
import {
    CheckCircle2,
    Clock,
    Globe,
    MessageCircle,
    Phone,
    Search,
    Wrench
} from 'lucide-react';
import { useState } from 'react';

interface PublicTenantPageProps {
    tenant: {
        id: string;
        name: string;
        logo?: string;
        primaryColor?: string;
        address?: string;
        city?: string;
        phone?: string;
    };
}

export default function PublicTenantPage({ tenant }: PublicTenantPageProps) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [ticketNumber, setTicketNumber] = useState('');
    const [repairStatus, setRepairStatus] = useState<any>(null);
    const [isSearching, setIsSearching] = useState(false);

    const handleCheckStatus = async () => {
        setIsSearching(true);
        try {
            // Simulated repair lookup - in prod this would call a public repair API
            await new Promise(resolve => setTimeout(resolve, 1500));
            setRepairStatus({
                status: 'IN_REPAIR',
                progress: 65,
                estimatedDelivery: 'Tomorrow, 5:00 PM',
                notes: 'Parts replaced. Final testing in progress.'
            });
        } catch (error) {
            alert('Ticket not found');
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#030407] text-white selection:bg-primary selection:text-black">
            {/* Ambient Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 blur-[120px] rounded-full animate-pulse delay-1000" />
            </div>

            <nav className="relative z-10 px-8 py-8 flex justify-between items-center max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-black text-black">
                        {tenant.name.charAt(0)}
                    </div>
                    <span className="text-xl font-black tracking-tighter uppercase">{tenant.name}</span>
                </div>
                <div className="flex items-center gap-6">
                    <Button variant="light" className="font-bold opacity-60 hover:opacity-100 hidden md:flex">Our Services</Button>
                    <Button color="primary" radius="full" className="font-black px-8" onClick={onOpen}>Inquire Now</Button>
                </div>
            </nav>

            <main className="relative z-10 max-w-7xl mx-auto px-8 py-20 lg:py-32 grid lg:grid-cols-2 gap-20 items-center">
                {/* Hero Content */}
                <div className="space-y-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-primary">
                        <Globe size={12} /> Live Powered by <span className="italic">Ease</span><span className="text-primary italic">Inventory</span>
                    </div>
                    <h1 className="text-6xl lg:text-8xl font-black leading-none tracking-tight">
                        Expert Care for Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Premium Tech</span>
                    </h1>
                    <p className="text-lg text-white/40 font-bold max-w-lg leading-relaxed">
                        Authorized service center for premium electronics. From diagnosis to final delivery, we handle your devices with precision and care.
                    </p>
                    <div className="flex items-center gap-6 pt-4">
                        <div className="flex flex-col">
                            <span className="text-3xl font-black">4.9/5</span>
                            <span className="text-[10px] font-black uppercase opacity-30 tracking-widest">Customer Rating</span>
                        </div>
                        <div className="w-[1px] h-12 bg-white/10" />
                        <div className="flex flex-col">
                            <span className="text-3xl font-black">15k+</span>
                            <span className="text-[10px] font-black uppercase opacity-30 tracking-widest">Repairs Done</span>
                        </div>
                    </div>
                </div>

                {/* Repair Status Widget */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <Card className="modern-card bg-white/5 backdrop-blur-3xl border border-white/10 p-10 rounded-[3rem] relative overflow-visible shadow-2xl">
                        <CardBody className="p-0 space-y-8">
                            <div>
                                <h3 className="text-2xl font-black mb-2">Check Repair Progress</h3>
                                <p className="text-xs font-bold opacity-40 uppercase tracking-widest">Enter your ticket number to track live status</p>
                            </div>

                            <div className="space-y-4">
                                <Input 
                                    placeholder="e.g. TIC-10024"
                                    size="lg"
                                    radius="lg"
                                    value={ticketNumber}
                                    onValueChange={setTicketNumber}
                                    startContent={<Search size={20} className="opacity-30" />}
                                    classNames={{
                                        inputWrapper: "bg-white/5 h-16 border border-white/5 group-hover:border-white/20 transition-all",
                                        input: "font-black"
                                    }}
                                />
                                <Button 
                                    color="primary" 
                                    size="lg" 
                                    radius="lg" 
                                    className="w-full h-16 font-black text-lg shadow-xl shadow-primary/20"
                                    isLoading={isSearching}
                                    onClick={handleCheckStatus}
                                >
                                    Track Live Device
                                </Button>
                            </div>

                            {repairStatus && (
                                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Status: {repairStatus.status}</span>
                                        </div>
                                        <span className="text-xs font-bold opacity-40">{repairStatus.progress}% Complete</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary" style={{ width: `${repairStatus.progress}%` }} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-[8px] font-black uppercase tracking-widest opacity-30">Est. Delivery</p>
                                            <p className="text-xs font-bold">{repairStatus.estimatedDelivery}</p>
                                        </div>
                                        <div className="space-y-1 text-right">
                                            <p className="text-[8px] font-black uppercase tracking-widest opacity-30">Notes</p>
                                            <p className="text-xs font-bold truncate">{repairStatus.notes}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </div>
            </main>

            {/* Features Row */}
            <section className="max-w-7xl mx-auto px-8 py-20 grid md:grid-cols-3 gap-8">
                <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <CheckCircle2 size={24} />
                    </div>
                    <h4 className="text-xl font-black">Genuine Parts</h4>
                    <p className="text-sm font-bold opacity-30 leading-relaxed">We only use certified OEM components for all your hardware repairs and upgrades.</p>
                </div>
                <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                        <Clock size={24} />
                    </div>
                    <h4 className="text-xl font-black">Fast Turnaround</h4>
                    <p className="text-sm font-bold opacity-30 leading-relaxed">Most smartphone and laptop repairs are completed within 48 business hours.</p>
                </div>
                <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-warning/10 flex items-center justify-center text-warning">
                        <Wrench size={24} />
                    </div>
                    <h4 className="text-xl font-black">Warranty Cover</h4>
                    <p className="text-sm font-bold opacity-30 leading-relaxed">All our services come with a standard 90-day peace-of-mind warranty cover.</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="max-w-7xl mx-auto px-8 py-20 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-black text-xs">{tenant.name.charAt(0)}</div>
                        <span className="font-black uppercase tracking-widest text-xs opacity-60">{tenant.name}</span>
                    </div>
                    <p className="text-xs font-bold opacity-30">{tenant.address}, {tenant.city}</p>
                </div>
                <div className="flex gap-10">
                    <div className="flex items-center gap-2 text-primary font-black text-xs uppercase cursor-pointer hover:underline">
                        <Phone size={14} /> Contact Business
                    </div>
                    <div className="flex items-center gap-2 text-secondary font-black text-xs uppercase cursor-pointer hover:underline">
                        <MessageCircle size={14} /> WhatsApp Us
                    </div>
                </div>
            </footer>

            {/* Inquiry Modal */}
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg" radius="lg" classNames={{
                backdrop: "bg-black/80 backdrop-blur-xl",
                base: "bg-neutral-900 border border-white/10 p-6 text-white"
            }}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <h2 className="text-2xl font-black">Direct Inquiry</h2>
                                <p className="text-[10px] font-black uppercase opacity-40 tracking-widest">Connect with local experts</p>
                            </ModalHeader>
                            <ModalBody className="space-y-6 py-8">
                                <Input label="Full Name" placeholder="Alex Smith" labelPlacement="outside" radius="lg" classNames={{ inputWrapper: "bg-white/5 h-14" }} />
                                <Input label="Phone Number" placeholder="+91 00000 00000" labelPlacement="outside" radius="lg" classNames={{ inputWrapper: "bg-white/5 h-14" }} />
                                <Input label="What are you looking for?" placeholder="e.g. MacBook Pro repair, iPhone battery" labelPlacement="outside" radius="lg" classNames={{ inputWrapper: "bg-white/5 h-14" }} />
                                <Button color="primary" className="w-full h-14 font-black text-lg" radius="full" onPress={onClose}>Send Request</Button>
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
