"""
Schemas for flow run impact analysis
"""

from typing import Optional
from uuid import UUID

from pydantic import Field

from prefect.server.utilities.schemas.bases import ORMBaseModel, PrefectBaseModel
from prefect.types import DateTime


class FlowDependency(ORMBaseModel):
    """Schema for flow dependency relationships"""

    upstream_flow_id: UUID = Field(description="The upstream flow ID")
    downstream_flow_id: UUID = Field(description="The downstream flow ID")
    dependency_type: str = Field(
        description="Type of dependency: triggers, provides_data, or blocks"
    )


class ImpactAnalysis(ORMBaseModel):
    """Schema for impact analysis results"""

    flow_run_id: UUID = Field(description="The flow run ID being analyzed")
    impacted_flow_runs: list[UUID] = Field(
        default_factory=list, description="IDs of impacted flow runs"
    )
    impacted_deployments: list[UUID] = Field(
        default_factory=list, description="IDs of impacted deployments"
    )
    severity: str = Field(description="Impact severity: low, medium, high, critical")
    calculated_at: DateTime = Field(description="When analysis was calculated")


class FlowDependencyCreate(PrefectBaseModel):
    """Schema for creating a flow dependency"""

    upstream_flow_id: UUID
    downstream_flow_id: UUID
    dependency_type: str
