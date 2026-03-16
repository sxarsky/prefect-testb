"""
Functions for interacting with flow quota ORM objects.
Intended for internal use by the Prefect REST API.
"""

from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID

import sqlalchemy as sa
from sqlalchemy.ext.asyncio import AsyncSession

import prefect.server.schemas as schemas
from prefect.server.database import PrefectDBInterface, db_injector, orm_models
from prefect.types._datetime import now


@db_injector
async def create_flow_quota(
    db: PrefectDBInterface,
    session: AsyncSession,
    flow_quota: schemas.quotas.FlowQuotaCreate,
) -> orm_models.FlowQuota:
    """Create a flow quota configuration"""
    insert_values = flow_quota.model_dump()

    insert_stmt = (
        db.queries.insert(db.FlowQuota)
        .values(**insert_values)
        .on_conflict_do_update(
            index_elements=[db.FlowQuota.flow_id],
            set_=insert_values,
        )
    )

    await session.execute(insert_stmt)

    query = sa.select(db.FlowQuota).where(
        db.FlowQuota.flow_id == flow_quota.flow_id
    )

    result = await session.execute(query)
    return result.scalar_one()


@db_injector
async def read_flow_quota_by_flow_id(
    db: PrefectDBInterface,
    session: AsyncSession,
    flow_id: UUID,
) -> Optional[orm_models.FlowQuota]:
    """Read flow quota configuration by flow ID"""
    query = sa.select(db.FlowQuota).where(db.FlowQuota.flow_id == flow_id)

    result = await session.execute(query)
    return result.scalar()


@db_injector
async def update_flow_quota(
    db: PrefectDBInterface,
    session: AsyncSession,
    flow_id: UUID,
    flow_quota: schemas.quotas.FlowQuotaUpdate,
) -> bool:
    """Update flow quota configuration"""
    update_values = flow_quota.model_dump(exclude_unset=True)

    if not update_values:
        return True

    update_stmt = (
        sa.update(db.FlowQuota)
        .where(db.FlowQuota.flow_id == flow_id)
        .values(**update_values)
    )

    result = await session.execute(update_stmt)
    return result.rowcount > 0


@db_injector
async def delete_flow_quota(
    db: PrefectDBInterface,
    session: AsyncSession,
    flow_id: UUID,
) -> bool:
    """Delete flow quota configuration"""
    delete_stmt = sa.delete(db.FlowQuota).where(db.FlowQuota.flow_id == flow_id)

    result = await session.execute(delete_stmt)
    return result.rowcount > 0


@db_injector
async def check_and_increment_quota(
    db: PrefectDBInterface,
    session: AsyncSession,
    flow_id: UUID,
) -> tuple[bool, Optional[str]]:
    """
    Check if a flow run can be created within quota limits and increment counters.

    Returns:
        tuple[bool, Optional[str]]: (allowed, reason_if_denied)
    """
    # Get quota configuration
    quota = await read_flow_quota_by_flow_id(db, session, flow_id)

    if not quota:
        # No quota configured, allow by default
        return True, None

    # Check concurrent runs
    concurrent_runs_query = (
        sa.select(sa.func.count(db.FlowRun.id))
        .where(
            db.FlowRun.flow_id == flow_id,
            db.FlowRun.state_type.in_(["PENDING", "RUNNING", "SCHEDULED"]),
        )
    )
    concurrent_result = await session.execute(concurrent_runs_query)
    concurrent_count = concurrent_result.scalar_one()

    if concurrent_count >= quota.max_concurrent_runs:
        return False, f"Concurrent run limit ({quota.max_concurrent_runs}) exceeded"

    # Check hourly quota
    hour_start = now("UTC").replace(minute=0, second=0, microsecond=0)
    hourly_usage = await _get_or_create_usage(
        db, session, flow_id, hour_start, "hour"
    )

    if hourly_usage.run_count >= quota.max_runs_per_hour:
        await _increment_exceeded_count(db, session, hourly_usage.id)
        return False, f"Hourly quota ({quota.max_runs_per_hour}) exceeded"

    # Check daily quota
    day_start = now("UTC").replace(hour=0, minute=0, second=0, microsecond=0)
    daily_usage = await _get_or_create_usage(
        db, session, flow_id, day_start, "day"
    )

    if daily_usage.run_count >= quota.max_runs_per_day:
        await _increment_exceeded_count(db, session, daily_usage.id)
        return False, f"Daily quota ({quota.max_runs_per_day}) exceeded"

    # Increment usage counters
    await _increment_usage(db, session, hourly_usage.id)
    await _increment_usage(db, session, daily_usage.id)

    return True, None


@db_injector
async def get_quota_usage(
    db: PrefectDBInterface,
    session: AsyncSession,
    flow_id: UUID,
) -> schemas.quotas.QuotaUsageResponse:
    """Get current quota usage for a flow"""
    quota = await read_flow_quota_by_flow_id(db, session, flow_id)

    # Get concurrent runs
    concurrent_runs_query = (
        sa.select(sa.func.count(db.FlowRun.id))
        .where(
            db.FlowRun.flow_id == flow_id,
            db.FlowRun.state_type.in_(["PENDING", "RUNNING", "SCHEDULED"]),
        )
    )
    concurrent_result = await session.execute(concurrent_runs_query)
    concurrent_count = concurrent_result.scalar_one()

    # Get hourly usage
    hour_start = now("UTC").replace(minute=0, second=0, microsecond=0)
    hourly_query = (
        sa.select(db.QuotaUsage)
        .where(
            db.QuotaUsage.flow_id == flow_id,
            db.QuotaUsage.period_start == hour_start,
            db.QuotaUsage.period_type == "hour",
        )
    )
    hourly_result = await session.execute(hourly_query)
    hourly_usage = hourly_result.scalar()
    hourly_count = hourly_usage.run_count if hourly_usage else 0

    # Get daily usage
    day_start = now("UTC").replace(hour=0, minute=0, second=0, microsecond=0)
    daily_query = (
        sa.select(db.QuotaUsage)
        .where(
            db.QuotaUsage.flow_id == flow_id,
            db.QuotaUsage.period_start == day_start,
            db.QuotaUsage.period_type == "day",
        )
    )
    daily_result = await session.execute(daily_query)
    daily_usage = daily_result.scalar()
    daily_count = daily_usage.run_count if daily_usage else 0

    if quota:
        hourly_remaining = max(0, quota.max_runs_per_hour - hourly_count)
        daily_remaining = max(0, quota.max_runs_per_day - daily_count)
        quota_exceeded = (
            concurrent_count >= quota.max_concurrent_runs
            or hourly_count >= quota.max_runs_per_hour
            or daily_count >= quota.max_runs_per_day
        )
    else:
        hourly_remaining = 999999
        daily_remaining = 999999
        quota_exceeded = False

    return schemas.quotas.QuotaUsageResponse(
        flow_id=flow_id,
        current_concurrent_runs=concurrent_count,
        hourly_run_count=hourly_count,
        daily_run_count=daily_count,
        hourly_quota_remaining=hourly_remaining,
        daily_quota_remaining=daily_remaining,
        quota_exceeded=quota_exceeded,
    )


@db_injector
async def reset_quota_usage(
    db: PrefectDBInterface,
    session: AsyncSession,
    flow_id: UUID,
) -> bool:
    """Reset quota usage counters for a flow"""
    delete_stmt = sa.delete(db.QuotaUsage).where(db.QuotaUsage.flow_id == flow_id)

    result = await session.execute(delete_stmt)
    return result.rowcount > 0


@db_injector
async def _get_or_create_usage(
    db: PrefectDBInterface,
    session: AsyncSession,
    flow_id: UUID,
    period_start: datetime,
    period_type: str,
) -> orm_models.QuotaUsage:
    """Get or create a quota usage record"""
    query = (
        sa.select(db.QuotaUsage)
        .where(
            db.QuotaUsage.flow_id == flow_id,
            db.QuotaUsage.period_start == period_start,
            db.QuotaUsage.period_type == period_type,
        )
    )

    result = await session.execute(query)
    usage = result.scalar()

    if not usage:
        insert_stmt = db.queries.insert(db.QuotaUsage).values(
            flow_id=flow_id,
            period_start=period_start,
            period_type=period_type,
            run_count=0,
            quota_exceeded_count=0,
        )

        await session.execute(insert_stmt)

        result = await session.execute(query)
        usage = result.scalar_one()

    return usage


@db_injector
async def _increment_usage(
    db: PrefectDBInterface,
    session: AsyncSession,
    usage_id: UUID,
) -> None:
    """Increment the run count for a usage record"""
    update_stmt = (
        sa.update(db.QuotaUsage)
        .where(db.QuotaUsage.id == usage_id)
        .values(run_count=db.QuotaUsage.run_count + 1)
    )

    await session.execute(update_stmt)


@db_injector
async def _increment_exceeded_count(
    db: PrefectDBInterface,
    session: AsyncSession,
    usage_id: UUID,
) -> None:
    """Increment the exceeded count for a usage record"""
    update_stmt = (
        sa.update(db.QuotaUsage)
        .where(db.QuotaUsage.id == usage_id)
        .values(quota_exceeded_count=db.QuotaUsage.quota_exceeded_count + 1)
    )

    await session.execute(update_stmt)
