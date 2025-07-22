from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
import uuid

class TradeAccountCreate(BaseModel):
    account_name: str
    broker: str = "IBKR"
    account_number: Optional[str] = None

class TradeAccountUpdate(BaseModel):
    account_name: Optional[str] = None
    broker: Optional[str] = None
    account_number: Optional[str] = None

class TradeAccount(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    account_name: str
    broker: str
    account_number: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class TradeCreate(BaseModel):
    account_id: uuid.UUID
    symbol: str
    quantity: Decimal
    price: Decimal
    side: str  # BUY or SELL
    trade_date: datetime
    commission: Optional[Decimal] = 0
    currency: str = "USD"
    exchange: Optional[str] = None
    order_type: Optional[str] = None

class TradeUpdate(BaseModel):
    symbol: Optional[str] = None
    quantity: Optional[Decimal] = None
    price: Optional[Decimal] = None
    side: Optional[str] = None
    trade_date: Optional[datetime] = None
    commission: Optional[Decimal] = None
    currency: Optional[str] = None
    exchange: Optional[str] = None
    order_type: Optional[str] = None

class Trade(BaseModel):
    id: uuid.UUID
    account_id: uuid.UUID
    symbol: str
    quantity: Decimal
    price: Decimal
    side: str
    trade_date: datetime
    commission: Decimal
    currency: str
    exchange: Optional[str]
    order_type: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TradeWithPnL(Trade):
    pnl: Optional[Decimal] = None
    pnl_percent: Optional[Decimal] = None

class TradeFilters(BaseModel):
    account_id: Optional[uuid.UUID] = None
    symbol: Optional[str] = None
    side: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    min_pnl: Optional[Decimal] = None
    max_pnl: Optional[Decimal] = None

class DashboardStats(BaseModel):
    total_trades: int
    total_pnl: Decimal
    win_rate: float
    total_commission: Decimal
    best_trade: Optional[Decimal] = None
    worst_trade: Optional[Decimal] = None

# Tag schemas
class TradeTagCreate(BaseModel):
    name: str
    color: str = "#3B82F6"

class TradeTagUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None

class TradeTag(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    color: str
    created_at: datetime

    class Config:
        from_attributes = True

# Journal entry schemas
class TradeJournalCreate(BaseModel):
    trade_id: uuid.UUID
    entry_text: str

class TradeJournalUpdate(BaseModel):
    entry_text: str

class TradeJournalEntry(BaseModel):
    id: uuid.UUID
    trade_id: uuid.UUID
    entry_text: str
    entry_date: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Enhanced trade schemas with relationships
class TradeWithDetails(Trade):
    tags: List[TradeTag] = []
    journal_entries: List[TradeJournalEntry] = []
    pnl: Optional[Decimal] = None
    pnl_percent: Optional[Decimal] = None

# CSV Import schemas
class CSVImportResult(BaseModel):
    imported_count: int
    error_count: int
    errors: List[str] = []

# Enhanced filtering with tags
class TradeFiltersAdvanced(TradeFilters):
    tags: Optional[List[str]] = None
    has_journal: Optional[bool] = None

# Analytics schemas
class PnLBySymbol(BaseModel):
    symbol: str
    total_pnl: Decimal
    trade_count: int
    win_rate: float

class PnLByTimeframe(BaseModel):
    date: datetime
    daily_pnl: Decimal
    cumulative_pnl: Decimal
    trade_count: int

class PerformanceAnalytics(BaseModel):
    pnl_by_symbol: List[PnLBySymbol]
    daily_pnl: List[PnLByTimeframe]
    monthly_summary: DashboardStats

# Win/Loss Analysis schemas
class WinLossBreakdown(BaseModel):
    wins: int
    losses: int
    breakeven: int
    win_rate: float
    avg_win: Decimal
    avg_loss: Decimal
    profit_factor: float  # Total wins / Total losses
    expectancy: Decimal  # Average expected profit per trade

class WinLossByTimeframe(BaseModel):
    period: str  # e.g., "2025-01", "2025-W01", "2025-Q1"
    timeframe_type: str  # "daily", "weekly", "monthly", "quarterly"
    breakdown: WinLossBreakdown
    total_pnl: Decimal
    trade_count: int

class WinLossBySymbol(BaseModel):
    symbol: str
    breakdown: WinLossBreakdown
    total_pnl: Decimal
    trade_count: int
    avg_hold_time_hours: Optional[float] = None

class WinLossByStrategy(BaseModel):
    strategy: str  # Derived from tags
    breakdown: WinLossBreakdown
    total_pnl: Decimal
    trade_count: int

class WinLossAnalysis(BaseModel):
    overall: WinLossBreakdown
    by_timeframe: List[WinLossByTimeframe]
    by_symbol: List[WinLossBySymbol]
    by_strategy: List[WinLossByStrategy]
    time_period: str  # "all", "1m", "3m", "6m", "1y", "ytd"