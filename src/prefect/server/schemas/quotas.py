"""
Schemas for flow run quota limits
"""

from typing import Optional
from uuid import UUID

from pydantic import Field

from prefect.server.utilities.schemas.bases import ORMBaseModel, PrefectBaseModel
from prefect.types import DateTime


class FlowQuota(ORMBaseModel):
    """Schema for flow quota configuration"""

    flow_id: UUID = Field(description="The flow ID this quota applies to")
    max_concurrent_runs: int = Field(
        default=10, description="Maximum number of concurrent runs allowed"
    )
    max_runs_per_hour: int = Field(
        default=100, description="Maximum number of runs per hour"
    )
    max_runs_per_day: int = Field(
        default=1000, description="Maximum number of runs per day"
    )
    quota_exceeded_action: str = Field(
        default="reject",
        description="Action to take when quota is exceeded: 'queue', 'reject', or 'alert'",
    )


class QuotaUsage(ORMBaseModel):
    """Schema for tracking quota usage"""

    flow_id: UUID = Field(description="The flow ID being tracked")
    period_start: DateTime = Field(description="Start of the tracking period")
    period_type: str = Field(
        description="Type of period: 'hour' or 'day'"
    )
    run_count: int = Field(default=0, description="Number of runs in this period")
    quota_exceeded_count: int = Field(
        default=0, description="Number of times quota was exceeded"
    )


class FlowQuotaCreate(PrefectBaseModel):
    """Schema for creating a flow quota"""

    flow_id: UUID
    max_concurrent_runs: int = 10
    max_runs_per_hour: int = 100
    max_runs_per_day: int = 1000
    quota_exceeded_action: str = "reject"


class FlowQuotaUpdate(PrefectBaseModel):
    """Schema for updating a flow quota"""

    max_concurrent_runs: Optional[int] = None
    max_runs_per_hour: Optional[int] = None
    max_runs_per_day: Optional[int] = None
    quota_exceeded_action: Optional[str] = None


class QuotaUsageResponse(PrefectBaseModel):
    """Response schema for quota usage"""

    flow_id: UUID
    current_concurrent_runs: int
    hourly_run_count: int
    daily_run_count: int
    hourly_quota_remaining: int
    daily_quota_remaining: int
    quota_exceeded: bool
