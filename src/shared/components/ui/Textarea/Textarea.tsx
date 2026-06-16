import React, { useState } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ style, onFocus, onBlur, ...props }, ref) => {
    const [focused, setFocused] = useState(false);

    return (
      <textarea
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
          padding: '10px 14px',
          borderRadius: 8,
          border: focused ? '1.5px solid #1A7FC1' : '1px solid #D0D5DD',
          background: '#F9FAFB',
          fontSize: 14,
          fontFamily: "'Inter', system-ui, sans-serif",
          color: '#08283B',
          boxSizing: 'border-box',
          outline: 'none',
          resize: 'vertical',
          minHeight: 80,
          boxShadow: focused ? '0 0 0 3px rgba(26,127,193,0.12)' : 'none',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          lineHeight: '20px',
          ...style,
        }}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';
