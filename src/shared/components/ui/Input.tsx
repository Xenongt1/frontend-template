import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input: React.FC<InputProps> = ({ error, className, ...props }) => (
  <input
    {...props}
    className={className}
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
    }}
  />
);
