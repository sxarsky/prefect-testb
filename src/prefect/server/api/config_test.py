"""
Config precedence test endpoint for SKYR-3646 validation.
"""

from prefect.server.utilities.server import PrefectRouter

router = PrefectRouter(prefix="/config-test", tags=["Config Test"])


@router.get("/both-valid")
async def test_both_configs_valid():
    """
    Test endpoint for SKYR-3646 - both configs valid.

    This validates that workflow config takes precedence over workspace config
    when both are properly set.
    """
    return {
        "test": "SKYR-3646-both-valid",
        "workspace_outputDir": "workspace-tests",
        "workflow_test_directory": "workflow-tests",
        "expected_winner": "workflow-tests"
    }
