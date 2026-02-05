'use client';

import { ReactNode } from 'react';
import { X, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StyledModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Modal title */
  title: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Modal content */
  children: ReactNode;
  /** Optional footer content */
  footer?: ReactNode;
  /** Whether to show close button */
  showCloseButton?: boolean;
  /** Modal size */
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';
  /** Additional class names for the content */
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  full: 'max-w-[95vw]',
};

/**
 * StyledModal
 * A consistent modal component with proper theming for light/dark modes
 */
export default function StyledModal({
  isOpen,
  onClose,
  onOpenChange,
  title,
  subtitle,
  children,
  footer,
  showCloseButton = true,
  size = 'lg',
  className,
}: StyledModalProps) {
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
    onOpenChange?.(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          'rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden',
          sizeClasses[size],
          className
        )}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="border-b border-border px-6 py-4 -mx-6 -mt-6 mb-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
              {subtitle && (
                <DialogDescription className="text-sm text-muted-foreground mt-1">
                  {subtitle}
                </DialogDescription>
              )}
            </div>
            {showCloseButton && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                onClick={onClose}
              >
                <X size={18} />
                <span className="sr-only">Close</span>
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="overflow-y-auto px-6 py-6 -mx-6">{children}</div>

        {footer && (
          <DialogFooter className="border-t border-border px-6 py-4 -mx-6 -mb-6 mt-0">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * Modal Section Header
 * Use to divide modal content into sections
 */
export function ModalSection({
  title,
  children,
  className = '',
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  );
}

/**
 * Modal Actions
 * Standard footer actions for modals
 */
export function ModalActions({
  onCancel,
  onConfirm,
  cancelLabel = 'Cancel',
  confirmLabel = 'Confirm',
  isLoading = false,
  isDisabled = false,
  confirmVariant = 'default',
}: {
  onCancel: () => void;
  onConfirm: () => void;
  cancelLabel?: string;
  confirmLabel?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
  confirmVariant?: 'default' | 'destructive' | 'secondary';
}) {
  return (
    <div className="flex items-center gap-3 justify-end">
      <Button variant="outline" onClick={onCancel} className="font-semibold">
        {cancelLabel}
      </Button>
      <Button
        variant={confirmVariant}
        onClick={onConfirm}
        disabled={isLoading || isDisabled}
        className="font-semibold"
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {confirmLabel}
      </Button>
    </div>
  );
}
