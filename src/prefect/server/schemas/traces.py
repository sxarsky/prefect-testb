"""
Schemas for flow execution traces
"""

from typing import Optional
from uuid import UUID

from pydantic import Field

from prefect.server.utilities.schemas.bases import ORMBaseModel
from prefect.types import DateTime


class ExecutionTrace(ORMBaseModel):
    """Schema for execution trace"""

    flow_run_id: UUID = Field(description="The flow run ID")
    parent_trace_id: Optional[UUID] = Field(
        default=None, description="Parent trace ID for nested flows"
    )
    trace_type: str = Field(description="Type of trace: flow, task, or subflow")
    name: str = Field(description="Name of the traced element")
    started_at: DateTime = Field(description="When execution started")
    completed_at: Optional[DateTime] = Field(
        default=None, description="When execution completed"
    )
    duration_ms: Optional[int] = Field(
        default=None, description="Execution duration in milliseconds"
    )
    status: str = Field(description="Execution status")


class TraceSpan(ORMBaseModel):
    """Schema for trace span"""

    trace_id: UUID = Field(description="The trace ID this span belongs to")
    span_name: str = Field(description="Name of the span")
    span_type: str = Field(
        description="Type of span: execution, cache_check, retry, state_transition"
    )
    started_at: DateTime = Field(description="When span started")
    duration_ms: int = Field(description="Span duration in milliseconds")
    metadata: dict = Field(default_factory=dict, description="Span metadata")
