"""
Routes for interacting with flow quota objects.
"""

from uuid import UUID

from fastapi import Body, Depends, HTTPException, Path, Response, status

import prefect.server.models as models
import prefect.server.schemas as schemas
from prefect.server.database import PrefectDBInterface, provide_database_interface
from prefect.server.utilities.server import PrefectRouter

router = PrefectRouter(prefix="/quotas", tags=["Quotas"])


@router.post("/flows/{flow_id}/quota/")
async def create_or_update_flow_quota(
    flow_id: UUID = Path(..., description="The flow ID"),
    flow_quota: schemas.quotas.FlowQuotaCreate = Body(...),
    db: PrefectDBInterface = Depends(provide_database_interface),
) -> schemas.quotas.FlowQuota:
    """
    Create or update a flow quota configuration.

    Args:
        flow_id: The ID of the flow
        flow_quota: The quota configuration

    Returns:
        The created or updated flow quota
    """
    # Verify flow exists
    async with db.session_context() as session:
        flow = await models.flows.read_flow(session=session, flow_id=flow_id)
        if not flow:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Flow with id {flow_id} not found",
            )

    # Ensure flow_id matches
    flow_quota.flow_id = flow_id

    async with db.session_context(begin_transaction=True) as session:
        quota = await models.quotas.create_flow_quota(
            session=session, flow_quota=flow_quota
        )

    return schemas.quotas.FlowQuota.model_validate(quota, from_attributes=True)


@router.get("/flows/{flow_id}/quota/")
async def read_flow_quota(
    flow_id: UUID = Path(..., description="The flow ID"),
    db: PrefectDBInterface = Depends(provide_database_interface),
) -> schemas.quotas.FlowQuota:
    """
    Read a flow quota configuration.

    Args:
        flow_id: The ID of the flow

    Returns:
        The flow quota configuration
    """
    async with db.session_context() as session:
        quota = await models.quotas.read_flow_quota_by_flow_id(
            session=session, flow_id=flow_id
        )

    if not quota:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quota configuration for flow {flow_id} not found",
        )

    return schemas.quotas.FlowQuota.model_validate(quota, from_attributes=True)


@router.patch("/flows/{flow_id}/quota/")
async def update_flow_quota(
    flow_id: UUID = Path(..., description="The flow ID"),
    flow_quota: schemas.quotas.FlowQuotaUpdate = Body(...),
    db: PrefectDBInterface = Depends(provide_database_interface),
) -> None:
    """
    Update a flow quota configuration.

    Args:
        flow_id: The ID of the flow
        flow_quota: The quota updates

    Returns:
        None
    """
    async with db.session_context(begin_transaction=True) as session:
        updated = await models.quotas.update_flow_quota(
            session=session, flow_id=flow_id, flow_quota=flow_quota
        )

    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quota configuration for flow {flow_id} not found",
        )


@router.delete("/flows/{flow_id}/quota/")
async def delete_flow_quota(
    flow_id: UUID = Path(..., description="The flow ID"),
    db: PrefectDBInterface = Depends(provide_database_interface),
) -> None:
    """
    Delete a flow quota configuration.

    Args:
        flow_id: The ID of the flow

    Returns:
        None
    """
    async with db.session_context(begin_transaction=True) as session:
        deleted = await models.quotas.delete_flow_quota(session=session, flow_id=flow_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quota configuration for flow {flow_id} not found",
        )


@router.get("/flows/{flow_id}/quota/usage/")
async def get_flow_quota_usage(
    flow_id: UUID = Path(..., description="The flow ID"),
    db: PrefectDBInterface = Depends(provide_database_interface),
) -> schemas.quotas.QuotaUsageResponse:
    """
    Get current quota usage for a flow.

    Args:
        flow_id: The ID of the flow

    Returns:
        Current quota usage statistics
    """
    async with db.session_context() as session:
        usage = await models.quotas.get_quota_usage(session=session, flow_id=flow_id)

    return usage


@router.post("/flows/{flow_id}/quota/reset/")
async def reset_flow_quota_usage(
    flow_id: UUID = Path(..., description="The flow ID"),
    db: PrefectDBInterface = Depends(provide_database_interface),
) -> None:
    """
    Reset quota usage counters for a flow.

    Args:
        flow_id: The ID of the flow

    Returns:
        None
    """
    async with db.session_context(begin_transaction=True) as session:
        await models.quotas.reset_quota_usage(session=session, flow_id=flow_id)
