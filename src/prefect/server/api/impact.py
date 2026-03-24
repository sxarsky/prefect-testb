"""
Routes for flow run impact analysis
"""

from uuid import UUID

from fastapi import Body, Depends, HTTPException, Path, status

import prefect.server.models as models
import prefect.server.schemas as schemas
from prefect.server.database import PrefectDBInterface, provide_database_interface
from prefect.server.utilities.server import PrefectRouter

router = PrefectRouter(prefix="/impact", tags=["Impact Analysis"])


@router.post("/flows/{flow_id}/dependencies/")
async def create_flow_dependency(
    flow_id: UUID = Path(..., description="The flow ID"),
    dependency: schemas.impact.FlowDependencyCreate = Body(...),
    db: PrefectDBInterface = Depends(provide_database_interface),
) -> schemas.impact.FlowDependency:
    """
    Define a flow dependency relationship.

    Args:
        flow_id: The ID of the flow (must match upstream or downstream)
        dependency: The dependency to create

    Returns:
        The created dependency
    """
    if (
        dependency.upstream_flow_id != flow_id
        and dependency.downstream_flow_id != flow_id
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="flow_id must match either upstream_flow_id or downstream_flow_id",
        )

    async with db.session_context(begin_transaction=True) as session:
        result = await models.impact.create_flow_dependency(
            session=session, dependency=dependency
        )

    return schemas.impact.FlowDependency.model_validate(result, from_attributes=True)


@router.get("/flow-runs/{flow_run_id}/impact-analysis/")
async def get_impact_analysis(
    flow_run_id: UUID = Path(..., description="The flow run ID"),
    db: PrefectDBInterface = Depends(provide_database_interface),
) -> schemas.impact.ImpactAnalysis:
    """
    Get impact analysis for a flow run.

    Args:
        flow_run_id: The ID of the flow run

    Returns:
        Impact analysis results
    """
    async with db.session_context() as session:
        analysis = await models.impact.analyze_impact(
            session=session, flow_run_id=flow_run_id
        )

    return analysis


@router.get("/flows/{flow_id}/dependency-graph/")
async def get_dependency_graph(
    flow_id: UUID = Path(..., description="The flow ID"),
    db: PrefectDBInterface = Depends(provide_database_interface),
) -> dict:
    """
    Get the dependency graph for a flow.

    Args:
        flow_id: The ID of the flow

    Returns:
        Dependency graph visualization data
    """
    async with db.session_context() as session:
        dependencies = await models.impact.read_flow_dependencies(
            session=session, flow_id=flow_id
        )

    return {
        "flow_id": str(flow_id),
        "dependencies": [
            schemas.impact.FlowDependency.model_validate(dep, from_attributes=True)
            for dep in dependencies
        ],
    }
