import { forwardRef, useState, useRef, useEffect, type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface DatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  value?: string;
  onChange?: (date: string) => void;
  min?: string;
  max?: string;
  error?: boolean;
  showTime?: boolean;
}

const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, value, onChange, min, max, error, showTime = false, placeholder, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [localValue, setLocalValue] = useState(value || '');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputType = showTime ? 'datetime-local' : 'date';

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
      setLocalValue(value || '');
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
      onChange?.(newValue);
    };

    const formatDisplayValue = (dateString: string) => {
      if (!dateString) return '';
      
      try {
        const date = new Date(dateString);
        if (showTime) {
          return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        }
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      } catch {
        return dateString;
      }
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      setLocalValue('');
      onChange?.('');
      setIsOpen(false);
    };

    return (
      <div ref={containerRef} className="relative">
        <div
          className={cn(
            'relative flex items-center cursor-pointer',
            'bg-slate-800/50 border border-slate-700/50 rounded-xl',
            'hover:border-slate-600/50 transition-all duration-200',
            'focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500/50',
            error && 'border-loss-500/50 focus-within:ring-loss-500/50 focus-within:border-loss-500/50',
            className
          )}
          onClick={() => setIsOpen(true)}
        >
          <input
            ref={ref}
            type="text"
            readOnly
            value={formatDisplayValue(localValue)}
            placeholder={placeholder || (showTime ? 'Select date and time' : 'Select date')}
            className={cn(
              'w-full px-4 py-3 bg-transparent text-white placeholder-gray-500',
              'focus:outline-none cursor-pointer',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            {...props}
          />
          <div className="absolute right-2 flex items-center gap-2">
            {localValue && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="Clear date"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        {isOpen && (
          <div className="absolute z-50 mt-2 p-4 bg-slate-800 border border-slate-700 rounded-xl shadow-xl">
            <input
              type={inputType}
              value={localValue}
              onChange={handleChange}
              min={min}
              max={max}
              className={cn(
                'px-4 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg',
                'text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50',
                'transition-all duration-200'
              )}
              autoFocus
            />
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1.5 text-sm bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all duration-200"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';

// Simple date input variant for forms
const SimpleDateInput = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, error, showTime = false, ...props }, ref) => (
    <input
      ref={ref}
      type={showTime ? 'datetime-local' : 'date'}
      className={cn(
        'w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white',
        'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50',
        'transition-all duration-200',
        'hover:border-slate-600/50',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        '[&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert',
        error && 'border-loss-500/50 focus:ring-loss-500/50 focus:border-loss-500/50',
        className
      )}
      {...props}
    />
  )
);

SimpleDateInput.displayName = 'SimpleDateInput';

export { DatePicker, SimpleDateInput };
export type { DatePickerProps };