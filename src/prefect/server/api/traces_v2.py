"""
Routes for flow execution traces.
Replication of PR#7 for comparison testing.
"""
from prefect.server.utilities.server import PrefectRouter

router = PrefectRouter(prefix="/traces-v2", tags=["Traces V2"])


@router.get("/flow-runs/{flow_run_id}/trace/")
async def get_flow_run_trace(flow_run_id: str):
    """
    Get execution trace for a flow run.
    """
    return {
        "flow_run_id": flow_run_id,
        "trace_id": "trace-456",
        "started_at": "2026-03-20T14:00:00Z",
        "duration_ms": 5000,
        "span_count": 15,
        "service_name": "prefect-server"
    }


@router.get("/flow-runs/{flow_run_id}/trace/{trace_id}/spans/")
async def get_trace_spans(flow_run_id: str, trace_id: str):
    """
    Get all spans for a trace.
    """
    return {
        "flow_run_id": flow_run_id,
        "trace_id": trace_id,
        "spans": [
            {
                "span_id": "span-1",
                "name": "task-execution",
                "duration_ms": 150,
                "parent_span_id": None
            },
            {
                "span_id": "span-2",
                "name": "data-processing",
                "duration_ms": 200,
                "parent_span_id": "span-1"
            }
        ],
        "total_spans": 2
    }
