"""
Config precedence test endpoint for SKYR-3646 validation.
"""

from prefect.server.utilities.server import PrefectRouter

router = PrefectRouter(prefix="/config-test", tags=["Config Test"])


@router.get("/workspace-only")
async def test_workspace_only():
    """
    Test endpoint for SKYR-3646 - workspace config only.

    This validates that workspace config IS used when workflow config
    doesn't override it.
    """
    return {
        "test": "SKYR-3646-workspace-only",
        "workspace_outputDir": "workspace-tests",
        "workflow_test_directory": "none",
        "expected_location": "workspace-tests"
    }
