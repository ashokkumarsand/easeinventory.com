'use client';

import { Logo } from '@/components/icons/Logo';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';

interface LoaderProps {
  onComplete?: () => void;
  duration?: number;
  message?: string;
}

/**
 * Interactive Logo Loader
 * Uses the EaseInventory logo with smooth animations
 */
export const LogoLoader: React.FC<LoaderProps> = ({ 
  onComplete, 
  duration = 2000,
  message = 'Loading...'
}) => {
  const [isComplete, setIsComplete] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsComplete(true);
      setTimeout(() => {
        setIsAnimating(false);
        onComplete?.();
      }, 500);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  if (!isAnimating) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background">
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
      </div>

      <div className="relative flex flex-col items-center gap-8">
        {/* Animated Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: isComplete ? 1.1 : 1, 
            opacity: isComplete ? 0 : 1,
            rotate: isComplete ? 10 : 0
          }}
          transition={{ 
            duration: 0.8, 
            ease: "easeOut",
            scale: { duration: 0.5 }
          }}
          className="relative"
        >
          {/* Pulsing ring behind logo */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary/30"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              width: '120px',
              height: '120px',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
          
          {/* Second pulsing ring with delay */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-secondary/20"
            animate={{
              scale: [1, 1.8, 1],
              opacity: [0.3, 0, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
            style={{
              width: '120px',
              height: '120px',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />

          {/* Logo with subtle floating animation */}
          <motion.div
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Logo size={80} />
          </motion.div>
        </motion.div>

        {/* Loading text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: isComplete ? 0 : 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-col items-center gap-2"
        >
          <p className="text-sm font-black text-foreground/40 uppercase tracking-[0.3em]">
            {message}
          </p>
          
          {/* Progress dots */}
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-primary"
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

/**
 * Simple inline loader for buttons/cards
 */
export const InlineLoader: React.FC<{ size?: number }> = ({ size = 24 }) => {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
    >
      <Logo size={size} />
    </motion.div>
  );
};

/**
 * Full page loading spinner with Logo
 */
export const PageLoader: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, 0, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Logo size={64} />
        </motion.div>
        <p className="text-sm font-bold text-foreground/40 uppercase tracking-widest">
          {message}
        </p>
      </div>
    </div>
  );
};

// Keep old exports for backwards compatibility
export const ScatterLoader = LogoLoader;
export const SimpleLoader = InlineLoader;

export default LogoLoader;
