import React from 'react';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options?: SelectOption[];
  error?: string;
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({ options, error, placeholder: _placeholder, children, ...props }) => (
  <select
    {...props}
    style={{
      width: '100%',
      boxSizing: 'border-box',
      background: '#FDFDFD',
      border: `1px solid ${error ? '#B91C1C' : '#D0D9DD'}`,
      borderRadius: 8,
      padding: '10px 14px',
      fontFamily: 'Inter',
      fontSize: 14,
      color: '#08283B',
      outline: 'none',
      appearance: 'auto',
    }}
  >
    {options
      ? options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))
      : children}
  </select>
);
