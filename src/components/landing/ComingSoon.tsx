'use client';

import { Logo } from '@/components/icons/Logo';
import BetaGallery from '@/components/landing/BetaGallery';
import Footer from '@/components/landing/Footer';
import WaveBackground from '@/components/landing/WaveBackground';
import WhyUs from '@/components/landing/WhyUs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowRight,
    Bell,
    Building2,
    CheckCircle2,
    ChevronDown,
    Globe,
    Loader2,
    Rocket,
    Shield,
    Sparkles,
    Store,
    Users,
    Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

// Launch date: February 20th, 2026 at midnight IST
const LAUNCH_DATE = new Date('2026-02-20T00:00:00+05:30');

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

const CountdownUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
        <div className="relative">
            <motion.div
                key={value}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="w-16 h-16 md:w-20 md:h-20 backdrop-blur-sm rounded-2xl flex items-center justify-center"
                style={{
                    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.3)',
                }}
            >
                <span className="text-2xl md:text-3xl font-black tabular-nums">
                    {value.toString().padStart(2, '0')}
                </span>
            </motion.div>
        </div>
        <span className="mt-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">{label}</span>
    </div>
);

const Countdown = () => {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const calculateTimeLeft = () => {
            const difference = LAUNCH_DATE.getTime() - new Date().getTime();
            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(timer);
    }, []);

    if (!mounted) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex items-center justify-center gap-3 md:gap-4"
        >
            <CountdownUnit value={timeLeft.days} label="Days" />
            <span className="text-2xl font-black text-white/20 mt-[-24px]">:</span>
            <CountdownUnit value={timeLeft.hours} label="Hours" />
            <span className="text-2xl font-black text-white/20 mt-[-24px]">:</span>
            <CountdownUnit value={timeLeft.minutes} label="Min" />
            <span className="text-2xl font-black text-white/20 mt-[-24px]">:</span>
            <CountdownUnit value={timeLeft.seconds} label="Sec" />
        </motion.div>
    );
};

const ComingSoon: React.FC = () => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [notifyOnRelease, setNotifyOnRelease] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await fetch('/api/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    name: name || undefined,
                    businessName: businessName || undefined,
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

    // Stagger animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }
        }
    };

    return (
        <div className="min-h-screen bg-[#030407] text-white flex flex-col items-center justify-center p-4 md:p-6 text-center overflow-hidden selection:bg-primary selection:text-black">
            {/* Premium Wave Grid Background */}
            <div className="fixed inset-0">
                <WaveBackground variant="hero" />
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative z-10 max-w-5xl mx-auto py-12 md:py-20 px-2 md:px-4 w-full"
            >
                {/* Logo Section */}
                <motion.div variants={itemVariants} className="flex justify-center mb-8 md:mb-12">
                    <div className="relative group cursor-pointer">
                        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 opacity-0 group-hover:opacity-50 transition-opacity duration-700" />
                        <div
                            className="backdrop-blur-xl p-5 md:p-6 rounded-2xl relative transition-all duration-500"
                            style={{
                                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.3)',
                            }}
                        >
                            <Logo size={60} className="md:w-[80px] md:h-[80px]" />
                        </div>
                    </div>
                </motion.div>

                {/* Badges */}
                <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-2 md:gap-3 mb-6 md:mb-8">
                    <Badge variant="secondary" className="font-bold text-[10px] md:text-xs px-3 md:px-4 py-1.5 bg-primary/10 border border-primary/20 text-primary rounded-full">
                        <Sparkles size={12} className="mr-1.5" />
                        India-Ready ERP
                    </Badge>
                    <Badge variant="secondary" className="font-bold text-[10px] md:text-xs px-3 md:px-4 py-1.5 bg-white/5 border border-white/10 text-white/70 rounded-full">
                        GST Compliant
                    </Badge>
                    <Badge variant="secondary" className="font-bold text-[10px] md:text-xs px-3 md:px-4 py-1.5 bg-white/5 border border-white/10 text-white/70 rounded-full">
                        Multi-Location
                    </Badge>
                </motion.div>

                {/* Countdown Timer */}
                <motion.div variants={itemVariants} className="mb-8 md:mb-12">
                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Launching In</p>
                    <Countdown />
                </motion.div>

                {/* Hero Section */}
                <motion.div variants={itemVariants} className="space-y-4 md:space-y-6 mb-10 md:mb-14">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] font-heading">
                        Inventory management
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-cyan-400">
                            that feels weightless
                        </span>
                    </h1>

                    <p className="text-base md:text-lg lg:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed px-4">
                        Stop fighting legacy systems. Experience modern inventory control with
                        <span className="text-white/80 font-semibold"> real-time tracking</span>,
                        <span className="text-white/80 font-semibold"> GST automation</span>, and
                        <span className="text-white/80 font-semibold"> intelligent insights</span>.
                    </p>
                </motion.div>

                {/* Email Signup - Simplified */}
                <motion.div variants={itemVariants} className="max-w-md mx-auto mb-8 md:mb-10">
                    <Card className="dark-elevated-card backdrop-blur-xl p-6 md:p-8 rounded-3xl">
                        <CardContent className="p-0">
                            <AnimatePresence mode="wait">
                                {!isSubmitted ? (
                                    <motion.form
                                        key="form"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        onSubmit={handleSubmit}
                                        className="space-y-4"
                                    >
                                        {/* Email Input - Primary */}
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Enter your email"
                                                required
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="flex-1 bg-white/5 h-12 md:h-14 border border-white/10 hover:border-white/20 focus:border-primary/50 px-4 font-medium text-sm md:text-base rounded-xl placeholder:text-white/30"
                                            />
                                            <Button
                                                type="submit"
                                                disabled={isLoading}
                                                className="h-12 md:h-14 px-6 font-bold rounded-xl shadow-lg shadow-primary/20"
                                            >
                                                {isLoading ? (
                                                    <Loader2 size={18} className="animate-spin" />
                                                ) : (
                                                    <>
                                                        <span className="hidden md:inline mr-2">Join Waitlist</span>
                                                        <ArrowRight size={18} />
                                                    </>
                                                )}
                                            </Button>
                                        </div>

                                        {/* Expandable Details */}
                                        <button
                                            type="button"
                                            onClick={() => setShowDetails(!showDetails)}
                                            className="flex items-center justify-center gap-2 text-xs font-medium text-white/40 hover:text-white/60 transition-colors w-full py-2"
                                        >
                                            <span>{showDetails ? 'Hide details' : 'Add more details (optional)'}</span>
                                            <motion.div
                                                animate={{ rotate: showDetails ? 180 : 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <ChevronDown size={14} />
                                            </motion.div>
                                        </button>

                                        <AnimatePresence>
                                            {showDetails && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="space-y-3 overflow-hidden"
                                                >
                                                    <Input
                                                        placeholder="Your name"
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        className="bg-white/5 h-12 border border-white/10 hover:border-white/20 focus:border-primary/50 px-4 font-medium text-sm rounded-xl placeholder:text-white/30"
                                                    />
                                                    <Input
                                                        placeholder="Business name"
                                                        value={businessName}
                                                        onChange={(e) => setBusinessName(e.target.value)}
                                                        className="bg-white/5 h-12 border border-white/10 hover:border-white/20 focus:border-primary/50 px-4 font-medium text-sm rounded-xl placeholder:text-white/30"
                                                    />
                                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                                        <Checkbox
                                                            id="notify"
                                                            checked={notifyOnRelease}
                                                            onCheckedChange={(checked) => setNotifyOnRelease(checked === true)}
                                                        />
                                                        <label htmlFor="notify" className="flex items-center gap-2 text-xs font-medium text-white/60 cursor-pointer">
                                                            <Bell size={12} className="text-primary" />
                                                            Notify me on launch
                                                        </label>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.form>
                                ) : (
                                    <motion.div
                                        key="success"
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="py-6 text-center space-y-4"
                                    >
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                            className="w-14 h-14 bg-green-500/20 border border-green-500/30 rounded-2xl flex items-center justify-center mx-auto text-green-400"
                                        >
                                            <CheckCircle2 size={28} />
                                        </motion.div>
                                        <div>
                                            <p className="text-lg font-bold mb-1">You&apos;re on the list!</p>
                                            <p className="text-sm text-white/50">
                                                We&apos;ll notify you when we launch.
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Trust Signals - Closer to CTA */}
                <motion.div
                    variants={itemVariants}
                    className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mb-16 md:mb-24"
                >
                    {[
                        { label: 'Uptime SLA', val: '99.99%', icon: Shield },
                        { label: 'Security', val: 'AES-256', icon: Globe },
                        { label: 'On Waitlist', val: '5,000+', icon: Users },
                        { label: 'All India', val: '28 States', icon: Building2 },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            className="flex items-center gap-2 text-white/50"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                        >
                            <stat.icon size={14} className="text-primary/60" />
                            <span className="text-xs font-medium">
                                <span className="text-white/80 font-bold">{stat.val}</span> {stat.label}
                            </span>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Features Grid */}
                <motion.div variants={itemVariants} className="mb-20 md:mb-28">
                    <div className="text-center mb-8 md:mb-12">
                        <h2 className="text-2xl md:text-3xl font-bold mb-2 font-heading">Everything you need</h2>
                        <p className="text-sm md:text-base text-white/40">Built for Indian businesses, designed for growth</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {[
                            { title: 'Inventory Engine', desc: 'Real-time stock tracking across multiple locations with serial number support.', icon: Rocket },
                            { title: 'Smart Analytics', desc: 'AI-powered insights and demand forecasting to optimize your inventory.', icon: Zap },
                            { title: 'Service Hub', desc: 'Complete repair management with job cards and customer tracking.', icon: Store },
                            { title: 'HR & Payroll', desc: 'Automated attendance, leave management, and GST-compliant payslips.', icon: Users },
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                className="group p-5 md:p-6 rounded-2xl transition-all duration-300"
                                style={{
                                    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)',
                                    border: '1px solid rgba(255, 255, 255, 0.06)',
                                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.3)',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)';
                                    e.currentTarget.style.borderColor = 'rgba(132, 204, 22, 0.2)';
                                    e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 0 30px rgba(132, 204, 22, 0.08), 0 0 0 1px rgba(132, 204, 22, 0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)';
                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                                    e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.3)';
                                }}
                            >
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-black transition-all duration-300">
                                    <feature.icon size={20} />
                                </div>
                                <h3 className="font-bold text-base md:text-lg mb-2">{feature.title}</h3>
                                <p className="text-xs md:text-sm text-white/40 leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Why Choose Us Section */}
                <WhyUs />

                {/* Beta Snapshots Gallery */}
                <BetaGallery />
            </motion.div>

            {/* Full Footer */}
            <Footer />
        </div>
    );
};

export default ComingSoon;
