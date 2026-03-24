# SKYR-3646 Config Precedence Test

This file exists to trigger testbot for config precedence validation.

## Test Setup

**Workspace Config** (`.skyramp/workspace.yml`):
- base_url: `http://workspace-config-url:4200`

**Workflow Config** (`.github/workflows/skyramp-testbot.yml`):
- base_url: `http://workflow-config-url:4200`

## Expected Behavior

According to SKYR-3646 fix:
- ✅ Workflow config should WIN
- ✅ Testbot should use `http://workflow-config-url:4200`
- ❌ Should NOT use `http://workspace-config-url:4200`

## Validation

Check testbot logs for which base_url is actually used.
