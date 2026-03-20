"""
Routes for task retry budgets.
Replication of PR#10 for comparison testing.
"""
from prefect.server.utilities.server import PrefectRouter

router = PrefectRouter(prefix="/retry-budget-v2", tags=["Retry Budget V2"])


@router.post("/flows/{flow_id}/retry-budget/")
async def set_retry_budget(
    flow_id: str,
    max_retries: int,
    reset_interval: str = "daily"
):
    """
    Set retry budget for a flow.
    """
    return {
        "id": "budget-123",
        "flow_id": flow_id,
        "max_retries": max_retries,
        "reset_interval": reset_interval,
        "current_usage": 0
    }


@router.get("/flow-runs/{flow_run_id}/retry-usage/")
async def get_retry_usage(flow_run_id: str):
    """
    Get retry usage for a flow run.
    """
    return {
        "flow_run_id": flow_run_id,
        "total_retries": 3,
        "budget_limit": 10,
        "budget_remaining": 7,
        "tasks_retried": ["task-1", "task-2", "task-1"],
        "retry_details": [
            {"task_name": "task-1", "retries": 2},
            {"task_name": "task-2", "retries": 1}
        ]
    }
