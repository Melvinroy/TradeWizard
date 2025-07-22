from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from app.core.database import get_db
from app.modules.auth.dependencies import get_current_user
from app.core.models import User
from app.modules.tradelog.service import TradeLogService
from app.modules.tradelog.schemas import (
    # Trade schemas
    TradeCreate, TradeUpdate, Trade, TradeWithDetails, TradeFilters, TradeFiltersAdvanced,
    # Account schemas
    TradeAccountCreate, TradeAccountUpdate, TradeAccount,
    # Analytics schemas
    DashboardStats, PerformanceAnalytics, PnLBySymbol, PnLByTimeframe, WinLossAnalysis,
    # Tag schemas
    TradeTagCreate, TradeTagUpdate, TradeTag,
    # Journal schemas
    TradeJournalCreate, TradeJournalUpdate, TradeJournalEntry,
    # Import schemas
    CSVImportResult
)

router = APIRouter()

# Trade Account Management
@router.post("/accounts", response_model=TradeAccount, status_code=status.HTTP_201_CREATED)
async def create_trade_account(
    account_data: TradeAccountCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new trading account"""
    from app.core.models import TradeAccount as TradeAccountModel
    
    account = TradeAccountModel(**account_data.dict(), user_id=current_user.id)
    db.add(account)
    db.commit()
    db.refresh(account)
    return account

@router.get("/accounts", response_model=List[TradeAccount])
async def get_trade_accounts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all trading accounts for the current user"""
    from app.core.models import TradeAccount as TradeAccountModel
    
    accounts = db.query(TradeAccountModel).filter(
        TradeAccountModel.user_id == current_user.id
    ).all()
    return accounts

@router.put("/accounts/{account_id}", response_model=TradeAccount)
async def update_trade_account(
    account_id: uuid.UUID,
    account_data: TradeAccountUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a trading account"""
    from app.core.models import TradeAccount as TradeAccountModel
    
    account = db.query(TradeAccountModel).filter(
        TradeAccountModel.id == account_id,
        TradeAccountModel.user_id == current_user.id
    ).first()
    
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    update_data = account_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(account, field, value)
    
    db.commit()
    db.refresh(account)
    return account

# Trade Management
@router.post("/trades", response_model=Trade, status_code=status.HTTP_201_CREATED)
async def create_trade(
    trade_data: TradeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new trade"""
    service = TradeLogService(db)
    return service.create_trade(trade_data, current_user.id)

@router.get("/trades-simple")
async def get_trades_simple(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get trades in simple format"""
    from app.core.models import Trade as TradeModel, TradeAccount
    
    trades = db.query(TradeModel)\
        .join(TradeAccount)\
        .filter(TradeAccount.user_id == current_user.id)\
        .order_by(TradeModel.trade_date.desc())\
        .all()
    
    result = []
    for trade in trades:
        result.append({
            "id": str(trade.id),
            "symbol": trade.symbol,
            "side": trade.side,
            "quantity": float(trade.quantity),
            "price": float(trade.price),
            "trade_date": trade.trade_date.isoformat(),
            "commission": float(trade.commission),
            "currency": trade.currency,
            "pnl": 0,  # TODO: Calculate P&L
            "pnl_percent": 0  # TODO: Calculate P&L percentage
        })
    
    return result

@router.get("/trades/{trade_id}", response_model=TradeWithDetails)
async def get_trade(
    trade_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific trade"""
    from app.core.models import Trade as TradeModel, TradeAccount as TradeAccountModel
    from sqlalchemy.orm import joinedload
    from sqlalchemy import and_
    
    trade = db.query(TradeModel)\
        .join(TradeAccountModel)\
        .filter(
            and_(TradeModel.id == trade_id, TradeAccountModel.user_id == current_user.id)
        )\
        .options(joinedload(TradeModel.tags), joinedload(TradeModel.journal_entries))\
        .first()
    
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    
    return TradeWithDetails(
        **trade.__dict__,
        tags=[tag.tag for tag in trade.tags],
        journal_entries=trade.journal_entries
    )

@router.put("/trades/{trade_id}", response_model=Trade)
async def update_trade(
    trade_id: uuid.UUID,
    trade_data: TradeUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a trade"""
    service = TradeLogService(db)
    return service.update_trade(trade_id, trade_data, current_user.id)

@router.delete("/trades/{trade_id}")
async def delete_trade(
    trade_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a trade"""
    service = TradeLogService(db)
    service.delete_trade(trade_id, current_user.id)
    return {"message": "Trade deleted successfully"}

# CSV Import
@router.post("/import/csv", response_model=CSVImportResult)
async def import_trades_csv(
    account_id: uuid.UUID,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Import trades from IBKR CSV file"""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    service = TradeLogService(db)
    return service.import_from_csv(file, account_id, current_user.id)

# Analytics and Dashboard
@router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get dashboard statistics"""
    service = TradeLogService(db)
    return service.get_dashboard_stats(current_user.id)

@router.get("/test-trades")
async def test_trades_endpoint(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Test trades endpoint"""
    return {"message": "Test endpoint working", "user_id": str(current_user.id)}

@router.get("/analytics/performance", response_model=PerformanceAnalytics)
async def get_performance_analytics(
    account_id: Optional[uuid.UUID] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed performance analytics"""
    # This would be implemented with more complex analytics logic
    service = TradeLogService(db)
    stats = service.get_dashboard_stats(current_user.id)
    
    # Placeholder implementation - you'll want to expand this
    return PerformanceAnalytics(
        pnl_by_symbol=[],
        daily_pnl=[],
        monthly_summary=stats
    )

@router.get("/analytics/win-loss", response_model=WinLossAnalysis)
async def get_win_loss_analysis(
    time_period: str = Query(default="all", description="Time period: all, 1m, 3m, 6m, 1y, ytd"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive win/loss analysis breakdown by timeframe, symbol, and strategy"""
    service = TradeLogService(db)
    return service.get_win_loss_analysis(current_user.id, time_period)

# Tag Management
@router.post("/tags", response_model=TradeTag, status_code=status.HTTP_201_CREATED)
async def create_tag(
    tag_data: TradeTagCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new trade tag"""
    service = TradeLogService(db)
    return service.create_trade_tag(tag_data, current_user.id)

@router.get("/tags", response_model=List[TradeTag])
async def get_tags(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all tags for the current user"""
    service = TradeLogService(db)
    return service.get_user_tags(current_user.id)

@router.put("/tags/{tag_id}", response_model=TradeTag)
async def update_tag(
    tag_id: uuid.UUID,
    tag_data: TradeTagUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a trade tag"""
    from app.core.models import TradeTag as TradeTagModel
    
    tag = db.query(TradeTagModel).filter(
        TradeTagModel.id == tag_id,
        TradeTagModel.user_id == current_user.id
    ).first()
    
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    update_data = tag_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(tag, field, value)
    
    db.commit()
    db.refresh(tag)
    return tag

@router.delete("/tags/{tag_id}")
async def delete_tag(
    tag_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a trade tag"""
    from app.core.models import TradeTag as TradeTagModel
    
    tag = db.query(TradeTagModel).filter(
        TradeTagModel.id == tag_id,
        TradeTagModel.user_id == current_user.id
    ).first()
    
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    db.delete(tag)
    db.commit()
    return {"message": "Tag deleted successfully"}

# Journal Entries
@router.post("/journal", response_model=TradeJournalEntry, status_code=status.HTTP_201_CREATED)
async def create_journal_entry(
    entry_data: TradeJournalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a journal entry for a trade"""
    service = TradeLogService(db)
    return service.create_journal_entry(entry_data, current_user.id)

@router.get("/trades/{trade_id}/journal", response_model=List[TradeJournalEntry])
async def get_trade_journal_entries(
    trade_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all journal entries for a specific trade"""
    from app.core.models import TradeJournalEntry as JournalModel, Trade as TradeModel, TradeAccount as TradeAccountModel
    from sqlalchemy import and_
    
    entries = db.query(JournalModel)\
        .join(TradeModel)\
        .join(TradeAccountModel)\
        .filter(
            and_(
                JournalModel.trade_id == trade_id,
                TradeAccountModel.user_id == current_user.id
            )
        ).all()
    
    return entries

@router.put("/journal/{entry_id}", response_model=TradeJournalEntry)
async def update_journal_entry(
    entry_id: uuid.UUID,
    entry_data: TradeJournalUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a journal entry"""
    from app.core.models import TradeJournalEntry as JournalModel, Trade as TradeModel, TradeAccount as TradeAccountModel
    from sqlalchemy import and_
    
    entry = db.query(JournalModel)\
        .join(TradeModel)\
        .join(TradeAccountModel)\
        .filter(
            and_(
                JournalModel.id == entry_id,
                TradeAccountModel.user_id == current_user.id
            )
        ).first()
    
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    
    entry.entry_text = entry_data.entry_text
    db.commit()
    db.refresh(entry)
    return entry

@router.delete("/journal/{entry_id}")
async def delete_journal_entry(
    entry_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a journal entry"""
    from app.core.models import TradeJournalEntry as JournalModel, Trade as TradeModel, TradeAccount as TradeAccountModel
    from sqlalchemy import and_
    
    entry = db.query(JournalModel)\
        .join(TradeModel)\
        .join(TradeAccountModel)\
        .filter(
            and_(
                JournalModel.id == entry_id,
                TradeAccountModel.user_id == current_user.id
            )
        ).first()
    
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    
    db.delete(entry)
    db.commit()
    return {"message": "Journal entry deleted successfully"}