'use client';

import { Logo } from '@/components/icons/Logo';
import BetaGallery from '@/components/landing/BetaGallery';
import Footer from '@/components/landing/Footer';
import WhyUs from '@/components/landing/WhyUs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Building2, CheckCircle2, Globe, Loader2, Rocket, Shield, Store, Users, Zap } from 'lucide-react';
import React, { useState } from 'react';

const ComingSoon: React.FC = () => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [notifyOnRelease, setNotifyOnRelease] = useState(true);
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
                    notifyOnRelease,
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
        <div className="min-h-screen bg-[#030407] text-white flex flex-col items-center justify-center p-4 md:p-6 text-center overflow-hidden selection:bg-primary selection:text-black">
            {/* Ambient Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[100%] md:w-[60%] h-[60%] bg-primary/20 blur-[120px] md:blur-[160px] rounded-full animate-pulse transition-all duration-1000" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[100%] md:w-[60%] h-[60%] bg-secondary/20 blur-[120px] md:blur-[160px] rounded-full animate-pulse delay-1000 transition-all duration-1000" />
                <div className="absolute top-[30%] left-[20%] w-[50%] md:w-[30%] h-[30%] bg-warning/10 blur-[100px] md:blur-[140px] rounded-full animate-drift" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 contrast-150 brightness-50 mix-blend-overlay" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto py-12 md:py-20 px-2 md:px-4 w-full">
                {/* Logo Section */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1, ease: "circOut" }}
                    className="flex justify-center mb-10 md:mb-16"
                >
                    <div className="relative group cursor-pointer">
                        <motion.div 
                            animate={{ 
                                y: [0, -10, 0],
                                rotate: [0, 2, 0]
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="absolute inset-0 bg-primary/30 blur-3xl rounded-full scale-110 opacity-40 group-hover:opacity-100 transition-opacity duration-700" 
                        />
                        <div className="bg-black/40 backdrop-blur-2xl border border-white/10 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] relative hover:border-primary/50 transition-colors duration-500">
                            <Logo size={80} className="md:w-[120px] md:h-[120px]" />
                        </div>
                    </div>
                </motion.div>

                {/* Hero Section */}
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 1 }}
                    className="space-y-6 md:space-y-8 mb-16 md:mb-20"
                >
                    <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                        <Badge variant="secondary" className="font-black uppercase tracking-widest text-[8px] md:text-[10px] px-4 md:px-6 py-1 md:py-2 bg-primary/10 border border-primary/20 text-primary">
                            INDIA READY ERP
                        </Badge>
                        <Badge variant="secondary" className="font-black uppercase tracking-widest text-[8px] md:text-[10px] px-4 md:px-6 py-1 md:py-2 bg-secondary/10 border border-secondary/20">
                            GST COMPLIANT
                        </Badge>
                    </div>

                    <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tight leading-[1.15] md:leading-[0.85] uppercase">
                        Defy the Weight <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-secondary italic pb-6 px-4 inline-block transform translate-y-2">Of Operations.</span>
                    </h1>

                    <p className="text-lg md:text-2xl lg:text-3xl font-bold text-white/40 max-w-3xl mx-auto leading-relaxed italic tracking-tight px-4">
                        Stop fighting the pull of outdated legacy systems. Experience the <span className="text-white font-black">Antigravity Protocol</span>: High-precision management designed to make your business feel weightless.
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-5 gap-8 md:gap-10 items-start">
                    {/* Features Showcase */}
                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {[
                            { title: 'Operational Engine', desc: 'Unified control for products, sales, and seamless logistics management.', icon: Rocket },
                            { title: 'Inventory Intel', desc: 'Serial number tracking, multi-location stock, and dynamic pricing tools.', icon: Zap },
                            { title: 'Service Hub', desc: 'Professional job cards and real-time customer repair tracking.', icon: Store },
                            { title: 'Personnel Guard', desc: 'Automated attendance tracking and payroll management.', icon: Users },
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + (idx * 0.1) }}
                                className="group p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-primary/40 transition-all duration-500 text-left"
                            >
                                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.1] border border-white/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-black transition-all duration-500 mb-4 md:mb-6">
                                    <feature.icon size={24} className="md:w-[28px] md:h-[28px]" />
                                </div>
                                <h3 className="font-black text-lg md:text-xl mb-2 uppercase tracking-tight">{feature.title}</h3>
                                <p className="text-xs md:text-sm font-bold opacity-30 leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Waitlist Card */}
                    <div className="lg:col-span-2 w-full">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Card className="modern-card bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl relative overflow-visible">
                                <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/20 blur-3xl opacity-50 pointer-events-none" />
                                <CardContent className="p-0 space-y-6 md:space-y-8">
                                    <div className="text-left">
                                        <h2 className="text-2xl md:text-3xl font-black mb-1 md:mb-2 uppercase tracking-tight italic">Activate Protocol</h2>
                                        <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.15em] md:tracking-[0.2em]">Secure early access and exclusive operational benefits</p>
                                    </div>

                                    <AnimatePresence mode="wait">
                                        {!isSubmitted ? (
                                            <motion.form
                                                key="waitlist-form"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                onSubmit={handleSubmit}
                                                className="space-y-4 md:space-y-5"
                                            >
                                                <div className="space-y-2">
                                                    <label className="font-black uppercase text-[10px] tracking-widest opacity-40">Business Name</label>
                                                    <Input
                                                        placeholder="Vertex Solutions"
                                                        value={businessName}
                                                        onChange={(e) => setBusinessName(e.target.value)}
                                                        className="bg-white/5 h-16 md:h-20 border border-white/5 hover:border-white/20 focus:border-primary/50 px-4 font-black text-base md:text-lg rounded-xl"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="font-black uppercase text-[10px] tracking-widest opacity-40">Your Name</label>
                                                    <Input
                                                        placeholder="John Doe"
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        className="bg-white/5 h-16 md:h-20 border border-white/5 hover:border-white/20 focus:border-primary/50 px-4 font-black text-base md:text-lg rounded-xl"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="font-black uppercase text-[10px] tracking-widest opacity-40">Work Email</label>
                                                    <Input
                                                        placeholder="hello@vertex.com"
                                                        required
                                                        type="email"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        className="bg-white/5 h-16 md:h-20 border border-white/5 hover:border-white/20 focus:border-primary/50 px-4 font-black text-base md:text-lg rounded-xl"
                                                    />
                                                </div>

                                                {/* Notify on Release Checkbox */}
                                                <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                                                    <Checkbox
                                                        id="notify"
                                                        checked={notifyOnRelease}
                                                        onCheckedChange={(checked) => setNotifyOnRelease(checked === true)}
                                                    />
                                                    <label htmlFor="notify" className="flex items-center gap-2 text-sm font-bold cursor-pointer">
                                                        <Bell size={16} className="text-primary" />
                                                        <span>Notify me when EaseInventory launches</span>
                                                    </label>
                                                </div>

                                                <Button
                                                    className="w-full h-14 md:h-16 font-black text-lg md:text-xl shadow-2xl shadow-primary/30 uppercase tracking-widest mt-2 md:mt-4 rounded-full"
                                                    type="submit"
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? (
                                                        <Loader2 size={20} className="animate-spin" />
                                                    ) : (
                                                        <>
                                                            <Rocket size={20} className="mr-2" />
                                                            Mobilize Access
                                                        </>
                                                    )}
                                                </Button>
                                            </motion.form>
                                        ) : (
                                            <motion.div
                                                key="success-message"
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className="py-6 md:py-10 text-center space-y-4 md:space-y-6"
                                            >
                                                <div className="w-16 h-16 md:w-20 md:h-20 bg-green-500/20 border-2 border-green-500/30 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center mx-auto text-green-500">
                                                    <CheckCircle2 size={32} className="md:w-[40px] md:h-[40px]" />
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-2xl md:text-3xl font-black uppercase tracking-tight italic">You&apos;re Onboard!</p>
                                                    <p className="text-xs md:text-sm font-bold opacity-40 leading-relaxed italic mx-auto max-w-[220px] md:max-w-[250px]">
                                                        Your VIP pass is secured. We&apos;ll reach out personally to finalize your onboarding.
                                                    </p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>

                {/* Trust Signals */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="mt-20 md:mt-32 pt-12 md:pt-20 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12"
                >
                    {[
                        { label: 'Uptime', val: '99.99%', icon: Shield },
                        { label: 'India Regions', val: 'All 28', icon: Building2 },
                        { label: 'Security', val: 'AES-256', icon: Globe },
                        { label: 'Waitlist', val: '5k+', icon: Users },
                    ].map((stat, i) => (
                        <div key={i} className="flex flex-col items-center gap-1 md:gap-2 group">
                            <stat.icon size={18} className="text-primary opacity-30 group-hover:opacity-100 transition-opacity md:w-[20px] md:h-[20px]" />
                            <span className="text-2xl md:text-3xl font-black">{stat.val}</span>
                            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-30">{stat.label}</span>
                        </div>
                    ))}
                </motion.div>

                {/* Why Choose Us Section */}
                <WhyUs />

                {/* Beta Snapshots Gallery */}
                <BetaGallery />
            </div>

            {/* Full Footer */}
            <Footer />
        </div>
    );
};

export default ComingSoon;

