from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.modules.auth.router import router as auth_router
from app.modules.tradelog.router import router as tradelog_router

app = FastAPI(
    title="TradeWizard API",
    description="Trading journal and analytics platform",
    version="1.0.0"
)

# CORS middleware - must be added before routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,  # Changed to False when using wildcard
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/auth", tags=["authentication"])
app.include_router(tradelog_router, prefix="/api/v1", tags=["tradelog"])

@app.get("/")
async def root():
    return {"message": "TradeWizard API"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}