'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
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
            // Fetch tenant settings
            const settingsRes = await fetch('/api/tenant/settings');
            const settingsData = await settingsRes.json();
            if (settingsData.tenant?.slug) {
                setExistingSubdomain(settingsData.tenant.slug);
                setSubdomain(settingsData.tenant.slug);
            }
            setTenantId(settingsData.tenant?.id || null);
            const settings = settingsData.tenant?.settings || {};
            const planFeatures = settings.planFeatures || {};
            setCustomDomainAllowed(planFeatures.customDomainAllowed === true);
            setCurrentPlan(settingsData.tenant?.plan || 'TRIAL');

            // Fetch domain settings
            const domainRes = await fetch('/api/domains');
            if (domainRes.ok) {
                const domainData = await domainRes.json();
                if (domainData.domain?.customDomain) {
                    setDomain(domainData.domain.customDomain);
                    setVerificationToken(domainData.domain.verificationToken);
                    if (domainData.domain.verified) {
                        setStatus('VERIFIED');
                    } else {
                        setStatus('PENDING');
                        setDnsInstructions(domainData.domain.dnsInstructions);
                    }
                }
            }
        } catch (error) {
            console.error('Fetch settings error:', error);
        }
    };

    const [verificationToken, setVerificationToken] = useState<string | null>(null);
    const [dnsInstructions, setDnsInstructions] = useState<any>(null);
    const [verificationResult, setVerificationResult] = useState<any>(null);

    const handleSetDomain = async () => {
        if (!domain) return;
        setIsVerifying(true);
        try {
            const response = await fetch('/api/domains', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customDomain: domain }),
            });

            const data = await response.json();

            if (response.ok) {
                setVerificationToken(data.domain.verificationToken);
                setDnsInstructions(data.domain.dnsInstructions);
                setStatus('PENDING');
                alert('Domain set! Please add the DNS records below to verify ownership.');
            } else {
                alert(data.message || 'Failed to set domain.');
            }
        } catch (error) {
            alert('Network error. Please try again.');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleVerify = async () => {
        setIsVerifying(true);
        setVerificationResult(null);
        try {
            const response = await fetch('/api/domains/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await response.json();
            setVerificationResult(data.verificationResult);

            if (response.ok && data.verified) {
                setStatus('VERIFIED');
                alert('Domain verified successfully!');
            } else {
                setStatus('PENDING');
                alert(data.message || 'Verification pending. Please check DNS records.');
            }
        } catch (error) {
            setStatus('ERROR');
            alert('Network error. Please try again.');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleRemoveDomain = async () => {
        if (!confirm('Are you sure you want to remove this custom domain?')) return;
        try {
            const response = await fetch('/api/domains', { method: 'DELETE' });
            if (response.ok) {
                setDomain('');
                setStatus('IDLE');
                setVerificationToken(null);
                setDnsInstructions(null);
                alert('Domain removed successfully.');
                fetchSettings();
            }
        } catch (error) {
            alert('Failed to remove domain.');
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
                    <h1 className="text-3xl lg:text-4xl font-black tracking-tight font-heading">Branding & Domains</h1>
                </div>
                <p className="text-foreground/50 font-bold ml-1">Manage how clients access your portal via subdomains or custom URLs.</p>
            </div>

            {/* EaseInventory Subdomain */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-7 space-y-6">
                    <Card className="modern-card p-8 bg-primary/5 border-primary/20 rounded-lg">
                        <CardContent className="p-0 space-y-6">
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
                                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(`${existingSubdomain}.easeinventory.com`)}>
                                            <Copy size={16} className="opacity-40" />
                                          </Button>
                                        </div>
                                    </div>
                                    <Badge variant="secondary" className="bg-primary/10 text-primary font-black">ACTIVE</Badge>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="p-4 rounded-xl bg-warning/5 border border-warning/20">
                                        <p className="text-xs font-bold text-warning italic">You haven&apos;t claimed a premium subdomain yet.</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="relative flex-1">
                                            <Input
                                                placeholder="your-unique-slug"
                                                className="bg-black/5 h-14 pr-32"
                                                value={subdomain}
                                                onChange={(e) => setSubdomain(e.target.value)}
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black opacity-30">.easeinventory.com</span>
                                        </div>
                                        <Button
                                            className="h-14 font-black px-10 shadow-lg shadow-primary/20"
                                            onClick={handleClaimSubdomain}
                                            disabled={isClaiming || !subdomain || subdomain.length < 3}
                                        >
                                            {isClaiming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Claim
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Separator className="opacity-10" />

            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <Globe size={22} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-black tracking-tight font-heading">White-Label Domains</h1>
                </div>
                <p className="text-foreground/50 font-bold ml-1">Connect your own domain name to brand your business portal.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Configuration Panel */}
                <div className="lg:col-span-7 space-y-8">
                    {/* Upgrade Prompt for Starter Plan */}
                    {customDomainAllowed === false && (
                        <Card className="modern-card p-8 border-2 border-warning/30 bg-warning/5 rounded-lg">
                            <CardContent className="p-0 space-y-4">
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
                                        className="font-black bg-warning text-warning-foreground hover:bg-warning/90"
                                        asChild
                                    >
                                        <a href="/settings/billing">Upgrade to Business</a>
                                    </Button>
                                    <Badge variant="secondary" className="font-bold">
                                        Current: {currentPlan}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card className="modern-card p-8 rounded-lg">
                        <CardContent className="p-0 space-y-8">
                            <div>
                                <h3 className="text-xl font-black mb-2">Connect New Domain</h3>
                                <p className="text-sm opacity-40 font-bold">Use a subdomain like <code className="text-primary bg-primary/5 px-2 py-0.5 rounded">inventory.yourcompany.com</code> for the best experience.</p>
                            </div>

                            <div className="flex gap-4">
                                <div className="relative flex-1">
                                    <Globe size={18} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-20" />
                                    <Input
                                        placeholder="e.g. portal.acme.com"
                                        className="bg-black/5 h-14 pl-10"
                                        value={domain}
                                        onChange={(e) => setDomain(e.target.value)}
                                        disabled={customDomainAllowed === false || status === 'VERIFIED'}
                                    />
                                </div>
                                {status === 'IDLE' ? (
                                    <Button
                                        className="h-14 font-black px-10"
                                        onClick={handleSetDomain}
                                        disabled={isVerifying || customDomainAllowed === false || !domain}
                                    >
                                        {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Set Domain
                                    </Button>
                                ) : status === 'PENDING' ? (
                                    <Button
                                        variant="secondary"
                                        className="h-14 font-black px-10"
                                        onClick={handleVerify}
                                        disabled={isVerifying}
                                    >
                                        {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Verify DNS
                                    </Button>
                                ) : (
                                    <Button
                                        variant="destructive"
                                        className="h-14 font-black px-10"
                                        onClick={handleRemoveDomain}
                                    >
                                        Remove
                                    </Button>
                                )}
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
                                    <Badge variant="secondary" className="ml-auto font-black bg-success/10 text-success">ACTIVE</Badge>
                                </div>
                            )}

                            <Separator className="opacity-40" />

                            <div className="space-y-6">
                                <h4 className="text-sm font-black uppercase tracking-widest opacity-40">DNS Configuration</h4>

                                {/* Verification Status */}
                                {verificationResult && (
                                    <div className={`p-4 rounded-xl ${verificationResult.txtVerified ? 'bg-success/5 border border-success/20' : 'bg-warning/5 border border-warning/20'}`}>
                                        <p className="text-xs font-bold">
                                            TXT Record: <span className={verificationResult.txtVerified ? 'text-success' : 'text-warning'}>{verificationResult.txtVerified ? 'Verified' : 'Not Found'}</span>
                                            {' | '}
                                            CNAME Record: <span className={verificationResult.cnameVerified ? 'text-success' : 'text-warning'}>{verificationResult.cnameVerified ? 'Verified' : 'Not Found'}</span>
                                        </p>
                                        {verificationResult.errors?.length > 0 && (
                                            <p className="text-[10px] opacity-60 mt-1">{verificationResult.errors.join(', ')}</p>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {/* TXT Record for Verification */}
                                    {verificationToken && status === 'PENDING' && (
                                        <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Step 1: Verification Record</span>
                                                <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg font-black text-[10px]">TXT</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-black uppercase tracking-widest opacity-30">Host/Name</span>
                                                <div className="flex items-center gap-2">
                                                    <code className="text-xs font-bold">_easeinventory-verify</code>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => copyToClipboard('_easeinventory-verify')}><Copy size={12} /></Button>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-black uppercase tracking-widest opacity-30">Value</span>
                                                <div className="flex items-center gap-2">
                                                    <code className="text-xs font-bold text-primary break-all max-w-[200px]">{verificationToken}</code>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => copyToClipboard(verificationToken)}><Copy size={12} /></Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* CNAME Record */}
                                    <div className="p-6 rounded-2xl bg-black/[0.03] border border-black/5 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-30">{verificationToken ? 'Step 2: Routing Record' : 'Type'}</span>
                                            <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-lg font-black text-[10px]">CNAME</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-30">Host/Name</span>
                                            <div className="flex items-center gap-2">
                                                <code className="text-xs font-bold">{domain ? domain.split('.')[0] : 'inventory'}</code>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => copyToClipboard(domain ? domain.split('.')[0] : 'inventory')}><Copy size={12} /></Button>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-30">Value</span>
                                            <div className="flex items-center gap-2">
                                                <code className="text-xs font-bold text-primary">cname.easeinventory.com</code>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => copyToClipboard('cname.easeinventory.com')}><Copy size={12} /></Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
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
                    <Card className="modern-card bg-black/5 dark:bg-white/5 border-none shadow-none p-8 rounded-lg">
                        <CardContent className="p-0 space-y-6">
                            <div className="flex items-center gap-2 mb-4">
                                <HelpCircle size={18} className="opacity-30" />
                                <h3 className="text-sm font-black uppercase tracking-widest">Setup Guide</h3>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <p className="text-xs font-black">1. Use a Subdomain</p>
                                    <p className="text-[11px] font-bold opacity-40">Subdomains are easier to manage and don&apos;t require root domain redirection logic.</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xs font-black">2. Propogation Time</p>
                                    <p className="text-[11px] font-bold opacity-40">DNS changes can take up to 24-48 hours, though most take effect within 1 hour.</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xs font-black">3. SSL/HTTPS</p>
                                    <p className="text-[11px] font-bold opacity-40">We automatically provision Let&apos;s Encrypt certificates for all verified custom domains.</p>
                                </div>
                            </div>

                            <Separator className="opacity-10" />

                            <Button
                                variant="ghost"
                                className="w-full h-12 font-black text-xs uppercase tracking-widest"
                            >
                                Detailed Documentation
                                <ExternalLink size={14} className="ml-2" />
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
