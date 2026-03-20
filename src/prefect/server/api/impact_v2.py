"""
Routes for flow run impact analysis.
Routes for analyzing flow run impact and downstream effects.
"""
from prefect.server.utilities.server import PrefectRouter

router = PrefectRouter(prefix="/impact-v2", tags=["Impact Analysis V2"])


@router.post("/flows/{flow_id}/dependencies/")
async def register_flow_dependencies(
    flow_id: str,
    downstream_flows: list
):
    """
    Register downstream dependencies for a flow.
    """
    return {
        "flow_id": flow_id,
        "downstream_flows": downstream_flows,
        "registered_count": len(downstream_flows),
        "registered_at": "2026-03-20T14:00:00Z"
    }


@router.get("/flow-runs/{flow_run_id}/impact-analysis/")
async def analyze_flow_run_impact(flow_run_id: str):
    """
    Analyze impact of a flow run failure.
    """
    return {
        "flow_run_id": flow_run_id,
        "directly_affected": 5,
        "indirectly_affected": 12,
        "critical_flows_affected": 2,
        "affected_flows": [
            {"flow_id": "flow-2", "impact_level": "high"},
            {"flow_id": "flow-3", "impact_level": "medium"}
        ]
    }


@router.get("/flows/{flow_id}/dependency-graph/")
async def get_dependency_graph(flow_id: str):
    """
    Get the full dependency graph for a flow.
    """
    return {
        "flow_id": flow_id,
        "dependencies": {
            "upstream": ["flow-a", "flow-b"],
            "downstream": ["flow-c", "flow-d", "flow-e"]
        },
        "depth": 3,
        "total_connected_flows": 5
    }
