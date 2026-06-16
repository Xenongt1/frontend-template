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
    style={{
      width: 'min(420px, calc(100vw - 48px))',
      padding: 16,
      background: '#FDFDFD',
      boxShadow: '0px 1px 2px -1px rgba(0, 0, 0, 0.10), 0px 1px 3px rgba(0, 0, 0, 0.10)',
      borderRadius: 6,
      display: 'inline-flex',
      justifyContent: 'flex-start',
      alignItems: 'center',
      gap: 10,
      position: 'fixed',
      right: 24,
      top: 88,
      zIndex: 50,
      boxSizing: 'border-box',
    }}
  >
    <div
      style={{
        padding: 8,
        background: '#08283B',
        borderRadius: 8,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Check size={16} color="#FDFDFD" strokeWidth={2} aria-hidden="true" />
    </div>

    <div style={{ flex: '1 1 0', display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 12, minWidth: 0 }}>
      <div style={{ flex: '1 1 0', color: '#08283B', fontSize: 14, fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 400, lineHeight: '21px', wordBreak: 'break-word' }}>
        {message}
      </div>
      <button
        type="button"
        aria-label={t('dialog.dismissNotification')}
        onClick={onClose}
        style={{ width: 20, height: 20, border: 'none', background: 'transparent', color: '#08283B', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
      >
        <X size={20} strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
  </output>
  );
};

export default SuccessToast;
