'use client';

import { Logo } from '@/components/icons/Logo';
import {
    Avatar,
    Button,
    Card,
    CardBody,
    Checkbox,
    Chip,
    Divider,
    Input
} from '@heroui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Building, Globe } from 'lucide-react';
import { getSession, signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectedTenant, setDetectedTenant] = useState<any>(null);
  const [formData, setFormData] = useState({
    workspace: '',
    email: '',
    password: '',
    rememberMe: false
  });

  useEffect(() => {
    const fetchTenantContext = async () => {
      const hostname = window.location.hostname;
      const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'easeinventory.com';
      
      // 1. Detect by Hostname (Subdomain or Custom Domain)
      if (hostname !== rootDomain && hostname !== 'localhost') {
        let slug = '';
        if (hostname.endsWith(`.${rootDomain}`)) {
          slug = hostname.replace(`.${rootDomain}`, '');
        }

        try {
          const res = await fetch(`/api/tenant/lookup?host=${hostname}${slug ? `&slug=${slug}` : ''}`);
          const data = await res.json();
          if (data.tenant) {
            setDetectedTenant(data.tenant);
            setFormData(prev => ({ ...prev, workspace: data.tenant.slug }));
          }
        } catch (err) {
          console.error("Tenant lookup failed", err);
        }
      } 
      
      // 2. Fallback to Query Param
      const workspace = searchParams.get('workspace');
      if (workspace && !detectedTenant) {
        setFormData(prev => ({ ...prev, workspace }));
        try {
          const res = await fetch(`/api/tenant/lookup?slug=${workspace}`);
          const data = await res.json();
          if (data.tenant) setDetectedTenant(data.tenant);
        } catch (e) {}
      }
    };

    fetchTenantContext();
  }, [searchParams, detectedTenant]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
        workspace: formData.workspace,
      });

      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
      } else {
        // Automatic Redirection Logic for White-Labeling
        const session = await getSession();
        const user = session?.user as any;
        const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'easeinventory.com';
        const hostname = window.location.hostname;

        if (user?.customDomain && hostname !== user.customDomain) {
           window.location.href = `https://${user.customDomain}/dashboard`;
        } else if (user?.tenantSlug && (hostname === rootDomain || hostname === 'localhost')) {
           window.location.href = `https://${user.tenantSlug}.${rootDomain}/dashboard`;
        } else {
           router.push('/dashboard');
        }
      }
    } catch (err: any) {
      setError('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-xl flex flex-col gap-10 relative z-10">
        
        <div className="flex flex-col items-center text-center">
           <motion.div
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ duration: 0.5 }}
           >
             <Link href="/" className="inline-flex items-center gap-4 mb-10 group active:scale-95 transition-transform">
               {detectedTenant?.logo ? (
                  <Avatar src={detectedTenant.logo} className="w-14 h-14 rounded-2xl shadow-lg ring-4 ring-primary/20" />
               ) : (
                  <div className="p-3 bg-foreground/5 rounded-2xl group-hover:bg-primary/20 transition-colors">
                    <Logo size={44} />
                  </div>
               )}
               <span className="text-2xl font-black tracking-tighter uppercase text-foreground">
                 {detectedTenant?.name || (
                   <>Ease<span className="text-primary italic">Inventory</span></>
                 )}
               </span>
             </Link>
           </motion.div>
           
           <AnimatePresence mode="wait">
             {detectedTenant ? (
               <motion.div
                key="tenant-header"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2"
               >
                 <Chip color="primary" variant="flat" size="sm" startContent={<Building size={12} />} className="font-black uppercase tracking-widest text-[10px]">Business Portal Identified</Chip>
                 <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground uppercase">Login to {detectedTenant.name}</h1>
               </motion.div>
             ) : (
               <motion.div
                key="default-header"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
               >
                 <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-foreground uppercase">Administrative Access</h1>
                 <p className="text-foreground/50 font-medium text-lg italic max-w-xs mx-auto">Enter your credentials to manage your business operations.</p>
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        <motion.div
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ delay: 0.1, duration: 0.6 }}
        >
          <Card className="modern-card p-6 md:p-8 border-none shadow-2xl bg-card" radius="lg">
            <CardBody className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-8">
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs font-bold text-center">
                    {error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground/40 block mb-2 ml-1">Admin Username or Email</label>
                  <Input
                    type="text"
                    placeholder="easeinventoryadmin or email"
                    size="lg"
                    radius="lg"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    classNames={{
                      inputWrapper: "bg-foreground/5 h-12 border-none shadow-inner",
                      input: "text-sm font-bold"
                    }}
                  />
                </div>

                <div className="space-y-2">
                   <div className="flex justify-between px-1 mb-1">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Secure Password</label>
                      <Link href="/forgot-password" title="Coming soon" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Reset Password?</Link>
                   </div>
                   <Input
                    type="password"
                    placeholder="••••••••••••"
                    size="lg"
                    radius="lg"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    classNames={{
                      inputWrapper: "bg-foreground/5 h-12 border-none shadow-inner",
                      input: "text-sm font-bold"
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Checkbox 
                    isSelected={formData.rememberMe}
                    onValueChange={(val) => setFormData({...formData, rememberMe: val})}
                    color="primary"
                    radius="sm"
                    classNames={{ 
                      label: "text-xs font-black uppercase tracking-widest text-foreground/40 select-none",
                    }}
                  >
                    Keep me logged in
                  </Checkbox>
                  
                  {detectedTenant && (
                    <div className="flex items-center gap-1 text-primary opacity-50 hover:opacity-100 transition-opacity cursor-help">
                       <Globe size={12} />
                       <span className="text-[10px] font-black uppercase tracking-widest">{detectedTenant.customDomain || `${detectedTenant.slug}.easeinventory.com`}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <Button 
                    color="primary" 
                    size="lg"
                    className="w-full font-black h-12 shadow-xl shadow-primary/20 text-sm uppercase tracking-widest" 
                    radius="full"
                    type="submit"
                    isLoading={isLoading}
                  >
                    Login to Secure Portal
                  </Button>
                </div>
              </form>

              <div className="flex items-center gap-6 py-2">
                 <Divider className="flex-1 opacity-10" />
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-20">Biometric / External</span>
                 <Divider className="flex-1 opacity-10" />
              </div>

              <Button 
                variant="bordered" 
                className="w-full font-black h-12 border-foreground/10 text-foreground text-xs uppercase tracking-widest hover:bg-foreground/5" 
                radius="full"
                onClick={() => {
                  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'easeinventory.com';
                  let callbackUrl = '/dashboard';
                  if (detectedTenant) {
                    const domain = detectedTenant.customDomain || `${detectedTenant.slug}.${rootDomain}`;
                    callbackUrl = `https://${domain}/dashboard`;
                  }
                  signIn('google', { callbackUrl });
                }}
                startContent={
                  <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                }
              >
                Sign in with Google
              </Button>
            </CardBody>
          </Card>
        </motion.div>

        <p className="text-center text-sm font-black uppercase tracking-widest text-foreground/40">
          Need a new account?{' '}
          <Link href="/register" className="text-primary font-black hover:underline underline-offset-8">
            Register now
          </Link>
        </p>
      </div>
    </div>
  );
}
