import { toast as sonnerToast } from 'sonner';
import React from 'react';

export type ToastVariant = 'success' | 'error' | 'info';

export function toast(message: string, variant: ToastVariant = 'info') {
  if (variant === 'success') return sonnerToast.success(message);
  if (variant === 'error') return sonnerToast.error(message);
  return sonnerToast(message);
}

// Legacy component API — used by pages that render <Toast open={...} />
interface ToastProps {
  open: boolean;
  message: string;
  variant?: ToastVariant;
  onDismiss?: () => void;
}

export function Toast({ open, message, variant = 'info', onDismiss }: ToastProps): null {
  React.useEffect(() => {
    if (!open || !message) return;
    const id = toast(message, variant);
    return () => {
      sonnerToast.dismiss(id as string | number | undefined);
      onDismiss?.();
    };
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  }, [open, message]);
  return null;
}

// SuccessToast — simple wrapper matching the existing API
interface SuccessToastProps {
  message: string;
  onClose?: () => void;
}

export function SuccessToast({ message, onClose }: SuccessToastProps): null {
  React.useEffect(() => {
    const id = sonnerToast.success(message, { onDismiss: onClose, onAutoClose: onClose });
    return () => { sonnerToast.dismiss(id); };
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  }, [message]);
  return null;
}
