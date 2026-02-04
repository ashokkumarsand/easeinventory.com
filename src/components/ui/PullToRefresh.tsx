'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  disabled?: boolean;
}

export default function PullToRefresh({
  onRefresh,
  children,
  disabled = false,
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const y = useMotionValue(0);
  const rotate = useTransform(y, [0, 80], [0, 360]);
  const opacity = useTransform(y, [0, 40, 80], [0, 0.5, 1]);

  const threshold = 80;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || disabled) return;

    let isTouching = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (container.scrollTop === 0) {
        startY.current = e.touches[0].clientY;
        isTouching = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isTouching || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const diff = currentY - startY.current;

      if (diff > 0 && container.scrollTop === 0) {
        e.preventDefault();
        y.set(Math.min(diff * 0.5, threshold * 1.5));
      }
    };

    const handleTouchEnd = async () => {
      if (!isTouching) return;
      isTouching = false;

      if (y.get() >= threshold && !isRefreshing) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
        }
      }

      y.set(0);
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [disabled, isRefreshing, onRefresh, y]);

  return (
    <div ref={containerRef} className="relative overflow-auto h-full">
      {/* Pull indicator */}
      <motion.div
        style={{ y, opacity }}
        className="absolute top-0 left-0 right-0 flex items-center justify-center h-16 pointer-events-none z-10"
      >
        <motion.div
          style={{ rotate }}
          className={`w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center ${
            isRefreshing ? 'animate-spin' : ''
          }`}
        >
          <RefreshCw size={18} className="text-primary" />
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div style={{ y: useTransform(y, (v) => (v > 0 ? v : 0)) }}>
        {children}
      </motion.div>
    </div>
  );
}
