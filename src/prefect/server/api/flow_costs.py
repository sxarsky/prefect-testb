"""
Routes for interacting with flow cost objects.
"""

from typing import List
from uuid import UUID

from fastapi import Depends, HTTPException, Path, Response, status

import prefect.server.models as models
import prefect.server.schemas as schemas
from prefect.server.database import PrefectDBInterface, provide_database_interface
from prefect.server.utilities.server import PrefectRouter

router: PrefectRouter = PrefectRouter(prefix="/flow-costs", tags=["Flow Costs"])


@router.post("/profiles/")
async def create_flow_cost_profile(
    flow_cost_profile: schemas.flow_costs.FlowCostProfileCreate,
    response: Response,
    db: PrefectDBInterface = Depends(provide_database_interface),
) -> schemas.flow_costs.FlowCostProfile:
    """
    Creates a new flow cost profile.
    """
    async with db.session_context(begin_transaction=True) as session:
        model = await models.flow_costs.create_flow_cost_profile(
            session=session, flow_cost_profile=flow_cost_profile
        )
    response.status_code = status.HTTP_201_CREATED
    return model


@router.get("/profiles/flow/{flow_id:uuid}")
async def read_flow_cost_profile(
    flow_id: UUID = Path(..., description="The flow id"),
    db: PrefectDBInterface = Depends(provide_database_interface),
) -> schemas.flow_costs.FlowCostProfile:
    """
    Get a flow cost profile by flow ID.
    """
    async with db.session_context() as session:
        profile = await models.flow_costs.read_flow_cost_profile(
            session=session, flow_id=flow_id
        )
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flow cost profile not found",
        )
    return profile


@router.patch("/profiles/flow/{flow_id:uuid}", status_code=status.HTTP_204_NO_CONTENT)
async def update_flow_cost_profile(
    flow_cost_profile: schemas.flow_costs.FlowCostProfileUpdate,
    flow_id: UUID = Path(..., description="The flow id"),
    db: PrefectDBInterface = Depends(provide_database_interface),
) -> None:
    """
    Updates a flow cost profile.
    """
    async with db.session_context(begin_transaction=True) as session:
        result = await models.flow_costs.update_flow_cost_profile(
            session=session, flow_id=flow_id, flow_cost_profile=flow_cost_profile
        )
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flow cost profile not found",
        )


@router.delete("/profiles/flow/{flow_id:uuid}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_flow_cost_profile(
    flow_id: UUID = Path(..., description="The flow id"),
    db: PrefectDBInterface = Depends(provide_database_interface),
) -> None:
    """
    Deletes a flow cost profile.
    """
    async with db.session_context(begin_transaction=True) as session:
        result = await models.flow_costs.delete_flow_cost_profile(
            session=session, flow_id=flow_id
        )
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flow cost profile not found",
        )


@router.post("/run-costs/")
async def create_flow_run_cost(
    flow_run_cost: schemas.flow_costs.FlowRunCostCreate,
    response: Response,
    db: PrefectDBInterface = Depends(provide_database_interface),
) -> schemas.flow_costs.FlowRunCost:
    """
    Creates a new flow run cost record.
    """
    async with db.session_context(begin_transaction=True) as session:
        model = await models.flow_costs.create_flow_run_cost(
            session=session, flow_run_cost=flow_run_cost
        )
    response.status_code = status.HTTP_201_CREATED
    return model


@router.get("/run-costs/flow-run/{flow_run_id:uuid}")
async def read_flow_run_cost(
    flow_run_id: UUID = Path(..., description="The flow run id"),
    db: PrefectDBInterface = Depends(provide_database_interface),
) -> schemas.flow_costs.FlowRunCost:
    """
    Get a flow run cost by flow run ID.
    """
    async with db.session_context() as session:
        cost = await models.flow_costs.read_flow_run_cost(
            session=session, flow_run_id=flow_run_id
        )
    if not cost:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Flow run cost not found"
        )
    return cost


@router.get("/history/flow/{flow_id:uuid}")
async def read_flow_costs_history(
    flow_id: UUID = Path(..., description="The flow id"),
    limit: int = 100,
    db: PrefectDBInterface = Depends(provide_database_interface),
) -> List[schemas.flow_costs.FlowRunCost]:
    """
    Get historical flow run costs for a flow.
    """
    async with db.session_context() as session:
        costs = await models.flow_costs.read_flow_costs_history(
            session=session, flow_id=flow_id, limit=limit
        )
    return costs
