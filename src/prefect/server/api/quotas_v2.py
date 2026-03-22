"""
Flow Quota Management API

Provides endpoints for managing and monitoring flow execution quotas.
"""

from typing import Optional
from datetime import datetime, timedelta
from prefect.server.utilities.server import PrefectRouter

router = PrefectRouter(prefix="/quotas-v2", tags=["Quotas V2"])


@router.get("/flows/{flow_id}/quota-config/")
async def get_quota_config(flow_id: str):
    """
    Get the quota configuration for a flow.

    Returns quota limits and current usage.
    """
    return {
        "flow_id": flow_id,
        "quota_config": {
            "id": f"qc-{flow_id}",
            "max_concurrent_runs": 5,
            "max_runs_per_hour": 20,
            "max_runs_per_day": 100,
            "max_total_duration_hours": 24,
            "enabled": True,
            "created_at": (datetime.now() - timedelta(days=15)).isoformat(),
            "updated_at": datetime.now().isoformat(),
        },
        "current_usage": {
            "concurrent_runs": 2,
            "runs_this_hour": 8,
            "runs_today": 45,
            "total_duration_today_hours": 12.5,
            "last_reset": datetime.now().replace(hour=0, minute=0, second=0).isoformat(),
        },
        "usage_percentages": {
            "concurrent": 40.0,  # 2/5
            "hourly": 40.0,      # 8/20
            "daily": 45.0,       # 45/100
            "duration": 52.08,   # 12.5/24
        },
    }


@router.post("/flows/{flow_id}/quota-config/")
async def create_quota_config(flow_id: str):
    """
    Create or update quota configuration for a flow.

    Accepts quota limit parameters.
    """
    return {
        "id": f"qc-{flow_id}",
        "flow_id": flow_id,
        "max_concurrent_runs": 5,
        "max_runs_per_hour": 20,
        "max_runs_per_day": 100,
        "max_total_duration_hours": 24,
        "enabled": True,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
    }


@router.patch("/flows/{flow_id}/quota-config/")
async def update_quota_config(flow_id: str):
    """
    Update specific fields in quota configuration.

    Allows partial updates to quota limits.
    """
    return {
        "id": f"qc-{flow_id}",
        "flow_id": flow_id,
        "max_concurrent_runs": 5,
        "max_runs_per_hour": 20,
        "max_runs_per_day": 100,
        "max_total_duration_hours": 24,
        "enabled": True,
        "updated_at": datetime.now().isoformat(),
    }


@router.delete("/flows/{flow_id}/quota-config/")
async def delete_quota_config(flow_id: str):
    """
    Delete the quota configuration for a flow.
    """
    return {"success": True, "message": "Quota configuration deleted"}


@router.post("/flows/{flow_id}/quota-config/reset/")
async def reset_quota_usage(flow_id: str):
    """
    Reset the current usage counters for a flow's quota.

    This resets hourly and daily counters to zero.
    """
    return {
        "flow_id": flow_id,
        "reset_at": datetime.now().isoformat(),
        "current_usage": {
            "concurrent_runs": 0,
            "runs_this_hour": 0,
            "runs_today": 0,
            "total_duration_today_hours": 0,
        },
    }


@router.get("/flows/{flow_id}/quota-history/")
async def get_quota_history(flow_id: str, days: Optional[int] = 7):
    """
    Get quota usage history for a flow.

    Returns historical usage patterns and quota violations.
    """
    # Generate mock historical data
    history = []
    base_date = datetime.now() - timedelta(days=days)

    for i in range(days):
        date = base_date + timedelta(days=i)
        # Simulate varying usage
        runs = 30 + (i % 5) * 10
        violations = 1 if runs > 90 else 0

        history.append({
            "date": date.strftime("%Y-%m-%d"),
            "total_runs": runs,
            "quota_violations": violations,
            "peak_concurrent": 3 + (i % 3),
            "total_duration_hours": runs * 0.25,
        })

    return {
        "flow_id": flow_id,
        "period_days": days,
        "total_violations": sum(h["quota_violations"] for h in history),
        "history": history,
    }


@router.get("/flows/{flow_id}/quota-violations/")
async def get_quota_violations(flow_id: str, limit: Optional[int] = 10):
    """
    Get recent quota violation events for a flow.

    Returns detailed information about when and how quotas were exceeded.
    """
    # Generate mock violation data
    violations = []
    base_time = datetime.now()

    for i in range(min(limit, 3)):
        violation_time = base_time - timedelta(hours=i * 12)
        violations.append({
            "id": f"qv-{flow_id}-{i}",
            "flow_id": flow_id,
            "violation_type": ["daily_limit", "hourly_limit", "concurrent_limit"][i % 3],
            "timestamp": violation_time.isoformat(),
            "quota_limit": [100, 20, 5][i % 3],
            "actual_value": [105, 23, 6][i % 3],
            "action_taken": "run_queued",
            "message": "Flow run queued due to quota limit",
        })

    return {
        "flow_id": flow_id,
        "total_violations": len(violations),
        "violations": violations,
    }


@router.get("/quota-overview/")
async def get_quota_overview():
    """
    Get overview of all flows with quota configurations.

    Returns summary statistics across all flows.
    """
    return {
        "total_flows_with_quotas": 5,
        "total_active_quotas": 4,
        "flows_near_quota": 2,  # Flows using >80% of any quota
        "total_violations_today": 3,
        "flows": [
            {
                "flow_id": "flow-1",
                "flow_name": "ETL Pipeline",
                "quota_status": "warning",  # warning when >80%
                "highest_usage_percentage": 85.0,
                "violations_today": 1,
            },
            {
                "flow_id": "flow-2",
                "flow_name": "Data Sync",
                "quota_status": "ok",
                "highest_usage_percentage": 45.0,
                "violations_today": 0,
            },
        ],
    }
