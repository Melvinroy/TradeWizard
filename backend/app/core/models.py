from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Boolean, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    subscription_tier = Column(String(50), default="free")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    trade_accounts = relationship("TradeAccount", back_populates="user", cascade="all, delete-orphan")

class TradeAccount(Base):
    __tablename__ = "trade_accounts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    account_name = Column(String(255), nullable=False)
    broker = Column(String(100), default="IBKR")
    account_number = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="trade_accounts")
    trades = relationship("Trade", back_populates="account", cascade="all, delete-orphan")

class Trade(Base):
    __tablename__ = "trades"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    account_id = Column(UUID(as_uuid=True), ForeignKey("trade_accounts.id"), nullable=False)
    symbol = Column(String(20), nullable=False, index=True)
    quantity = Column(Numeric(15, 8), nullable=False)
    price = Column(Numeric(15, 4), nullable=False)
    side = Column(String(10), nullable=False)  # BUY or SELL
    trade_date = Column(DateTime(timezone=True), nullable=False, index=True)
    commission = Column(Numeric(10, 4), default=0)
    currency = Column(String(10), default="USD")
    exchange = Column(String(50))
    order_type = Column(String(50))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    account = relationship("TradeAccount", back_populates="trades")
    tags = relationship("TradeTagAssociation", back_populates="trade", cascade="all, delete-orphan")
    journal_entries = relationship("TradeJournalEntry", back_populates="trade", cascade="all, delete-orphan")

class TradeTag(Base):
    __tablename__ = "trade_tags"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    color = Column(String(7), default="#3B82F6")  # Hex color
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    trades = relationship("TradeTagAssociation", back_populates="tag", cascade="all, delete-orphan")

class TradeTagAssociation(Base):
    __tablename__ = "trade_tag_associations"
    
    trade_id = Column(UUID(as_uuid=True), ForeignKey("trades.id"), primary_key=True)
    tag_id = Column(UUID(as_uuid=True), ForeignKey("trade_tags.id"), primary_key=True)
    
    # Relationships
    trade = relationship("Trade", back_populates="tags")
    tag = relationship("TradeTag", back_populates="trades")

class TradeJournalEntry(Base):
    __tablename__ = "trade_journal_entries"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trade_id = Column(UUID(as_uuid=True), ForeignKey("trades.id"), nullable=False)
    entry_text = Column(Text, nullable=False)
    entry_date = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    trade = relationship("Trade", back_populates="journal_entries")