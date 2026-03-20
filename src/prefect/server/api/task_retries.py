"""
Task retry budget endpoints.
"""
from prefect.server.utilities.server import PrefectRouter

router = PrefectRouter(prefix="/task-retries", tags=["Task Retries"])


@router.get("/budgets")
async def get_retry_budgets():
    """Get all retry budgets."""
    return {
        "budgets": [
            {"flow_id": "flow-1", "max_retries": 10, "used_retries": 3},
            {"flow_id": "flow-2", "max_retries": 5, "used_retries": 5}
        ]
    }


@router.post("/budgets")
async def set_retry_budget(flow_id: str, max_retries: int):
    """Set retry budget for a flow."""
    return {
        "flow_id": flow_id,
        "max_retries": max_retries,
        "used_retries": 0,
        "budget_set": True
    }


@router.get("/runs/{run_id}/usage")
async def get_retry_usage(run_id: str):
    """Get retry usage for a run."""
    return {
        "run_id": run_id,
        "total_retries": 3,
        "budget_remaining": 7,
        "tasks_retried": ["task-1", "task-3"]
    }
