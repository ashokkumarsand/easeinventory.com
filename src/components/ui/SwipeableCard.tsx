'use client';

import { useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Trash2, Edit, Check } from 'lucide-react';

interface SwipeAction {
  icon: React.ElementType;
  color: string;
  bgColor: string;
  onAction: () => void;
}

interface SwipeableCardProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  disabled?: boolean;
}

export default function SwipeableCard({
  children,
  leftActions = [],
  rightActions = [],
  onSwipeLeft,
  onSwipeRight,
  disabled = false,
}: SwipeableCardProps) {
  const x = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const leftOpacity = useTransform(x, [0, 100], [0, 1]);
  const rightOpacity = useTransform(x, [-100, 0], [1, 0]);
  const leftScale = useTransform(x, [0, 100], [0.5, 1]);
  const rightScale = useTransform(x, [-100, 0], [1, 0.5]);

  const threshold = 80;

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset > threshold || velocity > 500) {
      onSwipeRight?.();
    } else if (offset < -threshold || velocity < -500) {
      onSwipeLeft?.();
    }
  };

  if (disabled) {
    return <div>{children}</div>;
  }

  return (
    <div ref={containerRef} className="relative overflow-hidden rounded-xl">
      {/* Left actions (revealed on swipe right) */}
      {leftActions.length > 0 && (
        <motion.div
          style={{ opacity: leftOpacity, scale: leftScale }}
          className="absolute left-0 top-0 bottom-0 flex items-center gap-2 pl-4"
        >
          {leftActions.map((action, idx) => (
            <button
              key={idx}
              onClick={action.onAction}
              className={`w-10 h-10 rounded-full flex items-center justify-center ${action.bgColor}`}
            >
              <action.icon size={18} className={action.color} />
            </button>
          ))}
        </motion.div>
      )}

      {/* Right actions (revealed on swipe left) */}
      {rightActions.length > 0 && (
        <motion.div
          style={{ opacity: rightOpacity, scale: rightScale }}
          className="absolute right-0 top-0 bottom-0 flex items-center gap-2 pr-4"
        >
          {rightActions.map((action, idx) => (
            <button
              key={idx}
              onClick={action.onAction}
              className={`w-10 h-10 rounded-full flex items-center justify-center ${action.bgColor}`}
            >
              <action.icon size={18} className={action.color} />
            </button>
          ))}
        </motion.div>
      )}

      {/* Main content */}
      <motion.div
        style={{ x }}
        drag="x"
        dragConstraints={{ left: -100, right: 100 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        className="relative bg-background cursor-grab active:cursor-grabbing"
      >
        {children}
      </motion.div>
    </div>
  );
}

// Pre-configured swipe actions
export const defaultLeftActions: SwipeAction[] = [
  {
    icon: Check,
    color: 'text-white',
    bgColor: 'bg-success',
    onAction: () => {},
  },
];

export const defaultRightActions: SwipeAction[] = [
  {
    icon: Edit,
    color: 'text-white',
    bgColor: 'bg-primary',
    onAction: () => {},
  },
  {
    icon: Trash2,
    color: 'text-white',
    bgColor: 'bg-danger',
    onAction: () => {},
  },
];
