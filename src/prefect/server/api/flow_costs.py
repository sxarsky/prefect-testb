"""
Flow cost tracking endpoints.
"""
from prefect.server.utilities.server import PrefectRouter

router = PrefectRouter(prefix="/flow-costs", tags=["Flow Costs"])


@router.get("/profiles")
async def list_cost_profiles():
    """Get all cost profiles."""
    return {
        "profiles": [
            {"id": "1", "flow_id": "flow-1", "cost_per_second": 0.01, "currency": "USD"},
            {"id": "2", "flow_id": "flow-2", "cost_per_second": 0.02, "currency": "USD"}
        ]
    }


@router.post("/profiles")
async def create_cost_profile(flow_id: str, cost_per_second: float):
    """Create a new cost profile."""
    return {
        "id": "new-profile",
        "flow_id": flow_id,
        "cost_per_second": cost_per_second,
        "currency": "USD"
    }


@router.get("/runs/{run_id}")
async def get_run_cost(run_id: str):
    """Get cost for a specific run."""
    return {
        "run_id": run_id,
        "total_cost": 12.45,
        "execution_seconds": 1245,
        "currency": "USD"
    }
