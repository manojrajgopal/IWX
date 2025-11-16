from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import logging
import uvicorn
from contextlib import asynccontextmanager
import time
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from database.mongodb import MongoDB
from database.mysql import create_tables
from utils.config import settings
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

# Import Alembic for migrations
from alembic.config import Config
from alembic import command

from routers import auth, products, orders, admin, websocket, ai, addresses, payments, wishlist, notifications, security, virtual_try_on
from middleware.logging import RequestLoggingMiddleware
from middleware.security import SecurityMiddleware
from services.user_service import UserService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info("Starting up IWX E-commerce Backend...")

    try:
        # Connect to databases first
        await MongoDB.connect_to_mongo()
        await create_tables()
        logger.info("Database connections established")

        # Run database migrations (optional - comment out if not needed)
        # logger.info("Running database migrations...")
        # alembic_cfg = Config("alembic.ini")
        # command.upgrade(alembic_cfg, "head")
        # logger.info("Database migrations completed")

        # Create default admin user
        await UserService.create_admin_user()

    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise

    yield

    # Shutdown
    logger.info("Shutting down...")
    await MongoDB.close_mongo_connection()

# Create FastAPI app
app = FastAPI(
    title="IWX E-commerce API",
    description="Professional e-commerce backend for InfiniteWaveX",
    version="1.0.0",
    lifespan=lifespan
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:3000", "http://127.0.0.1:5173", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.add_middleware(
    RequestLoggingMiddleware
)

app.add_middleware(
    SecurityMiddleware,
    rate_limit_requests=1000,  # 1000 requests per minute
    rate_limit_window=60
)

# Include routers
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(admin.router)
app.include_router(websocket.router)
app.include_router(ai.router)
app.include_router(addresses.router)
app.include_router(payments.router)
app.include_router(wishlist.router)
app.include_router(notifications.router)
app.include_router(security.router)
app.include_router(virtual_try_on.router)



# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "IWX E-commerce API",
        "version": "1.0.0"
    }

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to IWX E-commerce API",
        "docs": "/docs",
        "health": "/health"
    }

# Global exception handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions"""
    logger.warning(f"HTTP exception: {exc.status_code} - {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": exc.status_code,
                "message": exc.detail
            }
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors"""
    logger.warning(f"Validation error: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "error": {
                "code": 422,
                "message": "Validation error",
                "details": exc.errors()
            }
        }
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler for unhandled exceptions"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": 500,
                "message": "Internal server error. Please try again later."
            }
        }
    )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
        log_level="info",
        access_log=False  # Disable uvicorn's built-in access logging to show our custom logs
    )