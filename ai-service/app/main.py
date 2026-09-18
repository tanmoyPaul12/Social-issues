#!/usr/bin/env python3
"""
FastAPI Server Entry Point (`app/main.py`).

AI Service Backend for Societal Problem Multimodal Validation & University Capability Routing.
"""

import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.api.university_routing import router as university_routing_router
from app.api.unified_routing import router as unified_routing_router

load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Master Unified Multimodal Societal Intelligence & University Routing API",
    description="Unified AI Backend featuring Multimodal Problem Validation, 10-Domain Classification, Severity Prioritization, Spatial Deduplication, Supabase PGVector Retrieval, 6-Factor Deterministic University Capability Scoring, and Faculty Expert Matching.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for Frontend/Web Integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(unified_routing_router, prefix="/api/v1")
app.include_router(university_routing_router, prefix="/api/v1")


@app.get("/")
async def root():
    return {
        "message": "Master Unified Multimodal Societal Intelligence & University Routing AI Service is active.",
        "docs": "/docs",
        "health": "/api/v1/unified-routing/health",
        "unified_analyze_endpoint": "/api/v1/unified-routing/analyze",
        "university_routing_endpoint": "/api/v1/university-routing/route"
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
