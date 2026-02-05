'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, X, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export default function PWAInstallPrompt() {
  const { isInstallable, promptInstall } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if user has dismissed before
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        setIsDismissed(true);
      }
    }

    // Delay showing prompt
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
  };

  const handleInstall = async () => {
    const installed = await promptInstall();
    if (installed) {
      setIsDismissed(true);
    }
  };

  if (!isInstallable || isDismissed || !showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
      >
        <Card className="shadow-2xl border border-primary/20 bg-background/95 backdrop-blur-lg">
          <CardContent className="p-4">
            <div className="flex gap-4 relative">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm mb-1">Install EaseInventory</h3>
                <p className="text-xs text-foreground/60 mb-3">
                  Install our app for faster access and offline support
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="font-bold"
                    onClick={handleInstall}
                  >
                    <Download size={14} className="mr-2" />
                    Install
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="font-bold"
                    onClick={handleDismiss}
                  >
                    Not Now
                  </Button>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="absolute top-0 right-0 p-1 rounded-full hover:bg-foreground/10 transition-colors"
              >
                <X size={16} className="text-foreground/40" />
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
