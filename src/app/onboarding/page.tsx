'use client';

import { Logo } from '@/components/icons/Logo';
import {
    Button,
    Card,
    CardBody,
    Input
} from '@heroui/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    gstNumber: '',
    shopProof: null as File | null,
    idProof: null as File | null,
    businessLicense: null as File | null,
  });

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, [field]: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // In a real app, you would upload files to R2/S3 first
      // For MVP, we'll simulate file URLs or use base64 if small, 
      // but the API expects URLs. Let's simulate for now.
      
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gstNumber: formData.gstNumber,
          shopProofUrl: 'https://placehold.co/600x400?text=Shop+Proof', // Simulated
          idProofUrl: 'https://placehold.co/600x400?text=ID+Proof', // Simulated
          businessLicense: formData.businessLicense ? 'https://placehold.co/600x400?text=License' : null,
        }),
      });

      if (response.ok) {
        // Update session or redirect
        router.push('/dashboard?onboarding=submitted');
      } else {
        const data = await response.json();
        alert(data.message || 'Onboarding failed');
      }
    } catch (error) {
      alert('An error occurred during onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="w-full max-w-2xl relative z-10">
        <div className="flex flex-col items-center mb-10">
          <Logo size={48} />
          <h1 className="text-3xl font-black mt-6 uppercase tracking-tighter">Business Verification</h1>
          <p className="text-foreground/50 font-medium">Complete your verification to access full enterprise features.</p>
        </div>

        <Card className="modern-card p-6 md:p-10 border-none shadow-2xl bg-card" radius="lg">
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground/40 block mb-2 ml-1">GST Number (Optional)</label>
                  <Input
                    placeholder="27AAAAA0000A1Z5"
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({...formData, gstNumber: e.target.value})}
                    size="lg"
                    radius="lg"
                    classNames={{
                      inputWrapper: "bg-foreground/5 h-12 border-none shadow-inner",
                      input: "text-sm font-bold"
                    }}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground/40 block mb-2 ml-1">Shop Front/Proof</label>
                    <div className="relative group">
                      <input 
                        type="file" 
                        accept="image/*" 
                        required
                        onChange={(e) => handleFileChange(e, 'shopProof')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="h-32 border-2 border-dashed border-foreground/10 rounded-2xl flex flex-col items-center justify-center group-hover:bg-foreground/5 transition-colors">
                        <span className="text-2xl mb-2">🏪</span>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                          {formData.shopProof ? formData.shopProof.name : 'Upload Shop Proof'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground/40 block mb-2 ml-1">Identity Proof (Aadhar/PAN)</label>
                    <div className="relative group">
                      <input 
                        type="file" 
                        accept="image/*" 
                        required
                        onChange={(e) => handleFileChange(e, 'idProof')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="h-32 border-2 border-dashed border-foreground/10 rounded-2xl flex flex-col items-center justify-center group-hover:bg-foreground/5 transition-colors">
                        <span className="text-2xl mb-2">🪪</span>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                          {formData.idProof ? formData.idProof.name : 'Upload ID Proof'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground/40 block mb-2 ml-1">Business License (Optional)</label>
                  <div className="relative group">
                    <input 
                      type="file" 
                      accept="image/*,.pdf" 
                      onChange={(e) => handleFileChange(e, 'businessLicense')}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="h-24 border-2 border-dashed border-foreground/10 rounded-2xl flex flex-col items-center justify-center group-hover:bg-foreground/5 transition-colors">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                        {formData.businessLicense ? formData.businessLicense.name : 'Click to upload license'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  color="primary" 
                  size="lg"
                  type="submit"
                  isLoading={isLoading}
                  className="w-full font-black h-12 shadow-xl shadow-primary/20 text-sm uppercase tracking-widest" 
                  radius="full"
                >
                  Submit for Verification
                </Button>
                <p className="text-center mt-6 text-[10px] font-black uppercase tracking-widest opacity-30">
                  Manual verification typically takes 24-48 hours.
                </p>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
