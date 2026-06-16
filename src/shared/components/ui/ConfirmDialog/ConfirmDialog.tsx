import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();
  const resolvedConfirmLabel = confirmLabel ?? t('common.confirm');
  const resolvedCancelLabel = cancelLabel ?? t('common.cancel');
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  if (!open) return null;

  const confirmClass = danger
    ? 'bg-[#C81E1E] text-[#FDFDFD] hover:bg-[#a11919]'
    : 'bg-navy-900 text-canvas-50 hover:bg-navy-800';

  return (
    <>
      <button
        type="button"
        aria-label={resolvedCancelLabel}
        onClick={onCancel}
        className="fixed inset-0 z-[300] bg-navy-900/35 border-none cursor-pointer"
      />
      <div className="fixed inset-0 z-[301] flex items-center justify-center pointer-events-none">
        <div className="relative w-[min(451px,calc(100vw-32px))] bg-[#FDFDFD] border border-[#E6EAEB] rounded-lg shadow-[0_1px_2px_0_rgba(0,0,0,0.08)] p-6 flex flex-col gap-4 pointer-events-auto">
          <button
            type="button"
            aria-label={t('dialog.close')}
            onClick={onCancel}
            className="absolute top-3 right-3 inline-flex items-center justify-center w-6 h-6 border-none bg-transparent cursor-pointer opacity-70 hover:opacity-100"
          >
            <X size={16} aria-hidden="true" />
          </button>

          <div className="flex flex-col gap-2 pr-6">
            <h2 className="m-0 text-[18px] font-semibold leading-[1.5] text-[#041620] font-['Inter']">
              {title}
            </h2>
            <p className="m-0 text-[14px] font-normal leading-[1.5] text-[#395362] font-['Inter']">
              {description}
            </p>
          </div>

          <div className="flex items-center justify-end gap-4 mt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="inline-flex items-center justify-center px-5 py-[10px] rounded-lg border border-[#061C2A] bg-transparent text-[14px] font-medium leading-[1.5] text-[#061C2A] font-['Inter'] cursor-pointer hover:bg-canvas-100 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {resolvedCancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`inline-flex items-center justify-center px-5 py-[10px] rounded-lg border-none text-[14px] font-medium leading-[1.5] font-['Inter'] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-colors ${confirmClass}`}
            >
              {loading ? t('dialog.processing') : resolvedConfirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
