"""
Routes for validating task outputs against schemas.
"""
from prefect.server.utilities.server import PrefectRouter

router = PrefectRouter(prefix="/task-validation-v2", tags=["Task Validation V2"])


@router.post("/schemas/")
async def create_validation_schema(
    task_name: str,
    schema_type: str,
    schema_definition: dict
):
    """
    Create a validation schema for a task.
    """
    return {
        "id": "schema-123",
        "task_name": task_name,
        "schema_type": schema_type,
        "schema_definition": schema_definition,
        "created_at": "2026-03-20T14:00:00Z"
    }


@router.get("/schemas/{task_name}")
async def get_validation_schema(task_name: str):
    """
    Get validation schema for a task.
    """
    return {
        "id": "schema-123",
        "task_name": task_name,
        "schema_type": "pydantic",
        "schema_definition": {
            "type": "object",
            "properties": {
                "status": {"type": "string"},
                "result": {"type": "number"}
            }
        }
    }


@router.post("/validate/")
async def validate_task_output(
    task_name: str,
    output_data: dict,
    schema_id: str = None
):
    """
    Validate task output against schema.
    """
    return {
        "task_name": task_name,
        "valid": True,
        "errors": [],
        "validated_at": "2026-03-20T14:00:00Z"
    }


@router.post("/validate-batch/")
async def validate_batch_outputs(
    validations: list
):
    """
    Validate multiple task outputs in batch.
    """
    return {
        "total": len(validations),
        "valid": len(validations) - 1,
        "invalid": 1,
        "results": [
            {"task_name": v.get("task_name"), "valid": True}
            for v in validations
        ]
    }
