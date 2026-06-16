import React from 'react';

type SkeletonVariant = 'text' | 'pill' | 'circle' | 'block';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
}

const variantClass: Record<SkeletonVariant, string> = {
  text: 'h-3.5 rounded',
  pill: 'h-7 rounded-full',
  circle: 'rounded-md',
  block: 'rounded',
};

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  className = '',
  ...props
}) => (
  <div
    className={`bg-canvas-300 animate-pulse ${variantClass[variant]} ${className}`}
    aria-hidden
    {...props}
  />
);
