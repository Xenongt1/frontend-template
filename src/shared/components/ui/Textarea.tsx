import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ error, ...props }) => (
  <textarea
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
      resize: 'vertical',
      minHeight: 80,
    }}
  />
);
