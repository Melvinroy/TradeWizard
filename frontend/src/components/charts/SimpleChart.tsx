import React from 'react';

interface Trade {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  trade_date: string;
  commission: number;
}

interface SimpleChartProps {
  trades: Trade[];
}

const SimpleChart: React.FC<SimpleChartProps> = ({ trades }) => {
  if (trades.length === 0) {
    return (
      <div style={{ width: '100%', height: '300px', padding: '20px', backgroundColor: '#1f2937', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#9ca3af' }}>
          <div style={{ fontSize: '16px', marginBottom: '8px' }}>P&L Chart</div>
          <div style={{ fontSize: '14px' }}>No trades available</div>
        </div>
      </div>
    );
  }

  const chartData = trades
    .sort((a, b) => new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime())
    .reduce((acc, trade, index) => {
      const tradeValue = Number(trade.price) * Number(trade.quantity);
      const pnl = trade.side === 'BUY' ? -tradeValue : tradeValue;
      const runningTotal = index === 0 ? pnl : acc[index - 1].total + pnl;
      
      acc.push({
        date: new Date(trade.trade_date).toLocaleDateString(),
        total: runningTotal,
        trade: `${trade.side} ${trade.quantity} ${trade.symbol}`
      });
      return acc;
    }, [] as any[]);

  const maxValue = Math.max(...chartData.map((d: any) => d.total), 0);
  const minValue = Math.min(...chartData.map((d: any) => d.total), 0);
  const range = maxValue - minValue || 1;

  return (
    <div style={{ width: '100%', height: '400px', padding: '20px', backgroundColor: '#1f2937', borderRadius: '12px' }}>
      <h3 style={{ color: 'white', marginBottom: '20px', fontSize: '18px', fontWeight: 'bold' }}>
        P&L Over Time
      </h3>
      <div style={{ position: 'relative', width: '100%', height: '300px', backgroundColor: '#374151', borderRadius: '8px', padding: '10px' }}>
        <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(percent => (
            <line
              key={percent}
              x1="0"
              y1={`${percent}%`}
              x2="100%"
              y2={`${percent}%`}
              stroke="#4b5563"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
          ))}
          
          {/* Chart line */}
          {chartData.length > 1 && (
            <polyline
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              points={chartData.map((point: any, index: number) => {
                const x = (index / (chartData.length - 1)) * 100;
                const y = 100 - ((point.total - minValue) / range) * 100;
                return `${x},${y}`;
              }).join(' ')}
            />
          )}
          
          {/* Data points */}
          {chartData.map((point: any, index: number) => {
            const x = (index / (chartData.length - 1)) * 100;
            const y = 100 - ((point.total - minValue) / range) * 100;
            return (
              <circle
                key={index}
                cx={`${x}%`}
                cy={`${y}%`}
                r="4"
                fill={point.total >= 0 ? '#10b981' : '#ef4444'}
                stroke="white"
                strokeWidth="2"
              />
            );
          })}
        </svg>
        
        {/* Y-axis labels */}
        <div style={{ position: 'absolute', left: '-60px', top: '0', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '12px', color: '#9ca3af' }}>
          <span>${maxValue.toFixed(0)}</span>
          <span>${(minValue + range * 0.75).toFixed(0)}</span>
          <span>${(minValue + range * 0.5).toFixed(0)}</span>
          <span>${(minValue + range * 0.25).toFixed(0)}</span>
          <span>${minValue.toFixed(0)}</span>
        </div>
      </div>
      
      {/* Summary */}
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#d1d5db' }}>
        <span>Total Trades: {trades.length}</span>
        <span>Final P&L: <span style={{ color: chartData[chartData.length - 1]?.total >= 0 ? '#10b981' : '#ef4444' }}>
          ${chartData[chartData.length - 1]?.total.toFixed(2) || '0.00'}
        </span></span>
      </div>
    </div>
  );
};

export default SimpleChart;