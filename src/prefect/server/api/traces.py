"""
Routes for interacting with flow execution traces.
"""

from uuid import UUID

from fastapi import Depends, HTTPException, Path, status

import prefect.server.models as models
import prefect.server.schemas as schemas
from prefect.server.database import PrefectDBInterface, provide_database_interface
from prefect.server.utilities.server import PrefectRouter

router = PrefectRouter(prefix="/traces", tags=["Traces"])


@router.get("/flow-runs/{flow_run_id}/trace/")
async def get_flow_run_trace(
    flow_run_id: UUID = Path(..., description="The flow run ID"),
    db: PrefectDBInterface = Depends(provide_database_interface),
) -> list[schemas.traces.ExecutionTrace]:
    """
    Get full execution trace for a flow run.

    Args:
        flow_run_id: The ID of the flow run

    Returns:
        List of execution traces
    """
    async with db.session_context() as session:
        traces = await models.traces.read_flow_run_traces(
            session=session, flow_run_id=flow_run_id
        )

    if not traces:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No traces found for flow run {flow_run_id}",
        )

    return [
        schemas.traces.ExecutionTrace.model_validate(trace, from_attributes=True)
        for trace in traces
    ]


@router.get("/flow-runs/{flow_run_id}/trace/{trace_id}/spans/")
async def get_trace_spans(
    flow_run_id: UUID = Path(..., description="The flow run ID"),
    trace_id: UUID = Path(..., description="The trace ID"),
    db: PrefectDBInterface = Depends(provide_database_interface),
) -> list[schemas.traces.TraceSpan]:
    """
    Get spans for a specific trace.

    Args:
        flow_run_id: The ID of the flow run (for validation)
        trace_id: The ID of the trace

    Returns:
        List of trace spans
    """
    async with db.session_context() as session:
        # Verify trace belongs to flow run
        trace = await models.traces.read_execution_trace(
            session=session, trace_id=trace_id
        )

        if not trace or trace.flow_run_id != flow_run_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Trace {trace_id} not found for flow run {flow_run_id}",
            )

        spans = await models.traces.read_trace_spans(session=session, trace_id=trace_id)

    return [
        schemas.traces.TraceSpan.model_validate(span, from_attributes=True)
        for span in spans
    ]
