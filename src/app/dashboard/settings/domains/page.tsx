'use client';

import {
    Button,
    Card,
    CardBody,
    Chip,
    Divider,
    Input
} from '@heroui/react';
import {
    Copy,
    ExternalLink,
    Globe,
    HelpCircle,
    Info,
    ShieldCheck,
    Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function DomainSettingsPage() {
    const [domain, setDomain] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [status, setStatus] = useState<'IDLE' | 'PENDING' | 'VERIFIED' | 'ERROR'>('IDLE');
    const [customDomainAllowed, setCustomDomainAllowed] = useState<boolean | null>(null);
    const [currentPlan, setCurrentPlan] = useState<string>('');
    const [subdomain, setSubdomain] = useState('');
    const [isClaiming, setIsClaiming] = useState(false);
    const [existingSubdomain, setExistingSubdomain] = useState<string | null>(null);
    const [tenantId, setTenantId] = useState<string | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await fetch('/api/tenant/settings');
            const data = await response.json();
            if (data.tenant?.customDomain) {
                setDomain(data.tenant.customDomain);
                setStatus('VERIFIED');
            }
            if (data.tenant?.slug) {
                setExistingSubdomain(data.tenant.slug);
                setSubdomain(data.tenant.slug);
            }
            setTenantId(data.tenant?.id || null);
            // Check plan features
            const settings = data.tenant?.settings || {};
            const planFeatures = settings.planFeatures || {};
            setCustomDomainAllowed(planFeatures.customDomainAllowed === true);
            setCurrentPlan(data.tenant?.plan || 'FREE');
        } catch (error) {
            console.error('Fetch settings error:', error);
        }
    };

    const handleVerify = async () => {
        setIsVerifying(true);
        try {
            // Call DNS verification API
            const response = await fetch('/api/tenant/verify-domain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain }),
            });

            const data = await response.json();

            if (response.ok && data.status === 'VERIFIED') {
                setStatus('VERIFIED');
            } else if (data.status === 'PENDING' || data.status === 'NOT_FOUND') {
                setStatus('PENDING');
                alert(data.message || 'DNS record not found. Please add the CNAME record and try again.');
            } else {
                setStatus('ERROR');
                alert(data.message || 'Verification failed. Please check DNS records.');
            }
        } catch (error) {
            setStatus('ERROR');
            alert('Network error. Please try again.');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleClaimSubdomain = async () => {
        setIsClaiming(true);
        try {
            const response = await fetch('/api/tenant/claim-subdomain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug: subdomain }),
            });

            const data = await response.json();

            if (response.ok) {
                setExistingSubdomain(subdomain);
                alert('Subdomain claimed successfully!');
            } else {
                alert(data.message || 'Failed to claim subdomain.');
            }
        } catch (error) {
            alert('Network error. Please try again.');
        } finally {
            setIsClaiming(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard');
    };

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <Globe size={22} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-primary">Branding & Domains</h1>
                </div>
                <p className="text-black/40 dark:text-white/40 font-bold ml-1">Manage how clients access your portal via subdomains or custom URLs.</p>
            </div>

            {/* EaseInventory Subdomain */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-7 space-y-6">
                    <Card className="modern-card p-8 bg-primary/5 border-primary/20" radius="lg">
                        <CardBody className="p-0 space-y-6">
                            <div>
                                <h3 className="text-xl font-black mb-2 flex items-center gap-2">
                                    <Zap size={20} className="text-primary" />
                                    EaseInventory Subdomain
                                </h3>
                                <p className="text-sm opacity-60 font-medium">Your project is also accessible via a direct path: <code className="bg-primary/10 px-2 py-0.5 rounded text-primary">easyinventory.com/c/{tenantId}</code></p>
                            </div>

                            {existingSubdomain ? (
                                <div className="p-5 rounded-2xl bg-white/50 dark:bg-black/50 border border-primary/20 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1 text-primary">Your Subdomain</span>
                                        <div className="flex items-center gap-2">
                                          <span className="text-lg font-black tracking-tight font-mono">{existingSubdomain}.easeinventory.com</span>
                                          <Button isIconOnly variant="light" size="sm" onClick={() => copyToClipboard(`${existingSubdomain}.easeinventory.com`)}>
                                            <Copy size={16} className="opacity-40" />
                                          </Button>
                                        </div>
                                    </div>
                                    <Chip color="primary" variant="flat" className="font-black">ACTIVE</Chip>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="p-4 rounded-xl bg-warning/5 border border-warning/20">
                                        <p className="text-xs font-bold text-warning italic">You haven't claimed a premium subdomain yet.</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <Input 
                                            placeholder="your-unique-slug" 
                                            size="lg"
                                            radius="lg"
                                            value={subdomain}
                                            onValueChange={setSubdomain}
                                            classNames={{ inputWrapper: "bg-black/5 h-14" }}
                                            endContent={<span className="text-xs font-black opacity-30">.easeinventory.com</span>}
                                        />
                                        <Button 
                                            color="primary" 
                                            size="lg" 
                                            radius="lg" 
                                            className="h-14 font-black px-10 shadow-lg shadow-primary/20"
                                            onClick={handleClaimSubdomain}
                                            isLoading={isClaiming}
                                            isDisabled={!subdomain || subdomain.length < 3}
                                        >
                                            Claim
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </div>
            </div>

            <Divider className="opacity-10" />

            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <Globe size={22} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-primary">White-Label Domains</h1>
                </div>
                <p className="text-black/40 dark:text-white/40 font-bold ml-1">Connect your own domain name to brand your business portal.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Configuration Panel */}
                <div className="lg:col-span-7 space-y-8">
                    {/* Upgrade Prompt for Starter Plan */}
                    {customDomainAllowed === false && (
                        <Card className="modern-card p-8 border-2 border-warning/30 bg-warning/5" radius="lg">
                            <CardBody className="p-0 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
                                        <Info size={20} className="text-warning" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black">Upgrade Required</h3>
                                        <p className="text-sm opacity-60 font-medium">Custom domains are available on Business and Professional plans.</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Button 
                                        color="warning" 
                                        size="lg" 
                                        radius="lg" 
                                        className="font-black"
                                        as="a"
                                        href="/dashboard/settings/billing"
                                    >
                                        Upgrade to Business
                                    </Button>
                                    <Chip color="default" variant="flat" className="font-bold">
                                        Current: {currentPlan}
                                    </Chip>
                                </div>
                            </CardBody>
                        </Card>
                    )}

                    <Card className="modern-card p-8" radius="lg">
                        <CardBody className="p-0 space-y-8">
                            <div>
                                <h3 className="text-xl font-black mb-2">Connect New Domain</h3>
                                <p className="text-sm opacity-40 font-bold">Use a subdomain like <code className="text-primary bg-primary/5 px-2 py-0.5 rounded">inventory.yourcompany.com</code> for the best experience.</p>
                            </div>

                            <div className="flex gap-4">
                                <Input 
                                    placeholder="e.g. portal.acme.com" 
                                    size="lg"
                                    radius="lg"
                                    value={domain}
                                    onValueChange={setDomain}
                                    classNames={{ inputWrapper: "bg-black/5 h-14" }}
                                    startContent={<Globe size={18} className="opacity-20" />}
                                    isDisabled={customDomainAllowed === false}
                                />
                                <Button 
                                    color="primary" 
                                    size="lg" 
                                    radius="lg" 
                                    className="h-14 font-black px-10"
                                    onClick={handleVerify}
                                    isLoading={isVerifying}
                                    isDisabled={customDomainAllowed === false || !domain}
                                >
                                    Verify
                                </Button>
                            </div>

                            {status === 'VERIFIED' && (
                                <div className="p-6 rounded-2xl bg-success/5 border border-success/20 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center text-success">
                                        <ShieldCheck size={22} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-success uppercase tracking-widest leading-none mb-1">Domain Verified</p>
                                        <p className="text-xs font-bold opacity-60">Provisioning SSL certificates. Estimated time: 10 mins.</p>
                                    </div>
                                    <Chip color="success" size="sm" variant="flat" className="ml-auto font-black">ACTIVE</Chip>
                                </div>
                            )}

                            <Divider className="opacity-40" />

                            <div className="space-y-6">
                                <h4 className="text-sm font-black uppercase tracking-widest opacity-40">DNS Configuration</h4>
                                
                                <div className="space-y-4">
                                    <div className="p-6 rounded-2xl bg-black/[0.03] border border-black/5 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-30">Type</span>
                                            <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-lg font-black text-[10px]">CNAME</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-30">Host/Name</span>
                                            <div className="flex items-center gap-2">
                                                <code className="text-xs font-bold">inventory</code>
                                                <Button isIconOnly variant="light" size="sm" radius="full" onClick={() => copyToClipboard('inventory')}><Copy size={12} /></Button>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-30">Value</span>
                                            <div className="flex items-center gap-2">
                                                <code className="text-xs font-bold text-primary">cname.easeinventory.com</code>
                                                <Button isIconOnly variant="light" size="sm" radius="full" onClick={() => copyToClipboard('cname.easeinventory.com')}><Copy size={12} /></Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-4">
                        <Info size={20} className="text-primary shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-sm font-black tracking-tight leading-none">Global Edge Forwarding</p>
                            <p className="text-[11px] font-bold opacity-50 leading-relaxed">Once DNS is configured, our global Anycast network will automatically route traffic to your regional EaseInventory instance.</p>
                        </div>
                    </div>
                </div>

                {/* FAQ / Guidance */}
                <div className="lg:col-span-5 space-y-8">
                    <Card className="modern-card bg-black/5 dark:bg-white/5 border-none shadow-none p-8" radius="lg">
                        <CardBody className="p-0 space-y-6">
                            <div className="flex items-center gap-2 mb-4">
                                <HelpCircle size={18} className="opacity-30" />
                                <h3 className="text-sm font-black uppercase tracking-widest">Setup Guide</h3>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <p className="text-xs font-black">1. Use a Subdomain</p>
                                    <p className="text-[11px] font-bold opacity-40">Subdomains are easier to manage and don't require root domain redirection logic.</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xs font-black">2. Propogation Time</p>
                                    <p className="text-[11px] font-bold opacity-40">DNS changes can take up to 24-48 hours, though most take effect within 1 hour.</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xs font-black">3. SSL/HTTPS</p>
                                    <p className="text-[11px] font-bold opacity-40">We automatically provision Let's Encrypt certificates for all verified custom domains.</p>
                                </div>
                            </div>

                            <Divider className="opacity-10" />

                            <Button 
                                variant="light" 
                                className="w-full h-12 font-black text-xs uppercase tracking-widest"
                                endContent={<ExternalLink size={14} />}
                            >
                                Detailed Documentation
                            </Button>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
}
