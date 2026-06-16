import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check, X, AlertCircle } from 'lucide-react';
import { toast as sonnerToast } from 'sonner';

export type ToastVariant = 'success' | 'error';

export function toast(message: string, variant: ToastVariant = 'success') {
  if (variant === 'error') return sonnerToast.error(message);
  return sonnerToast.success(message);
}

export interface ToastProps {
  open: boolean;
  message: string;
  variant?: ToastVariant;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  open,
  message,
  variant = 'success',
  onDismiss,
}) => {
  const { t } = useTranslation();
  if (!open) return null;

  const isError = variant === 'error';
  const iconBg = isError ? '#9B1C1C' : '#08283B';

  return (
    <div
      role={isError ? 'alert' : 'status'} // NOSONAR — ARIA live region for transient notifications
      aria-live={isError ? 'assertive' : 'polite'}
      className="fixed top-[88px] right-6 z-[400] w-[min(420px,calc(100vw-48px))] p-4 bg-[#FDFDFD] rounded-md shadow-[0_1px_2px_-1px_rgba(0,0,0,0.10),0_1px_3px_rgba(0,0,0,0.10)] inline-flex items-center gap-[10px] box-border"
    >
      <div
        className="p-2 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: iconBg }}
      >
        {isError ? (
          <AlertCircle size={16} color="#FDFDFD" strokeWidth={2} aria-hidden="true" />
        ) : (
          <Check size={16} color="#FDFDFD" strokeWidth={2} aria-hidden="true" />
        )}
      </div>
      <div className="flex-1 min-w-0 flex items-center gap-3">
        <div className="flex-1 text-[#08283B] text-sm font-normal leading-[21px] font-['Inter'] break-words">
          {message}
        </div>
        <button
          type="button"
          aria-label={t('dialog.dismissNotification')}
          onClick={onDismiss}
          className="w-5 h-5 border-none bg-transparent text-[#08283B] p-0 inline-flex items-center justify-center cursor-pointer flex-shrink-0"
        >
          <X size={20} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
