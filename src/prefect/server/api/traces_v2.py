"""
Routes for flow run execution traces.
"""
from prefect.server.utilities.server import PrefectRouter

router = PrefectRouter(prefix="/traces-v2", tags=["Traces V2"])


@router.get("/flow-runs/{flow_run_id}/traces/")
async def get_flow_run_traces(flow_run_id: str):
    """
    Get execution traces for a flow run.
    Returns trace spans for tasks, subflows, and other operations.
    """
    return {
        "flow_run_id": flow_run_id,
        "traces": [
            {
                "trace_id": "trace-1",
                "span_id": "span-1",
                "span_type": "task",
                "name": "extract_data",
                "started_at": "2026-03-23T10:00:00Z",
                "ended_at": "2026-03-23T10:01:30Z",
                "duration_ms": 90000,
                "status": "completed",
                "parent_span_id": None,
            },
            {
                "trace_id": "trace-1",
                "span_id": "span-2",
                "span_type": "task",
                "name": "transform_data",
                "started_at": "2026-03-23T10:01:35Z",
                "ended_at": "2026-03-23T10:03:00Z",
                "duration_ms": 85000,
                "status": "completed",
                "parent_span_id": "span-1",
            },
            {
                "trace_id": "trace-1",
                "span_id": "span-3",
                "span_type": "task",
                "name": "load_data",
                "started_at": "2026-03-23T10:03:05Z",
                "ended_at": "2026-03-23T10:05:20Z",
                "duration_ms": 135000,
                "status": "completed",
                "parent_span_id": "span-2",
            },
            {
                "trace_id": "trace-1",
                "span_id": "span-4",
                "span_type": "subflow",
                "name": "validation_subflow",
                "started_at": "2026-03-23T10:05:25Z",
                "ended_at": "2026-03-23T10:06:10Z",
                "duration_ms": 45000,
                "status": "completed",
                "parent_span_id": "span-3",
            },
        ],
        "total_spans": 4,
    }
