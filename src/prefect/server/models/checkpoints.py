"""
Functions for interacting with checkpoint ORM objects.
"""

from uuid import UUID

import sqlalchemy as sa
from sqlalchemy.ext.asyncio import AsyncSession

import prefect.server.schemas as schemas
from prefect.server.database import PrefectDBInterface, db_injector, orm_models


@db_injector
async def create_checkpoint(
    db: PrefectDBInterface,
    session: AsyncSession,
    checkpoint: schemas.checkpoints.FlowCheckpoint,
) -> orm_models.FlowCheckpoint:
    """Create a flow checkpoint"""
    insert_values = checkpoint.model_dump_for_orm()

    model = db.FlowCheckpoint(**insert_values)
    session.add(model)
    await session.flush()

    return model


@db_injector
async def read_flow_run_checkpoints(
    db: PrefectDBInterface,
    session: AsyncSession,
    flow_run_id: UUID,
) -> list[orm_models.FlowCheckpoint]:
    """Read all checkpoints for a flow run"""
    query = (
        sa.select(db.FlowCheckpoint)
        .where(db.FlowCheckpoint.flow_run_id == flow_run_id)
        .order_by(db.FlowCheckpoint.created_at)
    )

    result = await session.execute(query)
    return list(result.scalars().all())
