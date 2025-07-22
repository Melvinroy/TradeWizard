#!/usr/bin/env python3

"""
Database initialization script for TradeWizard
Creates all tables and optionally seeds with sample data
"""

import os
import sys
from sqlalchemy import create_engine
from app.core.database import Base, get_db
from app.core.config import settings
from app.core.models import User, TradeAccount, Trade, TradeTag, TradeJournalEntry, TradeTagAssociation

def init_database():
    """Initialize the database with all tables"""
    print("Initializing TradeWizard database...")
    
    # Create engine
    engine = create_engine(settings.DATABASE_URL)
    
    # Create all tables
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    
    print("Database tables created successfully!")
    print(f"Database location: {settings.DATABASE_URL}")
    
    # List created tables
    print("\nCreated tables:")
    for table in Base.metadata.tables.keys():
        print(f"  - {table}")

def create_sample_data():
    """Create some sample data for testing"""
    from sqlalchemy.orm import sessionmaker
    from app.core.security import get_password_hash
    from datetime import datetime, timezone
    from decimal import Decimal
    import uuid
    
    print("\nCreating sample data...")
    
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Create sample user
        sample_user = User(
            email="demo@tradewizard.com",
            password_hash=get_password_hash("demo123"),
            subscription_tier="free"
        )
        db.add(sample_user)
        db.commit()
        db.refresh(sample_user)
        
        # Create sample trade account
        sample_account = TradeAccount(
            user_id=sample_user.id,
            account_name="Demo IBKR Account",
            broker="IBKR",
            account_number="U12345678"
        )
        db.add(sample_account)
        db.commit()
        db.refresh(sample_account)
        
        # Create sample trades
        sample_trades = [
            {
                "account_id": sample_account.id,
                "symbol": "AAPL",
                "quantity": Decimal("100"),
                "price": Decimal("150.50"),
                "side": "BUY",
                "trade_date": datetime.now(timezone.utc),
                "commission": Decimal("1.00"),
                "currency": "USD",
                "exchange": "NASDAQ"
            },
            {
                "account_id": sample_account.id,
                "symbol": "AAPL",
                "quantity": Decimal("50"),
                "price": Decimal("155.25"),
                "side": "SELL",
                "trade_date": datetime.now(timezone.utc),
                "commission": Decimal("1.00"),
                "currency": "USD",
                "exchange": "NASDAQ"
            },
            {
                "account_id": sample_account.id,
                "symbol": "TSLA",
                "quantity": Decimal("25"),
                "price": Decimal("220.75"),
                "side": "BUY",
                "trade_date": datetime.now(timezone.utc),
                "commission": Decimal("1.00"),
                "currency": "USD",
                "exchange": "NASDAQ"
            }
        ]
        
        created_trades = []
        for trade_data in sample_trades:
            trade = Trade(**trade_data)
            db.add(trade)
            created_trades.append(trade)
        
        db.commit()
        
        # Create sample tags
        sample_tags = [
            {"user_id": sample_user.id, "name": "Tech Stock", "color": "#3B82F6"},
            {"user_id": sample_user.id, "name": "Swing Trade", "color": "#10B981"},
            {"user_id": sample_user.id, "name": "Day Trade", "color": "#F59E0B"}
        ]
        
        for tag_data in sample_tags:
            tag = TradeTag(**tag_data)
            db.add(tag)
        
        db.commit()
        
        print("Sample data created successfully!")
        print(f"  - Demo user: demo@tradewizard.com (password: demo123)")
        print(f"  - {len(sample_trades)} sample trades")
        print(f"  - {len(sample_tags)} sample tags")
        
    except Exception as e:
        print(f"Error creating sample data: {e}")
        db.rollback()
    finally:
        db.close()

def main():
    """Main function"""
    if len(sys.argv) > 1 and sys.argv[1] == "--with-sample-data":
        init_database()
        create_sample_data()
    else:
        init_database()
        print("\nTo create sample data, run: python init_db.py --with-sample-data")

if __name__ == "__main__":
    main()