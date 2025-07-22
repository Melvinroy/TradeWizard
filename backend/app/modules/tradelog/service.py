from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, desc, func
from typing import List, Optional, Dict, Tuple
from datetime import datetime, timedelta
from decimal import Decimal
from collections import defaultdict
import uuid
import csv
import io
from fastapi import UploadFile, HTTPException

from app.core.models import Trade, TradeAccount, TradeTag, TradeJournalEntry, User, TradeTagAssociation
from app.modules.tradelog.schemas import (
    TradeCreate, TradeUpdate, TradeFilters, DashboardStats,
    TradeTagCreate, TradeJournalCreate, CSVImportResult,
    WinLossBreakdown, WinLossByTimeframe, WinLossBySymbol, 
    WinLossByStrategy, WinLossAnalysis
)


class TradeLogService:
    def __init__(self, db: Session):
        self.db = db

    def create_trade(self, trade_data: TradeCreate, user_id: uuid.UUID) -> Trade:
        """Create a new trade"""
        # Verify account belongs to user
        account = self.db.query(TradeAccount).filter(
            and_(TradeAccount.id == trade_data.account_id, TradeAccount.user_id == user_id)
        ).first()
        
        if not account:
            raise HTTPException(status_code=404, detail="Trade account not found")
        
        trade = Trade(**trade_data.dict())
        self.db.add(trade)
        self.db.commit()
        self.db.refresh(trade)
        return trade

    def get_trades(
        self, 
        user_id: uuid.UUID, 
        filters: TradeFilters = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Trade]:
        """Get trades with filtering and pagination"""
        query = self.db.query(Trade).join(TradeAccount).filter(
            TradeAccount.user_id == user_id
        )
        
        if filters:
            if filters.account_id:
                query = query.filter(Trade.account_id == filters.account_id)
            if filters.symbol:
                query = query.filter(Trade.symbol.ilike(f"%{filters.symbol}%"))
            if filters.side:
                query = query.filter(Trade.side == filters.side)
            if filters.start_date:
                query = query.filter(Trade.trade_date >= filters.start_date)
            if filters.end_date:
                query = query.filter(Trade.trade_date <= filters.end_date)
        
        return query.order_by(desc(Trade.trade_date))\
                   .offset(skip)\
                   .limit(limit)\
                   .all()

    def update_trade(self, trade_id: uuid.UUID, trade_data: TradeUpdate, user_id: uuid.UUID) -> Trade:
        """Update an existing trade"""
        trade = self.db.query(Trade).join(TradeAccount).filter(
            and_(Trade.id == trade_id, TradeAccount.user_id == user_id)
        ).first()
        
        if not trade:
            raise HTTPException(status_code=404, detail="Trade not found")
        
        update_data = trade_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(trade, field, value)
        
        self.db.commit()
        self.db.refresh(trade)
        return trade

    def delete_trade(self, trade_id: uuid.UUID, user_id: uuid.UUID):
        """Delete a trade"""
        trade = self.db.query(Trade).join(TradeAccount).filter(
            and_(Trade.id == trade_id, TradeAccount.user_id == user_id)
        ).first()
        
        if not trade:
            raise HTTPException(status_code=404, detail="Trade not found")
        
        self.db.delete(trade)
        self.db.commit()

    def get_dashboard_stats(self, user_id: uuid.UUID) -> DashboardStats:
        """Calculate dashboard statistics"""
        trades = self.db.query(Trade).join(TradeAccount).filter(
            TradeAccount.user_id == user_id
        ).all()
        
        if not trades:
            return DashboardStats(
                total_trades=0,
                total_pnl=Decimal('0'),
                win_rate=0.0,
                total_commission=Decimal('0')
            )
        
        # Calculate P&L for each trade (simplified - assumes all trades are closed)
        total_pnl = Decimal('0')
        winning_trades = 0
        total_commission = sum(trade.commission for trade in trades)
        
        # Group trades by symbol to calculate P&L
        positions = {}
        for trade in trades:
            if trade.symbol not in positions:
                positions[trade.symbol] = []
            positions[trade.symbol].append(trade)
        
        # Calculate P&L for each position
        for symbol, symbol_trades in positions.items():
            symbol_trades.sort(key=lambda x: x.trade_date)
            position = Decimal('0')
            avg_price = Decimal('0')
            
            for trade in symbol_trades:
                if trade.side == 'BUY':
                    if position == 0:
                        avg_price = trade.price
                    else:
                        avg_price = ((avg_price * position) + (trade.price * trade.quantity)) / (position + trade.quantity)
                    position += trade.quantity
                else:  # SELL
                    if position > 0:
                        pnl = (trade.price - avg_price) * min(trade.quantity, position)
                        total_pnl += pnl
                        if pnl > 0:
                            winning_trades += 1
                        position -= trade.quantity
        
        win_rate = (winning_trades / len(trades)) * 100 if trades else 0
        
        return DashboardStats(
            total_trades=len(trades),
            total_pnl=total_pnl,
            win_rate=round(win_rate, 2),
            total_commission=total_commission,
            best_trade=max([t.price * t.quantity for t in trades], default=Decimal('0')),
            worst_trade=min([t.price * t.quantity for t in trades], default=Decimal('0'))
        )

    def import_from_csv(self, file: UploadFile, account_id: uuid.UUID, user_id: uuid.UUID) -> CSVImportResult:
        """Import trades from IBKR CSV file"""
        # Verify account ownership
        account = self.db.query(TradeAccount).filter(
            and_(TradeAccount.id == account_id, TradeAccount.user_id == user_id)
        ).first()
        
        if not account:
            raise HTTPException(status_code=404, detail="Trade account not found")
        
        content = file.file.read()
        csv_content = content.decode('utf-8')
        
        # Parse IBKR CSV which has different sections
        lines = csv_content.strip().split('\n')
        trades_section_started = False
        trade_lines = []
        
        for line in lines:
            if line.startswith('Trades,Header,'):
                trades_section_started = True
                trade_lines.append(line)
            elif trades_section_started and line.startswith('Trades,Data,'):
                trade_lines.append(line)
            elif trades_section_started and not line.startswith('Trades,'):
                # End of trades section
                break
        
        if not trade_lines:
            return CSVImportResult(
                imported_count=0,
                error_count=1,
                errors=["No trades section found in CSV file"]
            )
        
        # Process the trades section
        trades_csv = '\n'.join(trade_lines)
        reader = csv.DictReader(io.StringIO(trades_csv))
        imported_trades = []
        errors = []
        
        for row_num, row in enumerate(reader, start=1):
            try:
                # Map IBKR CSV columns to our trade model
                trade_data = self._parse_ibkr_csv_row(row)
                trade_data['account_id'] = account_id
                
                trade = Trade(**trade_data)
                self.db.add(trade)
                imported_trades.append(trade)
                
            except Exception as e:
                errors.append(f"Row {row_num}: {str(e)}")
        
        if imported_trades:
            self.db.commit()
        
        return CSVImportResult(
            imported_count=len(imported_trades),
            error_count=len(errors),
            errors=errors
        )

    def _parse_ibkr_csv_row(self, row: dict) -> dict:
        """Parse IBKR CSV row into trade data"""
        try:
            # Skip non-trade rows - check the Header column for "Data"
            if row.get('Header') != 'Data':
                raise ValueError("Not a trade data row")
            
            # Skip non-stock trades
            if row.get('Asset Category') != 'Stocks':
                raise ValueError("Not a stock trade")
            
            quantity = Decimal(str(row.get('Quantity', '0')))
            price = Decimal(str(row.get('T. Price', '0')))
            commission = abs(Decimal(str(row.get('Comm/Fee', '0'))))
            
            # Parse date/time format: "2025-04-09;14:18:37"
            date_time_str = row.get('Date/Time', '')
            trade_date = datetime.strptime(date_time_str, '%Y-%m-%d;%H:%M:%S')
            
            return {
                'symbol': row.get('Symbol', '').strip(),
                'quantity': abs(quantity),  # Store as positive, use side for direction
                'price': price,
                'side': 'BUY' if quantity > 0 else 'SELL',
                'trade_date': trade_date,
                'commission': commission,
                'currency': row.get('Currency', 'USD'),
                'exchange': '',  # Not in IBKR CSV
                'order_type': 'MKT'  # Default to market order
            }
        except Exception as e:
            raise ValueError(f"Invalid data in CSV row: {e}")

    def create_trade_tag(self, tag_data: TradeTagCreate, user_id: uuid.UUID) -> TradeTag:
        """Create a new trade tag"""
        tag = TradeTag(**tag_data.dict(), user_id=user_id)
        self.db.add(tag)
        self.db.commit()
        self.db.refresh(tag)
        return tag

    def get_user_tags(self, user_id: uuid.UUID) -> List[TradeTag]:
        """Get all tags for a user"""
        return self.db.query(TradeTag).filter(TradeTag.user_id == user_id).all()

    def create_journal_entry(self, entry_data: TradeJournalCreate, user_id: uuid.UUID) -> TradeJournalEntry:
        """Create a journal entry for a trade"""
        # Verify trade belongs to user
        trade = self.db.query(Trade).join(TradeAccount).filter(
            and_(Trade.id == entry_data.trade_id, TradeAccount.user_id == user_id)
        ).first()
        
        if not trade:
            raise HTTPException(status_code=404, detail="Trade not found")
        
        entry = TradeJournalEntry(**entry_data.dict())
        self.db.add(entry)
        self.db.commit()
        self.db.refresh(entry)
        return entry

    def get_win_loss_analysis(self, user_id: uuid.UUID, time_period: str = "all") -> WinLossAnalysis:
        """Calculate comprehensive win/loss analysis"""
        try:
            # Get trades based on time period
            query = self.db.query(Trade).join(TradeAccount).filter(
                TradeAccount.user_id == user_id
            )
            
            # Apply time filter
            if time_period != "all":
                cutoff_date = self._get_cutoff_date(time_period)
                query = query.filter(Trade.trade_date >= cutoff_date)
            
            trades = query.order_by(Trade.trade_date).all()
            
            if not trades:
                return WinLossAnalysis(
                    overall=self._empty_breakdown(),
                    by_timeframe=[],
                    by_symbol=[],
                    by_strategy=[],
                    time_period=time_period
                )
            
            # Calculate P&L for each closed position
            positions_data = self._calculate_positions_pnl(trades)
            
            # Overall analysis
            overall = self._calculate_breakdown(positions_data)
            
            # By timeframe analysis
            by_timeframe = self._analyze_by_timeframe(positions_data)
            
            # By symbol analysis
            by_symbol = self._analyze_by_symbol(positions_data)
            
            # By strategy analysis (based on tags)
            by_strategy = self._analyze_by_strategy(positions_data)
            
            return WinLossAnalysis(
                overall=overall,
                by_timeframe=by_timeframe,
                by_symbol=by_symbol,
                by_strategy=by_strategy,
                time_period=time_period
            )
        
        except Exception as e:
            # For debugging - let's return a simple analysis
            print(f"Win/Loss Analysis Error: {str(e)}")
            return WinLossAnalysis(
                overall=self._empty_breakdown(),
                by_timeframe=[],
                by_symbol=[],
                by_strategy=[],
                time_period=time_period
            )
    
    def _get_cutoff_date(self, time_period: str) -> datetime:
        """Get cutoff date based on time period"""
        now = datetime.now()
        
        if time_period == "1m":
            return now - timedelta(days=30)
        elif time_period == "3m":
            return now - timedelta(days=90)
        elif time_period == "6m":
            return now - timedelta(days=180)
        elif time_period == "1y":
            return now - timedelta(days=365)
        elif time_period == "ytd":
            return datetime(now.year, 1, 1)
        else:
            return datetime.min
    
    def _calculate_positions_pnl(self, trades: List[Trade]) -> List[Dict]:
        """Calculate P&L for closed positions"""
        positions = defaultdict(list)
        
        # Group trades by symbol
        for trade in trades:
            positions[trade.symbol].append(trade)
        
        # Calculate P&L for each position
        position_results = []
        
        for symbol, symbol_trades in positions.items():
            symbol_trades.sort(key=lambda x: x.trade_date)
            
            position_qty = Decimal('0')
            avg_price = Decimal('0')
            
            for i, trade in enumerate(symbol_trades):
                if trade.side == 'BUY':
                    if position_qty == 0:
                        avg_price = trade.price
                    else:
                        avg_price = ((avg_price * position_qty) + (trade.price * trade.quantity)) / (position_qty + trade.quantity)
                    position_qty += trade.quantity
                    
                else:  # SELL
                    if position_qty > 0:
                        # Calculate P&L for this closing trade
                        close_qty = min(trade.quantity, position_qty)
                        pnl = (trade.price - avg_price) * close_qty - trade.commission
                        
                        # Find corresponding opening trades for strategy tags
                        opening_trades = [t for t in symbol_trades[:i] if t.side == 'BUY']
                        tags = []
                        if opening_trades:
                            # Get tags from the most recent opening trade
                            last_open = opening_trades[-1]
                            tag_assocs = self.db.query(TradeTagAssociation).filter(
                                TradeTagAssociation.trade_id == last_open.id
                            ).all()
                            tags = []
                            for ta in tag_assocs:
                                tag = self.db.query(TradeTag).filter(TradeTag.id == ta.tag_id).first()
                                if tag:
                                    tags.append(tag.name)
                        
                        position_results.append({
                            'symbol': symbol,
                            'pnl': pnl,
                            'close_date': trade.trade_date,
                            'quantity': close_qty,
                            'entry_price': avg_price,
                            'exit_price': trade.price,
                            'tags': tags,
                            'hold_time': trade.trade_date - opening_trades[-1].trade_date if opening_trades else timedelta(0)
                        })
                        
                        position_qty -= close_qty
                        
                        # If position is fully closed, reset
                        if position_qty == 0:
                            avg_price = Decimal('0')
        
        return position_results
    
    def _calculate_breakdown(self, positions: List[Dict]) -> WinLossBreakdown:
        """Calculate win/loss breakdown from positions"""
        if not positions:
            return self._empty_breakdown()
        
        wins = [p for p in positions if p['pnl'] > 0]
        losses = [p for p in positions if p['pnl'] < 0]
        breakeven = [p for p in positions if p['pnl'] == 0]
        
        total_wins = sum(p['pnl'] for p in wins) if wins else Decimal('0')
        total_losses = abs(sum(p['pnl'] for p in losses)) if losses else Decimal('0')
        
        win_rate = (len(wins) / len(positions) * 100) if positions else 0
        avg_win = (total_wins / len(wins)) if wins else Decimal('0')
        avg_loss = (total_losses / len(losses)) if losses else Decimal('0')
        profit_factor = float(total_wins / total_losses) if total_losses > 0 else float('inf') if total_wins > 0 else 0.0
        
        # Expectancy = (Win% * Avg Win) - (Loss% * Avg Loss)
        win_pct = len(wins) / len(positions) if positions else 0
        loss_pct = len(losses) / len(positions) if positions else 0
        expectancy = (win_pct * avg_win) - (loss_pct * avg_loss)
        
        return WinLossBreakdown(
            wins=len(wins),
            losses=len(losses),
            breakeven=len(breakeven),
            win_rate=round(win_rate, 2),
            avg_win=avg_win,
            avg_loss=avg_loss,
            profit_factor=round(profit_factor, 2),
            expectancy=expectancy
        )
    
    def _empty_breakdown(self) -> WinLossBreakdown:
        """Return empty breakdown"""
        return WinLossBreakdown(
            wins=0,
            losses=0,
            breakeven=0,
            win_rate=0.0,
            avg_win=Decimal('0'),
            avg_loss=Decimal('0'),
            profit_factor=0.0,
            expectancy=Decimal('0')
        )
    
    def _analyze_by_timeframe(self, positions: List[Dict]) -> List[WinLossByTimeframe]:
        """Analyze win/loss by different timeframes"""
        if not positions:
            return []
        
        # Group by month
        monthly_groups = defaultdict(list)
        for pos in positions:
            month_key = pos['close_date'].strftime('%Y-%m')
            monthly_groups[month_key].append(pos)
        
        results = []
        for period, period_positions in sorted(monthly_groups.items()):
            breakdown = self._calculate_breakdown(period_positions)
            total_pnl = sum(p['pnl'] for p in period_positions)
            
            results.append(WinLossByTimeframe(
                period=period,
                timeframe_type="monthly",
                breakdown=breakdown,
                total_pnl=total_pnl,
                trade_count=len(period_positions)
            ))
        
        return results
    
    def _analyze_by_symbol(self, positions: List[Dict]) -> List[WinLossBySymbol]:
        """Analyze win/loss by symbol"""
        if not positions:
            return []
        
        symbol_groups = defaultdict(list)
        for pos in positions:
            symbol_groups[pos['symbol']].append(pos)
        
        results = []
        for symbol, symbol_positions in symbol_groups.items():
            breakdown = self._calculate_breakdown(symbol_positions)
            total_pnl = sum(p['pnl'] for p in symbol_positions)
            
            # Calculate average hold time
            hold_times = [p['hold_time'].total_seconds() / 3600 for p in symbol_positions if p['hold_time']]
            avg_hold_time = sum(hold_times) / len(hold_times) if hold_times else None
            
            results.append(WinLossBySymbol(
                symbol=symbol,
                breakdown=breakdown,
                total_pnl=total_pnl,
                trade_count=len(symbol_positions),
                avg_hold_time_hours=avg_hold_time
            ))
        
        # Sort by total P&L descending
        results.sort(key=lambda x: x.total_pnl, reverse=True)
        return results
    
    def _analyze_by_strategy(self, positions: List[Dict]) -> List[WinLossByStrategy]:
        """Analyze win/loss by strategy (tags)"""
        if not positions:
            return []
        
        strategy_groups = defaultdict(list)
        
        # Group by tags (strategies)
        for pos in positions:
            if pos['tags']:
                for tag in pos['tags']:
                    strategy_groups[tag].append(pos)
            else:
                strategy_groups['No Strategy'].append(pos)
        
        results = []
        for strategy, strategy_positions in strategy_groups.items():
            breakdown = self._calculate_breakdown(strategy_positions)
            total_pnl = sum(p['pnl'] for p in strategy_positions)
            
            results.append(WinLossByStrategy(
                strategy=strategy,
                breakdown=breakdown,
                total_pnl=total_pnl,
                trade_count=len(strategy_positions)
            ))
        
        # Sort by total P&L descending
        results.sort(key=lambda x: x.total_pnl, reverse=True)
        return results