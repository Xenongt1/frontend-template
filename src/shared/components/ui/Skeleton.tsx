import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'pill' | 'circle' | 'rect' | 'block';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, variant = 'rect' }) => {
  const variantClass =
    variant === 'circle'
      ? 'rounded-full'
      : variant === 'pill'
        ? 'rounded-full h-5'
        : variant === 'text'
          ? 'rounded h-4'
          : 'rounded-md'; // covers 'rect' and 'block'

  return <div className={cn('animate-pulse bg-gray-200', variantClass, className)} />;
};
