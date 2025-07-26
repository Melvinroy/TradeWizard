import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  Filter,
  Search,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit3,
  X
} from 'lucide-react';
import { Badge } from './Badge';
import { Button } from './Button';
import { Input } from './Input';
import { FormSelect } from './Form';
import { cn } from '../../lib/utils';

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
  loading?: boolean;
  className?: string;
}

type SortField = keyof Trade;
type SortDirection = 'asc' | 'desc' | null;

const EnhancedTradeTable: React.FC<EnhancedTradeTableProps> = ({
  trades,
  onRowClick,
  loading = false,
  className
}) => {
  const [sortField, setSortField] = useState<SortField>('trade_date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSide, setFilterSide] = useState<'all' | 'BUY' | 'SELL'>('all');
  const [filterSymbol, setFilterSymbol] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Get unique symbols for filter
  const uniqueSymbols = useMemo(() => 
    [...new Set(trades.map(trade => trade.symbol))].sort(),
    [trades]
  );

  // Filter and sort trades
  const processedTrades = useMemo(() => {
    let filtered = trades.filter(trade => {
      const matchesSearch = trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           trade.side.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (trade.tags && trade.tags.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesSide = filterSide === 'all' || trade.side === filterSide;
      const matchesSymbol = filterSymbol === 'all' || trade.symbol === filterSymbol;
      
      return matchesSearch && matchesSide && matchesSymbol;
    });

    // Sort trades
    if (sortField && sortDirection) {
      filtered.sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];

        if (sortField === 'trade_date') {
          aValue = new Date(aValue as string).getTime();
          bValue = new Date(bValue as string).getTime();
        } else if (sortField === 'price' || sortField === 'quantity' || sortField === 'commission') {
          aValue = Number(aValue);
          bValue = Number(bValue);
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [trades, searchTerm, filterSide, filterSymbol, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(processedTrades.length / itemsPerPage);
  const paginatedTrades = processedTrades.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(
        sortDirection === 'asc' ? 'desc' : sortDirection === 'desc' ? null : 'asc'
      );
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 opacity-50" />;
    if (sortDirection === 'asc') return <ArrowUp className="w-4 h-4 text-blue-400" />;
    if (sortDirection === 'desc') return <ArrowDown className="w-4 h-4 text-blue-400" />;
    return <ArrowUpDown className="w-4 h-4 opacity-50" />;
  };

  const calculatePnL = (trade: Trade) => {
    const totalValue = trade.price * trade.quantity;
    const commission = trade.commission || 0;
    return trade.side === 'BUY' ? -totalValue - commission : totalValue - commission;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterSide('all');
    setFilterSymbol('all');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="data-table-container">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <span className="ml-3 text-text-secondary">Loading trades...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-blue-400" />
            Trade History
          </h2>
          <p className="text-text-secondary text-sm mt-1">
            {processedTrades.length} of {trades.length} trades
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant={showFilters ? "primary" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            {(searchTerm || filterSide !== 'all' || filterSymbol !== 'all') && (
              <Badge variant="info" size="sm">
                {[searchTerm, filterSide !== 'all' ? filterSide : '', filterSymbol !== 'all' ? filterSymbol : '']
                  .filter(Boolean).length}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card p-6 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Symbol, side, tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Side
                </label>
                <FormSelect
                  value={filterSide}
                  onChange={(e) => setFilterSide(e.target.value as typeof filterSide)}
                >
                  <option value="all">All Sides</option>
                  <option value="BUY">BUY Only</option>
                  <option value="SELL">SELL Only</option>
                </FormSelect>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Symbol
                </label>
                <FormSelect
                  value={filterSymbol}
                  onChange={(e) => setFilterSymbol(e.target.value)}
                >
                  <option value="all">All Symbols</option>
                  {uniqueSymbols.map(symbol => (
                    <option key={symbol} value={symbol}>{symbol}</option>
                  ))}
                </FormSelect>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="w-full gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="data-table-container">
        {processedTrades.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="data-table-header">
                  <tr>
                    {[
                      { key: 'symbol' as SortField, label: 'Symbol' },
                      { key: 'side' as SortField, label: 'Side' },
                      { key: 'quantity' as SortField, label: 'Quantity' },
                      { key: 'price' as SortField, label: 'Price' },
                      { key: 'trade_date' as SortField, label: 'Date' },
                      { key: 'commission' as SortField, label: 'Commission' },
                      { key: 'pnl', label: 'P&L' },
                      { key: 'tags', label: 'Tags' }
                    ].map(({ key, label }) => (
                      <th
                        key={key}
                        className={cn(
                          "px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider",
                          key !== 'pnl' && key !== 'tags' && "cursor-pointer hover:text-white transition-colors"
                        )}
                        onClick={key !== 'pnl' && key !== 'tags' ? () => handleSort(key as SortField) : undefined}
                      >
                        <div className="flex items-center gap-2">
                          {label}
                          {key !== 'pnl' && key !== 'tags' && getSortIcon(key as SortField)}
                        </div>
                      </th>
                    ))}
                    <th className="px-6 py-4 text-center text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/30">
                  {paginatedTrades.map((trade, index) => {
                    const pnl = calculatePnL(trade);
                    return (
                      <motion.tr
                        key={trade.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-white/5 transition-colors cursor-pointer"
                        onClick={() => onRowClick?.(trade)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono font-semibold text-white">
                            {trade.symbol}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge 
                            variant={trade.side === 'BUY' ? 'success' : 'error'} 
                            size="sm"
                          >
                            {trade.side}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-white">
                          {trade.quantity.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-white">
                          ${trade.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-text-secondary text-sm">
                          {new Date(trade.trade_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-white">
                          ${(trade.commission || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-mono font-semibold">
                          <span className={cn(
                            "flex items-center gap-1",
                            pnl >= 0 ? "text-profit-400" : "text-loss-400"
                          )}>
                            {pnl >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            ${Math.abs(pnl).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {trade.tags ? (
                            <div className="flex gap-1 flex-wrap">
                              {trade.tags.split(',').slice(0, 2).map((tag, tagIndex) => (
                                <Badge key={tagIndex} variant="info" size="sm">
                                  {tag.trim()}
                                </Badge>
                              ))}
                              {trade.tags.split(',').length > 2 && (
                                <Badge variant="outline" size="sm">
                                  +{trade.tags.split(',').length - 2}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-500 text-xs">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onRowClick?.(trade);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-700/30">
                <div className="text-sm text-text-secondary">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                  {Math.min(currentPage * itemsPerPage, processedTrades.length)} of{' '}
                  {processedTrades.length} trades
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="px-3 py-1 text-sm bg-white/10 rounded-lg">
                    {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No trades found</h3>
            <p className="text-text-secondary">
              {searchTerm || filterSide !== 'all' || filterSymbol !== 'all'
                ? 'Try adjusting your filters'
                : 'Upload a CSV file or add trades manually to get started'
              }
            </p>
            {(searchTerm || filterSide !== 'all' || filterSymbol !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="mt-4"
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedTradeTable;
export type { EnhancedTradeTableProps };