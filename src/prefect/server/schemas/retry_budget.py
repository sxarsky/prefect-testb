"""
Schemas for task retry budgets
"""

from typing import Optional
from uuid import UUID

from pydantic import Field

from prefect.server.utilities.schemas.bases import ORMBaseModel, PrefectBaseModel


class FlowRetryBudget(ORMBaseModel):
    """Schema for flow retry budget configuration"""

    flow_id: UUID = Field(description="The flow ID")
    max_total_retries: int = Field(default=10, description="Maximum total retries allowed")
    retry_reset_interval_hours: int = Field(
        default=24, description="Hours after which retry budget resets"
    )


class FlowRunRetryUsage(ORMBaseModel):
    """Schema for flow run retry usage tracking"""

    flow_run_id: UUID = Field(description="The flow run ID")
    retries_used: int = Field(default=0, description="Number of retries used")
    retries_remaining: int = Field(description="Number of retries remaining")
    budget_exceeded: bool = Field(default=False, description="Whether budget is exceeded")


class FlowRetryBudgetCreate(PrefectBaseModel):
    """Schema for creating a retry budget"""

    flow_id: UUID
    max_total_retries: int = 10
    retry_reset_interval_hours: int = 24


class FlowRetryBudgetUpdate(PrefectBaseModel):
    """Schema for updating a retry budget"""

    max_total_retries: Optional[int] = None
    retry_reset_interval_hours: Optional[int] = None
