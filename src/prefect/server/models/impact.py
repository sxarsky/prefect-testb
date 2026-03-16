"""
Functions for interacting with impact analysis ORM objects.
"""

from uuid import UUID

import sqlalchemy as sa
from sqlalchemy.ext.asyncio import AsyncSession

import prefect.server.schemas as schemas
from prefect.server.database import PrefectDBInterface, db_injector, orm_models
from prefect.types._datetime import now


@db_injector
async def create_flow_dependency(
    db: PrefectDBInterface,
    session: AsyncSession,
    dependency: schemas.impact.FlowDependencyCreate,
) -> orm_models.FlowDependency:
    """Create a flow dependency relationship"""
    insert_values = dependency.model_dump()

    model = db.FlowDependency(**insert_values)
    session.add(model)
    await session.flush()

    return model


@db_injector
async def read_flow_dependencies(
    db: PrefectDBInterface,
    session: AsyncSession,
    flow_id: UUID,
) -> list[orm_models.FlowDependency]:
    """Read all dependencies for a flow"""
    query = sa.select(db.FlowDependency).where(
        sa.or_(
            db.FlowDependency.upstream_flow_id == flow_id,
            db.FlowDependency.downstream_flow_id == flow_id,
        )
    )

    result = await session.execute(query)
    return list(result.scalars().all())


@db_injector
async def analyze_impact(
    db: PrefectDBInterface,
    session: AsyncSession,
    flow_run_id: UUID,
) -> schemas.impact.ImpactAnalysis:
    """Analyze the impact of a flow run failure"""
    # Get the flow run
    flow_run_query = sa.select(db.FlowRun).where(db.FlowRun.id == flow_run_id)
    flow_run_result = await session.execute(flow_run_query)
    flow_run = flow_run_result.scalar()

    if not flow_run:
        return schemas.impact.ImpactAnalysis(
            flow_run_id=flow_run_id,
            impacted_flow_runs=[],
            impacted_deployments=[],
            severity="low",
            calculated_at=now("UTC"),
        )

    # Get downstream dependencies
    deps_query = sa.select(db.FlowDependency).where(
        db.FlowDependency.upstream_flow_id == flow_run.flow_id
    )
    deps_result = await session.execute(deps_query)
    dependencies = list(deps_result.scalars().all())

    # Calculate impact
    impacted_count = len(dependencies)

    if impacted_count == 0:
        severity = "low"
    elif impacted_count <= 2:
        severity = "medium"
    elif impacted_count <= 5:
        severity = "high"
    else:
        severity = "critical"

    return schemas.impact.ImpactAnalysis(
        flow_run_id=flow_run_id,
        impacted_flow_runs=[],  # Simplified - would need actual flow run lookups
        impacted_deployments=[],  # Simplified - would need deployment lookups
        severity=severity,
        calculated_at=now("UTC"),
    )
