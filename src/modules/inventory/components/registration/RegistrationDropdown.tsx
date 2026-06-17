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

// Shared text styling for items rendered inside this dropdown's listbox.
// Exported so other places that visually echo a dropdown item (e.g. the
// edit/deactivate links in GradeExpiryStep) can stay in lockstep.
export const dropdownItemTextClass =
  'font-inter text-sm font-medium leading-[21px] text-text-primary text-justify break-words';

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

  function resolveBorderClass(): string {
    if (open) return 'border-[1.5px] border-text-secondary';
    if (error) return 'border border-[#C81E1E]';
    return 'border border-stroke-input';
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
    <div ref={wrapperRef} className="relative w-full">
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={[
          'w-full pl-3.5 pr-9 py-2.5 rounded-lg box-border outline-none cursor-pointer',
          'flex items-center justify-between gap-3',
          'bg-surface-input transition-[border-color] duration-150',
          resolveBorderClass(),
        ].join(' ')}
      >
        <span
          className={[
            'font-inter text-sm font-normal leading-5 overflow-hidden text-ellipsis whitespace-nowrap',
            selectedOption ? 'text-text-primary' : 'text-text-placeholder',
          ].join(' ')}
        >
          {selectedOption?.label ?? placeholder ?? t('common.select')}
        </span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          color="#5A6F7C"
          className="shrink-0"
        />
      </button>

      {open ? (
        <div
          role="listbox"
          aria-labelledby={id}
          className="absolute z-20 left-0 top-[calc(100%+6px)] w-full bg-canvas-50 rounded-lg border border-stroke-light overflow-hidden"
        >
          <div className="flex flex-col">
            {placeholder ? (
              <button
                type="button"
                role="option"
                aria-selected={value === ''}
                onClick={() => {
                  onChange('');
                  setOpen(false);
                }}
                className={[
                  'px-4 py-2 border-none cursor-pointer text-left transition-colors duration-150',
                  value === '' ? 'bg-canvas-100' : 'bg-canvas-50 hover:bg-canvas-100',
                ].join(' ')}
              >
                <span className={dropdownItemTextClass}>{placeholder}</span>
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
                className={[
                  'px-4 py-2 border-none cursor-pointer text-left transition-colors duration-150',
                  index > 0 || placeholder ? 'border-t border-stroke-light' : '',
                  option.value === value ? 'bg-canvas-100' : 'bg-canvas-50 hover:bg-canvas-100',
                ].join(' ')}
              >
                <span className={dropdownItemTextClass}>{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};
