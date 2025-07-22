import React from 'react';

interface Trade {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  trade_date: string;
}

interface PortfolioChartProps {
  trades: Trade[];
}

const PortfolioChart: React.FC<PortfolioChartProps> = ({ trades }) => {
  const portfolioData = trades.reduce((acc, trade) => {
    const symbol = trade.symbol;
    const value = Number(trade.price) * Number(trade.quantity);
    
    if (!acc[symbol]) {
      acc[symbol] = { symbol, totalValue: 0, tradeCount: 0 };
    }
    
    acc[symbol].totalValue += value;
    acc[symbol].tradeCount += 1;
    return acc;
  }, {} as Record<string, { symbol: string, totalValue: number, tradeCount: number }>);

  const chartData = Object.values(portfolioData)
    .sort((a: any, b: any) => b.totalValue - a.totalValue)
    .slice(0, 6); // Top 6 symbols for better layout

  const totalValue = chartData.reduce((sum: number, item: any) => sum + item.totalValue, 0);
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  if (chartData.length === 0) {
    return (
      <div style={{ width: '100%', height: '400px', padding: '20px', backgroundColor: '#1f2937', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#9ca3af' }}>
          <div style={{ fontSize: '16px', marginBottom: '8px' }}>Portfolio Breakdown</div>
          <div style={{ fontSize: '14px' }}>No trades available</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '400px', padding: '20px', backgroundColor: '#1f2937', borderRadius: '12px' }}>
      <h3 style={{ color: 'white', marginBottom: '20px', fontSize: '18px', fontWeight: 'bold' }}>
        Portfolio Breakdown
      </h3>
      
      <div style={{ display: 'flex', gap: '28px', alignItems: 'center', height: '300px' }}>
        {/* Donut Chart */}
        <div style={{ position: 'relative', width: '200px', height: '200px', flexShrink: 0 }}>
          <svg width="200" height="200" viewBox="0 0 200 200">
            <g transform="translate(100,100)">
              {chartData.map((item: any, index: number) => {
                const percentage = item.totalValue / totalValue;
                const startAngle = chartData.slice(0, index).reduce((sum: number, prev: any) => sum + (prev.totalValue / totalValue) * 2 * Math.PI, 0);
                const endAngle = startAngle + percentage * 2 * Math.PI;
                
                const x1 = Math.cos(startAngle) * 42;
                const y1 = Math.sin(startAngle) * 42;
                const x2 = Math.cos(endAngle) * 42;
                const y2 = Math.sin(endAngle) * 42;
                
                const largeArcFlag = percentage > 0.5 ? 1 : 0;
                
                return (
                  <path
                    key={item.symbol}
                    d={`M 0 0 L ${x1} ${y1} A 42 42 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                    fill={colors[index]}
                    opacity="0.85"
                  />
                );
              })}
              {/* Inner circle */}
              <circle cx="0" cy="0" r="24" fill="#1f2937" />
            </g>
          </svg>
          
          {/* Center text */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: 'white'
          }}>
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>Total Value</div>
            <div style={{ fontSize: '15px', fontWeight: 'bold' }}>
              ${(totalValue / 1000).toFixed(0)}K
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div style={{ flex: 1, maxWidth: '220px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {chartData.map((item: any, index: number) => {
              const percentage = ((item.totalValue / totalValue) * 100).toFixed(1);
              return (
                <div key={item.symbol} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
                  <div 
                    style={{ 
                      width: '10px', 
                      height: '10px', 
                      backgroundColor: colors[index], 
                      borderRadius: '50%',
                      flexShrink: 0
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: 'white', fontSize: '13px', fontWeight: '600', marginBottom: '2px' }}>
                      {item.symbol}
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: '11px' }}>
                      {percentage}% • {item.tradeCount} trades
                    </div>
                  </div>
                  <div style={{ color: '#d1d5db', fontSize: '12px', fontWeight: '500', flexShrink: 0 }}>
                    ${(item.totalValue / 1000).toFixed(1)}K
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioChart;