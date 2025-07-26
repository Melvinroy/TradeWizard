import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Activity,
  Calendar,
  BarChart3,
  Filter,
  Download,
  Plus,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';

interface TradingJournalLayoutProps {
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
  onAddTrade?: () => void;
  onImportCSV?: () => void;
  onExportData?: () => void;
  className?: string;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  size?: 'small' | 'medium' | 'large';
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor = 'text-blue-400',
  size = 'medium'
}) => {
  const sizeClasses = {
    small: 'p-3 lg:p-4',
    medium: 'p-4 lg:p-6',
    large: 'p-6 lg:p-8'
  };

  const valueSizes = {
    small: 'text-2xl lg:text-3xl font-extrabold',
    medium: 'text-3xl lg:text-4xl font-extrabold',
    large: 'text-4xl lg:text-5xl font-black'
  };

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
        'relative overflow-hidden group',
        'bg-gradient-to-br from-gray-800/40 to-gray-900/40',
        'backdrop-blur-xl border border-gray-700/30',
        'rounded-xl lg:rounded-2xl transition-all duration-300',
        'hover:border-gray-600/50 hover:shadow-2xl hover:shadow-blue-500/10',
        'shadow-xl',
        sizeClasses[size]
      )}
      whileHover={{ y: -2, scale: 1.01 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Top border glow effect */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Title */}
          <h3 className="text-gray-400 text-sm font-medium mb-2 tracking-wide">
            {title}
          </h3>
          
          {/* Main Value */}
          <motion.div 
            className={cn(
              'text-white font-mono mb-1',
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
            <p className="text-gray-500 text-xs mb-3">
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
      </div>
    </motion.div>
  );
};

const TradingJournalLayout: React.FC<TradingJournalLayoutProps> = ({
  children,
  stats,
  onAddTrade,
  onImportCSV,
  onExportData,
  className
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Safely handle stats with default values and null checking
  const safeStats = {
    total_trades: Number(stats?.total_trades) || 0,
    total_pnl: Number(stats?.total_pnl) || 0,
    win_rate: Number(stats?.win_rate) || 0,
    best_trade: Number(stats?.best_trade) || 0,
    worst_trade: Number(stats?.worst_trade) || 0,
    avg_win: Number(stats?.avg_win) || 0,
    avg_loss: Number(stats?.avg_loss) || 0,
    profit_factor: Number(stats?.profit_factor) || 0,
    sharpe_ratio: Number(stats?.sharpe_ratio) || 0,
    max_drawdown: Number(stats?.max_drawdown) || 0,
  };

  // Calculate additional metrics
  const avgWin = safeStats.avg_win;
  const avgLoss = safeStats.avg_loss;
  const profitFactor = avgLoss !== 0 ? avgWin / Math.abs(avgLoss) : 0;
  const sharpeRatio = safeStats.sharpe_ratio;
  const maxDrawdown = safeStats.max_drawdown;

  // Format P&L change
  const pnlChange = safeStats.total_pnl >= 0 ? 'positive' : 'negative';
  const pnlChangeText = safeStats.total_pnl >= 0 ? 'Profitable' : 'Loss';

  const primaryMetrics = [
    {
      title: 'Total P&L',
      value: `$${safeStats.total_pnl.toFixed(2)}`,
      subtitle: 'All-time performance',
      change: pnlChangeText,
      changeType: pnlChange as 'positive' | 'negative',
      icon: DollarSign,
      iconColor: safeStats.total_pnl >= 0 ? 'text-profit-400' : 'text-loss-400'
    },
    {
      title: 'Total Trades',
      value: safeStats.total_trades,
      subtitle: 'Completed positions',
      icon: BarChart3,
      iconColor: 'text-blue-400'
    },
    {
      title: 'Win Rate',
      value: `${safeStats.win_rate.toFixed(1)}%`,
      subtitle: 'Success percentage',
      change: safeStats.win_rate >= 60 ? 'Strong' : safeStats.win_rate >= 40 ? 'Moderate' : 'Needs Work',
      changeType: safeStats.win_rate >= 60 ? 'positive' : safeStats.win_rate >= 40 ? 'neutral' : 'negative' as 'positive' | 'negative' | 'neutral',
      icon: Target,
      iconColor: safeStats.win_rate >= 60 ? 'text-profit-400' : 'text-yellow-400'
    },
    {
      title: 'Best Trade',
      value: `$${safeStats.best_trade.toFixed(2)}`,
      subtitle: 'Top performer',
      icon: TrendingUp,
      iconColor: 'text-profit-400'
    }
  ];

  const advancedMetrics = [
    {
      title: 'Profit Factor',
      value: profitFactor.toFixed(2),
      subtitle: 'Gross profit / Gross loss',
      change: profitFactor >= 2 ? 'Excellent' : profitFactor >= 1.5 ? 'Good' : 'Poor',
      changeType: profitFactor >= 2 ? 'positive' : profitFactor >= 1.5 ? 'neutral' : 'negative' as 'positive' | 'negative' | 'neutral',
      icon: Activity,
      iconColor: 'text-purple-400'
    },
    {
      title: 'Sharpe Ratio',
      value: sharpeRatio.toFixed(2),
      subtitle: 'Risk-adjusted return',
      change: sharpeRatio >= 1.5 ? 'Excellent' : sharpeRatio >= 1 ? 'Good' : 'Poor',
      changeType: sharpeRatio >= 1.5 ? 'positive' : sharpeRatio >= 1 ? 'neutral' : 'negative' as 'positive' | 'negative' | 'neutral',
      icon: TrendingUp,
      iconColor: 'text-emerald-400'
    },
    {
      title: 'Max Drawdown',
      value: `${maxDrawdown.toFixed(1)}%`,
      subtitle: 'Largest decline',
      changeType: 'negative' as 'negative',
      icon: TrendingDown,
      iconColor: 'text-loss-400'
    },
    {
      title: 'Avg Win/Loss',
      value: `$${avgWin.toFixed(0)}/$${Math.abs(avgLoss).toFixed(0)}`,
      subtitle: 'Average trade results',
      icon: Activity,
      iconColor: 'text-blue-400'
    }
  ];

  return (
    <div className={cn("space-y-8 p-6 lg:p-8", className)}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-5xl font-extrabold text-white mb-3 tracking-tight">Trading Journal</h1>
            <p className="text-lg text-gray-300 font-medium">
              Track and analyze your trading performance with professional insights
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Advanced Toggle */}
            <Button
              variant={showAdvanced ? "primary" : "outline"}
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="gap-2 min-w-[140px]"
            >
              {showAdvanced ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
            </Button>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {onExportData && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onExportData}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              )}
              
              {onImportCSV && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onImportCSV}
                  className="gap-2"
                >
                  <Download className="w-4 h-4 rotate-180" />
                  <span className="hidden sm:inline">Import CSV</span>
                </Button>
              )}
              
              {onAddTrade && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onAddTrade}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Trade</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="space-y-6">
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8"
          layout
        >
          {primaryMetrics.map((metric, index) => (
            <MetricCard
              key={metric.title}
              {...metric}
              size="medium"
            />
          ))}
        </motion.div>
      </div>

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
              <p className="text-gray-400 text-sm">
                Deep dive into your trading performance metrics and risk analysis
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {advancedMetrics.map((metric, index) => (
                <MetricCard
                  key={metric.title}
                  {...metric}
                  size="medium"
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
          transition={{ delay: 0.2, duration: 0.4 }}
          className="relative"
        >
          {children}
        </motion.div>
      )}
    </div>
  );
};

export default TradingJournalLayout;
export type { TradingJournalLayoutProps };