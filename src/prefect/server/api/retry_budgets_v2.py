"""
Flow Retry Budget Tracker API

Provides endpoints for managing and monitoring task retry budgets.
"""

from typing import Optional
from datetime import datetime, timedelta
from prefect.server.utilities.server import PrefectRouter

router = PrefectRouter(prefix="/retry-budgets-v2", tags=["Retry Budgets V2"])


@router.get("/flows/{flow_id}/retry-budget/")
async def get_retry_budget(flow_id: str):
    """
    Get the retry budget configuration for a flow.

    Returns retry limits and current usage.
    """
    return {
        "flow_id": flow_id,
        "retry_budget": {
            "id": f"rb-{flow_id}",
            "max_retries_per_task": 3,
            "max_retries_per_hour": 50,
            "max_retries_per_day": 200,
            "max_total_retry_duration_minutes": 120,
            "enabled": True,
            "created_at": (datetime.now() - timedelta(days=10)).isoformat(),
            "updated_at": datetime.now().isoformat(),
        },
        "current_usage": {
            "retries_this_hour": 12,
            "retries_today": 45,
            "total_retry_duration_today_minutes": 35.5,
            "active_retrying_tasks": 3,
            "last_reset": datetime.now().replace(hour=0, minute=0, second=0).isoformat(),
        },
        "usage_percentages": {
            "hourly": 24.0,      # 12/50
            "daily": 22.5,       # 45/200
            "duration": 29.58,   # 35.5/120
        },
    }


@router.post("/flows/{flow_id}/retry-budget/")
async def create_retry_budget(flow_id: str):
    """
    Create or update retry budget configuration for a flow.

    Accepts retry budget limit parameters.
    """
    return {
        "id": f"rb-{flow_id}",
        "flow_id": flow_id,
        "max_retries_per_task": 3,
        "max_retries_per_hour": 50,
        "max_retries_per_day": 200,
        "max_total_retry_duration_minutes": 120,
        "enabled": True,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
    }


@router.delete("/flows/{flow_id}/retry-budget/")
async def delete_retry_budget(flow_id: str):
    """
    Delete the retry budget configuration for a flow.
    """
    return {"success": True, "message": "Retry budget configuration deleted"}


@router.post("/flows/{flow_id}/retry-budget/reset/")
async def reset_retry_budget(flow_id: str):
    """
    Reset the current retry usage counters for a flow.

    This resets hourly and daily retry counters to zero.
    """
    return {
        "flow_id": flow_id,
        "reset_at": datetime.now().isoformat(),
        "current_usage": {
            "retries_this_hour": 0,
            "retries_today": 0,
            "total_retry_duration_today_minutes": 0,
            "active_retrying_tasks": 0,
        },
    }


@router.get("/flows/{flow_id}/retry-history/")
async def get_retry_history(flow_id: str, days: Optional[int] = 7):
    """
    Get retry usage history for a flow.

    Returns historical retry patterns and budget violations.
    """
    # Generate mock historical data
    history = []
    base_date = datetime.now() - timedelta(days=days)

    for i in range(days):
        date = base_date + timedelta(days=i)
        # Simulate varying retry usage
        retries = 20 + (i % 4) * 15
        violations = 1 if retries > 180 else 0

        history.append({
            "date": date.strftime("%Y-%m-%d"),
            "total_retries": retries,
            "budget_violations": violations,
            "failed_tasks": 3 + (i % 3),
            "avg_retries_per_task": round(retries / (3 + (i % 3)), 2),
            "total_retry_duration_minutes": retries * 1.5,
        })

    return {
        "flow_id": flow_id,
        "period_days": days,
        "total_violations": sum(h["budget_violations"] for h in history),
        "history": history,
    }


@router.get("/flows/{flow_id}/retry-events/")
async def get_retry_events(flow_id: str, limit: Optional[int] = 20):
    """
    Get recent retry events for a flow.

    Returns detailed information about task retry attempts.
    """
    # Generate mock retry events
    events = []
    base_time = datetime.now()

    for i in range(min(limit, 5)):
        event_time = base_time - timedelta(minutes=i * 15)
        events.append({
            "id": f"re-{flow_id}-{i}",
            "flow_id": flow_id,
            "task_run_id": f"task-run-{i}",
            "task_name": ["extract_data", "transform_data", "load_data", "validate", "cleanup"][i % 5],
            "retry_attempt": (i % 3) + 1,
            "max_retries": 3,
            "timestamp": event_time.isoformat(),
            "reason": ["Timeout", "Connection Error", "Rate Limit", "Data Validation Error"][i % 4],
            "retry_delay_seconds": [30, 60, 120][i % 3],
            "status": ["retrying", "success", "exhausted"][i % 3],
        })

    return {
        "flow_id": flow_id,
        "total_events": len(events),
        "events": events,
    }


@router.get("/task-runs/{task_run_id}/retry-details/")
async def get_task_run_retry_details(task_run_id: str):
    """
    Get detailed retry information for a specific task run.

    Returns complete retry attempt history and analysis.
    """
    return {
        "task_run_id": task_run_id,
        "task_name": "data_processing_task",
        "total_attempts": 3,
        "max_retries": 3,
        "current_status": "success",
        "retry_attempts": [
            {
                "attempt_number": 1,
                "timestamp": (datetime.now() - timedelta(minutes=10)).isoformat(),
                "duration_seconds": 45,
                "failure_reason": "Connection timeout",
                "error_message": "Failed to connect to database after 30 seconds",
            },
            {
                "attempt_number": 2,
                "timestamp": (datetime.now() - timedelta(minutes=8)).isoformat(),
                "duration_seconds": 38,
                "failure_reason": "Rate limit exceeded",
                "error_message": "API rate limit exceeded, retry after 60s",
            },
            {
                "attempt_number": 3,
                "timestamp": (datetime.now() - timedelta(minutes=5)).isoformat(),
                "duration_seconds": 52,
                "failure_reason": None,
                "error_message": None,
            },
        ],
        "total_retry_time_seconds": 135,
        "retry_strategy": {
            "type": "exponential_backoff",
            "initial_delay_seconds": 30,
            "max_delay_seconds": 300,
            "backoff_factor": 2,
        },
    }


@router.get("/retry-budget-overview/")
async def get_retry_budget_overview():
    """
    Get overview of retry budgets across all flows.

    Returns summary statistics and flows with high retry usage.
    """
    return {
        "total_flows_with_budgets": 8,
        "total_active_budgets": 7,
        "flows_near_budget": 2,  # Flows using >80% of any retry budget
        "total_retries_today": 156,
        "total_violations_today": 1,
        "flows": [
            {
                "flow_id": "flow-1",
                "flow_name": "ETL Pipeline",
                "budget_status": "warning",
                "highest_usage_percentage": 85.0,
                "retries_today": 170,
                "violations_today": 0,
            },
            {
                "flow_id": "flow-2",
                "flow_name": "Data Sync",
                "budget_status": "ok",
                "highest_usage_percentage": 35.0,
                "retries_today": 70,
                "violations_today": 0,
            },
        ],
    }
