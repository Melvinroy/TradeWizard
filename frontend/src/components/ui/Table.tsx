import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface TableProps extends HTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
  variant?: 'default' | 'hover';
}

interface TableCellProps extends HTMLAttributes<HTMLTableCellElement> {
  children?: React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

interface TableHeadProps extends HTMLAttributes<HTMLTableCellElement> {
  children?: React.ReactNode;
  sortable?: boolean;
  sorted?: 'asc' | 'desc' | null;
  onSort?: () => void;
}

const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ className, children, ...props }, ref) => (
    <div className="relative w-full overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
      <table
        ref={ref}
        className={cn('w-full caption-bottom text-sm border-collapse', className)}
        {...props}
      >
        {children}
      </table>
    </div>
  )
);
Table.displayName = 'Table';

const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <thead
      ref={ref}
      className={cn(
        'bg-slate-800/80 border-b border-slate-700/50 backdrop-blur-sm',
        className
      )}
      {...props}
    >
      {children}
    </thead>
  )
);
TableHeader.displayName = 'TableHeader';

const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, children, ...props }, ref) => (
    <tbody
      ref={ref}
      className={cn('divide-y divide-slate-700/30', className)}
      {...props}
    >
      {children}
    </tbody>
  )
);
TableBody.displayName = 'TableBody';

const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'border-slate-700/30 transition-colors duration-200',
      hover: 'border-slate-700/30 transition-all duration-200 hover:bg-slate-800/30 hover:shadow-sm cursor-pointer'
    };

    return (
      <tr
        ref={ref}
        className={cn(variants[variant], className)}
        {...props}
      >
        {children}
      </tr>
    );
  }
);
TableRow.displayName = 'TableRow';

const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, children, sortable, sorted, onSort, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        'h-12 px-4 text-left align-middle font-medium text-gray-300 tracking-wide text-xs uppercase',
        sortable && 'cursor-pointer select-none hover:text-white transition-colors duration-200',
        className
      )}
      onClick={sortable ? onSort : undefined}
      {...props}
    >
      <div className="flex items-center space-x-2">
        <span>{children}</span>
        {sortable && (
          <div className="flex flex-col">
            <svg
              className={cn(
                'h-3 w-3 transition-colors duration-200',
                sorted === 'asc' ? 'text-blue-400' : 'text-gray-500'
              )}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M5.293 9.707a1 1 0 011.414 0L10 6.414l3.293 3.293a1 1 0 011.414-1.414L10 3.586 5.293 8.293a1 1 0 000 1.414z" />
            </svg>
            <svg
              className={cn(
                'h-3 w-3 -mt-1 transition-colors duration-200',
                sorted === 'desc' ? 'text-blue-400' : 'text-gray-500'
              )}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M14.707 10.293a1 1 0 00-1.414 0L10 13.586 6.707 10.293a1 1 0 00-1.414 1.414L10 16.414l4.707-4.707a1 1 0 000-1.414z" />
            </svg>
          </div>
        )}
      </div>
    </th>
  )
);
TableHead.displayName = 'TableHead';

const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, children, align = 'left', ...props }, ref) => {
    const alignClasses = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right'
    };

    return (
      <td
        ref={ref}
        className={cn(
          'px-4 py-3 align-middle text-gray-100 font-medium',
          alignClasses[align],
          className
        )}
        {...props}
      >
        {children}
      </td>
    );
  }
);
TableCell.displayName = 'TableCell';

export { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
};