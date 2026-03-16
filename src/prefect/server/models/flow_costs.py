"""
Functions for interacting with flow cost ORM objects.
Intended for internal use by the Prefect REST API.
"""

from typing import Optional
from uuid import UUID

import sqlalchemy as sa
from sqlalchemy.ext.asyncio import AsyncSession

import prefect.server.schemas as schemas
from prefect.server.database import PrefectDBInterface, db_injector, orm_models


@db_injector
async def create_flow_cost_profile(
    db: PrefectDBInterface,
    session: AsyncSession,
    flow_cost_profile: schemas.flow_costs.FlowCostProfileCreate,
) -> orm_models.FlowCostProfile:
    """
    Creates a new flow cost profile.

    Args:
        session: a database session
        flow_cost_profile: a flow cost profile creation schema

    Returns:
        orm_models.FlowCostProfile: the newly-created flow cost profile
    """
    insert_stmt = db.queries.insert(db.FlowCostProfile).values(
        **flow_cost_profile.model_dump()
    )
    await session.execute(insert_stmt)

    query = (
        sa.select(db.FlowCostProfile)
        .where(db.FlowCostProfile.flow_id == flow_cost_profile.flow_id)
        .limit(1)
    )
    result = await session.execute(query)
    return result.scalar_one()


@db_injector
async def read_flow_cost_profile(
    db: PrefectDBInterface, session: AsyncSession, flow_id: UUID
) -> Optional[orm_models.FlowCostProfile]:
    """
    Reads a flow cost profile by flow ID.

    Args:
        session: A database session
        flow_id: a flow id

    Returns:
        orm_models.FlowCostProfile: the flow cost profile or None
    """
    query = sa.select(db.FlowCostProfile).where(db.FlowCostProfile.flow_id == flow_id)
    result = await session.execute(query)
    return result.scalar_one_or_none()


@db_injector
async def update_flow_cost_profile(
    db: PrefectDBInterface,
    session: AsyncSession,
    flow_id: UUID,
    flow_cost_profile: schemas.flow_costs.FlowCostProfileUpdate,
) -> bool:
    """
    Updates a flow cost profile.

    Args:
        session: a database session
        flow_id: the flow id
        flow_cost_profile: a flow cost profile update schema

    Returns:
        bool: whether or not matching rows were found to update
    """
    update_stmt = (
        sa.update(db.FlowCostProfile)
        .where(db.FlowCostProfile.flow_id == flow_id)
        .values(**flow_cost_profile.model_dump(exclude_unset=True))
    )
    result = await session.execute(update_stmt)
    return result.rowcount > 0


@db_injector
async def delete_flow_cost_profile(
    db: PrefectDBInterface, session: AsyncSession, flow_id: UUID
) -> bool:
    """
    Deletes a flow cost profile.

    Args:
        session: a database session
        flow_id: the flow id

    Returns:
        bool: whether or not a row was deleted
    """
    delete_stmt = sa.delete(db.FlowCostProfile).where(
        db.FlowCostProfile.flow_id == flow_id
    )
    result = await session.execute(delete_stmt)
    return result.rowcount > 0


@db_injector
async def create_flow_run_cost(
    db: PrefectDBInterface,
    session: AsyncSession,
    flow_run_cost: schemas.flow_costs.FlowRunCostCreate,
) -> orm_models.FlowRunCost:
    """
    Creates a new flow run cost record.

    Args:
        session: a database session
        flow_run_cost: a flow run cost creation schema

    Returns:
        orm_models.FlowRunCost: the newly-created flow run cost record
    """
    insert_stmt = db.queries.insert(db.FlowRunCost).values(
        **flow_run_cost.model_dump()
    )
    await session.execute(insert_stmt)

    query = (
        sa.select(db.FlowRunCost)
        .where(db.FlowRunCost.flow_run_id == flow_run_cost.flow_run_id)
        .limit(1)
    )
    result = await session.execute(query)
    return result.scalar_one()


@db_injector
async def read_flow_run_cost(
    db: PrefectDBInterface, session: AsyncSession, flow_run_id: UUID
) -> Optional[orm_models.FlowRunCost]:
    """
    Reads a flow run cost by flow run ID.

    Args:
        session: A database session
        flow_run_id: a flow run id

    Returns:
        orm_models.FlowRunCost: the flow run cost or None
    """
    query = sa.select(db.FlowRunCost).where(
        db.FlowRunCost.flow_run_id == flow_run_id
    )
    result = await session.execute(query)
    return result.scalar_one_or_none()


@db_injector
async def read_flow_costs_history(
    db: PrefectDBInterface,
    session: AsyncSession,
    flow_id: UUID,
    limit: int = 100,
) -> list[orm_models.FlowRunCost]:
    """
    Reads flow run cost history for a flow.

    Args:
        session: A database session
        flow_id: a flow id
        limit: maximum number of records to return

    Returns:
        list[orm_models.FlowRunCost]: list of flow run costs
    """
    query = (
        sa.select(db.FlowRunCost)
        .join(db.FlowRun, db.FlowRunCost.flow_run_id == db.FlowRun.id)
        .where(db.FlowRun.flow_id == flow_id)
        .order_by(db.FlowRunCost.calculated_at.desc())
        .limit(limit)
    )
    result = await session.execute(query)
    return list(result.scalars().all())
