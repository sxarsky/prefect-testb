"""
Routes for task validation results tracking.
"""
from prefect.server.utilities.server import PrefectRouter

router = PrefectRouter(prefix="/task-validation-v2", tags=["Task Validation V2"])


@router.get("/task-runs/{task_run_id}/validation/")
async def get_task_validation_results(task_run_id: str):
    """
    Get validation results for a task run.
    Returns all validation checks, assertions, and test outcomes.
    """
    return {
        "task_run_id": task_run_id,
        "validation_status": "passed",  # or "failed", "partial"
        "total_checks": 5,
        "passed_checks": 4,
        "failed_checks": 1,
        "skipped_checks": 0,
        "validation_results": [
            {
                "id": "val-1",
                "check_name": "schema_validation",
                "check_type": "schema",
                "status": "passed",
                "message": "Data schema matches expected format",
                "details": {
                    "expected_schema": "OrderSchema",
                    "actual_schema": "OrderSchema",
                },
                "timestamp": "2026-03-23T10:05:20Z",
            },
            {
                "id": "val-2",
                "check_name": "row_count_validation",
                "check_type": "assertion",
                "status": "passed",
                "message": "Row count is within expected range",
                "details": {
                    "expected_min": 1000,
                    "expected_max": 100000,
                    "actual": 50000,
                },
                "timestamp": "2026-03-23T10:05:21Z",
            },
            {
                "id": "val-3",
                "check_name": "null_value_check",
                "check_type": "data_quality",
                "status": "failed",
                "message": "Found NULL values in non-nullable columns",
                "details": {
                    "affected_columns": ["customer_id", "order_date"],
                    "null_count": 12,
                },
                "timestamp": "2026-03-23T10:05:22Z",
            },
            {
                "id": "val-4",
                "check_name": "business_rule_validation",
                "check_type": "business_rule",
                "status": "passed",
                "message": "All orders have valid customer references",
                "details": {
                    "rule": "customer_exists",
                    "violations": 0,
                },
                "timestamp": "2026-03-23T10:05:23Z",
            },
            {
                "id": "val-5",
                "check_name": "performance_check",
                "check_type": "performance",
                "status": "passed",
                "message": "Task completed within SLA",
                "details": {
                    "sla_seconds": 300,
                    "actual_seconds": 125,
                },
                "timestamp": "2026-03-23T10:05:24Z",
            },
        ],
    }


@router.post("/task-runs/{task_run_id}/validation/")
async def create_validation_result(task_run_id: str, validation_data: dict):
    """
    Record a validation result for a task run.
    """
    return {
        "id": "val-new",
        "task_run_id": task_run_id,
        "check_name": validation_data.get("check_name", "unnamed_check"),
        "check_type": validation_data.get("check_type", "assertion"),
        "status": validation_data.get("status", "passed"),
        "message": validation_data.get("message", ""),
        "details": validation_data.get("details", {}),
        "timestamp": "2026-03-23T10:07:00Z",
    }


@router.get("/flows/{flow_id}/validation-summary/")
async def get_flow_validation_summary(flow_id: str):
    """
    Get aggregated validation statistics for a flow.
    """
    return {
        "flow_id": flow_id,
        "total_task_runs": 150,
        "validated_task_runs": 145,
        "overall_pass_rate": 0.96,
        "validation_stats": {
            "total_checks": 725,
            "passed_checks": 698,
            "failed_checks": 22,
            "skipped_checks": 5,
        },
        "check_type_breakdown": {
            "schema": {"total": 145, "passed": 145, "failed": 0},
            "assertion": {"total": 290, "passed": 280, "failed": 10},
            "data_quality": {"total": 145, "passed": 133, "failed": 12},
            "business_rule": {"total": 145, "passed": 140, "failed": 0},
        },
        "recent_failures": [
            {
                "task_run_id": "task-run-123",
                "check_name": "null_value_check",
                "timestamp": "2026-03-23T10:05:22Z",
            },
            {
                "task_run_id": "task-run-456",
                "check_name": "row_count_validation",
                "timestamp": "2026-03-23T09:30:15Z",
            },
        ],
    }
