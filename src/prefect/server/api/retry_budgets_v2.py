"""Flow Retry Budget Tracker API"""
from prefect.server.utilities.server import PrefectRouter

router = PrefectRouter(prefix="/retry-budgets-v2", tags=["Retry Budgets V2"])

@router.get("/flows/{flow_id}/retry-budget/")
async def get_retry_budget(flow_id: str):
    return {
        "flow_id": flow_id,
        "retry_budget": {
            "max_retries_per_task": 3,
            "max_retries_per_hour": 50,
            "max_retries_per_day": 200,
            "enabled": True,
        },
        "current_usage": {
            "retries_this_hour": 12,
            "retries_today": 45,
            "active_retrying_tasks": 3,
        },
        "usage_percentages": {
            "hourly": 24.0,
            "daily": 22.5,
        },
    }
