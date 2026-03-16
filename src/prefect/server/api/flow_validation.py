"""
Routes for flow graph validation
"""

from uuid import UUID

from fastapi import Depends, HTTPException, Path, status

import prefect.server.models as models
from prefect.server.database import PrefectDBInterface, provide_database_interface
from prefect.server.utilities.server import PrefectRouter
from prefect.services.flow_validator import FlowGraphValidator

router = PrefectRouter(prefix="/flow-validation", tags=["Flow Validation"])


@router.post("/flows/{flow_id}/validate-graph/")
async def validate_flow_graph(
    flow_id: UUID = Path(..., description="The flow ID"),
    db: PrefectDBInterface = Depends(provide_database_interface),
) -> dict:
    """
    Validate a flow's dependency graph

    Args:
        flow_id: The ID of the flow to validate

    Returns:
        Validation results with any issues found
    """
    async with db.session_context() as session:
        flow = await models.flows.read_flow(session=session, flow_id=flow_id)

        if not flow:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Flow {flow_id} not found",
            )

    validator = FlowGraphValidator()
    issues = validator.validate_graph(flow)

    return {
        "flow_id": str(flow_id),
        "valid": len(issues) == 0,
        "issues": issues,
    }


@router.get("/flows/{flow_id}/graph-analysis/")
async def analyze_flow_graph(
    flow_id: UUID = Path(..., description="The flow ID"),
    db: PrefectDBInterface = Depends(provide_database_interface),
) -> dict:
    """
    Get graph analysis metrics for a flow

    Args:
        flow_id: The ID of the flow to analyze

    Returns:
        Graph metrics and analysis
    """
    async with db.session_context() as session:
        flow = await models.flows.read_flow(session=session, flow_id=flow_id)

        if not flow:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Flow {flow_id} not found",
            )

    validator = FlowGraphValidator()
    metrics = validator.calculate_graph_metrics(flow)

    return {
        "flow_id": str(flow_id),
        "metrics": metrics,
    }
