"""
Validation status API endpoints for SKYR-3650 testing.
This module provides endpoints to check validation status.
"""

from fastapi import APIRouter, status
from prefect.server.utilities.server import PrefectRouter

router = PrefectRouter(prefix="/validation-status", tags=["Validation"])


@router.get("/health")
async def get_validation_health():
    """
    Get validation health status.

    Returns validation health check for SKYR-3650 testing.
    """
    return {
        "status": "healthy",
        "validation": "SKYR-3650",
        "description": "Self-trigger detection validation endpoint"
    }


@router.get("/check")
async def check_validation_status():
    """
    Check validation status.

    Returns current validation status for testing purposes.
    """
    return {
        "validated": True,
        "test_case": "SKYR-3650",
        "scenario": "Multiple PRs on same branch"
    }
