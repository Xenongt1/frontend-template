import React from 'react';
import { AlertDialog } from 'radix-ui';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
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
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}) => (
  <AlertDialog.Root open={open} onOpenChange={(v) => { if (!v) onCancel(); }}>
    <AlertDialog.Portal>
      <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
        <div className="flex items-start justify-between gap-4">
          <AlertDialog.Title className="text-base font-semibold text-[#041620]">
            {title}
          </AlertDialog.Title>
          <button
            type="button"
            onClick={onCancel}
            className="shrink-0 p-1 rounded-md text-[#395362] hover:bg-gray-100 border-none bg-transparent cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        {description && (
          <AlertDialog.Description className="mt-2 text-sm text-[#395362]">
            {description}
          </AlertDialog.Description>
        )}
        <div className="mt-5 flex justify-end gap-3">
          <AlertDialog.Cancel asChild>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-[#395362] bg-white border border-[#B2BCC2] rounded-lg hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
            >
              {cancelLabel}
            </button>
          </AlertDialog.Cancel>
          <AlertDialog.Action asChild>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={cn(
                'px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 cursor-pointer',
                danger
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-[#08283B] hover:bg-[#061C2A]',
              )}
            >
              {loading ? 'Processing…' : confirmLabel}
            </button>
          </AlertDialog.Action>
        </div>
      </AlertDialog.Content>
    </AlertDialog.Portal>
  </AlertDialog.Root>
);
