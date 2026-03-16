"""
Routes for interacting with flow checkpoints.
"""

from uuid import UUID

from fastapi import Depends, Path

import prefect.server.models as models
import prefect.server.schemas as schemas
from prefect.server.database import PrefectDBInterface, provide_database_interface
from prefect.server.utilities.server import PrefectRouter

router = PrefectRouter(prefix="/checkpoints", tags=["Checkpoints"])


@router.get("/flow-runs/{flow_run_id}/checkpoints/")
async def list_flow_run_checkpoints(
    flow_run_id: UUID = Path(..., description="The flow run ID"),
    db: PrefectDBInterface = Depends(provide_database_interface),
) -> list[schemas.checkpoints.FlowCheckpoint]:
    """
    List all checkpoints for a flow run.

    Args:
        flow_run_id: The ID of the flow run

    Returns:
        List of checkpoints
    """
    async with db.session_context() as session:
        checkpoints = await models.checkpoints.read_flow_run_checkpoints(
            session=session, flow_run_id=flow_run_id
        )

    return [
        schemas.checkpoints.FlowCheckpoint.model_validate(cp, from_attributes=True)
        for cp in checkpoints
    ]
