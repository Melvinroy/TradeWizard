import { type ClassValue, clsx } from 'clsx';

// Utility for combining class names
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Format currency values
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  options?: Intl.NumberFormatOptions
) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(amount);
}

// Format percentage values
export function formatPercentage(value: number, decimals: number = 2) {
  return `${value.toFixed(decimals)}%`;
}

// Format large numbers with K, M, B suffixes
export function formatCompactNumber(num: number) {
  const formatters = [
    { value: 1e9, symbol: 'B' },
    { value: 1e6, symbol: 'M' },
    { value: 1e3, symbol: 'K' },
  ];

  for (const formatter of formatters) {
    if (Math.abs(num) >= formatter.value) {
      return (num / formatter.value).toFixed(1) + formatter.symbol;
    }
  }

  return num.toString();
}

// Get P&L color classes
export function getPnLColor(pnl: number) {
  if (pnl > 0) {
    return 'text-profit-500';
  } else if (pnl < 0) {
    return 'text-loss-500';
  }
  return 'text-gray-400';
}

// Get P&L background color classes
export function getPnLBgColor(pnl: number, opacity: string = '20') {
  if (pnl > 0) {
    return `bg-profit-500/${opacity}`;
  } else if (pnl < 0) {
    return `bg-loss-500/${opacity}`;
  }
  return `bg-gray-500/${opacity}`;
}

// Format date strings
export function formatDate(dateString: string, options?: Intl.DateTimeFormatOptions) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
}

// Format date and time
export function formatDateTime(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Calculate P&L from trade data
export function calculateTradePnL(trade: {
  quantity: number;
  price: number;
  side: 'BUY' | 'SELL';
}, currentPrice?: number) {
  if (!currentPrice) return 0;
  
  const multiplier = trade.side === 'BUY' ? 1 : -1;
  return multiplier * trade.quantity * (currentPrice - trade.price);
}

// Generate random ID (for demo purposes)
export function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Debounce function for search inputs
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
}

// Local storage helpers with error handling
export const storage = {
  get: (key: string) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  
  set: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Silent fail
    }
  },
  
  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Silent fail
    }
  },
};

// Validate email format
export function isValidEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Copy text to clipboard
export async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

// Generate color from string (for tags/symbols)
export function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
}