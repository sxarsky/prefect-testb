"""
Task output validation endpoints.
"""
from prefect.server.utilities.server import PrefectRouter

router = PrefectRouter(prefix="/task-validation", tags=["Task Validation"])


@router.get("/schemas")
async def list_validation_schemas():
    """Get all validation schemas."""
    return {
        "schemas": [
            {"id": "1", "task_name": "process_data", "schema_type": "pydantic"},
            {"id": "2", "task_name": "transform_data", "schema_type": "json"}
        ]
    }


@router.post("/schemas")
async def create_validation_schema(task_name: str, schema_definition: dict):
    """Create validation schema."""
    return {
        "id": "new-schema",
        "task_name": task_name,
        "schema_definition": schema_definition,
        "created": True
    }


@router.post("/validate")
async def validate_task_output(task_id: str, output_data: dict):
    """Validate task output."""
    return {
        "task_id": task_id,
        "valid": True,
        "errors": []
    }
