import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type SpinnerVariant = 'default' | 'primary' | 'success' | 'warning' | 'error';

interface LoadingSpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  text?: string;
  fullScreen?: boolean;
}

const spinnerSizes = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
};

const spinnerVariants = {
  default: 'text-gray-400',
  primary: 'text-blue-400',
  success: 'text-profit-400',
  warning: 'text-yellow-400',
  error: 'text-loss-400'
};

const LoadingSpinner = forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size = 'md', variant = 'primary', text, fullScreen = false, ...props }, ref) => {
    const spinner = (
      <div className={cn('flex flex-col items-center justify-center gap-3', className)} {...props} ref={ref}>
        <div className="relative">
          <div
            className={cn(
              'animate-spin rounded-full border-2 border-current border-t-transparent',
              spinnerSizes[size],
              spinnerVariants[variant]
            )}
          />
          <div
            className={cn(
              'absolute inset-0 animate-ping rounded-full border border-current opacity-20',
              spinnerSizes[size],
              spinnerVariants[variant]
            )}
          />
        </div>
        {text && (
          <p className="text-sm font-medium text-gray-400 animate-pulse">{text}</p>
        )}
      </div>
    );

    if (fullScreen) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
          {spinner}
        </div>
      );
    }

    return spinner;
  }
);

LoadingSpinner.displayName = 'LoadingSpinner';

// Inline loading component for buttons and small areas
const InlineSpinner = forwardRef<HTMLSpanElement, { size?: SpinnerSize; className?: string }>(
  ({ size = 'xs', className }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-block animate-spin rounded-full border-2 border-current border-t-transparent',
        spinnerSizes[size],
        className
      )}
    />
  )
);

InlineSpinner.displayName = 'InlineSpinner';

export { LoadingSpinner, InlineSpinner };
export type { LoadingSpinnerProps, SpinnerSize, SpinnerVariant };