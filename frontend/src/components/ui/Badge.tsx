import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
}

const badgeVariants = {
  default: 'bg-slate-700/50 text-gray-100 border-slate-600/50',
  success: 'bg-profit-500/20 text-profit-400 border-profit-500/30',
  warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  error: 'bg-loss-500/20 text-loss-400 border-loss-500/30',
  info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  outline: 'bg-transparent text-gray-300 border-gray-500'
};

const badgeSizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base'
};

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-lg border backdrop-blur-sm',
        'transition-all duration-200',
        badgeVariants[variant],
        badgeSizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
);

Badge.displayName = 'Badge';

export { Badge };
export type { BadgeProps, BadgeVariant, BadgeSize };