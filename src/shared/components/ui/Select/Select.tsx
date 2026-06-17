import React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { label: string; value: string }[];
  placeholder?: string;
}

// Focus + placeholder/selected text colour move to CSS classes — same
// shape as the migrated <Input>. The value-driven colour swap stays
// (placeholder grey when no value chosen, primary text when a value is
// set) because <option disabled> doesn't propagate text colour reliably.
const baseClass = [
  'w-full pl-3.5 pr-9 py-2.5 rounded-lg outline-none box-border cursor-pointer',
  'bg-surface-input border border-stroke-input appearance-none',
  'font-inter text-sm leading-5',
  'transition-[border-color] duration-150',
  'focus:border-[1.5px] focus:border-text-secondary',
].join(' ');

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, placeholder, className, value, ...props }, ref) => {
    const isPlaceholder = value === '' || value === undefined;
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          value={value}
          className={[
            baseClass,
            isPlaceholder ? 'text-text-placeholder' : 'text-text-primary',
            className ?? '',
          ].join(' ')}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {/* Custom chevron icon */}
        <svg
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="none"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
        >
          <path
            d="M4 6l4 4 4-4"
            stroke="#5A6F7C"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }
);

Select.displayName = 'Select';
