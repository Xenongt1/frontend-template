import React, { useState } from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { label: string; value: string }[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, placeholder, style, onFocus, onBlur, ...props }, ref) => {
    const [focused, setFocused] = useState(false);

    return (
      <div style={{ position: 'relative', width: '100%' }}>
        <select
          ref={ref}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={{
            width: '100%',
            padding: '10px 36px 10px 14px',
            borderRadius: 8,
            border: focused ? '1.5px solid #1A7FC1' : '1px solid #D0D5DD',
            background: '#F9FAFB',
            fontSize: 14,
            fontFamily: "'Inter', system-ui, sans-serif",
            color: props.value === '' || props.value === undefined ? '#9CA3AF' : '#08283B',
            boxSizing: 'border-box',
            outline: 'none',
            appearance: 'none' as const,
            boxShadow: focused ? '0 0 0 3px rgba(26,127,193,0.12)' : 'none',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            lineHeight: '20px',
            cursor: 'pointer',
            ...style,
          }}
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
          style={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 16,
            height: 16,
            pointerEvents: 'none',
          }}
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
