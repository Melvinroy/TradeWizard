import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target,
  Calendar,
  PieChart,
  Activity,
  Settings,
  Filter,
  Grid3X3,
  List
} from 'lucide-react';
import MetricsWidget from '../ui/MetricsWidget';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

interface DashboardLayoutProps {
  children?: React.ReactNode;
  stats: {
    total_trades: number;
    total_pnl: number;
    win_rate: number;
    best_trade: number;
    worst_trade?: number;
    avg_win?: number;
    avg_loss?: number;
    profit_factor?: number;
    sharpe_ratio?: number;
    max_drawdown?: number;
  };
  className?: string;
}

type ViewMode = 'grid' | 'list';

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  stats,
  className
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Calculate additional metrics
  const avgWin = stats.avg_win || 0;
  const avgLoss = stats.avg_loss || 0;
  const profitFactor = avgLoss !== 0 ? avgWin / Math.abs(avgLoss) : 0;
  const sharpeRatio = stats.sharpe_ratio || 0;
  const maxDrawdown = stats.max_drawdown || 0;

  // Format P&L change
  const pnlChange = stats.total_pnl >= 0 ? 'positive' : 'negative';
  const pnlChangeText = stats.total_pnl >= 0 ? '+' : '';

  const primaryMetrics = [
    {
      title: 'Total P&L',
      value: `$${stats.total_pnl.toFixed(2)}`,
      subtitle: 'All-time performance',
      change: `${pnlChangeText}${Math.abs(stats.total_pnl).toFixed(2)}`,
      changeType: pnlChange as 'positive' | 'negative',
      icon: DollarSign,
      iconColor: stats.total_pnl >= 0 ? 'text-profit-400' : 'text-loss-400',
      gradient: stats.total_pnl >= 0 ? 'bg-gradient-to-br from-profit-500/20 to-profit-600/10' : 'bg-gradient-to-br from-loss-500/20 to-loss-600/10'
    },
    {
      title: 'Total Trades',
      value: stats.total_trades,
      subtitle: 'Completed positions',
      icon: BarChart3,
      iconColor: 'text-blue-400',
      gradient: 'bg-gradient-to-br from-blue-500/20 to-blue-600/10'
    },
    {
      title: 'Win Rate',
      value: `${stats.win_rate.toFixed(1)}%`,
      subtitle: 'Success percentage',
      change: stats.win_rate >= 60 ? 'Strong' : stats.win_rate >= 40 ? 'Moderate' : 'Needs Work',
      changeType: stats.win_rate >= 60 ? 'positive' : stats.win_rate >= 40 ? 'neutral' : 'negative' as 'positive' | 'negative' | 'neutral',
      icon: Target,
      iconColor: stats.win_rate >= 60 ? 'text-profit-400' : 'text-yellow-400',
      gradient: 'bg-gradient-to-br from-yellow-500/20 to-orange-600/10'
    },
    {
      title: 'Best Trade',
      value: `$${stats.best_trade.toFixed(2)}`,
      subtitle: 'Top performer',
      icon: TrendingUp,
      iconColor: 'text-profit-400',
      gradient: 'bg-gradient-to-br from-profit-500/20 to-emerald-600/10'
    }
  ];

  const advancedMetrics = [
    {
      title: 'Profit Factor',
      value: profitFactor.toFixed(2),
      subtitle: 'Risk-reward ratio',
      change: profitFactor >= 2 ? 'Excellent' : profitFactor >= 1.5 ? 'Good' : 'Poor',
      changeType: profitFactor >= 2 ? 'positive' : profitFactor >= 1.5 ? 'neutral' : 'negative' as 'positive' | 'negative' | 'neutral',
      icon: PieChart,
      iconColor: 'text-purple-400'
    },
    {
      title: 'Avg Win',
      value: `$${avgWin.toFixed(2)}`,
      subtitle: 'Average winning trade',
      icon: TrendingUp,
      iconColor: 'text-profit-400'
    },
    {
      title: 'Avg Loss',
      value: `$${Math.abs(avgLoss).toFixed(2)}`,
      subtitle: 'Average losing trade',
      icon: TrendingDown,
      iconColor: 'text-loss-400'
    },
    {
      title: 'Max Drawdown',
      value: `${maxDrawdown.toFixed(1)}%`,
      subtitle: 'Largest decline',
      changeType: 'negative' as 'negative',
      icon: Activity,
      iconColor: 'text-loss-400'
    }
  ];

  return (
    <div className={cn("space-y-8", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="trading-title">Trading Performance</h1>
          <p className="text-text-secondary mt-2">
            Advanced analytics and insights for your trading journey
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant={showAdvanced ? "primary" : "outline"}
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="gap-2"
          >
            <Settings className="w-4 h-4" />
            {showAdvanced ? 'Basic View' : 'Advanced View'}
          </Button>
          
          <div className="flex items-center bg-white/5 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 rounded-md transition-all',
                viewMode === 'grid' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              )}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded-md transition-all',
                viewMode === 'list' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Primary Metrics */}
      <motion.div 
        className={cn(
          "grid gap-6",
          viewMode === 'grid' 
            ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-4" 
            : "grid-cols-1"
        )}
        layout
      >
        {primaryMetrics.map((metric, index) => (
          <MetricsWidget
            key={metric.title}
            {...metric}
            size={viewMode === 'list' ? 'small' : 'medium'}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          />
        ))}
      </motion.div>

      {/* Advanced Metrics */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                Advanced Analytics
              </h2>
              <p className="text-text-secondary text-sm">
                Deep dive into your trading performance metrics
              </p>
            </div>
            
            <div className={cn(
              "grid gap-6",
              viewMode === 'grid' 
                ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-4" 
                : "grid-cols-1 md:grid-cols-2"
            )}>
              {advancedMetrics.map((metric, index) => (
                <MetricsWidget
                  key={metric.title}
                  {...metric}
                  size={viewMode === 'list' ? 'small' : 'medium'}
                  className="animate-slide-up"
                  style={{ animationDelay: `${(index + 4) * 0.1}s` }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      {children && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="relative"
        >
          {children}
        </motion.div>
      )}
    </div>
  );
};

export default DashboardLayout;
export type { DashboardLayoutProps };