import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface Country {
  name: string;
  flag: string;
  dialCode: string;
  code: string;
}

const COUNTRIES: Country[] = [
  { name: 'United States', flag: '🇺🇸', dialCode: '+1',   code: 'US' },
  { name: 'United Kingdom', flag: '🇬🇧', dialCode: '+44',  code: 'GB' },
  { name: 'France',         flag: '🇫🇷', dialCode: '+33',  code: 'FR' },
  { name: 'Germany',        flag: '🇩🇪', dialCode: '+49',  code: 'DE' },
  { name: 'Kenya',          flag: '🇰🇪', dialCode: '+254', code: 'KE' },
  { name: 'Nigeria',        flag: '🇳🇬', dialCode: '+234', code: 'NG' },
  { name: 'South Africa',   flag: '🇿🇦', dialCode: '+27',  code: 'ZA' },
];

interface PhoneInputProps {
  dialCode: string;
  onDialCodeChange: (dialCode: string) => void;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  dialCode,
  onDialCodeChange,
  value,
  onChange,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = COUNTRIES.find(c => c.dialCode === dialCode) ?? COUNTRIES[0];

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative flex-1">
      <div className={`flex rounded-lg bg-surface-overlay border ${error ? 'border-red-700' : 'border-stroke-medium'} overflow-hidden`}>
        <button
          type="button"
          onClick={() => setIsOpen(p => !p)}
          className={`flex items-center gap-1.5 px-3 py-2.5 bg-transparent border-r ${error ? 'border-red-700' : 'border-stroke-medium'} cursor-pointer shrink-0 whitespace-nowrap`}
        >
          <span className="text-base leading-none">{selected.flag}</span>
          <span className="font-inter text-sm text-text-primary font-normal">{selected.dialCode}</span>
          <ChevronDown size={14} className="text-text-tertiary" />
        </button>

        <input
          type="tel"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="123 456 7890"
          className="flex-1 min-w-0 bg-transparent border-none outline-none px-3 py-2.5 font-inter text-sm text-text-primary placeholder:text-text-placeholder"
        />
      </div>

      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] left-0 bg-surface-card border border-stroke-medium rounded-lg shadow-lg z-[100] min-w-[220px] max-h-60 overflow-y-auto">
          {COUNTRIES.map(country => (
            <button
              key={country.code}
              type="button"
              onClick={() => { onDialCodeChange(country.dialCode); setIsOpen(false); }}
              className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-left border-none cursor-pointer ${country.dialCode === dialCode ? 'bg-primary-100' : 'bg-transparent hover:bg-canvas-100'}`}
            >
              <span className="text-base">{country.flag}</span>
              <span className="font-inter text-sm text-text-primary flex-1">{country.name}</span>
              <span className="font-inter text-[13px] text-text-tertiary">{country.dialCode}</span>
            </button>
          ))}
        </div>
      )}

      {error && (
        <span className="block mt-1 font-inter text-xs text-red-700">{error}</span>
      )}
    </div>
  );
};

export default PhoneInput;
