"""Flow Quota Management API"""
from prefect.server.utilities.server import PrefectRouter
from datetime import datetime, timedelta

router = PrefectRouter(prefix="/quotas-v2", tags=["Quotas V2"])

@router.get("/flows/{flow_id}/quota-config/")
async def get_quota_config(flow_id: str):
    return {
        "flow_id": flow_id,
        "quota_config": {
            "id": f"qc-{flow_id}",
            "max_concurrent_runs": 5,
            "max_runs_per_hour": 20,
            "max_runs_per_day": 100,
            "max_total_duration_hours": 24,
            "enabled": True,
        },
        "current_usage": {
            "concurrent_runs": 2,
            "runs_this_hour": 8,
            "runs_today": 45,
            "total_duration_today_hours": 12.5,
        },
        "usage_percentages": {
            "concurrent": 40.0,
            "hourly": 40.0,
            "daily": 45.0,
            "duration": 52.08,
        },
    }
