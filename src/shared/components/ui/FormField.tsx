import React from 'react';

interface FormFieldProps {
  id: string;
  label?: string;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  required,
  optional,
  hint,
  error,
  children,
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    {label && (
      <label
        htmlFor={id}
        style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 14, color: '#08283B' }}
      >
        {label}
        {required && <span style={{ color: '#B91C1C', marginLeft: 2 }}>*</span>}
        {optional && (
          <span style={{ fontWeight: 400, color: '#6B7A85', marginLeft: 4 }}>(optional)</span>
        )}
        {hint && (
          <span style={{ fontWeight: 400, color: '#6B7A85', marginLeft: 4 }}>{hint}</span>
        )}
      </label>
    )}
    {children}
    {error && (
      <span style={{ fontFamily: 'Inter', fontSize: 12, color: '#B91C1C' }}>{error}</span>
    )}
  </div>
);
