import { useState, useMemo, forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './Table';
import { Input } from './Input';
import { Button } from './Button';
import { LoadingSpinner } from './LoadingSpinner';
import { Badge } from './Badge';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, item: T, index: number) => React.ReactNode;
  filterType?: 'text' | 'select' | 'date' | 'number';
  filterOptions?: { label: string; value: string }[];
}

export interface DataTableProps<T> extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
  pageSizeOptions?: number[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T, index: number) => void;
  onSelectionChange?: (selectedItems: T[]) => void;
  selectable?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  showPagination?: boolean;
  showItemsPerPage?: boolean;
  stickyHeader?: boolean;
}

interface FilterState {
  [key: string]: string;
}

interface SortState {
  column: string | null;
  direction: 'asc' | 'desc' | null;
}

function DataTableInner<T extends Record<string, any>>(
  {
    data,
    columns,
    pageSize = 10,
    pageSizeOptions = [10, 25, 50, 100],
    loading = false,
    emptyMessage = 'No data available',
    onRowClick,
    onSelectionChange,
    selectable = false,
    searchable = true,
    searchPlaceholder = 'Search...',
    showPagination = true,
    showItemsPerPage = true,
    stickyHeader = false,
    className,
    ...props
  }: DataTableProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(pageSize);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({});
  const [sortState, setSortState] = useState<SortState>({ column: null, direction: null });
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort data
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (searchQuery) {
      result = result.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Apply column filters
    Object.entries(filters).forEach(([columnKey, filterValue]) => {
      if (filterValue) {
        result = result.filter(item => {
          const value = String(item[columnKey] || '');
          return value.toLowerCase().includes(filterValue.toLowerCase());
        });
      }
    });

    // Apply sorting
    if (sortState.column && sortState.direction) {
      result.sort((a, b) => {
        const aValue = a[sortState.column!];
        const bValue = b[sortState.column!];
        
        if (aValue === bValue) return 0;
        
        const comparison = aValue < bValue ? -1 : 1;
        return sortState.direction === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [data, searchQuery, filters, sortState]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedData.slice(startIndex, startIndex + itemsPerPage);
  }, [processedData, currentPage, itemsPerPage]);

  // Handle sort
  const handleSort = (columnKey: string) => {
    setSortState(prev => ({
      column: columnKey,
      direction: 
        prev.column === columnKey 
          ? prev.direction === 'asc' ? 'desc' : prev.direction === 'desc' ? null : 'asc'
          : 'asc'
    }));
  };

  // Handle selection
  const handleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedData.map((_, index) => index)));
    }
  };

  const handleSelectRow = (index: number) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(index)) {
      newSelection.delete(index);
    } else {
      newSelection.add(index);
    }
    setSelectedRows(newSelection);
  };

  // Update parent when selection changes
  useMemo(() => {
    if (onSelectionChange) {
      const selectedItems = Array.from(selectedRows).map(index => paginatedData[index]);
      onSelectionChange(selectedItems);
    }
  }, [selectedRows, paginatedData, onSelectionChange]);

  // Reset page when data changes
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, filters, itemsPerPage]);

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div ref={ref} className={cn('space-y-4', className)} {...props}>
      {/* Search and Filter Bar */}
      {(searchable || columns.some(col => col.filterable)) && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            {searchable && (
              <div className="flex-1">
                <Input
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            )}
            {columns.some(col => col.filterable) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
                {hasActiveFilters && (
                  <Badge variant="info" size="sm">{Object.values(filters).filter(Boolean).length}</Badge>
                )}
              </Button>
            )}
          </div>

          {/* Column Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 bg-slate-800/30 rounded-lg">
              {columns.filter(col => col.filterable).map(column => (
                <div key={String(column.key)}>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {column.header}
                  </label>
                  <Input
                    placeholder={`Filter ${column.header}`}
                    value={filters[String(column.key)] || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      [String(column.key)]: e.target.value
                    }))}
                    size="sm"
                  />
                </div>
              ))}
              {hasActiveFilters && (
                <div className="flex items-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilters({})}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className={cn('relative', stickyHeader && 'max-h-[600px] overflow-auto')}>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner text="Loading data..." />
          </div>
        ) : processedData.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-400">
            {emptyMessage}
          </div>
        ) : (
          <Table>
            <TableHeader className={cn(stickyHeader && 'sticky top-0 z-10')}>
              <TableRow>
                {selectable && (
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-600 text-blue-500 focus:ring-blue-500"
                    />
                  </TableHead>
                )}
                {columns.map(column => (
                  <TableHead
                    key={String(column.key)}
                    sortable={column.sortable}
                    sorted={sortState.column === String(column.key) ? sortState.direction : null}
                    onSort={() => column.sortable && handleSort(String(column.key))}
                    style={{ width: column.width }}
                    className={column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : ''}
                  >
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((item, index) => (
                <TableRow
                  key={index}
                  variant={onRowClick ? 'hover' : 'default'}
                  onClick={() => onRowClick?.(item, index)}
                  className={cn(selectedRows.has(index) && 'bg-blue-500/10')}
                >
                  {selectable && (
                    <TableCell className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(index)}
                        onChange={() => handleSelectRow(index)}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded border-gray-600 text-blue-500 focus:ring-blue-500"
                      />
                    </TableCell>
                  )}
                  {columns.map(column => (
                    <TableCell 
                      key={String(column.key)} 
                      align={column.align}
                    >
                      {column.render 
                        ? column.render(item[String(column.key)], item, index)
                        : item[String(column.key)]
                      }
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {showPagination && processedData.length > 0 && (
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-4">
            {showItemsPerPage && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Items per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="px-3 py-1 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  {pageSizeOptions.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
            )}
            <span className="text-sm text-gray-400">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, processedData.length)} of {processedData.length} items
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setCurrentPage(pageNumber)}
                    className="min-w-[40px]"
                  >
                    {pageNumber}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              Last
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export const DataTable = forwardRef(DataTableInner) as <T extends Record<string, any>>(
  props: DataTableProps<T> & React.RefAttributes<HTMLDivElement>
) => React.ReactElement;

DataTable.displayName = 'DataTable';