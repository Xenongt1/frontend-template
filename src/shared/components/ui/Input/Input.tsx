import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

// Focus state is driven by CSS :focus rather than a useState toggle — same
// visual outcome, fewer re-renders, no test plumbing needed. The focus
// indicator is just the soft outer ring; the input's border colour stays
// at stroke-input so the field doesn't visually "thicken" on click.
const baseClass = [
  'w-full box-border outline-none',
  'px-3.5 py-2.5 rounded-lg',
  'bg-surface-input border border-stroke-input',
  'font-inter text-sm leading-5 text-text-primary',
  'transition-[box-shadow] duration-150',
  'focus:shadow-[0_0_0_3px_rgba(26,127,193,0.12)]',
].join(' ');

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={[baseClass, className ?? ''].join(' ')}
      {...props}
    />
  )
);

Input.displayName = 'Input';
