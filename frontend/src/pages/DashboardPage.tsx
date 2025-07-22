import { useAuth } from '../contexts/AuthContext';

const DashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back, {user?.email}</p>
        </div>
        <button 
          onClick={logout}
          className="btn btn-primary"
        >
          Logout
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-dark rounded-xl p-6">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Total P&L</h3>
          <p className="text-3xl font-bold text-white">$12,456</p>
          <p className="text-sm text-green-400 mt-1">+8.2%</p>
        </div>
        
        <div className="glass-dark rounded-xl p-6">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Total Trades</h3>
          <p className="text-3xl font-bold text-white">347</p>
          <p className="text-sm text-blue-400 mt-1">This month</p>
        </div>
        
        <div className="glass-dark rounded-xl p-6">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Win Rate</h3>
          <p className="text-3xl font-bold text-white">68.5%</p>
          <p className="text-sm text-green-400 mt-1">Above average</p>
        </div>
        
        <div className="glass-dark rounded-xl p-6">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Best Trade</h3>
          <p className="text-3xl font-bold text-white">$2,847</p>
          <p className="text-sm text-gray-400 mt-1">AAPL</p>
        </div>
      </div>

      {/* Recent Trades */}
      <div className="glass-dark rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Recent Trades</h2>
        <div className="space-y-3">
          {[
            { symbol: 'AAPL', side: 'BUY', quantity: 100, price: 150.25, pnl: 247 },
            { symbol: 'TSLA', side: 'SELL', quantity: 50, price: 220.80, pnl: -156 },
            { symbol: 'MSFT', side: 'BUY', quantity: 75, price: 310.45, pnl: 89 },
          ].map((trade, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${trade.side === 'BUY' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <div>
                  <p className="font-mono font-semibold text-white">{trade.symbol}</p>
                  <p className="text-sm text-gray-400">{trade.side} {trade.quantity} @ ${trade.price}</p>
                </div>
              </div>
              <div className={`text-right ${trade.pnl > 0 ? 'text-green-400' : 'text-red-400'}`}>
                <p className="font-semibold">${Math.abs(trade.pnl)}</p>
                <p className="text-sm">{trade.pnl > 0 ? '+' : '-'}{((Math.abs(trade.pnl) / (trade.quantity * trade.price)) * 100).toFixed(1)}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;