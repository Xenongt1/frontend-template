import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';

interface RegistrationDropdownOption {
  label: React.ReactNode;
  value: string;
}

interface RegistrationDropdownProps {
  id: string;
  options: RegistrationDropdownOption[];
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const dropdownItemTextStyle: React.CSSProperties = {
  color: '#08283B',
  fontSize: 14,
  fontFamily: "'Inter', system-ui, sans-serif",
  fontWeight: 500,
  lineHeight: '21px',
  textAlign: 'justify',
  wordBreak: 'break-word',
};

export const RegistrationDropdown: React.FC<RegistrationDropdownProps> = ({
  id,
  options,
  placeholder,
  value,
  onChange,
  error,
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((option) => option.value === value);

  function resolveBorder(): string {
    if (open) return '1.5px solid #1A7FC1';
    if (error) return '1px solid #C81E1E';
    return '1px solid #D0D5DD';
  }

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        style={{
          width: '100%',
          padding: '10px 36px 10px 14px',
          borderRadius: 8,
          border: resolveBorder(),
          background: '#F9FAFB',
          boxSizing: 'border-box',
          outline: 'none',
          boxShadow: open ? '0 0 0 3px rgba(26,127,193,0.12)' : 'none',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <span
          style={{
            color: selectedOption ? '#08283B' : '#9CA3AF',
            fontSize: 14,
            fontFamily: "'Inter', system-ui, sans-serif",
            fontWeight: 400,
            lineHeight: '20px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {selectedOption?.label ?? placeholder ?? t('common.select')}
        </span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          color="#5A6F7C"
          style={{ flexShrink: 0 }}
        />
      </button>

      {open ? (
        <div
          role="listbox"
          aria-labelledby={id}
          style={{
            position: 'absolute',
            zIndex: 20,
            top: 'calc(100% + 6px)',
            left: 0,
            width: '100%',
            background: '#FDFDFD',
            borderRadius: 8,
            border: '1px solid #E6EAEB',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {placeholder ? (
              <button
                type="button"
                role="option"
                aria-selected={value === ''}
                onClick={() => {
                  onChange('');
                  setOpen(false);
                }}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  background: value === '' ? '#F7F7F7' : '#FDFDFD',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span style={dropdownItemTextStyle}>{placeholder}</span>
              </button>
            ) : null}
            {options.map((option, index) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={option.value === value}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderTop:
                    index > 0 || placeholder ? '1px solid #E6EAEB' : 'none',
                  background: option.value === value ? '#F7F7F7' : '#FDFDFD',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span style={dropdownItemTextStyle}>{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};
