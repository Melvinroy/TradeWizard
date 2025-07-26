import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from './Card';
import { cn, formatCurrency, getPnLColor } from '../../lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral' | 'positive';
  icon?: LucideIcon;
  gradient?: string;
  currency?: boolean;
  className?: string;
}

const StatsCard = ({ 
  title, 
  value, 
  description,
  change, 
  trend = 'neutral', 
  icon: Icon, 
  gradient,
  currency = false,
  className 
}: StatsCardProps) => {
  const trendColors = {
    up: 'text-profit-400',
    down: 'text-loss-400', 
    neutral: 'text-gray-400',
    positive: 'text-profit-400'
  };

  const trendIcons = {
    up: '↗',
    down: '↘',
    neutral: '→',
    positive: '↗'
  };

  const formattedValue = currency && typeof value === 'number' 
    ? formatCurrency(value) 
    : value;

  return (
    <Card 
      variant="glass" 
      hoverable 
      className={cn("group relative overflow-hidden", className)}
    >
      {/* Background gradient overlay */}
      {gradient && (
        <div className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300",
          gradient
        )} />
      )}
      
      {/* Animated border glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />
      
      <CardContent className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-gray-400 text-sm font-medium mb-2">{title}</p>
            
            <div className="flex items-baseline gap-2 mb-3">
              <motion.p 
                className="text-white text-3xl font-bold"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                {formattedValue}
              </motion.p>
              
              {change && (
                <motion.div 
                  className={cn("flex items-center text-sm font-semibold", trendColors[trend])}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <span className="mr-1">{trendIcons[trend]}</span>
                  {change}
                </motion.div>
              )}
            </div>
          </div>
          
          {Icon && (
            <motion.div 
              className="p-3 bg-slate-700/50 rounded-xl group-hover:bg-slate-600/50 transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors duration-200" />
            </motion.div>
          )}
        </div>
        
        {description && (
          <p className="text-sm text-gray-500 mt-2">{description}</p>
        )}

        {/* Progress bar for visual appeal */}
        {trend !== 'neutral' && (
          <div className="mt-4 h-1 bg-slate-700/50 rounded-full overflow-hidden">
            <motion.div
              className={cn(
                "h-full rounded-full",
                (trend === 'up' || trend === 'positive') ? 'bg-profit-500' : 'bg-loss-500'
              )}
              initial={{ width: 0 }}
              animate={{ width: '70%' }}
              transition={{ duration: 1, delay: 0.2 }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { StatsCard };
export type { StatsCardProps };
export default StatsCard;