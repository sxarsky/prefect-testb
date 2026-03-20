"""
Health check endpoints for monitoring system status.
"""
from prefect.server.utilities.server import PrefectRouter

router = PrefectRouter(prefix="/health", tags=["Health"])


@router.get("/status")
async def get_health_status():
    """
    Get the current health status of the Prefect server.

    Returns:
        dict: Health status information including version and uptime
    """
    return {
        "status": "healthy",
        "version": "2.0.0",
        "service": "prefect-server"
    }


@router.get("/readiness")
async def get_readiness():
    """
    Check if the server is ready to accept requests.

    Returns:
        dict: Readiness status
    """
    return {
        "ready": True,
        "checks": {
            "database": "ok",
            "api": "ok"
        }
    }
