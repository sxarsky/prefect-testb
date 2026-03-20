"""
Flow run quota limits endpoints.
"""
from prefect.server.utilities.server import PrefectRouter

router = PrefectRouter(prefix="/flow-quotas", tags=["Flow Quotas"])


@router.get("/limits")
async def get_quota_limits():
    """Get quota limits for flows."""
    return {
        "limits": [
            {"flow_id": "flow-1", "max_concurrent_runs": 10, "max_daily_runs": 100},
            {"flow_id": "flow-2", "max_concurrent_runs": 5, "max_daily_runs": 50}
        ]
    }


@router.post("/limits")
async def set_quota_limit(flow_id: str, max_concurrent_runs: int, max_daily_runs: int):
    """Set quota limits for a flow."""
    return {
        "flow_id": flow_id,
        "max_concurrent_runs": max_concurrent_runs,
        "max_daily_runs": max_daily_runs,
        "status": "active"
    }


@router.get("/usage/{flow_id}")
async def get_quota_usage(flow_id: str):
    """Get current quota usage."""
    return {
        "flow_id": flow_id,
        "current_concurrent_runs": 3,
        "runs_today": 25,
        "limit_reached": False
    }
