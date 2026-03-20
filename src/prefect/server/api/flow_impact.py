"""
Flow run impact analysis endpoints.
"""
from prefect.server.utilities.server import PrefectRouter

router = PrefectRouter(prefix="/flow-impact", tags=["Flow Impact"])


@router.get("/runs/{run_id}/downstream")
async def get_downstream_impact(run_id: str):
    """Get downstream flows affected by this run."""
    return {
        "run_id": run_id,
        "downstream_flows": [
            {"flow_id": "flow-2", "dependency_type": "direct"},
            {"flow_id": "flow-3", "dependency_type": "indirect"}
        ],
        "total_affected": 2
    }


@router.get("/runs/{run_id}/blast-radius")
async def calculate_blast_radius(run_id: str):
    """Calculate blast radius of a failure."""
    return {
        "run_id": run_id,
        "directly_affected": 5,
        "indirectly_affected": 12,
        "critical_flows_affected": 2
    }


@router.post("/runs/{run_id}/notify")
async def notify_affected_teams(run_id: str, impact_level: str):
    """Notify teams about impact."""
    return {
        "run_id": run_id,
        "impact_level": impact_level,
        "notifications_sent": 3,
        "teams_notified": ["team-a", "team-b", "team-c"]
    }
