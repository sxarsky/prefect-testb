"""
Functions for interacting with retry budget ORM objects.
"""

from typing import Optional
from uuid import UUID

import sqlalchemy as sa
from sqlalchemy.ext.asyncio import AsyncSession

import prefect.server.schemas as schemas
from prefect.server.database import PrefectDBInterface, db_injector, orm_models


@db_injector
async def create_retry_budget(
    db: PrefectDBInterface,
    session: AsyncSession,
    budget: schemas.retry_budget.FlowRetryBudgetCreate,
) -> orm_models.FlowRetryBudget:
    """Create a flow retry budget"""
    insert_values = budget.model_dump()

    insert_stmt = (
        db.queries.insert(db.FlowRetryBudget)
        .values(**insert_values)
        .on_conflict_do_update(
            index_elements=[db.FlowRetryBudget.flow_id],
            set_=insert_values,
        )
    )

    await session.execute(insert_stmt)

    query = sa.select(db.FlowRetryBudget).where(
        db.FlowRetryBudget.flow_id == budget.flow_id
    )

    result = await session.execute(query)
    return result.scalar_one()


@db_injector
async def read_retry_budget(
    db: PrefectDBInterface,
    session: AsyncSession,
    flow_id: UUID,
) -> Optional[orm_models.FlowRetryBudget]:
    """Read retry budget by flow ID"""
    query = sa.select(db.FlowRetryBudget).where(db.FlowRetryBudget.flow_id == flow_id)

    result = await session.execute(query)
    return result.scalar()


@db_injector
async def get_retry_usage(
    db: PrefectDBInterface,
    session: AsyncSession,
    flow_run_id: UUID,
) -> schemas.retry_budget.FlowRunRetryUsage:
    """Get retry usage for a flow run"""
    query = sa.select(db.FlowRunRetryUsage).where(
        db.FlowRunRetryUsage.flow_run_id == flow_run_id
    )

    result = await session.execute(query)
    usage = result.scalar()

    if usage:
        return schemas.retry_budget.FlowRunRetryUsage.model_validate(
            usage, from_attributes=True
        )

    # Default if no usage record exists
    return schemas.retry_budget.FlowRunRetryUsage(
        flow_run_id=flow_run_id,
        retries_used=0,
        retries_remaining=10,
        budget_exceeded=False,
    )
