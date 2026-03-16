"""
Functions for interacting with execution trace ORM objects.
"""

from typing import Optional
from uuid import UUID

import sqlalchemy as sa
from sqlalchemy.ext.asyncio import AsyncSession

import prefect.server.schemas as schemas
from prefect.server.database import PrefectDBInterface, db_injector, orm_models


@db_injector
async def create_execution_trace(
    db: PrefectDBInterface,
    session: AsyncSession,
    trace: schemas.traces.ExecutionTrace,
) -> orm_models.ExecutionTrace:
    """Create an execution trace"""
    insert_values = trace.model_dump_for_orm()

    model = db.ExecutionTrace(**insert_values)
    session.add(model)
    await session.flush()

    return model


@db_injector
async def read_execution_trace(
    db: PrefectDBInterface,
    session: AsyncSession,
    trace_id: UUID,
) -> Optional[orm_models.ExecutionTrace]:
    """Read an execution trace by ID"""
    query = sa.select(db.ExecutionTrace).where(db.ExecutionTrace.id == trace_id)

    result = await session.execute(query)
    return result.scalar()


@db_injector
async def read_flow_run_traces(
    db: PrefectDBInterface,
    session: AsyncSession,
    flow_run_id: UUID,
) -> list[orm_models.ExecutionTrace]:
    """Read all traces for a flow run"""
    query = (
        sa.select(db.ExecutionTrace)
        .where(db.ExecutionTrace.flow_run_id == flow_run_id)
        .order_by(db.ExecutionTrace.started_at)
    )

    result = await session.execute(query)
    return list(result.scalars().all())


@db_injector
async def create_trace_span(
    db: PrefectDBInterface,
    session: AsyncSession,
    span: schemas.traces.TraceSpan,
) -> orm_models.TraceSpan:
    """Create a trace span"""
    insert_values = span.model_dump_for_orm()

    model = db.TraceSpan(**insert_values)
    session.add(model)
    await session.flush()

    return model


@db_injector
async def read_trace_spans(
    db: PrefectDBInterface,
    session: AsyncSession,
    trace_id: UUID,
) -> list[orm_models.TraceSpan]:
    """Read all spans for a trace"""
    query = (
        sa.select(db.TraceSpan)
        .where(db.TraceSpan.trace_id == trace_id)
        .order_by(db.TraceSpan.started_at)
    )

    result = await session.execute(query)
    return list(result.scalars().all())
