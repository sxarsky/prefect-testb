"""
Config precedence test endpoint for SKYR-3646 validation.
"""

from prefect.server.utilities.server import PrefectRouter

router = PrefectRouter(prefix="/config-test", tags=["Config Test"])


@router.get("/precedence")
async def test_config_precedence():
    """
    Test endpoint to validate SKYR-3646 config precedence fix.

    This endpoint will trigger testbot to generate tests.
    The test_directory location will confirm which config won.
    """
    return {
        "test": "SKYR-3646",
        "check": "config_precedence",
        "expected_directory": "workflow-tests"
    }
