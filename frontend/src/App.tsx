import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/SimpleAuthContext';
import { extractFilesFromDragEvent, isValidCSVFile, hasFileInDragEvent, extractFilePathFromDragEvent } from './utils/dragDrop';

// Component imports
import SimpleChart from './components/charts/SimpleChart';
import PortfolioChart from './components/charts/PortfolioChart';
import EquityCurveChart from './components/charts/EquityCurveChart';
import EnhancedEquityCurveChart from './components/charts/EnhancedEquityCurveChart';
import TradeDetailsModal from './components/modals/TradeDetailsModal';
import AddTradeForm from './components/forms/AddTradeForm';
import Sidebar from './components/layout/Sidebar';
import TradingJournalLayout from './components/trading-journal/TradingJournalLayout';
import EnhancedKPIDashboard from './components/dashboard/EnhancedKPIDashboard';
import EnhancedTradeTable from './components/tables/EnhancedTradeTable';
import VirtualizedTradeTable from './components/tables/VirtualizedTradeTable';
import { Badge } from './components/ui/Badge';
import { StatsCard } from './components/ui/StatsCard';
import { Button } from './components/ui/Button';
import { Input } from './components/ui/Input';
import { FormSelect } from './components/ui/Form';
import { Target, BarChart3 } from 'lucide-react';

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
  worst_trade?: number;
  avg_win?: number;
  avg_loss?: number;
  profit_factor?: number;
  sharpe_ratio?: number;
  max_drawdown?: number;
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
  const [currentModule, setCurrentModule] = useState('trading-journal');

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


  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative">
      {/* Background gradient mesh */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      {/* Sidebar */}
      <Sidebar 
        currentModule={currentModule}
        onModuleChange={setCurrentModule}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-700/50 bg-gray-900/30 backdrop-blur-xl relative z-10">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div>
              <h1 className="text-lg lg:text-xl font-bold text-white">Trading Journal</h1>
              <p className="text-gray-400 text-xs lg:text-sm mt-1 hidden sm:block">Welcome back, {user?.email}</p>
            </div>
          </div>
          
          <Button variant="outline" onClick={logout} size="sm">
            <span className="hidden sm:inline">Logout</span>
            <span className="sm:hidden">⚪</span>
          </Button>
        </div>

        {/* Enhanced Dashboard Layout */}
        <div className="flex-1 overflow-y-auto">
          {/* Enhanced KPI Dashboard */}
          <EnhancedKPIDashboard
            stats={dashboardStats || {
              total_trades: 0,
              total_pnl: 0,
              win_rate: 0,
              best_trade: 0,
              worst_trade: 0,
              avg_win: 0,
              avg_loss: 0,
              profit_factor: 0,
              sharpe_ratio: 0,
              max_drawdown: 0
            }}
            trades={trades}
            onAddTrade={() => setShowAddTradeModal(true)}
            onImportCSV={() => document.getElementById('csv-upload')?.click()}
            onExportData={exportToCSV}
          />

          {/* CSV Import (Hidden Input) */}
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

          {/* Enhanced Charts Section */}
          <div className="px-6 lg:px-8 pb-8 space-y-8">
            {/* Main Enhanced Equity Curve - Full Width */}
            <EnhancedEquityCurveChart
              trades={trades}
              height={450}
              showDrawdowns={true}
              timeframe="1M"
              className="w-full"
            />
            
            {/* Supporting Charts - Responsive Grid */}
            {trades.length >= 1 && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
                <div className="glass-card p-6 lg:p-8 rounded-2xl min-h-[380px] backdrop-blur-xl bg-slate-800/40 border border-slate-700/30 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white tracking-tight">Daily P&L Distribution</h3>
                      <p className="text-slate-400 text-sm">Trading performance by day</p>
                    </div>
                  </div>
                  <div className="h-[280px] min-h-[250px] w-full overflow-hidden">
                    <SimpleChart trades={trades} />
                  </div>
                </div>
                
                <div className="glass-card p-6 lg:p-8 rounded-2xl min-h-[380px] backdrop-blur-xl bg-slate-800/40 border border-slate-700/30 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                      <Target className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white tracking-tight">Portfolio Overview</h3>
                      <p className="text-slate-400 text-sm">Asset allocation and performance</p>
                    </div>
                  </div>
                  <div className="h-[280px] min-h-[250px] w-full overflow-hidden">
                    <PortfolioChart trades={trades} />
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Virtualized Trade Table */}
            <div className="mt-8">
              <VirtualizedTradeTable
                trades={trades}
                onRowClick={(trade) => {
                  setSelectedTrade(trade);
                  setShowTradeDetails(true);
                }}
                onEditTrade={(trade) => {
                  setSelectedTrade(trade);
                  setShowAddTradeModal(true);
                }}
                height={600}
                loading={isLoading}
              />
            </div>
          </div>
        </div>
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