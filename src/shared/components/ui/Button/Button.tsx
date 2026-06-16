import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  type?: 'button' | 'submit' | 'reset';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  /** Pass a constrained class list (e.g. width overrides). Avoid colour/font overrides. */
  className?: string;
  children?: React.ReactNode;
}

// ─── Per-variant style strings ────────────────────────────────────────────────
// Primary: full spec from Figma "states" frame (30:16921).
// Secondary: default from "types" (30:17002); hover/click inferred and marked
// in styles.css — refine when explicit Figma specs land.
// Tertiary: transparent default; hover/click reuse the sidepanel hover colour
// since the sidebar nav (also transparent → grey) sets that precedent.

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: [
    'bg-brand-navy text-canvas-50',
    'hover:bg-brand-navy-dark active:bg-button-primary-click',
    'focus-visible:ring-4 focus-visible:ring-button-focus-ring',
    'disabled:bg-button-disabled-bg disabled:text-button-disabled-text',
  ].join(' '),

  secondary: [
    'bg-button-secondary-default text-canvas-50',
    'hover:bg-button-secondary-hover active:bg-button-secondary-click',
    'focus-visible:ring-4 focus-visible:ring-button-focus-ring',
    'disabled:bg-button-disabled-bg disabled:text-button-disabled-text',
  ].join(' '),

  tertiary: [
    'bg-transparent text-brand-navy-mid',
    'hover:bg-stroke-light active:bg-canvas-200',
    'focus-visible:ring-4 focus-visible:ring-button-focus-ring',
    'disabled:bg-transparent disabled:text-button-disabled-text',
  ].join(' '),
};

// ─── Per-size padding + font + icon sizing ────────────────────────────────────
// Icon sizing applied to direct SVG children via the arbitrary-variant
// `[&>svg]` selector so consumers can pass any SVG without sizing it themselves.

const SIZE_CLASSES: Record<ButtonSize, string> = {
  xs: 'px-3 py-2 text-xs [&>svg]:size-4',
  sm: 'px-3 py-2 text-sm [&>svg]:size-4',
  md: 'px-5 py-2.5 text-sm [&>svg]:size-5',
  lg: 'px-5 py-3 text-base [&>svg]:size-6',
  xl: 'px-6 py-3.5 text-base [&>svg]:size-6',
};

/**
 * App-wide action button.
 *
 *   variant: 'primary' | 'secondary' | 'tertiary' (default 'primary')
 *   size:    'xs' | 'sm' | 'md' | 'lg' | 'xl'    (default 'md')
 *
 * States — default, hover, active (click), focus-visible (4px ring),
 * disabled — are applied via Tailwind pseudo-classes; consumers never
 * need to wire them up at call sites.
 *
 * Icon-only buttons: pass a single icon as `children` and omit text.
 * The Figma spec keeps the same padding either way, so the button
 * becomes naturally wider than tall (e.g. 60×40 at md).
 */
const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  type = 'button',
  leftIcon,
  rightIcon,
  className,
  children,
  disabled,
  ...rest
}) => (
  <button
    type={type}
    disabled={disabled}
    className={[
      'inline-flex items-center justify-center gap-2',
      'rounded-lg border-none cursor-pointer outline-none',
      'font-inter font-medium leading-[1.5]',
      'transition-colors duration-150',
      'disabled:cursor-not-allowed disabled:[&_svg]:text-button-disabled-text',
      SIZE_CLASSES[size],
      VARIANT_CLASSES[variant],
      className ?? '',
    ].join(' ')}
    {...rest}
  >
    {leftIcon}
    {children !== undefined && children !== null && children !== '' && (
      <span className="whitespace-nowrap">{children}</span>
    )}
    {rightIcon}
  </button>
);

export default Button;
