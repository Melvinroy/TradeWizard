import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Edit,
  Trash2,
  Download,
  Calendar,
  Tag,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

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

interface EnhancedTradeTableProps {
  trades: Trade[];
  onRowClick?: (trade: Trade) => void;
  onEditTrade?: (trade: Trade) => void;
  onDeleteTrade?: (trade: Trade) => void;
  loading?: boolean;
  pageSize?: number;
  className?: string;
}

interface SortConfig {
  key: keyof Trade | 'pnl' | 'value';
  direction: 'asc' | 'desc';
}

interface FilterConfig {
  symbol: string;
  side: 'ALL' | 'BUY' | 'SELL';
  dateRange: '7D' | '30D' | '90D' | 'ALL';
  tags: string;
}

const EnhancedTradeTable: React.FC<EnhancedTradeTableProps> = ({
  trades,
  onRowClick,
  onEditTrade,
  onDeleteTrade,
  loading = false,
  pageSize = 50,
  className
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'trade_date', direction: 'desc' });
  const [filters, setFilters] = useState<FilterConfig>({
    symbol: '',
    side: 'ALL',
    dateRange: 'ALL',
    tags: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Calculate P&L for each trade
  const tradesWithPnL = useMemo(() => {
    return trades.map(trade => {
      const value = trade.price * trade.quantity;
      const pnl = trade.side === 'SELL' ? value - trade.commission : -(value + trade.commission);
      return {
        ...trade,
        value,
        pnl
      };
    });
  }, [trades]);

  // Filter and search trades
  const filteredTrades = useMemo(() => {
    let filtered = tradesWithPnL;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(trade =>
        trade.symbol.toLowerCase().includes(term) ||
        trade.side.toLowerCase().includes(term) ||
        trade.notes?.toLowerCase().includes(term) ||
        trade.tags?.toLowerCase().includes(term)
      );
    }

    // Symbol filter
    if (filters.symbol) {
      filtered = filtered.filter(trade =>
        trade.symbol.toLowerCase().includes(filters.symbol.toLowerCase())
      );
    }

    // Side filter
    if (filters.side !== 'ALL') {
      filtered = filtered.filter(trade => trade.side === filters.side);
    }

    // Date range filter
    if (filters.dateRange !== 'ALL') {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (filters.dateRange) {
        case '7D':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case '30D':
          cutoffDate.setDate(now.getDate() - 30);
          break;
        case '90D':
          cutoffDate.setDate(now.getDate() - 90);
          break;
      }
      
      filtered = filtered.filter(trade => new Date(trade.trade_date) >= cutoffDate);
    }

    // Tags filter
    if (filters.tags) {
      const term = filters.tags.toLowerCase();
      filtered = filtered.filter(trade =>
        trade.tags?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [tradesWithPnL, searchTerm, filters]);

  // Sort trades
  const sortedTrades = useMemo(() => {
    return [...filteredTrades].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return 1;
      if (bValue === undefined) return -1;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' 
          ? aValue - bValue 
          : bValue - aValue;
      }
      
      return 0;
    });
  }, [filteredTrades, sortConfig]);

  // Paginate trades
  const paginatedTrades = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedTrades.slice(startIndex, startIndex + pageSize);
  }, [sortedTrades, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedTrades.length / pageSize);

  const handleSort = (key: keyof Trade | 'pnl' | 'value') => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectAll = () => {
    if (selectedRows.size === paginatedTrades.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedTrades.map(trade => trade.id)));
    }
  };

  const handleSelectRow = (tradeId: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(tradeId)) {
      newSelected.delete(tradeId);
    } else {
      newSelected.add(tradeId);
    }
    setSelectedRows(newSelected);
  };

  const SortIcon = ({ column }: { column: keyof Trade | 'pnl' | 'value' }) => {
    if (sortConfig.key !== column) {
      return <ArrowUpDown className="w-4 h-4 text-gray-500" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-blue-400" />
      : <ArrowDown className="w-4 h-4 text-blue-400" />;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={cn(
        "bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm",
        "border border-gray-700/50 rounded-2xl p-8",
        className
      )}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <span className="ml-3 text-gray-400">Loading trades...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={cn(
        "bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm",
        "border border-gray-700/50 rounded-2xl overflow-hidden",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Trade History</h3>
            <p className="text-sm text-gray-400 mt-1">
              {sortedTrades.length} trades • {selectedRows.size} selected
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              disabled={selectedRows.size === 0}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export ({selectedRows.size})
            </Button>
          </div>
        </div>

        {/* Search and Quick Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search trades, symbols, notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
            />
          </div>
          
          <select
            value={filters.side}
            onChange={(e) => setFilters(prev => ({ ...prev, side: e.target.value as FilterConfig['side'] }))}
            className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="ALL">All Sides</option>
            <option value="BUY">Buy Only</option>
            <option value="SELL">Sell Only</option>
          </select>
          
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as FilterConfig['dateRange'] }))}
            className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="ALL">All Time</option>
            <option value="7D">Last 7 Days</option>
            <option value="30D">Last 30 Days</option>
            <option value="90D">Last 90 Days</option>
          </select>
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-700/50"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Symbol</label>
                  <input
                    type="text"
                    placeholder="e.g., AAPL, TSLA"
                    value={filters.symbol}
                    onChange={(e) => setFilters(prev => ({ ...prev, symbol: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Tags</label>
                  <input
                    type="text"
                    placeholder="e.g., swing, day-trade"
                    value={filters.tags}
                    onChange={(e) => setFilters(prev => ({ ...prev, tags: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters({ symbol: '', side: 'ALL', dateRange: 'ALL', tags: '' })}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700/50 bg-gray-800/50">
              <th className="p-4 text-left">
                <input
                  type="checkbox"
                  checked={selectedRows.size === paginatedTrades.length && paginatedTrades.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                />
              </th>
              
              <th className="p-4 text-left">
                <button
                  onClick={() => handleSort('trade_date')}
                  className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Date
                  <SortIcon column="trade_date" />
                </button>
              </th>
              
              <th className="p-4 text-left">
                <button
                  onClick={() => handleSort('symbol')}
                  className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Symbol
                  <SortIcon column="symbol" />
                </button>
              </th>
              
              <th className="p-4 text-left">
                <button
                  onClick={() => handleSort('side')}
                  className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Side
                  <SortIcon column="side" />
                </button>
              </th>
              
              <th className="p-4 text-right">
                <button
                  onClick={() => handleSort('quantity')}
                  className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors ml-auto"
                >
                  Quantity
                  <SortIcon column="quantity" />
                </button>
              </th>
              
              <th className="p-4 text-right">
                <button
                  onClick={() => handleSort('price')}
                  className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors ml-auto"
                >
                  Price
                  <SortIcon column="price" />
                </button>
              </th>
              
              <th className="p-4 text-right">
                <button
                  onClick={() => handleSort('value')}
                  className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors ml-auto"
                >
                  Value
                  <SortIcon column="value" />
                </button>
              </th>
              
              <th className="p-4 text-right">
                <button
                  onClick={() => handleSort('pnl')}
                  className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors ml-auto"
                >
                  P&L
                  <SortIcon column="pnl" />
                </button>
              </th>
              
              <th className="p-4 text-left">Tags</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          
          <tbody>
            {paginatedTrades.map((trade, index) => (
              <motion.tr
                key={trade.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className={cn(
                  "border-b border-gray-700/30 hover:bg-gray-700/30 transition-colors cursor-pointer",
                  selectedRows.has(trade.id) && "bg-blue-500/10"
                )}
                onClick={() => onRowClick?.(trade)}
              >
                <td className="p-4" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedRows.has(trade.id)}
                    onChange={() => handleSelectRow(trade.id)}
                    className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                  />
                </td>
                
                <td className="p-4 text-sm text-gray-300">
                  {formatDate(trade.trade_date)}
                </td>
                
                <td className="p-4">
                  <span className="font-semibold text-white">{trade.symbol}</span>
                </td>
                
                <td className="p-4">
                  <Badge
                    variant={trade.side === 'BUY' ? 'success' : 'destructive'}
                    size="sm"
                  >
                    {trade.side}
                  </Badge>
                </td>
                
                <td className="p-4 text-right text-sm text-gray-300">
                  {trade.quantity.toLocaleString()}
                </td>
                
                <td className="p-4 text-right text-sm text-gray-300">
                  {formatCurrency(trade.price)}
                </td>
                
                <td className="p-4 text-right text-sm text-gray-300">
                  {formatCurrency(trade.value)}
                </td>
                
                <td className="p-4 text-right text-sm">
                  <span className={cn(
                    "font-semibold",
                    trade.pnl >= 0 ? "text-profit-400" : "text-loss-400"
                  )}>
                    {trade.pnl >= 0 ? '+' : ''}{formatCurrency(trade.pnl)}
                  </span>
                </td>
                
                <td className="p-4">
                  {trade.tags && (
                    <div className="flex flex-wrap gap-1">
                      {trade.tags.split(',').map((tag, i) => (
                        <Badge key={i} variant="outline" size="sm">
                          {tag.trim()}
                        </Badge>
                      ))}
                    </div>
                  )}
                </td>
                
                <td className="p-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRowClick?.(trade)}
                      className="p-1 h-8 w-8"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    
                    {onEditTrade && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditTrade(trade)}
                        className="p-1 h-8 w-8"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                    
                    {onDeleteTrade && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteTrade(trade)}
                        className="p-1 h-8 w-8 text-loss-400 hover:text-loss-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-6 border-t border-gray-700/50">
          <div className="text-sm text-gray-400">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedTrades.length)} of {sortedTrades.length} trades
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = currentPage > 3 ? currentPage - 2 + i : i + 1;
                if (pageNum > totalPages) return null;
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={cn(
                      "px-3 py-1 text-sm rounded transition-colors",
                      currentPage === pageNum
                        ? "bg-blue-500 text-white"
                        : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {sortedTrades.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            {searchTerm || Object.values(filters).some(v => v !== '' && v !== 'ALL') 
              ? "No trades match your filters" 
              : "No trades found"
            }
          </div>
          {(searchTerm || Object.values(filters).some(v => v !== '' && v !== 'ALL')) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setFilters({ symbol: '', side: 'ALL', dateRange: 'ALL', tags: '' });
              }}
            >
              Clear all filters
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default EnhancedTradeTable;
export type { EnhancedTradeTableProps };