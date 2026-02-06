'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, X } from 'lucide-react';

interface PreviewBadgeProps {
  isPreviewActive: boolean;
}

export default function PreviewBadge({ isPreviewActive }: PreviewBadgeProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      await fetch('/api/preview/toggle', { method: 'POST' });
      router.refresh();
    } catch {
      setLoading(false);
    }
  };

  if (dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-4 right-4 z-[9999]"
      >
        {isPreviewActive ? (
          /* Active preview: amber badge with "User View" toggle */
          <div className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-950/80 px-4 py-2 shadow-lg shadow-amber-500/10 backdrop-blur-md">
            <Eye className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-200">
              Preview Mode
            </span>
            <button
              onClick={handleToggle}
              disabled={loading}
              className="ml-1 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-300 transition-colors hover:bg-amber-500/30 disabled:opacity-50"
            >
              {loading ? '...' : 'User View'}
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="ml-1 rounded-full p-1 text-amber-400/60 transition-colors hover:bg-amber-500/20 hover:text-amber-300"
              aria-label="Dismiss preview badge"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          /* Inactive: subtle badge with "Preview" button */
          <button
            onClick={handleToggle}
            disabled={loading}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 shadow-lg backdrop-blur-md transition-all hover:border-amber-500/30 hover:bg-amber-950/60 disabled:opacity-50"
          >
            <EyeOff className="h-4 w-4 text-white/40" />
            <span className="text-sm font-medium text-white/60">
              {loading ? 'Loading...' : 'Preview'}
            </span>
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
