"""
Aegis Migration Factory — Main Application Entry Point
FastAPI app with CORS, Redis init, and route registration
"""

import logging
import traceback
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from core.config import settings
from core.redis_client import get_redis, close_redis
from core.signing import SigningService
from routers import jobs, stream

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("aegis")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    # Startup
    logger.info("=" * 60)
    logger.info("  AEGIS MIGRATION FACTORY v1.0")
    logger.info("=" * 60)

    # Initialize Redis
    redis = await get_redis()
    if redis:
        logger.info("✓ Redis connected")
    else:
        logger.warning("✗ Redis unavailable — running without state persistence")

    # Create artifacts directory
    artifacts_dir = Path(settings.ARTIFACTS_DIR)
    artifacts_dir.mkdir(parents=True, exist_ok=True)
    logger.info(f"✓ Artifacts directory: {artifacts_dir.resolve()}")

    # Generate Ed25519 keypair if missing
    try:
        signing = SigningService(settings.KEYS_DIR)
        logger.info(f"✓ Ed25519 keypair ready (fingerprint: {signing.get_fingerprint()[:20]}...)")
    except Exception as e:
        logger.warning(f"✗ Signing key setup failed: {e}")

    # Log configuration
    logger.info(f"  Claude Model: {settings.CLAUDE_MODEL}")
    logger.info(f"  Demo Mode: {settings.DEMO_MODE}")
    logger.info(f"  Max Upload: {settings.MAX_UPLOAD_SIZE_MB}MB")
    logger.info("=" * 60)
    logger.info("Aegis Backend v1.0 started")

    yield

    # Shutdown
    await close_redis()
    logger.info("Aegis Backend shutdown complete")


# Create FastAPI app
app = FastAPI(
    title="Aegis Migration Factory",
    description="AI-powered GCP to AWS migration pipeline",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware — allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)

# Include routers
app.include_router(jobs.router)
app.include_router(stream.router)


# Root endpoint
@app.get("/")
async def root():
    return {
        "name": "Aegis Migration Factory",
        "version": "1.0.0",
        "status": "ok",
    }


# Health check
@app.get("/api/health")
async def health_check():
    redis = await get_redis()
    return {
        "status": "ok",
        "redis": "connected" if redis else "disconnected",
        "version": "1.0.0",
    }


# Exception handlers
@app.exception_handler(422)
async def validation_error_handler(request: Request, exc):
    logger.warning(f"Validation error: {exc}")
    return JSONResponse(
        status_code=422,
        content={
            "error": "Validation Error",
            "detail": str(exc),
        },
    )


@app.exception_handler(500)
async def internal_error_handler(request: Request, exc):
    tb = traceback.format_exc()
    logger.error(f"Internal server error: {exc}\n{tb}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "detail": "An unexpected error occurred. Check server logs for details.",
        },
    )
