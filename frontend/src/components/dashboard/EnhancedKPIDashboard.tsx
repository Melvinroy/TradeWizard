import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Activity,
  BarChart3,
  Eye,
  EyeOff,
  Info,
  Zap
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { 
  LineChart, 
  Line, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  AreaChart, 
  Area 
} from 'recharts';

interface Trade {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  trade_date: string;
  commission: number;
}

interface DashboardStats {
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
}

interface EnhancedKPIDashboardProps {
  stats: DashboardStats;
  trades?: Trade[];
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
  sparklineData?: Array<{ value: number; date: string }>;
  interactive?: boolean;
  trend?: number;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor = 'text-blue-400',
  size = 'medium',
  sparklineData,
  interactive = false,
  trend
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    small: 'p-4 lg:p-5',
    medium: 'p-5 lg:p-6',
    large: 'p-6 lg:p-8'
  };

  const valueSizes = {
    small: 'text-2xl lg:text-3xl font-extrabold',
    medium: 'text-3xl lg:text-4xl font-extrabold', 
    large: 'text-4xl lg:text-5xl font-black'
  };

  const changeColors = {
    positive: 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20',
    negative: 'text-red-400 bg-red-400/10 border border-red-400/20',
    neutral: 'text-gray-400 bg-gray-400/10 border border-gray-400/20'
  };

  const changeIcons = {
    positive: <TrendingUp className="w-3 h-3" />,
    negative: <TrendingDown className="w-3 h-3" />,
    neutral: <Activity className="w-3 h-3" />
  };

  const getTrendIndicator = () => {
    if (trend === undefined) return null;
    const isPositive = trend > 0;
    return (
      <motion.div
        className={cn(
          'absolute top-2 right-2 w-2 h-2 rounded-full',
          isPositive ? 'bg-emerald-400' : 'bg-red-400'
        )}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    );
  };

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden group cursor-pointer',
        'bg-gradient-to-br from-slate-800/60 to-slate-900/60',
        'backdrop-blur-xl border border-slate-700/30',
        'rounded-xl lg:rounded-2xl transition-all duration-300',
        'hover:border-slate-600/50 hover:shadow-2xl hover:shadow-blue-500/10',
        'shadow-xl',
        sizeClasses[size]
      )}
      whileHover={{ y: -3, scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100"
        transition={{ duration: 0.3 }}
      />
      
      {/* Top border glow effect */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Trend Indicator */}
      {getTrendIndicator()}
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {/* Title with info icon */}
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-slate-400 text-sm font-medium tracking-wide">
                {title}
              </h3>
              {interactive && (
                <motion.div
                  animate={{ opacity: isHovered ? 1 : 0.5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Info className="w-3 h-3 text-slate-500" />
                </motion.div>
              )}
            </div>
            
            {/* Main Value with animation */}
            <motion.div 
              className={cn(
                'text-white font-mono mb-2',
                valueSizes[size]
              )}
              animate={{ 
                scale: isHovered ? 1.05 : 1,
                color: isHovered ? '#60a5fa' : '#ffffff'
              }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              {typeof value === 'number' ? value.toLocaleString() : value}
            </motion.div>

            {/* Subtitle */}
            {subtitle && (
              <p className="text-slate-500 text-xs mb-3">
                {subtitle}
              </p>
            )}

            {/* Change Indicator with enhanced styling */}
            {change && (
              <motion.div 
                className={cn(
                  'inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-semibold',
                  changeColors[changeType]
                )}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                {changeIcons[changeType]}
                <span className="ml-1.5">{change}</span>
              </motion.div>
            )}
          </div>

          {/* Icon with enhanced animations */}
          <motion.div 
            className={cn(
              'p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10',
              iconColor
            )}
            whileHover={{ scale: 1.1, rotate: 10 }}
            whileTap={{ scale: 0.95 }}
            animate={{ 
              backgroundColor: isHovered ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)'
            }}
          >
            <Icon className="w-6 h-6" />
          </motion.div>
        </div>

        {/* Sparkline Chart */}
        {sparklineData && sparklineData.length > 0 && (
          <motion.div
            className="h-16 mt-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ 
              opacity: isHovered ? 1 : 0.7, 
              height: isHovered ? 64 : 48 
            }}
            transition={{ duration: 0.3 }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData}>
                <defs>
                  <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={changeType === 'positive' ? '#10b981' : '#ef4444'} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={changeType === 'positive' ? '#10b981' : '#ef4444'} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={changeType === 'positive' ? '#10b981' : '#ef4444'}
                  strokeWidth={2}
                  fill={`url(#gradient-${title})`}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

const EnhancedKPIDashboard: React.FC<EnhancedKPIDashboardProps> = ({
  stats,
  trades = [],
  onAddTrade,
  onImportCSV,
  onExportData,
  className
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL'>('1M');

  // Safely handle stats with default values
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

  // Generate sparkline data from trades
  const generateSparklineData = useMemo(() => {
    if (!trades || trades.length === 0) return [];
    
    const last30Days = trades
      .slice(-30)
      .map((trade, index) => ({
        date: trade.trade_date,
        value: (trade.side === 'BUY' ? -1 : 1) * trade.price * trade.quantity - trade.commission,
        index
      }));

    // Create cumulative P&L for sparkline
    let cumulative = 0;
    return last30Days.map(item => {
      cumulative += item.value;
      return { value: cumulative, date: item.date };
    });
  }, [trades]);

  // Calculate additional metrics
  const profitFactor = safeStats.avg_loss !== 0 ? safeStats.avg_win / Math.abs(safeStats.avg_loss) : 0;
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
      iconColor: safeStats.total_pnl >= 0 ? 'text-emerald-400' : 'text-red-400',
      sparklineData: generateSparklineData,
      interactive: true,
      trend: safeStats.total_pnl
    },
    {
      title: 'Total Trades',
      value: safeStats.total_trades,
      subtitle: 'Completed positions',
      icon: BarChart3,
      iconColor: 'text-blue-400',
      interactive: true
    },
    {
      title: 'Win Rate',
      value: `${safeStats.win_rate.toFixed(1)}%`,
      subtitle: 'Success percentage',
      change: safeStats.win_rate >= 60 ? 'Strong' : safeStats.win_rate >= 40 ? 'Moderate' : 'Needs Work',
      changeType: safeStats.win_rate >= 60 ? 'positive' : safeStats.win_rate >= 40 ? 'neutral' : 'negative' as 'positive' | 'negative' | 'neutral',
      icon: Target,
      iconColor: safeStats.win_rate >= 60 ? 'text-emerald-400' : 'text-yellow-400',
      interactive: true,
      trend: safeStats.win_rate - 50
    },
    {
      title: 'Best Trade',
      value: `$${safeStats.best_trade.toFixed(2)}`,
      subtitle: 'Top performer',
      icon: TrendingUp,
      iconColor: 'text-emerald-400',
      interactive: true
    }
  ];

  const advancedMetrics = [
    {
      title: 'Profit Factor',
      value: profitFactor.toFixed(2),
      subtitle: 'Gross profit / Gross loss',
      change: profitFactor >= 2 ? 'Excellent' : profitFactor >= 1.5 ? 'Good' : profitFactor >= 1 ? 'Fair' : 'Poor',
      changeType: profitFactor >= 2 ? 'positive' : profitFactor >= 1.5 ? 'neutral' : 'negative' as 'positive' | 'negative' | 'neutral',
      icon: Zap,
      iconColor: 'text-purple-400',
      interactive: true,
      trend: profitFactor - 1.5
    },
    {
      title: 'Sharpe Ratio',
      value: safeStats.sharpe_ratio.toFixed(2),
      subtitle: 'Risk-adjusted return',
      change: safeStats.sharpe_ratio >= 1.5 ? 'Excellent' : safeStats.sharpe_ratio >= 1 ? 'Good' : 'Poor',
      changeType: safeStats.sharpe_ratio >= 1.5 ? 'positive' : safeStats.sharpe_ratio >= 1 ? 'neutral' : 'negative' as 'positive' | 'negative' | 'neutral',
      icon: TrendingUp,
      iconColor: 'text-emerald-400',
      interactive: true,
      trend: safeStats.sharpe_ratio - 1
    },
    {
      title: 'Max Drawdown',
      value: `${safeStats.max_drawdown.toFixed(1)}%`,
      subtitle: 'Largest decline',
      changeType: 'negative' as 'negative',
      icon: TrendingDown,
      iconColor: 'text-red-400',
      interactive: true,
      trend: -safeStats.max_drawdown
    },
    {
      title: 'Avg Win/Loss',
      value: safeStats.avg_loss !== 0 ? `${(safeStats.avg_win / Math.abs(safeStats.avg_loss)).toFixed(1)}:1` : 'N/A',
      subtitle: 'Win/Loss ratio',
      icon: Activity,
      iconColor: 'text-blue-400',
      interactive: true
    }
  ];

  const timeframes = [
    { key: '1D', label: '1D' },
    { key: '1W', label: '1W' },
    { key: '1M', label: '1M' },
    { key: '3M', label: '3M' },
    { key: '1Y', label: '1Y' },
    { key: 'ALL', label: 'ALL' }
  ];

  return (
    <div className={cn("space-y-8 p-6 lg:p-8", className)}>
      {/* Enhanced Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <motion.h1 
              className="text-5xl font-extrabold text-white mb-3 tracking-tight"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              Trading Dashboard
            </motion.h1>
            <motion.p 
              className="text-lg text-slate-300 font-medium"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Professional insights and analytics for your trading performance
            </motion.p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Timeframe Selector */}
            <div className="flex items-center gap-1 p-1 bg-slate-800/50 backdrop-blur-xl border border-slate-700/30 rounded-lg">
              {timeframes.map((tf) => (
                <button
                  key={tf.key}
                  onClick={() => setTimeframe(tf.key as any)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200',
                    timeframe === tf.key
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  )}
                >
                  {tf.label}
                </button>
              ))}
            </div>

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
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <MetricCard
                {...metric}
                size="medium"
              />
            </motion.div>
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
            transition={{ duration: 0.4 }}
            className="overflow-hidden"
          >
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                Advanced Analytics
              </h2>
              <p className="text-slate-400 text-sm">
                Deep dive into your trading performance metrics and risk analysis
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {advancedMetrics.map((metric, index) => (
                <motion.div
                  key={metric.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <MetricCard
                    {...metric}
                    size="medium"
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedKPIDashboard;
export type { EnhancedKPIDashboardProps };