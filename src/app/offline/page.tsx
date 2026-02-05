'use client';

import { Button } from '@/components/ui/button';
import { WifiOff, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-warning/10 flex items-center justify-center">
          <WifiOff className="w-12 h-12 text-warning" />
        </div>

        <h1 className="text-3xl font-black tracking-tight mb-4">
          You're Offline
        </h1>

        <p className="text-foreground/60 mb-8">
          It looks like you've lost your internet connection. Some features may not be available until you're back online.
        </p>

        <div className="space-y-4">
          <Button
            size="lg"
            className="w-full font-bold"
            onClick={handleRetry}
          >
            <RefreshCw size={18} className="mr-2" />
            Try Again
          </Button>

          <p className="text-xs text-foreground/40">
            Don't worry - any changes you make while offline will be synced when you reconnect.
          </p>
        </div>

        <div className="mt-12 p-4 rounded-xl bg-foreground/5">
          <h3 className="font-bold text-sm mb-2">Available Offline:</h3>
          <ul className="text-sm text-foreground/60 space-y-1">
            <li>• View cached inventory data</li>
            <li>• Browse recent invoices</li>
            <li>• Access saved reports</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
