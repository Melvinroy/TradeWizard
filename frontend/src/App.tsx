import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/SimpleAuthContext';
import { extractFilesFromDragEvent, isValidCSVFile, hasFileInDragEvent, extractFilePathFromDragEvent } from './utils/dragDrop';

// Component imports
import SimpleChart from './components/charts/SimpleChart';
import PortfolioChart from './components/charts/PortfolioChart';
import TradeDetailsModal from './components/modals/TradeDetailsModal';
import AddTradeForm from './components/forms/AddTradeForm';

// Interfaces
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

interface DashboardStats {
  total_trades: number;
  total_pnl: number;
  win_rate: number;
  best_trade: number;
}

// Loading Screen Component
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-white text-xl">Loading TradeWizard...</div>
  </div>
);

// Auth Page Component
const AuthPage = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('demo@tradewizard.com');
  const [password, setPassword] = useState('demo123');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await login(email, password);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-dark p-8 w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">TradeWizard</h1>
          <p className="text-gray-400">Professional Trading Journal</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Welcome Back</h2>
            <p className="text-gray-400 mb-6">Sign in to your account</p>
          </div>
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-400">
              <strong>Demo credentials:</strong><br />
              Email: demo@tradewizard.com<br />
              Password: demo123
            </p>
          </div>
          <div>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary w-full"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Dashboard Page Component
const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddTradeModal, setShowAddTradeModal] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showChartModal, setShowChartModal] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [showTradeDetails, setShowTradeDetails] = useState(false);
  const [sortField, setSortField] = useState<string>('trade_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterSide, setFilterSide] = useState<'all' | 'BUY' | 'SELL'>('all');
  const [filterSymbol, setFilterSymbol] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsResponse, tradesResponse] = await Promise.all([
          fetch('http://localhost:8002/api/v1/dashboard/stats', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
          }),
          fetch('http://localhost:8002/api/v1/trades-simple', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
          })
        ]);
        
        const stats = statsResponse.ok ? await statsResponse.json() : {
          total_trades: 0, total_pnl: 0, win_rate: 0, best_trade: 0
        };
        const tradesData = tradesResponse.ok ? await tradesResponse.json() : [];
        
        setDashboardStats(stats);
        setTrades(tradesData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // CSV Upload Handler
  const handleCSVUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      toast.success('Uploading CSV...');
      
      const response = await fetch('http://localhost:8002/api/v1/import/csv?account_id=138d99da-91c5-4b61-9ae9-8a4d5a906b9b', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Successfully imported ${result.imported_count || 'some'} trades!`);
        window.location.reload();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Import failed');
      }
    } catch (error) {
      console.error('CSV upload error:', error);
      toast.error('Failed to upload CSV file');
    }
  };

  const handleTradeAdded = () => {
    setShowAddTradeModal(false);
    window.location.reload();
  };

  // Drag and Drop Handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasFileInDragEvent(e)) {
      setIsDragOver(true);
      e.dataTransfer.dropEffect = 'copy';
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x <= rect.left || x >= rect.right || y <= rect.top || y >= rect.bottom) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = extractFilesFromDragEvent(e);
    
    if (files.length === 0) {
      const filePath = extractFilePathFromDragEvent(e);
      if (filePath) {
        const fileName = filePath.toLowerCase();
        if (fileName.endsWith('.csv') || fileName.endsWith('.txt')) {
          toast.error(
            'Files dragged from VS Code cannot be directly uploaded. Please use the "Browse Files" button instead.',
            { duration: 6000 }
          );
          return;
        }
      }
      toast.error('No files detected. Please use the "Browse Files" button.');
      return;
    }
    
    const file = files[0];
    if (isValidCSVFile(file)) {
      handleCSVUpload(file);
    } else {
      toast.error(`Please upload a CSV file. Selected file: ${file.name}`);
    }
  };

  // Export Functions
  const exportToCSV = () => {
    if (trades.length === 0) {
      toast.error('No trades to export');
      return;
    }

    const headers = ['Symbol', 'Side', 'Quantity', 'Price', 'Trade Date', 'Total Value', 'Commission', 'Currency'];
    const csvData = trades.map(trade => [
      trade.symbol,
      trade.side,
      trade.quantity,
      Number(trade.price).toFixed(2),
      new Date(trade.trade_date).toLocaleString(),
      (Number(trade.price) * Number(trade.quantity)).toFixed(2),
      Number(trade.commission || 0).toFixed(2),
      trade.currency || 'USD'
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `tradewizard_trades_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Exported ${trades.length} trades to CSV`);
  };

  // Table Helper Functions
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  const getFilteredAndSortedTrades = () => {
    let filtered = trades.filter(trade => {
      const matchesSearch = trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           trade.side.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSide = filterSide === 'all' || trade.side === filterSide;
      const matchesSymbol = filterSymbol === 'all' || trade.symbol === filterSymbol;
      
      return matchesSearch && matchesSide && matchesSymbol;
    });

    filtered.sort((a, b) => {
      let aValue = a[sortField as keyof Trade];
      let bValue = b[sortField as keyof Trade];

      if (sortField === 'trade_date') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      } else if (sortField === 'price' || sortField === 'quantity') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  const filteredTrades = getFilteredAndSortedTrades();
  const totalPages = Math.ceil(filteredTrades.length / itemsPerPage);
  const paginatedTrades = filteredTrades.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const uniqueSymbols = [...new Set(trades.map(trade => trade.symbol))].sort();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold gradient-text">TradeWizard Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back, {user?.email}</p>
        </div>
        <button onClick={logout} className="btn btn-primary">
          Logout
        </button>
      </div>

      {/* CSV Import Section */}
      <div 
        className={`glass-dark p-4 mb-6 transition-all duration-200 ${
          isDragOver ? 'ring-2 ring-blue-400 ring-opacity-50' : ''
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-white">📄 Import IBKR CSV</h2>
          <div 
            className={`inline-flex items-center gap-2 border border-dashed rounded-lg px-4 py-2 cursor-pointer transition-all duration-200 ${
              isDragOver 
                ? 'border-blue-400 bg-blue-500/10' 
                : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/30'
            }`}
            onClick={() => document.getElementById('csv-upload')?.click()}
          >
            <svg className={`w-4 h-4 transition-colors ${isDragOver ? 'text-blue-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className={`text-sm transition-colors ${isDragOver ? 'text-blue-300' : 'text-white'}`}>
              {isDragOver ? 'Drop here' : 'Upload CSV'}
            </span>
          </div>
        </div>
        <input
          id="csv-upload"
          type="file"
          accept=".csv"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleCSVUpload(file);
            }
          }}
          className="hidden"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-dark p-6">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Total P&L</h3>
          <p className="text-3xl font-bold text-white">
            ${dashboardStats ? Number(dashboardStats.total_pnl).toFixed(2) : '0.00'}
          </p>
          <p className="text-sm text-green-400 mt-1">Real data</p>
        </div>
        
        <div className="glass-dark p-6">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Total Trades</h3>
          <p className="text-3xl font-bold text-white">
            {dashboardStats?.total_trades || 0}
          </p>
          <p className="text-sm text-blue-400 mt-1">All time</p>
        </div>
        
        <div className="glass-dark p-6">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Win Rate</h3>
          <p className="text-3xl font-bold text-white">
            {dashboardStats && dashboardStats.win_rate ? dashboardStats.win_rate.toFixed(1) : '0.0'}%
          </p>
          <p className="text-sm text-green-400 mt-1">Success rate</p>
        </div>
        
        <div className="glass-dark p-6">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Best Trade</h3>
          <p className="text-3xl font-bold text-white">
            ${dashboardStats ? Number(dashboardStats.best_trade).toFixed(2) : '0.00'}
          </p>
          <p className="text-sm text-gray-400 mt-1">Top performer</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="glass-dark p-4 mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-white">Performance Analytics</h2>
          <button
            onClick={() => setShowChartModal(true)}
            className="px-3 py-1 text-sm bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            View Charts
          </button>
        </div>
        {trades.length >= 1 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div style={{ height: '300px' }}>
              <SimpleChart trades={trades} />
            </div>
            <div style={{ height: '300px' }}>
              <PortfolioChart trades={trades} />
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400 py-6">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-base font-medium mb-1">Charts Available Soon</p>
            <p className="text-sm">Upload trades to see analytics</p>
          </div>
        )}
      </div>

      {/* Trade History Section */}
      <div className="glass-dark p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Trade History ({filteredTrades.length} of {trades.length})</h2>
          <div className="flex gap-3">
            <button
              onClick={exportToCSV}
              className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>
            <button
              onClick={() => setShowAddTradeModal(true)}
              className="btn btn-primary"
            >
              + Add Trade
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <input
            type="text"
            placeholder="Search trades..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filterSide}
            onChange={(e) => {
              setFilterSide(e.target.value as 'all' | 'BUY' | 'SELL');
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Sides</option>
            <option value="BUY">BUY Only</option>
            <option value="SELL">SELL Only</option>
          </select>
          <select
            value={filterSymbol}
            onChange={(e) => {
              setFilterSymbol(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Symbols</option>
            {uniqueSymbols.map(symbol => (
              <option key={symbol} value={symbol}>{symbol}</option>
            ))}
          </select>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterSide('all');
              setFilterSymbol('all');
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
          >
            Clear Filters
          </button>
        </div>

        {/* Trade Table */}
        {filteredTrades.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-white">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th 
                      className="px-4 py-3 text-left cursor-pointer hover:bg-gray-700/50 transition-colors"
                      onClick={() => handleSort('symbol')}
                    >
                      <div className="flex items-center gap-2">
                        Symbol
                        {sortField === 'symbol' && (
                          <span className="text-blue-400">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left cursor-pointer hover:bg-gray-700/50 transition-colors"
                      onClick={() => handleSort('side')}
                    >
                      <div className="flex items-center gap-2">
                        Side
                        {sortField === 'side' && (
                          <span className="text-blue-400">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-right cursor-pointer hover:bg-gray-700/50 transition-colors"
                      onClick={() => handleSort('quantity')}
                    >
                      <div className="flex items-center justify-end gap-2">
                        Quantity
                        {sortField === 'quantity' && (
                          <span className="text-blue-400">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-right cursor-pointer hover:bg-gray-700/50 transition-colors"
                      onClick={() => handleSort('price')}
                    >
                      <div className="flex items-center justify-end gap-2">
                        Price
                        {sortField === 'price' && (
                          <span className="text-blue-400">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-right cursor-pointer hover:bg-gray-700/50 transition-colors"
                      onClick={() => handleSort('trade_date')}
                    >
                      <div className="flex items-center justify-end gap-2">
                        Date
                        {sortField === 'trade_date' && (
                          <span className="text-blue-400">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-right">Total Value</th>
                    <th className="px-4 py-3 text-center">Tags</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTrades.map((trade: Trade, index: number) => (
                    <tr 
                      key={trade.id}
                      className={`border-t border-gray-700 hover:bg-gray-800/30 cursor-pointer transition-colors ${
                        index % 2 === 0 ? 'bg-gray-800/10' : 'bg-gray-800/20'
                      }`}
                      onClick={() => {
                        setSelectedTrade(trade);
                        setShowTradeDetails(true);
                      }}
                    >
                      <td className="px-4 py-3 font-mono font-semibold">{trade.symbol}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          trade.side === 'BUY' ? 'bg-green-600/20 text-green-300' : 'bg-red-600/20 text-red-300'
                        }`}>
                          {trade.side}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono">{Number(trade.quantity).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-mono">${Number(trade.price).toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-sm text-gray-300">
                        {new Date(trade.trade_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold">
                        ${(Number(trade.price) * Number(trade.quantity)).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {trade.tags ? (
                          <div className="flex justify-center gap-1">
                            {trade.tags.split(',').slice(0, 2).map((tag: string, tagIndex: number) => (
                              <span 
                                key={tagIndex}
                                className="px-2 py-1 text-xs bg-blue-600/20 text-blue-300 rounded-full"
                              >
                                {tag.trim()}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500 text-xs">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-400">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredTrades.length)} of {filteredTrades.length} trades
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg transition-colors"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-2 bg-gray-800 text-white rounded-lg">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-gray-400 py-8">
            No trades found. Upload a CSV file to get started.
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddTradeModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Add New Trade</h3>
              <button
                onClick={() => setShowAddTradeModal(false)}
                className="text-gray-400 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <AddTradeForm 
              onClose={() => setShowAddTradeModal(false)}
              onTradeAdded={handleTradeAdded}
            />
          </div>
        </div>
      )}

      {showChartModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-white">Trading Performance Analytics</h3>
              <button
                onClick={() => setShowChartModal(false)}
                className="text-gray-400 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-1 gap-6">
              <SimpleChart trades={trades} />
              <PortfolioChart trades={trades} />
            </div>
          </div>
        </div>
      )}

      {showTradeDetails && selectedTrade && (
        <TradeDetailsModal 
          trade={selectedTrade} 
          onClose={() => {
            setShowTradeDetails(false);
            setSelectedTrade(null);
          }}
          onUpdate={() => {
            setShowTradeDetails(false);
            setSelectedTrade(null);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

// Route Components
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return isAuthenticated ? <Navigate to="/dashboard" /> : <>{children}</>;
};

// Main App Component
function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            <Route 
              path="/auth" 
              element={
                <PublicRoute>
                  <AuthPage />
                </PublicRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
          
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(30, 41, 59, 0.95)',
                color: '#f8fafc',
                border: '1px solid rgba(51, 65, 85, 0.5)',
                borderRadius: '12px',
              },
            }}
          />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;