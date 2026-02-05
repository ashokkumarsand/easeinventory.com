'use client';

import { Logo } from '@/components/icons/Logo';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Clock, ShieldCheck } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect } from 'react';

export default function PendingApprovalPage() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      const user = session?.user as any;
      if (user?.registrationStatus === 'APPROVED') {
        redirect('/dashboard');
      }
    }
  }, [session, status]);

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center bg-background">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-md w-full relative z-10 text-center">
        <div className="mb-8 flex justify-center">
          <Logo size={64} />
        </div>

        <Card className="modern-card border-none shadow-2xl bg-card p-4">
          <CardContent className="py-10 flex flex-col items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center text-warning mb-2">
              <Clock size={32} className="animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-black uppercase tracking-tight">Registration Pending</h1>
              <p className="text-foreground/60 text-sm">
                Your account is currently under review by our administration team. This usually takes 12-24 hours.
              </p>
            </div>

            <div className="w-full space-y-3 pt-4 border-t border-foreground/5">
              <div className="flex items-center gap-3 text-left">
                <CheckCircle2 size={18} className="text-success" />
                <span className="text-xs font-bold text-foreground/80">Information Received</span>
              </div>
              <div className="flex items-center gap-3 text-left">
                <ShieldCheck size={18} className="text-primary" />
                <span className="text-xs font-bold text-foreground/80">Security Audit in Progress</span>
              </div>
            </div>

            <div className="flex gap-4 w-full pt-4">
              <Button
                variant="secondary"
                className="flex-1 font-bold"
                onClick={() => window.location.reload()}
              >
                Check Status
              </Button>
              <Button
                variant="ghost"
                className="flex-1 font-bold italic text-destructive hover:text-destructive"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="mt-8 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">
          Ease<span className="text-primary italic">Inventory</span> Security Team
        </p>
      </div>
    </div>
  );
}
