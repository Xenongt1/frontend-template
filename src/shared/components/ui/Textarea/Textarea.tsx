import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const baseClass = [
  'w-full px-3.5 py-2.5 rounded-lg outline-none box-border resize-y min-h-20',
  'bg-surface-input border border-stroke-input',
  'font-inter text-sm leading-5 text-text-primary',
  'transition-[border-color] duration-150',
  'focus:border-[1.5px] focus:border-stroke-medium',
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
