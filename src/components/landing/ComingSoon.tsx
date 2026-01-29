'use client';

import { Logo } from '@/components/icons/Logo';
import { Button, Card, CardBody, Chip, Input } from '@heroui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Building2, CheckCircle2, Globe, Rocket, Shield, Store, Users, Zap } from 'lucide-react';
import React, { useState } from 'react';

const ComingSoon: React.FC = () => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await fetch('/api/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    name,
                    businessName,
                    interests: ['ERP', 'Inventory', 'Shop Management']
                })
            });
            if (res.ok) setIsSubmitted(true);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#030407] text-white flex flex-col items-center justify-center p-6 text-center overflow-hidden selection:bg-primary selection:text-black">
            {/* Ambient Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary/20 blur-[160px] rounded-full animate-pulse transition-all duration-1000" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-secondary/20 blur-[160px] rounded-full animate-pulse delay-1000 transition-all duration-1000" />
                <div className="absolute top-[30%] left-[20%] w-[30%] h-[30%] bg-warning/10 blur-[140px] rounded-full animate-drift" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto py-20 px-4">
                {/* Logo Section */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1, ease: "circOut" }}
                    className="flex justify-center mb-16"
                >
                    <div className="relative group">
                        <div className="absolute inset-0 bg-primary/40 blur-3xl rounded-full scale-110 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
                        <div className="bg-black/50 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] relative">
                            <Logo size={120} />
                        </div>
                    </div>
                </motion.div>

                {/* Hero Section */}
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 1 }}
                    className="space-y-8 mb-20"
                >
                    <div className="flex flex-wrap justify-center gap-3">
                        <Chip variant="flat" color="primary" className="font-black uppercase tracking-widest text-[10px] px-6 py-2 bg-primary/10 border border-primary/20">
                            INDIA READY ERP 🇮🇳
                        </Chip>
                        <Chip variant="flat" color="secondary" className="font-black uppercase tracking-widest text-[10px] px-6 py-2 bg-secondary/10 border border-secondary/20">
                            GST COMPLIANT
                        </Chip>
                    </div>

                    <h1 className="text-6xl md:text-9xl font-black tracking-tight leading-[0.85] uppercase">
                        Master Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-secondary italic">Business Pulse.</span>
                    </h1>

                    <p className="text-xl md:text-3xl font-bold text-white/40 max-w-3xl mx-auto leading-relaxed italic tracking-tight">
                        The definitive Shop Management & ERP platform for ambitious retailers, service centers, and distributors.
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-5 gap-10 items-start">
                    {/* Features Showcase */}
                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { title: 'ERP Solution', desc: 'Unified control for products, sales, and complex logistics.', icon: Rocket },
                            { title: 'Inventory Intel', desc: 'S/N tracking, multi-location stock, and tiered pricing.', icon: Zap },
                            { title: 'Shop Authority', desc: 'Professional job cards & real-time customer repair tracking.', icon: Store },
                            { title: 'Personnel Guard', desc: 'Verified attendance and automated payroll generation.', icon: Users },
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + (idx * 0.1) }}
                                className="group p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-primary/40 transition-all duration-500 text-left"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.1] border border-white/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-black transition-all duration-500 mb-6">
                                    <feature.icon size={28} />
                                </div>
                                <h3 className="font-black text-xl mb-2 uppercase tracking-tight">{feature.title}</h3>
                                <p className="text-sm font-bold opacity-30 leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Waitlist Card */}
                    <div className="lg:col-span-2">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Card className="modern-card bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-10 rounded-[3rem] shadow-2xl relative overflow-visible">
                                <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/20 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
                                <CardBody className="p-0 space-y-8">
                                    <div className="text-left">
                                        <h2 className="text-3xl font-black mb-2 uppercase tracking-tight">Join the Elite</h2>
                                        <p className="text-xs font-bold opacity-40 uppercase tracking-[0.2em]">Secure early access and exclusive benefits</p>
                                    </div>

                                    <AnimatePresence mode="wait">
                                        {!isSubmitted ? (
                                            <motion.form
                                                key="waitlist-form"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                onSubmit={handleSubmit}
                                                className="space-y-4"
                                            >
                                                <Input
                                                    label="Business Name"
                                                    placeholder="ACME Electronics"
                                                    labelPlacement="outside"
                                                    radius="lg"
                                                    value={businessName}
                                                    onValueChange={setBusinessName}
                                                    classNames={{
                                                        inputWrapper: "bg-white/5 h-14 border border-white/5 hover:border-white/20 transition-all",
                                                        input: "font-black"
                                                    }}
                                                />
                                                <Input
                                                    label="Your Name"
                                                    placeholder="Rahul Kumar"
                                                    labelPlacement="outside"
                                                    radius="lg"
                                                    value={name}
                                                    onValueChange={setName}
                                                    classNames={{
                                                        inputWrapper: "bg-white/5 h-14 border border-white/5 hover:border-white/20 transition-all",
                                                        input: "font-black"
                                                    }}
                                                />
                                                <Input
                                                    label="Work Email"
                                                    placeholder="rahul@acme.com"
                                                    labelPlacement="outside"
                                                    radius="lg"
                                                    required
                                                    type="email"
                                                    value={email}
                                                    onValueChange={setEmail}
                                                    classNames={{
                                                        inputWrapper: "bg-white/5 h-14 border border-white/5 hover:border-white/20 transition-all",
                                                        input: "font-black"
                                                    }}
                                                />
                                                <Button
                                                    color="primary"
                                                    className="w-full h-16 font-black text-xl shadow-2xl shadow-primary/30 uppercase tracking-widest mt-4"
                                                    radius="full"
                                                    type="submit"
                                                    isLoading={isLoading}
                                                    startContent={!isLoading && <Rocket size={20} />}
                                                >
                                                    Claim Access
                                                </Button>
                                            </motion.form>
                                        ) : (
                                            <motion.div
                                                key="success-message"
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className="py-10 text-center space-y-6"
                                            >
                                                <div className="w-20 h-20 bg-green-500/20 border-2 border-green-500/30 rounded-[2.5rem] flex items-center justify-center mx-auto text-green-500">
                                                    <CheckCircle2 size={40} />
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-3xl font-black uppercase tracking-tight">You&apos;re Onboard!</p>
                                                    <p className="text-sm font-bold opacity-40 leading-relaxed italic mx-auto max-w-[250px]">
                                                        Your VIP pass is secured. We&apos;ll reach out personally to finalize your onboarding.
                                                    </p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </CardBody>
                            </Card>
                        </motion.div>
                    </div>
                </div>

                {/* Trust Signals */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="mt-32 pt-20 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-12"
                >
                    {[
                        { label: 'Uptime', val: '99.99%', icon: Shield },
                        { label: 'India Regions', val: 'All 28', icon: Building2 },
                        { label: 'Security', val: 'AES-256', icon: Globe },
                        { label: 'Waitlist', val: '5k+', icon: Users },
                    ].map((stat, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 group">
                            <stat.icon size={20} className="text-primary opacity-30 group-hover:opacity-100 transition-opacity" />
                            <span className="text-3xl font-black">{stat.val}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-30">{stat.label}</span>
                        </div>
                    ))}
                </motion.div>
            </div>

            <footer className="fixed bottom-10 left-0 w-full flex justify-center opacity-10 pointer-events-none px-4">
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-[1em]">EaseInventory • Powered by Advanced Precision • 2026</span>
                </div>
            </footer>
        </div>
    );
};

export default ComingSoon;
