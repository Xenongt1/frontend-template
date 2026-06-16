import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const baseClass = [
  'w-full px-3.5 py-2.5 rounded-lg outline-none box-border resize-y min-h-20',
  'bg-surface-input border border-stroke-input',
  'font-inter text-sm leading-5 text-text-primary',
  'transition-[border-color,box-shadow] duration-150',
  'focus:border-[1.5px] focus:border-stroke-focus',
  'focus:shadow-[0_0_0_3px_rgba(26,127,193,0.12)]',
].join(' ');

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={[baseClass, className ?? ''].join(' ')}
      {...props}
    />
  )
);

Textarea.displayName = 'Textarea';
