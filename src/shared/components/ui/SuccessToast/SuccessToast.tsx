import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check, X } from 'lucide-react';

interface SuccessToastProps {
  message: string;
  onClose: () => void;
}

const SuccessToast: React.FC<SuccessToastProps> = ({ message, onClose }) => {
  const { t } = useTranslation();
  return (
    <output
      aria-live="polite"
      className="fixed top-[88px] right-6 z-50 w-[min(420px,calc(100vw-48px))] p-4 bg-canvas-50 rounded-md inline-flex items-center gap-2.5 box-border shadow-[0_1px_2px_-1px_rgba(0,0,0,0.10),0_1px_3px_rgba(0,0,0,0.10)]"
    >
      <div className="p-2 bg-brand-navy rounded-lg flex items-center justify-center">
        <Check size={16} color="#FDFDFD" strokeWidth={2} aria-hidden="true" />
      </div>

      <div className="flex-1 flex items-center gap-3 min-w-0">
        <div className="flex-1 font-inter text-sm font-normal leading-[21px] text-text-primary break-words">
          {message}
        </div>
        <button
          type="button"
          aria-label={t('dialog.dismissNotification')}
          onClick={onClose}
          className="w-5 h-5 border-none bg-transparent text-text-primary p-0 inline-flex items-center justify-center cursor-pointer shrink-0"
        >
          <X size={20} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
    </output>
  );
};

export default SuccessToast;
