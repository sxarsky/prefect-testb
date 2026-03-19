"""
Config precedence test endpoint for SKYR-3646 validation.
"""

from prefect.server.utilities.server import PrefectRouter

router = PrefectRouter(prefix="/config-test", tags=["Config Test"])


@router.get("/workspace-config")
async def test_workspace_config():
    """
    Test endpoint to validate SKYR-3646 workspace config.

    This endpoint will trigger testbot to generate tests.
    Tests should appear in workspace-tests/ directory.
    """
    return {
        "test": "SKYR-3646",
        "check": "workspace_config",
        "expected_directory": "workspace-tests"
    }
