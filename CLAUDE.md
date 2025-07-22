# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TradeWizard is a professional trading journal and analytics platform designed to help traders track and analyze their trading performance. It consists of a FastAPI backend with React/TypeScript frontend.

### Architecture

- **Backend**: Python FastAPI with SQLAlchemy ORM, SQLite database, JWT authentication
- **Frontend**: React 19 + TypeScript + Vite, Tailwind CSS, React Router, Axios for API calls
- **Database**: SQLite with UUID primary keys, PostgreSQL compatibility designed in
- **Authentication**: JWT tokens with password hashing using passlib/bcrypt

### Core Models

- **User**: Authentication and subscription management
- **TradeAccount**: User's trading accounts (IBKR by default)
- **Trade**: Individual trades with symbol, quantity, price, side (BUY/SELL), timestamps
- **TradeTag**: User-defined tags for categorizing trades
- **TradeJournalEntry**: Text notes attached to trades
- **TradeTagAssociation**: Many-to-many relationship between trades and tags

### Key Features

- CSV import from Interactive Brokers (IBKR) trade logs
- Dashboard with P&L analytics, charts, and performance metrics
- Trade filtering, sorting, and search capabilities
- Manual trade entry and editing
- Tag-based trade categorization
- Journal entries for trade notes
- Export functionality (CSV/Excel)

## Development Commands

### Backend (from /backend directory)
```bash
# Install dependencies
pip install -r requirements.txt

# Initialize database
python init_db.py

# Run development server
uvicorn app.main:app --reload --host localhost --port 8002

# Run tests
pytest

# Database migrations
alembic upgrade head
```

### Frontend (from /frontend directory)
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

## API Structure

Base URL: `http://localhost:8002`

### Key Endpoints
- `/auth/login` - JWT authentication
- `/api/v1/trades` - CRUD operations for trades
- `/api/v1/trades-simple` - Simplified trade listing
- `/api/v1/import/csv` - CSV import with account_id parameter
- `/api/v1/dashboard/stats` - Dashboard statistics
- `/api/v1/accounts` - Trading account management

## Database Schema

The application uses SQLAlchemy models with UUID primary keys. Key relationships:
- Users have multiple TradeAccounts
- TradeAccounts have multiple Trades
- Trades can have multiple Tags (many-to-many)
- Trades can have multiple JournalEntries

## Authentication Flow

1. Demo credentials: `demo@tradewizard.com` / `demo123`
2. Login returns JWT access token stored in localStorage
3. All API requests include `Authorization: Bearer <token>` header
4. Frontend uses SimpleAuthContext for state management

## File Upload & Drag-Drop

The application supports drag-and-drop CSV file uploads with validation utilities in `frontend/src/utils/dragDrop.ts`. CSV files are processed on the backend and imported into the database.

## Development Phases & Roadmap

### Phase 1A: Core Import & Data Foundation (CURRENT FOCUS)
**Priority**: Fix IBKR CSV import functionality
- IBKR CSV parser needs to handle multi-section format correctly
- Implement proper data validation and cleaning
- Add duplicate trade detection
- Support multiple IBKR export formats

**Success Metrics**:
- 95%+ successful IBKR CSV imports
- Zero data corruption issues
- <2 second import time for 1000 trades

### Completed Features ✅
- Basic FastAPI backend with SQLAlchemy models
- JWT authentication system
- React frontend with TypeScript
- Basic trade CRUD operations
- CSV import endpoint (needs fixing)
- Dashboard with basic stats
- Manual trade entry
- Trade filtering and sorting
- Export functionality (CSV/Excel fallback)

### Next Development Priorities
1. **Fix IBKR CSV Parser** - Handle multi-section CSV format
2. **Implement P&L Calculations** - Replace stubbed calculations in trades-simple endpoint
3. **Add Trade Tagging System** - User-defined tags with color coding
4. **Enhance Analytics** - Win rate, daily/weekly/monthly P&L charts
5. **Add Trade Journaling** - Notes and observations per trade
6. **Calendar View** - Visual P&L tracking by date

### Planned Features (Phase 1B-1F)
- Advanced search and filtering
- Trade detail modal with editing
- Performance analytics by symbol/strategy
- Tag-based trade organization
- Daily/monthly P&L calendar view
- Mobile-responsive design improvements

### Long-term Roadmap (Phase 2+)
- Multi-broker support (TD Ameritrade, Schwab, Robinhood)
- Advanced analytics (Sharpe ratio, max drawdown, benchmarking)
- Strategy backtesting capabilities
- Community features and trade sharing

## Current Issues & TODOs

**High Priority**:
- Fix IBKR CSV import to handle multi-section format correctly
- Implement proper P&L calculations (currently stubbed as 0)
- Remove hardcoded account IDs in frontend code

**Medium Priority**:
- Excel export falls back to CSV if endpoint unavailable
- Add comprehensive data validation layer
- Implement caching for performance optimization

**Technical Debt**:
- Database uses SQLite but models are PostgreSQL-compatible
- Some API endpoints need error handling improvements
- Frontend needs loading states and better UX polish

## Environment Configuration

Backend uses pydantic-settings for configuration in `app/core/config.py`. Default SQLite database location: `./tradewizard.db`