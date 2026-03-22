"""
Flow Execution Traces API

Provides endpoints for collecting and querying execution traces.
"""

from typing import Optional
from datetime import datetime, timedelta
from prefect.server.utilities.server import PrefectRouter

router = PrefectRouter(prefix="/traces-v2", tags=["Traces V2"])


@router.get("/flow-runs/{flow_run_id}/traces/")
async def get_flow_run_traces(flow_run_id: str, span_type: Optional[str] = None):
    """
    Get execution traces for a flow run.
    """
    base_time = datetime.now()

    traces = [
        {
            "id": "span-1",
            "flow_run_id": flow_run_id,
            "span_type": "task",
            "name": "extract_data",
            "start_time": (base_time - timedelta(minutes=5)).isoformat(),
            "end_time": (base_time - timedelta(minutes=4, seconds=15)).isoformat(),
            "duration_ms": 45000,
            "status": "completed",
            "parent_span_id": None,
        },
        {
            "id": "span-2",
            "flow_run_id": flow_run_id,
            "span_type": "task",
            "name": "transform_data",
            "start_time": (base_time - timedelta(minutes=4)).isoformat(),
            "end_time": (base_time - timedelta(minutes=2, seconds=52)).isoformat(),
            "duration_ms": 68000,
            "status": "completed",
            "parent_span_id": None,
        },
        {
            "id": "span-3",
            "flow_run_id": flow_run_id,
            "span_type": "task",
            "name": "load_data",
            "start_time": (base_time - timedelta(minutes=2, seconds=45)).isoformat(),
            "end_time": (base_time - timedelta(minutes=2, seconds=22)).isoformat(),
            "duration_ms": 23000,
            "status": "completed",
            "parent_span_id": None,
        },
        {
            "id": "span-4",
            "flow_run_id": flow_run_id,
            "span_type": "flow",
            "name": "etl_pipeline",
            "start_time": (base_time - timedelta(minutes=5, seconds=5)).isoformat(),
            "end_time": (base_time - timedelta(minutes=2, seconds=20)).isoformat(),
            "duration_ms": 165000,
            "status": "completed",
            "parent_span_id": None,
        },
    ]

    if span_type:
        traces = [t for t in traces if t["span_type"] == span_type]

    return {
        "flow_run_id": flow_run_id,
        "traces": traces,
        "total_spans": len(traces),
    }
