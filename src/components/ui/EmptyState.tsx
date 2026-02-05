'use client';

import { Logo } from '@/components/icons/Logo';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { LucideIcon, Package } from 'lucide-react';
import React from 'react';

interface EmptyStateProps {
  /** Icon to display (defaults to Package) */
  icon?: LucideIcon;
  /** Use animated logo instead of icon */
  useLogo?: boolean;
  /** Main title */
  title: string;
  /** Description text */
  description?: string;
  /** Action button label */
  actionLabel?: string;
  /** Action button click handler */
  onAction?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Make it full height (for tables) */
  fullHeight?: boolean;
  /** Minimum height in pixels */
  minHeight?: number;
}

/**
 * Empty State Component
 * Displays a centered message when there's no data to show
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Package,
  useLogo = false,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
  fullHeight = true,
  minHeight = 400,
}) => {
  return (
    <div 
      className={`flex flex-col items-center justify-center text-center p-8 ${className}`}
      style={{ minHeight: fullHeight ? `${minHeight}px` : undefined }}
    >
      {/* Animated Icon/Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mb-6"
      >
        {useLogo ? (
          <motion.div
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="opacity-30"
          >
            <Logo size={80} />
          </motion.div>
        ) : (
          <div className="w-20 h-20 rounded-3xl bg-foreground/5 border border-foreground/5 flex items-center justify-center">
            <Icon size={36} className="text-foreground/20" />
          </div>
        )}
      </motion.div>

      {/* Text Content */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="space-y-2 max-w-sm"
      >
        <h3 className="text-xl font-bold text-foreground/80">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-foreground/40 leading-relaxed">
            {description}
          </p>
        )}
      </motion.div>

      {/* Action Button */}
      {actionLabel && onAction && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-6"
        >
          <Button
            className="font-bold px-8 rounded-full"
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        </motion.div>
      )}
    </div>
  );
};

/**
 * Table Empty State
 * Specialized empty state for data tables
 */
export const TableEmptyState: React.FC<{
  message?: string;
  onAdd?: () => void;
  addLabel?: string;
}> = ({
  message = 'No records found',
  onAdd,
  addLabel = 'Add First Item',
}) => {
  return (
    <EmptyState
      useLogo
      title={message}
      description="Start by adding your first entry to see data here."
      actionLabel={onAdd ? addLabel : undefined}
      onAction={onAdd}
      fullHeight
      minHeight={350}
    />
  );
};

/**
 * Search Empty State
 * For when search yields no results
 */
export const SearchEmptyState: React.FC<{
  query?: string;
  onClear?: () => void;
}> = ({ query, onClear }) => {
  return (
    <EmptyState
      icon={Package}
      title="No results found"
      description={query ? `No items match "${query}". Try a different search term.` : 'Try adjusting your search or filters.'}
      actionLabel={onClear ? 'Clear Search' : undefined}
      onAction={onClear}
      fullHeight={false}
      minHeight={250}
    />
  );
};

export default EmptyState;
