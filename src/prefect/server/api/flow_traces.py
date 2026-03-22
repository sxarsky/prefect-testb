"""
Flow execution traces endpoints.
"""
from prefect.server.utilities.server import PrefectRouter

router = PrefectRouter(prefix="/flow-traces", tags=["Flow Traces"])


@router.get("/runs/{run_id}")
async def get_execution_trace(run_id: str):
    """Get execution trace for a run."""
    return {
        "run_id": run_id,
        "trace_version": "2.0",
        "spans": [
            {"span_id": "1", "name": "task-1", "duration_ms": 150},
            {"span_id": "2", "name": "task-2", "duration_ms": 200}
        ],
        "total_duration_ms": 350
    }


@router.post("/runs/{run_id}/spans")
async def add_trace_span(run_id: str, span_name: str, duration_ms: int):
    """Add a trace span."""
    return {
        "run_id": run_id,
        "span_id": "new-span",
        "span_name": span_name,
        "duration_ms": duration_ms
    }


@router.get("/export/{run_id}")
async def export_trace(run_id: str, format: str = "json"):
    """Export trace in various formats."""
    return {
        "run_id": run_id,
        "format": format,
        "download_url": f"/traces/{run_id}.{format}"
    }
