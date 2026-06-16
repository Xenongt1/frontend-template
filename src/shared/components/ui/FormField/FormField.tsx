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
  <div className="flex flex-col gap-1.5 flex-[1_0_0] min-w-0">
    <label
      htmlFor={id}
      className="m-0 font-inter text-sm font-medium leading-[1.5] text-text-primary"
    >
      {label}
      {hint && <span className="text-text-tertiary font-normal"> {hint}</span>}
      {required && (
        <>
          <span className="text-[#C81E1E]" aria-hidden="true">*</span>
          <span className="sr-only">(required)</span>
        </>
      )}
      {optional && <span className="text-text-tertiary font-normal"> (optional)</span>}
    </label>
    {children}
    {error && (
      <p
        role="alert"
        id={`${id}-error`}
        className="m-0 font-inter text-xs leading-[1.4] text-[#C81E1E]"
      >
        {error}
      </p>
    )}
  </div>
);
