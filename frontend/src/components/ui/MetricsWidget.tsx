import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface MetricsWidgetProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: LucideIcon;
  iconColor?: string;
  gradient?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const sizeClasses = {
  small: 'p-4',
  medium: 'p-6', 
  large: 'p-8'
};

const valueSizes = {
  small: 'text-lg font-bold',
  medium: 'text-2xl font-bold',
  large: 'text-3xl font-extrabold'
};

const MetricsWidget: React.FC<MetricsWidgetProps> = ({
  title,
  value,
  subtitle,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor = 'text-blue-400',
  gradient,
  size = 'medium',
  className
}) => {
  const changeColors = {
    positive: 'text-profit-400 bg-profit-400/10',
    negative: 'text-loss-400 bg-loss-400/10',
    neutral: 'text-gray-400 bg-gray-400/10'
  };

  const changeIcons = {
    positive: '↗',
    negative: '↘',
    neutral: '→'
  };

  return (
    <motion.div
      className={cn(
        'metric-card group relative overflow-hidden',
        sizeClasses[size],
        className
      )}
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Gradient Background Overlay */}
      {gradient && (
        <div 
          className={cn(
            "absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300",
            gradient
          )} 
        />
      )}

      {/* Top Border Glow Effect */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1">
          {/* Title */}
          <h3 className="text-text-secondary text-sm font-medium mb-2 tracking-wide">
            {title}
          </h3>
          
          {/* Main Value */}
          <motion.div 
            className={cn(
              'text-text-primary font-mono mb-1',
              valueSizes[size]
            )}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            {typeof value === 'number' ? value.toLocaleString() : value}
          </motion.div>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-text-muted text-xs mb-3">
              {subtitle}
            </p>
          )}

          {/* Change Indicator */}
          {change && (
            <motion.div 
              className={cn(
                'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold',
                changeColors[changeType]
              )}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <span className="mr-1">{changeIcons[changeType]}</span>
              {change}
            </motion.div>
          )}
        </div>

        {/* Icon */}
        {Icon && (
          <motion.div 
            className={cn(
              'p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10',
              iconColor
            )}
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Icon className="w-6 h-6" />
          </motion.div>
        )}
      </div>

      {/* Progress Bar (optional) */}
      {changeType !== 'neutral' && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
          <motion.div
            className={cn(
              "h-full",
              changeType === 'positive' ? 'bg-profit-500' : 'bg-loss-500'
            )}
            initial={{ width: 0 }}
            animate={{ width: '70%' }}
            transition={{ duration: 1, delay: 0.2 }}
          />
        </div>
      )}
    </motion.div>
  );
};

export default MetricsWidget;
export type { MetricsWidgetProps };