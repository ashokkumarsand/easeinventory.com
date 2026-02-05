'use client';

import { useServiceWorker } from '@/hooks/useServiceWorker';
import OfflineIndicator from '@/components/ui/OfflineIndicator';
import PWAInstallPrompt from '@/components/ui/PWAInstallPrompt';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PWAProvider({ children }: { children: React.ReactNode }) {
  const { isUpdateAvailable, updateServiceWorker } = useServiceWorker();

  return (
    <>
      {children}

      {/* Offline indicator banner */}
      <OfflineIndicator />

      {/* PWA install prompt */}
      <PWAInstallPrompt />

      {/* Update available banner */}
      <AnimatePresence>
        {isUpdateAvailable && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-primary text-primary-foreground px-4 py-3 rounded-full shadow-xl flex items-center gap-3">
              <span className="text-sm font-bold">New version available!</span>
              <Button
                size="sm"
                variant="secondary"
                className="font-bold bg-white/20 text-white"
                onClick={updateServiceWorker}
              >
                <RefreshCw size={14} className="mr-2" />
                Update
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
