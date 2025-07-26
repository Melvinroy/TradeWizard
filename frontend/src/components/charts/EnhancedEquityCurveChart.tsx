import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Settings,
  Maximize2,
  BarChart3,
  Activity,
  Info
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';

interface Trade {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  trade_date: string;
  commission: number;
}

interface EnhancedEquityCurveChartProps {
  trades: Trade[];
  height?: number;
  showDrawdowns?: boolean;
  showVolume?: boolean;
  timeframe?: '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';
  className?: string;
}

interface ChartDataPoint {
  date: string;
  equity: number;
  drawdown: number;
  volume: number;
  dailyPnL: number;
  winRate: number;
  formattedDate: string;
  tradeCount: number;
}

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-lg p-4 shadow-2xl"
      >
        <p className="text-slate-300 text-sm font-medium mb-2">{data.formattedDate}</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400 text-xs">Equity:</span>
            <span className="text-white font-mono font-bold">
              ${data.equity?.toFixed(2) || '0.00'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400 text-xs">Daily P&L:</span>
            <span className={cn(
              "font-mono font-bold text-xs",
              (data.dailyPnL || 0) >= 0 ? "text-emerald-400" : "text-red-400"
            )}>
              ${data.dailyPnL?.toFixed(2) || '0.00'}
            </span>
          </div>
          {data.drawdown && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400 text-xs">Drawdown:</span> 
              <span className="text-red-400 font-mono font-bold text-xs">
                -{data.drawdown.toFixed(1)}%
              </span>
            </div>
          )}
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400 text-xs">Trades:</span>
            <span className="text-blue-400 font-mono font-bold text-xs">
              {data.tradeCount || 0}
            </span>
          </div>
        </div>
      </motion.div>
    );
  }
  return null;
};

// Chart Settings Modal
const ChartSettingsModal = ({ 
  isOpen, 
  onClose, 
  settings, 
  onSettingsChange 
}: {
  isOpen: boolean;
  onClose: () => void;
  settings: any;
  onSettingsChange: (settings: any) => void;
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Chart Settings</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-slate-300 text-sm">Show Drawdowns</label>
            <input
              type="checkbox"
              checked={settings.showDrawdowns}
              onChange={(e) => onSettingsChange({ ...settings, showDrawdowns: e.target.checked })}
              className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <label className="text-slate-300 text-sm">Show Volume</label>
            <input
              type="checkbox"
              checked={settings.showVolume}
              onChange={(e) => onSettingsChange({ ...settings, showVolume: e.target.checked })}
              className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-slate-300 text-sm">Smooth Line</label>
            <input
              type="checkbox"
              checked={settings.smooth}
              onChange={(e) => onSettingsChange({ ...settings, smooth: e.target.checked })}
              className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
            />
          </div>
        </div>

        <Button
          onClick={onClose}
          className="w-full mt-6"
          variant="primary"
        >
          Apply Changes
        </Button>
      </motion.div>
    </motion.div>
  );
};

const EnhancedEquityCurveChart: React.FC<EnhancedEquityCurveChartProps> = ({
  trades,
  height = 400,
  showDrawdowns = true,
  showVolume = false,
  timeframe = '1M',
  className
}) => {
  const [chartSettings, setChartSettings] = useState({
    showDrawdowns,
    showVolume,
    smooth: true
  });
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Process trades data for chart
  const chartData = useMemo((): ChartDataPoint[] => {
    if (!trades || trades.length === 0) {
      return [];
    }

    // Sort trades by date
    const sortedTrades = [...trades].sort((a, b) => 
      new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime()
    );

    let runningEquity = 0;
    let maxEquity = 0;
    const dataPoints: ChartDataPoint[] = [];
    
    // Group trades by date for better visualization
    const tradesByDate = sortedTrades.reduce((acc, trade) => {
      const date = new Date(trade.trade_date).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(trade);
      return acc;
    }, {} as Record<string, Trade[]>);

    Object.entries(tradesByDate).forEach(([dateStr, dayTrades]) => {
      const date = new Date(dateStr);
      let dailyPnL = 0;
      
      dayTrades.forEach(trade => {
        const tradePnL = (trade.side === 'SELL' ? 1 : -1) * trade.price * trade.quantity - trade.commission;
        dailyPnL += tradePnL;
      });

      runningEquity += dailyPnL;
      maxEquity = Math.max(maxEquity, runningEquity);
      
      const drawdown = maxEquity > 0 ? ((maxEquity - runningEquity) / maxEquity) * 100 : 0;

      dataPoints.push({
        date: date.toISOString().split('T')[0],
        equity: runningEquity,
        drawdown: drawdown,
        volume: dayTrades.length,
        dailyPnL: dailyPnL,
        winRate: dailyPnL > 0 ? 100 : 0,
        formattedDate: date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
        }),
        tradeCount: dayTrades.length
      });
    });

    return dataPoints;
  }, [trades]);

  // Calculate key metrics
  const metrics = useMemo(() => {
    if (chartData.length === 0) return null;
    
    const finalEquity = chartData[chartData.length - 1]?.equity || 0;
    const maxDrawdown = Math.max(...chartData.map(d => d.drawdown));
    const totalTrades = chartData.reduce((sum, d) => sum + d.tradeCount, 0);
    const profitableDays = chartData.filter(d => d.dailyPnL > 0).length;
    const winRate = chartData.length > 0 ? (profitableDays / chartData.length) * 100 : 0;

    return {
      totalReturn: finalEquity,
      maxDrawdown: maxDrawdown,
      totalTrades: totalTrades,
      winRate: winRate,
      totalDays: chartData.length
    };
  }, [chartData]);

  if (!trades || trades.length === 0) {
    return (
      <div className={cn(
        "flex items-center justify-center p-8 text-center",
        "bg-gradient-to-br from-slate-800/40 to-slate-900/40",
        "backdrop-blur-xl border border-slate-700/30 rounded-xl",
        className
      )}>
        <div>
          <BarChart3 className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-300 mb-2">No Trading Data</h3>
          <p className="text-slate-500 text-sm">
            Import your trades or add manual entries to see your equity curve
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        className={cn(
          "relative overflow-hidden",
          "bg-gradient-to-br from-slate-800/40 to-slate-900/40",
          "backdrop-blur-xl border border-slate-700/30",
          "rounded-xl lg:rounded-2xl shadow-2xl",
          "hover:border-slate-600/50 transition-all duration-300",
          className
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ height: isFullscreen ? '80vh' : height }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Equity Curve</h3>
              <p className="text-slate-400 text-sm">Portfolio performance over time</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Performance Indicator */}
            {metrics && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 rounded-lg">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  metrics.totalReturn >= 0 ? "bg-emerald-400" : "bg-red-400"
                )}>
                  <div className={cn(
                    "w-2 h-2 rounded-full animate-ping",
                    metrics.totalReturn >= 0 ? "bg-emerald-400" : "bg-red-400"
                  )} />
                </div>
                <span className="text-xs font-medium text-slate-300">
                  {metrics.totalReturn >= 0 ? 'Profitable' : 'Loss'}
                </span>
              </div>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="p-2"
            >
              <Settings className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Chart */}
        <div className="p-6" style={{ height: isFullscreen ? 'calc(80vh - 120px)' : height - 120 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#334155" 
                opacity={0.3}
                horizontal={true}
                vertical={false}
              />
              
              <XAxis
                dataKey="formattedDate"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                interval="preserveStartEnd"
              />
              
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              {/* Zero line */}
              <ReferenceLine y={0} stroke="#64748b" strokeDasharray="2 2" opacity={0.5} />
              
              {/* Equity Area */}
              <Area
                type={chartSettings.smooth ? "monotone" : "linear"}
                dataKey="equity"
                stroke="#3b82f6"
                strokeWidth={3}
                fill="url(#equityGradient)"
                dot={false}
                activeDot={{ 
                  r: 6, 
                  fill: '#3b82f6', 
                  stroke: '#1e293b', 
                  strokeWidth: 2 
                }}
              />
              
              {/* Drawdown Area */}
              {chartSettings.showDrawdowns && (
                <Area
                  type={chartSettings.smooth ? "monotone" : "linear"}
                  dataKey="drawdown"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fill="url(#drawdownGradient)"
                  dot={false}
                  opacity={0.7}
                />
              )}
              
              <Legend 
                content={({ payload }) => (
                  <div className="flex items-center justify-center gap-6 mt-4">
                    {payload?.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-sm text-slate-300">
                          {entry.dataKey === 'equity' ? 'Portfolio Value' : 'Drawdown %'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Stats */}
        {metrics && (
          <div className="px-6 pb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className={cn(
                  "text-lg font-bold font-mono",
                  metrics.totalReturn >= 0 ? "text-emerald-400" : "text-red-400"
                )}>
                  ${metrics.totalReturn.toFixed(2)}
                </div>
                <div className="text-xs text-slate-500">Total Return</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-bold font-mono text-red-400">
                  {metrics.maxDrawdown.toFixed(1)}%
                </div>
                <div className="text-xs text-slate-500">Max Drawdown</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-bold font-mono text-blue-400">
                  {metrics.totalTrades}
                </div>
                <div className="text-xs text-slate-500">Total Trades</div>
              </div>
              
              <div className="text-center">
                <div className={cn(
                  "text-lg font-bold font-mono",
                  metrics.winRate >= 50 ? "text-emerald-400" : "text-yellow-400"
                )}>
                  {metrics.winRate.toFixed(1)}%
                </div>
                <div className="text-xs text-slate-500">Profitable Days</div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Settings Modal */}
      <AnimatePresence>
        <ChartSettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          settings={chartSettings}
          onSettingsChange={setChartSettings}
        />
      </AnimatePresence>
    </>
  );
};

export default EnhancedEquityCurveChart;
export type { EnhancedEquityCurveChartProps };