"""
Routes for task retry budgets
"""

from uuid import UUID

from fastapi import Body, Depends, HTTPException, Path, status

import prefect.server.models as models
import prefect.server.schemas as schemas
from prefect.server.database import PrefectDBInterface, provide_database_interface
from prefect.server.utilities.server import PrefectRouter

router = PrefectRouter(prefix="/retry-budgets", tags=["Retry Budgets"])


@router.post("/flows/{flow_id}/retry-budget/")
async def create_or_update_retry_budget(
    flow_id: UUID = Path(..., description="The flow ID"),
    budget: schemas.retry_budget.FlowRetryBudgetCreate = Body(...),
    db: PrefectDBInterface = Depends(provide_database_interface),
) -> schemas.retry_budget.FlowRetryBudget:
    """
    Create or update a flow retry budget.

    Args:
        flow_id: The ID of the flow
        budget: The retry budget configuration

    Returns:
        The created or updated retry budget
    """
    budget.flow_id = flow_id

    async with db.session_context(begin_transaction=True) as session:
        result = await models.retry_budget.create_retry_budget(
            session=session, budget=budget
        )

    return schemas.retry_budget.FlowRetryBudget.model_validate(
        result, from_attributes=True
    )


@router.get("/flow-runs/{flow_run_id}/retry-usage/")
async def get_flow_run_retry_usage(
    flow_run_id: UUID = Path(..., description="The flow run ID"),
    db: PrefectDBInterface = Depends(provide_database_interface),
) -> schemas.retry_budget.FlowRunRetryUsage:
    """
    Get retry usage for a flow run.

    Args:
        flow_run_id: The ID of the flow run

    Returns:
        Current retry usage statistics
    """
    async with db.session_context() as session:
        usage = await models.retry_budget.get_retry_usage(
            session=session, flow_run_id=flow_run_id
        )

    return usage
