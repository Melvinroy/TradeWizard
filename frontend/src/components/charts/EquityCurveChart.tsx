import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp,
  TrendingDown,
  Calendar,
  Maximize2,
  Download,
  Settings
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
  currency?: string;
  tags?: string;
  notes?: string;
}

interface EquityCurveChartProps {
  trades: Trade[];
  timeframe?: '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';
  showBenchmark?: boolean;
  showDrawdowns?: boolean;
  showVolume?: boolean;
  height?: number;
  className?: string;
}

interface DataPoint {
  date: string;
  equity: number;
  dailyPnL: number;
  drawdown: number;
  tradeCount: number;
}

const EquityCurveChart: React.FC<EquityCurveChartProps> = ({
  trades,
  timeframe = 'ALL',
  showBenchmark = false,
  showDrawdowns = true,
  showVolume = false,
  height = 400,
  className
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);

  // Process trades into equity curve data
  const equityData = useMemo(() => {
    if (!trades || trades.length === 0) return [];

    // Sort trades by date
    const sortedTrades = [...trades].sort((a, b) => 
      new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime()
    );

    let runningEquity = 0;
    let maxEquity = 0;
    const dataPoints: DataPoint[] = [];
    
    // Group trades by date
    const tradesByDate = sortedTrades.reduce((acc, trade) => {
      const date = trade.trade_date.split('T')[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(trade);
      return acc;
    }, {} as Record<string, Trade[]>);

    // Create equity curve
    Object.entries(tradesByDate).forEach(([date, dayTrades]) => {
      const dailyPnL = dayTrades.reduce((sum, trade) => {
        const pnl = trade.side === 'BUY' 
          ? (trade.price * trade.quantity) - trade.commission
          : -(trade.price * trade.quantity) - trade.commission;
        return sum + pnl;
      }, 0);

      runningEquity += dailyPnL;
      maxEquity = Math.max(maxEquity, runningEquity);
      const drawdown = maxEquity > 0 ? ((maxEquity - runningEquity) / maxEquity) * 100 : 0;

      dataPoints.push({
        date,
        equity: runningEquity,
        dailyPnL,
        drawdown,
        tradeCount: dayTrades.length
      });
    });

    return dataPoints;
  }, [trades]);

  // Filter data by timeframe
  const filteredData = useMemo(() => {
    if (selectedTimeframe === 'ALL') return equityData;
    
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (selectedTimeframe) {
      case '1D':
        cutoffDate.setDate(now.getDate() - 1);
        break;
      case '1W':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '1M':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case '3M':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case '1Y':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return equityData.filter(point => new Date(point.date) >= cutoffDate);
  }, [equityData, selectedTimeframe]);

  // Calculate chart dimensions and scales
  const chartData = useMemo(() => {
    if (filteredData.length === 0) return null;

    const minEquity = Math.min(...filteredData.map(d => d.equity));
    const maxEquity = Math.max(...filteredData.map(d => d.equity));
    const maxDrawdown = Math.max(...filteredData.map(d => d.drawdown));
    
    const padding = Math.abs(maxEquity - minEquity) * 0.1;
    const yMin = minEquity - padding;
    const yMax = maxEquity + padding;
    
    return {
      data: filteredData,
      yMin,
      yMax,
      maxDrawdown,
      totalReturn: maxEquity - (filteredData[0]?.equity || 0),
      winningDays: filteredData.filter(d => d.dailyPnL > 0).length,
      losingDays: filteredData.filter(d => d.dailyPnL < 0).length
    };
  }, [filteredData]);

  const timeframeButtons = [
    { label: '1D', value: '1D' as const },
    { label: '1W', value: '1W' as const },
    { label: '1M', value: '1M' as const },
    { label: '3M', value: '3M' as const },
    { label: '1Y', value: '1Y' as const },
    { label: 'ALL', value: 'ALL' as const }
  ];

  if (!chartData) {
    return (
      <div className={cn(
        "flex items-center justify-center bg-gradient-to-br from-gray-800/90 to-gray-900/90",
        "backdrop-blur-sm border border-gray-700/50 rounded-2xl",
        className
      )} style={{ height }}>
        <div className="text-center text-gray-400">
          <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-600" />
          <h3 className="text-lg font-semibold mb-2">No Trading Data</h3>
          <p className="text-sm">Add trades to see your equity curve</p>
        </div>
      </div>
    );
  }

  // Generate SVG path for equity curve
  const generatePath = (data: DataPoint[], yMin: number, yMax: number) => {
    const width = 800; // SVG viewBox width
    const height = 300; // SVG viewBox height
    const padding = 40;
    
    const xScale = (width - padding * 2) / (data.length - 1);
    const yScale = (height - padding * 2) / (yMax - yMin);
    
    const points = data.map((point, index) => {
      const x = padding + index * xScale;
      const y = height - padding - (point.equity - yMin) * yScale;
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  };

  const equityPath = generatePath(chartData.data, chartData.yMin, chartData.yMax);
  const isPositive = chartData.totalReturn >= 0;

  return (
    <motion.div
      className={cn(
        "bg-gradient-to-br from-gray-800/90 to-gray-900/90",
        "backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            Equity Curve
          </h3>
          <div className="flex items-center gap-4 mt-2 text-sm">
            <span className={cn(
              "font-semibold",
              isPositive ? "text-profit-400" : "text-loss-400"
            )}>
              {isPositive ? '+' : ''}${chartData.totalReturn.toFixed(2)}
            </span>
            <span className="text-gray-400">
              {chartData.winningDays}W / {chartData.losingDays}L
            </span>
            <span className="text-gray-400">
              Max DD: {chartData.maxDrawdown.toFixed(1)}%
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Timeframe Selector */}
          <div className="flex items-center bg-gray-700/30 rounded-lg p-1">
            {timeframeButtons.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setSelectedTimeframe(value)}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded transition-all",
                  selectedTimeframe === value
                    ? "bg-blue-500 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-600/50"
                )}
              >
                {label}
              </button>
            ))}
          </div>
          
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Chart */}
      <div className="relative" style={{ height: height - 120 }}>
        <svg
          viewBox="0 0 800 300"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grid lines */}
          <defs>
            <pattern
              id="grid"
              width="40"
              height="30"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 30"
                fill="none"
                stroke="rgba(75, 85, 99, 0.2)"
                strokeWidth="1"
              />
            </pattern>
            
            {/* Gradient for area fill */}
            <linearGradient id="equityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop
                offset="0%"
                stopColor={isPositive ? "#10b981" : "#ef4444"}
                stopOpacity="0.3"
              />
              <stop
                offset="100%"
                stopColor={isPositive ? "#10b981" : "#ef4444"}
                stopOpacity="0.05"
              />
            </linearGradient>
          </defs>
          
          {/* Grid */}
          <rect width="800" height="300" fill="url(#grid)" />
          
          {/* Area fill */}
          <path
            d={`${equityPath} L 760,260 L 40,260 Z`}
            fill="url(#equityGradient)"
          />
          
          {/* Equity curve line */}
          <path
            d={equityPath}
            fill="none"
            stroke={isPositive ? "#10b981" : "#ef4444"}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Drawdown areas */}
          {showDrawdowns && chartData.data.map((point, index) => {
            if (point.drawdown <= 0) return null;
            
            const width = 800;
            const height = 300;
            const padding = 40;
            const xScale = (width - padding * 2) / (chartData.data.length - 1);
            const x = padding + index * xScale;
            const ddHeight = (point.drawdown / chartData.maxDrawdown) * 20;
            
            return (
              <rect
                key={`drawdown-${index}`}
                x={x - 1}
                y={40}
                width="2"
                height={ddHeight}
                fill="rgba(239, 68, 68, 0.4)"
              />
            );
          })}
          
          {/* Zero line */}
          {chartData.yMin < 0 && chartData.yMax > 0 && (
            <line
              x1="40"
              y1={260 - (-chartData.yMin / (chartData.yMax - chartData.yMin)) * 220}
              x2="760"
              y2={260 - (-chartData.yMin / (chartData.yMax - chartData.yMin)) * 220}
              stroke="rgba(156, 163, 175, 0.5)"
              strokeWidth="1"
              strokeDasharray="5,5"
            />
          )}
        </svg>

        {/* Hover tooltip */}
        {hoveredPoint && (
          <div className="absolute top-4 left-4 bg-gray-800/95 border border-gray-600 rounded-lg p-3 text-sm">
            <div className="text-white font-semibold">
              {new Date(hoveredPoint.date).toLocaleDateString()}
            </div>
            <div className="text-gray-300 mt-1">
              Equity: ${hoveredPoint.equity.toFixed(2)}
            </div>
            <div className={cn(
              "mt-1",
              hoveredPoint.dailyPnL >= 0 ? "text-profit-400" : "text-loss-400"
            )}>
              Daily P&L: {hoveredPoint.dailyPnL >= 0 ? '+' : ''}${hoveredPoint.dailyPnL.toFixed(2)}
            </div>
            <div className="text-gray-400 mt-1">
              Trades: {hoveredPoint.tradeCount}
            </div>
          </div>
        )}
      </div>

      {/* Chart Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-3 h-0.5 rounded",
            isPositive ? "bg-profit-400" : "bg-loss-400"
          )} />
          <span>Equity Curve</span>
        </div>
        {showDrawdowns && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 rounded bg-loss-400/60" />
            <span>Drawdowns</span>
          </div>
        )}
        {showBenchmark && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 rounded bg-gray-400" />
            <span>S&P 500</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default EquityCurveChart;
export type { EquityCurveChartProps };