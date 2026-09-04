"""
Health Routes: Exposes health check endpoints for AWS ALB / Target Group health checks.
"""
from fastapi import APIRouter
from app.utils.device import get_optimal_device

router = APIRouter(tags=["Health"])

@router.get("/health")
def health_check():
    """Health check endpoint for AWS Load Balancer probe."""
    return {
        "status": "HEALTHY",
        "service": "Societal Innovation AI Microservice",
        "device": get_optimal_device()
    }
