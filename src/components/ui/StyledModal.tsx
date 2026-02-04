'use client';

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  ModalProps,
} from '@heroui/react';
import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface StyledModalProps extends Omit<ModalProps, 'children'> {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  showCloseButton?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';
}

/**
 * StyledModal
 * A consistent modal component with proper theming for light/dark modes
 */
export default function StyledModal({
  title,
  subtitle,
  children,
  footer,
  onClose,
  showCloseButton = true,
  size = 'lg',
  ...modalProps
}: StyledModalProps) {
  return (
    <Modal
      size={size}
      scrollBehavior="inside"
      classNames={{
        backdrop: 'bg-black/50 dark:bg-black/70 backdrop-blur-sm',
        base: [
          'theme-modal',
          'rounded-2xl shadow-2xl',
          'max-h-[90vh]',
        ].join(' '),
        header: 'border-b border-black/5 dark:border-white/10 px-6 py-4',
        body: 'px-6 py-6',
        footer: 'border-t border-black/5 dark:border-white/10 px-6 py-4',
        closeButton: [
          'top-4 right-4',
          'hover:bg-zinc-100 dark:hover:bg-zinc-800',
          'rounded-lg transition-colors',
        ].join(' '),
      }}
      onClose={onClose}
      {...modalProps}
    >
      <ModalContent>
        {(onCloseInternal) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground">{title}</h2>
                  {subtitle && (
                    <p className="text-sm text-muted font-normal mt-1">{subtitle}</p>
                  )}
                </div>
                {showCloseButton && (
                  <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    className="text-muted hover:text-foreground"
                    onPress={onCloseInternal}
                  >
                    <X size={18} />
                  </Button>
                )}
              </div>
            </ModalHeader>
            <ModalBody>{children}</ModalBody>
            {footer && <ModalFooter>{footer}</ModalFooter>}
          </>
        )}
      </ModalContent>
    </Modal>
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
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
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
  confirmColor = 'primary',
}: {
  onCancel: () => void;
  onConfirm: () => void;
  cancelLabel?: string;
  confirmLabel?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
  confirmColor?: 'primary' | 'success' | 'warning' | 'danger';
}) {
  return (
    <div className="flex items-center gap-3 justify-end">
      <Button
        variant="flat"
        onPress={onCancel}
        className="font-semibold"
      >
        {cancelLabel}
      </Button>
      <Button
        color={confirmColor}
        onPress={onConfirm}
        isLoading={isLoading}
        isDisabled={isDisabled}
        className="font-semibold"
      >
        {confirmLabel}
      </Button>
    </div>
  );
}
