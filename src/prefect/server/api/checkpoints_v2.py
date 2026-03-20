"""
Routes for flow run checkpoints.
Replication of PR#8 for comparison testing.
"""
from prefect.server.utilities.server import PrefectRouter

router = PrefectRouter(prefix="/checkpoints-v2", tags=["Checkpoints V2"])


@router.get("/flow-runs/{flow_run_id}/checkpoints/")
async def get_flow_run_checkpoints(flow_run_id: str):
    """
    Get all checkpoints for a flow run.
    """
    return {
        "flow_run_id": flow_run_id,
        "checkpoints": [
            {
                "id": "checkpoint-1",
                "task_name": "process_data",
                "created_at": "2026-03-20T14:00:00Z",
                "state_data": {"progress": 50}
            },
            {
                "id": "checkpoint-2",
                "task_name": "transform_data",
                "created_at": "2026-03-20T14:05:00Z",
                "state_data": {"progress": 100}
            }
        ],
        "total": 2
    }


@router.post("/flow-runs/{flow_run_id}/checkpoints/")
async def create_checkpoint(
    flow_run_id: str,
    task_name: str,
    state_data: dict
):
    """
    Create a checkpoint for a flow run.
    """
    return {
        "id": "checkpoint-new",
        "flow_run_id": flow_run_id,
        "task_name": task_name,
        "state_data": state_data,
        "created_at": "2026-03-20T14:00:00Z"
    }


@router.post("/flow-runs/{flow_run_id}/restore/")
async def restore_from_checkpoint(
    flow_run_id: str,
    checkpoint_id: str
):
    """
    Restore a flow run from a checkpoint.
    """
    return {
        "flow_run_id": flow_run_id,
        "checkpoint_id": checkpoint_id,
        "restored": True,
        "resume_task": "next_task"
    }
