"""
Schemas for flow cost tracking.
"""

from typing import Any, Dict, Optional
from uuid import UUID

from pydantic import Field

from prefect.server.utilities.schemas.bases import ORMBaseModel, PrefectBaseModel
from prefect.types import DateTime


class FlowCostProfile(ORMBaseModel):
    """Schema for flow cost configuration"""

    flow_id: UUID = Field(..., description="The flow ID")
    cost_per_second: float = Field(default=0.0, description="Cost per second of execution")
    cost_per_task: float = Field(default=0.0, description="Cost per task execution")
    currency: str = Field(default="USD", description="Currency code")


class FlowCostProfileCreate(PrefectBaseModel):
    """Schema for creating a flow cost profile"""

    flow_id: UUID
    cost_per_second: float = 0.0
    cost_per_task: float = 0.0
    currency: str = "USD"


class FlowCostProfileUpdate(PrefectBaseModel):
    """Schema for updating a flow cost profile"""

    cost_per_second: Optional[float] = None
    cost_per_task: Optional[float] = None
    currency: Optional[str] = None


class FlowRunCost(ORMBaseModel):
    """Schema for flow run cost tracking"""

    flow_run_id: UUID = Field(..., description="The flow run ID")
    total_cost: float = Field(default=0.0, description="Total cost of the flow run")
    execution_seconds: int = Field(default=0, description="Total execution time in seconds")
    task_count: int = Field(default=0, description="Number of tasks executed")
    calculated_at: Optional[DateTime] = Field(None, description="When the cost was calculated")
    cost_breakdown: Optional[Dict[str, Any]] = Field(None, description="Per-task cost breakdown")


class FlowRunCostCreate(PrefectBaseModel):
    """Schema for creating a flow run cost record"""

    flow_run_id: UUID
    total_cost: float = 0.0
    execution_seconds: int = 0
    task_count: int = 0
    calculated_at: Optional[DateTime] = None
    cost_breakdown: Optional[Dict[str, Any]] = None
