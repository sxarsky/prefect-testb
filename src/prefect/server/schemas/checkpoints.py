"""
Schemas for flow run checkpoints
"""

from uuid import UUID

from pydantic import Field

from prefect.server.utilities.schemas.bases import ORMBaseModel
from prefect.types import DateTime


class FlowCheckpoint(ORMBaseModel):
    """Schema for flow checkpoint"""

    flow_run_id: UUID = Field(description="The flow run ID")
    task_run_id: UUID = Field(description="The task run ID at checkpoint")
    checkpoint_data: dict = Field(
        default_factory=dict, description="Serialized checkpoint state"
    )
    created_at: DateTime = Field(description="When checkpoint was created")
