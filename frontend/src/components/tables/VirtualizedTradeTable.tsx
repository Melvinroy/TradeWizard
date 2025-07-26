import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FixedSizeList as List } from 'react-window';
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
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  BarChart3
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

interface TradeWithPnL extends Trade {
  value: number;
  pnl: number;
}

interface VirtualizedTradeTableProps {
  trades: Trade[];
  onRowClick?: (trade: Trade) => void;
  onEditTrade?: (trade: Trade) => void;
  onDeleteTrade?: (trade: Trade) => void;
  loading?: boolean;
  height?: number;
  className?: string;
}

interface SortConfig {
  key: keyof TradeWithPnL;
  direction: 'asc' | 'desc';
}

interface FilterConfig {
  symbol: string;
  side: 'ALL' | 'BUY' | 'SELL';
  dateRange: '7D' | '30D' | '90D' | 'ALL';
  tags: string;
  minValue: string;
  maxValue: string;
  profitableOnly: boolean;
}

// Row component for virtual list
interface RowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    trades: TradeWithPnL[];
    selectedRows: Set<string>;
    onRowClick?: (trade: Trade) => void;
    onEditTrade?: (trade: Trade) => void;
    onDeleteTrade?: (trade: Trade) => void;
    onSelectRow: (tradeId: string) => void;
  };
}

const VirtualRow: React.FC<RowProps> = ({ index, style, data }) => {
  const { trades, selectedRows, onRowClick, onEditTrade, onDeleteTrade, onSelectRow } = data;
  const trade = trades[index];

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

  return (
    <div
      style={style}
      className={cn(
        "grid grid-cols-12 gap-4 items-center px-6 border-b border-slate-700/30 hover:bg-slate-700/30 transition-colors cursor-pointer",
        selectedRows.has(trade.id) && "bg-blue-500/10",
        index % 2 === 0 ? "bg-slate-800/20" : "bg-slate-800/10"
      )}
      onClick={() => onRowClick?.(trade)}
    >
      {/* Checkbox */}
      <div className="col-span-1 flex items-center" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={selectedRows.has(trade.id)}
          onChange={() => onSelectRow(trade.id)}
          className="rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
        />
      </div>

      {/* Date */}
      <div className="col-span-1 text-sm text-slate-300">
        {formatDate(trade.trade_date)}
      </div>

      {/* Symbol */}
      <div className="col-span-1">
        <span className="font-semibold text-white">{trade.symbol}</span>
      </div>

      {/* Side */}
      <div className="col-span-1">
        <Badge
          variant={trade.side === 'BUY' ? 'success' : 'destructive'}
          size="sm"
        >
          {trade.side}
        </Badge>
      </div>

      {/* Quantity */}
      <div className="col-span-1 text-right text-sm text-slate-300">
        {trade.quantity.toLocaleString()}
      </div>

      {/* Price */}
      <div className="col-span-1 text-right text-sm text-slate-300">
        {formatCurrency(trade.price)}
      </div>

      {/* Value */}
      <div className="col-span-1 text-right text-sm text-slate-300">
        {formatCurrency(trade.value)}
      </div>

      {/* P&L */}
      <div className="col-span-1 text-right text-sm">
        <div className="flex items-center justify-end gap-1">
          {trade.pnl > 0 ? (
            <TrendingUp className="w-3 h-3 text-emerald-400" />
          ) : trade.pnl < 0 ? (
            <TrendingDown className="w-3 h-3 text-red-400" />
          ) : null}
          <span className={cn(
            "font-semibold font-mono",
            trade.pnl >= 0 ? "text-emerald-400" : "text-red-400"
          )}>
            {trade.pnl >= 0 ? '+' : ''}{formatCurrency(trade.pnl)}
          </span>
        </div>
      </div>

      {/* Tags */}
      <div className="col-span-2">
        {trade.tags && (
          <div className="flex flex-wrap gap-1">
            {trade.tags.split(',').slice(0, 2).map((tag, i) => (
              <Badge key={i} variant="outline" size="sm">
                {tag.trim()}
              </Badge>
            ))}
            {trade.tags.split(',').length > 2 && (
              <Badge variant="outline" size="sm">
                +{trade.tags.split(',').length - 2}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="col-span-1 flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRowClick?.(trade)}
          className="p-1 h-7 w-7"
        >
          <Eye className="w-3 h-3" />
        </Button>
        
        {onEditTrade && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEditTrade(trade)}
            className="p-1 h-7 w-7"
          >
            <Edit className="w-3 h-3" />
          </Button>
        )}
        
        {onDeleteTrade && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDeleteTrade(trade)}
            className="p-1 h-7 w-7 text-red-400 hover:text-red-300"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
};

const VirtualizedTradeTable: React.FC<VirtualizedTradeTableProps> = ({
  trades,
  onRowClick,
  onEditTrade,
  onDeleteTrade,
  loading = false,
  height = 600,
  className
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'trade_date', direction: 'desc' });
  const [filters, setFilters] = useState<FilterConfig>({
    symbol: '',
    side: 'ALL',
    dateRange: 'ALL',
    tags: '',
    minValue: '',
    maxValue: '',
    profitableOnly: false
  });
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Calculate P&L for each trade
  const tradesWithPnL = useMemo((): TradeWithPnL[] => {
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

    // Value range filters
    if (filters.minValue) {
      const minVal = parseFloat(filters.minValue);
      if (!isNaN(minVal)) {
        filtered = filtered.filter(trade => trade.value >= minVal);
      }
    }

    if (filters.maxValue) {
      const maxVal = parseFloat(filters.maxValue);
      if (!isNaN(maxVal)) {
        filtered = filtered.filter(trade => trade.value <= maxVal);
      }
    }

    // Profitable only filter
    if (filters.profitableOnly) {
      filtered = filtered.filter(trade => trade.pnl > 0);
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

  const handleSort = (key: keyof TradeWithPnL) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectAll = useCallback(() => {
    if (selectedRows.size === sortedTrades.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(sortedTrades.map(trade => trade.id)));
    }
  }, [selectedRows.size, sortedTrades]);

  const handleSelectRow = useCallback((tradeId: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(tradeId)) {
      newSelected.delete(tradeId);
    } else {
      newSelected.add(tradeId);
    }
    setSelectedRows(newSelected);
  }, [selectedRows]);

  const SortIcon = ({ column }: { column: keyof TradeWithPnL }) => {
    if (sortConfig.key !== column) {
      return <ArrowUpDown className="w-4 h-4 text-slate-500" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-blue-400" />
      : <ArrowDown className="w-4 h-4 text-blue-400" />;
  };

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const totalPnL = sortedTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    const profitableTrades = sortedTrades.filter(trade => trade.pnl > 0).length;
    const winRate = sortedTrades.length > 0 ? (profitableTrades / sortedTrades.length) * 100 : 0;
    const totalValue = sortedTrades.reduce((sum, trade) => sum + trade.value, 0);

    return {
      totalTrades: sortedTrades.length,
      totalPnL,
      winRate,
      totalValue,
      avgTrade: sortedTrades.length > 0 ? totalPnL / sortedTrades.length : 0
    };
  }, [sortedTrades]);

  if (loading) {
    return (
      <div className={cn(
        "bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm",
        "border border-slate-700/50 rounded-2xl p-8",
        className
      )}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <span className="ml-3 text-slate-400">Loading trades...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={cn(
        "bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm",
        "border border-slate-700/50 rounded-2xl overflow-hidden",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              Trade History
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              {summaryStats.totalTrades} trades • {selectedRows.size} selected
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

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
          <div className="text-center p-3 bg-slate-800/50 rounded-lg">
            <div className="text-lg font-bold font-mono text-white">
              {summaryStats.totalTrades}
            </div>
            <div className="text-xs text-slate-400">Total Trades</div>
          </div>
          
          <div className="text-center p-3 bg-slate-800/50 rounded-lg">
            <div className={cn(
              "text-lg font-bold font-mono",
              summaryStats.totalPnL >= 0 ? "text-emerald-400" : "text-red-400"
            )}>
              ${summaryStats.totalPnL.toFixed(2)}
            </div>
            <div className="text-xs text-slate-400">Total P&L</div>
          </div>
          
          <div className="text-center p-3 bg-slate-800/50 rounded-lg">
            <div className={cn(
              "text-lg font-bold font-mono",
              summaryStats.winRate >= 50 ? "text-emerald-400" : "text-yellow-400"
            )}>
              {summaryStats.winRate.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-400">Win Rate</div>
          </div>
          
          <div className="text-center p-3 bg-slate-800/50 rounded-lg">
            <div className="text-lg font-bold font-mono text-blue-400">
              ${summaryStats.totalValue.toFixed(0)}
            </div>
            <div className="text-xs text-slate-400">Total Volume</div>
          </div>
          
          <div className="text-center p-3 bg-slate-800/50 rounded-lg">
            <div className={cn(
              "text-lg font-bold font-mono",
              summaryStats.avgTrade >= 0 ? "text-emerald-400" : "text-red-400"
            )}>
              ${summaryStats.avgTrade.toFixed(2)}
            </div>
            <div className="text-xs text-slate-400">Avg P&L</div>
          </div>
        </div>

        {/* Search and Quick Filters */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search trades, symbols, notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
            />
          </div>
          
          <select
            value={filters.side}
            onChange={(e) => setFilters(prev => ({ ...prev, side: e.target.value as FilterConfig['side'] }))}
            className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="ALL">All Sides</option>
            <option value="BUY">Buy Only</option>
            <option value="SELL">Sell Only</option>
          </select>
          
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as FilterConfig['dateRange'] }))}
            className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="ALL">All Time</option>
            <option value="7D">Last 7 Days</option>
            <option value="30D">Last 30 Days</option>
            <option value="90D">Last 90 Days</option>
          </select>

          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={filters.profitableOnly}
              onChange={(e) => setFilters(prev => ({ ...prev, profitableOnly: e.target.checked }))}
              className="rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
            />
            Profitable Only
          </label>
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-slate-700/50 pt-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Symbol</label>
                  <input
                    type="text"
                    placeholder="e.g., AAPL, TSLA"
                    value={filters.symbol}
                    onChange={(e) => setFilters(prev => ({ ...prev, symbol: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Tags</label>
                  <input
                    type="text"
                    placeholder="e.g., swing, day-trade"
                    value={filters.tags}
                    onChange={(e) => setFilters(prev => ({ ...prev, tags: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Min Value</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.minValue}
                    onChange={(e) => setFilters(prev => ({ ...prev, minValue: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Max Value</label>
                  <input
                    type="number"
                    placeholder="∞"
                    value={filters.maxValue}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxValue: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters({ 
                    symbol: '', 
                    side: 'ALL', 
                    dateRange: 'ALL', 
                    tags: '',
                    minValue: '',
                    maxValue: '',
                    profitableOnly: false
                  })}
                >
                  Clear All Filters
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 items-center px-6 py-3 bg-slate-800/50 border-b border-slate-700/50">
        <div className="col-span-1">
          <input
            type="checkbox"
            checked={selectedRows.size === sortedTrades.length && sortedTrades.length > 0}
            onChange={handleSelectAll}
            className="rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
          />
        </div>
        
        <div className="col-span-1">
          <button
            onClick={() => handleSort('trade_date')}
            className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Date
            <SortIcon column="trade_date" />
          </button>
        </div>
        
        <div className="col-span-1">
          <button
            onClick={() => handleSort('symbol')}
            className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Symbol
            <SortIcon column="symbol" />
          </button>
        </div>
        
        <div className="col-span-1">
          <button
            onClick={() => handleSort('side')}
            className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Side
            <SortIcon column="side" />
          </button>
        </div>
        
        <div className="col-span-1 text-right">
          <button
            onClick={() => handleSort('quantity')}
            className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors ml-auto"
          >
            Qty
            <SortIcon column="quantity" />
          </button>
        </div>
        
        <div className="col-span-1 text-right">
          <button
            onClick={() => handleSort('price')}
            className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors ml-auto"
          >
            Price
            <SortIcon column="price" />
          </button>
        </div>
        
        <div className="col-span-1 text-right">
          <button
            onClick={() => handleSort('value')}
            className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors ml-auto"
          >
            Value
            <SortIcon column="value" />
          </button>
        </div>
        
        <div className="col-span-1 text-right">
          <button
            onClick={() => handleSort('pnl')}
            className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors ml-auto"
          >
            P&L
            <SortIcon column="pnl" />
          </button>
        </div>
        
        <div className="col-span-2 text-sm font-medium text-slate-300">Tags</div>
        <div className="col-span-1 text-center text-sm font-medium text-slate-300">Actions</div>
      </div>

      {/* Virtual List */}
      {sortedTrades.length > 0 ? (
        <List
          height={height - 200} // Subtract header height
          itemCount={sortedTrades.length}
          itemSize={60}
          itemData={{
            trades: sortedTrades,
            selectedRows,
            onRowClick,
            onEditTrade,
            onDeleteTrade,
            onSelectRow: handleSelectRow
          }}
        >
          {VirtualRow}
        </List>
      ) : (
        <div className="text-center py-12">
          <div className="text-slate-400 mb-4">
            {searchTerm || Object.values(filters).some(v => v !== '' && v !== 'ALL' && v !== false) 
              ? "No trades match your filters" 
              : "No trades found"
            }
          </div>
          {(searchTerm || Object.values(filters).some(v => v !== '' && v !== 'ALL' && v !== false)) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setFilters({ 
                  symbol: '', 
                  side: 'ALL', 
                  dateRange: 'ALL', 
                  tags: '',
                  minValue: '',
                  maxValue: '',
                  profitableOnly: false
                });
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

export default VirtualizedTradeTable;
export type { VirtualizedTradeTableProps };