import React from 'react';

interface FormFieldProps {
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  hint,
  required,
  optional,
  error,
  children,
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: '1 0 0', minWidth: 0 }}>
    <label
      htmlFor={id}
      style={{ margin: 0, fontSize: 14, fontWeight: 500, fontFamily: "'Inter', system-ui, sans-serif", color: '#08283B', lineHeight: 1.5 }}
    >
      {label}
      {hint && <span style={{ color: '#5A6F7C', fontWeight: 400 }}> {hint}</span>}
      {required && (
        <>
          <span style={{ color: '#C81E1E' }} aria-hidden="true">*</span>
          <span className="sr-only">(required)</span>
        </>
      )}
      {optional && <span style={{ color: '#5A6F7C', fontWeight: 400 }}> (optional)</span>}
    </label>
    {children}
    {error && (
      <p
        role="alert"
        id={`${id}-error`}
        style={{ margin: 0, fontSize: 12, color: '#C81E1E', fontFamily: "'Inter', system-ui, sans-serif", lineHeight: 1.4 }}
      >
        {error}
      </p>
    )}
  </div>
);
