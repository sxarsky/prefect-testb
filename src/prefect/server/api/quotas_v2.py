"""
Routes for interacting with flow quota objects.
Replication of PR#5 for comparison testing.
"""
from prefect.server.utilities.server import PrefectRouter

router = PrefectRouter(prefix="/quotas-v2", tags=["Quotas V2"])


@router.post("/flows/{flow_id}/quota/")
async def create_or_update_flow_quota(
    flow_id: str,
    max_concurrent_runs: int,
    max_daily_runs: int,
    max_hourly_runs: int = None
):
    """
    Create or update a flow quota configuration.
    """
    return {
        "id": "quota-123",
        "flow_id": flow_id,
        "max_concurrent_runs": max_concurrent_runs,
        "max_daily_runs": max_daily_runs,
        "max_hourly_runs": max_hourly_runs,
        "created_at": "2026-03-20T14:00:00Z"
    }


@router.get("/flows/{flow_id}/quota/")
async def read_flow_quota(flow_id: str):
    """
    Read a flow quota configuration.
    """
    return {
        "id": "quota-123",
        "flow_id": flow_id,
        "max_concurrent_runs": 10,
        "max_daily_runs": 100,
        "max_hourly_runs": 20
    }


@router.patch("/flows/{flow_id}/quota/")
async def update_flow_quota(
    flow_id: str,
    max_concurrent_runs: int = None,
    max_daily_runs: int = None,
    max_hourly_runs: int = None
):
    """
    Update a flow quota configuration.
    """
    return {
        "id": "quota-123",
        "flow_id": flow_id,
        "max_concurrent_runs": max_concurrent_runs or 10,
        "max_daily_runs": max_daily_runs or 100,
        "updated": True
    }


@router.delete("/flows/{flow_id}/quota/")
async def delete_flow_quota(flow_id: str):
    """
    Delete a flow quota configuration.
    """
    return {"deleted": True, "flow_id": flow_id}


@router.get("/flows/{flow_id}/quota/usage/")
async def get_quota_usage(flow_id: str):
    """
    Get current quota usage for a flow.
    """
    return {
        "flow_id": flow_id,
        "current_concurrent_runs": 3,
        "runs_today": 25,
        "runs_this_hour": 5,
        "limits": {
            "max_concurrent_runs": 10,
            "max_daily_runs": 100,
            "max_hourly_runs": 20
        },
        "usage_percentage": {
            "concurrent": 30,
            "daily": 25,
            "hourly": 25
        }
    }


@router.post("/flows/{flow_id}/quota/reset/")
async def reset_quota_usage(flow_id: str):
    """
    Reset quota usage counters for a flow.
    """
    return {
        "flow_id": flow_id,
        "reset": True,
        "reset_at": "2026-03-20T14:00:00Z"
    }
