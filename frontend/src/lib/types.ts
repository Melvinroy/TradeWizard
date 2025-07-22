// User & Auth Types
export interface User {
  id: string;
  email: string;
  subscription_tier: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Trade Account Types
export interface TradeAccount {
  id: string;
  user_id: string;
  account_name: string;
  broker: string;
  account_number?: string;
  created_at: string;
}

// Trade Types
export interface Trade {
  id: string;
  account_id: string;
  symbol: string;
  quantity: number;
  price: number;
  side: 'BUY' | 'SELL';
  trade_date: string;
  commission: number;
  currency: string;
  exchange?: string;
  order_type?: string;
  created_at: string;
  updated_at: string;
  tags?: TradeTag[];
  journal_entries?: JournalEntry[];
  pnl?: number;
  pnl_percent?: number;
}

// Tag Types
export interface TradeTag {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

// Journal Types
export interface JournalEntry {
  id: string;
  trade_id: string;
  entry_text: string;
  entry_date: string;
  updated_at: string;
}

// Analytics Types
export interface DashboardStats {
  total_trades: number;
  total_pnl: number;
  win_rate: number;
  total_commission: number;
  best_trade?: number;
  worst_trade?: number;
}

export interface PnLBySymbol {
  symbol: string;
  total_pnl: number;
  trade_count: number;
  win_rate: number;
}

export interface PnLByTimeframe {
  date: string;
  daily_pnl: number;
  cumulative_pnl: number;
  trade_count: number;
}

export interface PerformanceAnalytics {
  pnl_by_symbol: PnLBySymbol[];
  daily_pnl: PnLByTimeframe[];
  monthly_summary: DashboardStats;
}

// Form Types
export interface TradeFormData {
  account_id: string;
  symbol: string;
  quantity: number;
  price: number;
  side: 'BUY' | 'SELL';
  trade_date: string;
  commission?: number;
  currency?: string;
  exchange?: string;
  order_type?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

// Filter Types
export interface TradeFilters {
  account_id?: string;
  symbol?: string;
  side?: 'BUY' | 'SELL' | '';
  start_date?: string;
  end_date?: string;
  tags?: string[];
}

// UI State Types
export interface LoadingState {
  [key: string]: boolean;
}

export interface ErrorState {
  [key: string]: string | null;
}