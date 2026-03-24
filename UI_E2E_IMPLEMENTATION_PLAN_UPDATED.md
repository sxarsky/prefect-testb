# Updated Plan: UI and E2E Test Implementation for Prefect

## Current State Assessment

### Backend APIs Status
✅ **Exists:**
- `impact_v2.py` - Flow impact analysis (mock endpoints ready)
- `concurrency_limits_v2.py` - Global concurrency limits (full implementation)

❌ **Missing (need to be created):**
- `flow_costs_v2.py` - Flow cost tracking
- `quotas_v2.py` - Flow execution quotas
- `task_validation_v2.py` - Task output validation
- `traces_v2.py` - Flow execution traces
- `checkpoints_v2.py` - Flow run checkpoints
- `graph_v2.py` - Flow dependency graphs
- `retry_budget_v2.py` - Task retry budgets

### UI Infrastructure Status
✅ **Exists:**
- React 19 + TypeScript setup
- TanStack Router (file-based routing)
- TanStack Query (API data fetching)
- Tailwind CSS + shadcn/ui components
- Playwright E2E test infrastructure
- `ui-v2/src/routes/runs/flow-run.$id.tsx` - Flow run detail page with tabs
- `ui-v2/src/routes/flows/flow.$id.tsx` - Flow detail page with tabs
- `ui-v2/src/api/` - API client modules
- `ui-v2/e2e/` - E2E test infrastructure

## Revised Implementation Approach

Given that most backend APIs don't exist yet, we'll take a **full-stack approach** for each PR:

1. **Create mock backend API** (simple stub endpoints)
2. **Build UI components** (connected to backend)
3. **Write E2E tests** (against real backend endpoints)

This ensures each PR is self-contained and functional.

---

## Revised PR Breakdown (8 PRs)

### Phase 1: Foundation Features (Start with existing backend)

#### PR 1: Flow Impact Analysis Visualization ⭐ START HERE
**Backend:** ✅ Already exists (`impact_v2.py`)
**Scope:** Small-Medium (2-3 days)
**Feature:** Add "Impact" tab to flow detail page

**Backend Work:**
- None needed - `impact_v2.py` already has mock endpoints

**Frontend Work:**
Files to create:
- `ui-v2/src/api/impact/index.ts` - API client module
- `ui-v2/src/components/flows/detail/flow-impact-tab/index.tsx` - Main tab component
- `ui-v2/src/components/flows/detail/flow-impact-tab/dependency-graph.tsx` - Graph visualization
- `ui-v2/src/components/flows/detail/flow-impact-tab/affected-flows-table.tsx` - Affected flows list
- `ui-v2/e2e/flows/flow-impact.spec.ts` - E2E tests

Files to modify:
- `ui-v2/src/routes/flows/flow.$id.tsx` - Add "impact" to tab enum (line 62)

**UI Components:**
- Simple visualization of dependency graph (can use text/table initially)
- Table showing affected flows with impact levels
- Badge components for impact levels (high/medium/low)
- Form to register dependencies

**E2E Tests (4 scenarios):**
1. Navigate to Impact tab
2. View dependency graph
3. View affected flows list
4. Register new dependency

**Pattern Reference:**
- Tab pattern: `ui-v2/src/routes/flows/flow.$id.tsx` (lines 60-82)
- API pattern: `ui-v2/src/api/flows/index.ts`

---

#### PR 2: Global Concurrency Limits UI Enhancement
**Backend:** ✅ Already exists (`concurrency_limits_v2.py`)
**Scope:** Small-Medium (2-3 days)
**Feature:** Enhance existing concurrency limits UI

**Note:** This leverages the existing fully-implemented backend API. Check if UI already exists and needs enhancement, or if we need to build from scratch.

**Investigate First:**
- Check if `ui-v2/src/routes/concurrency-limits/` exists
- Check if `ui-v2/src/api/global-concurrency-limits/` exists

**Work TBD based on investigation.**

---

### Phase 2: New Backend + UI Features

#### PR 3: Flow Run Graph Visualization
**Backend:** ❌ Need to create `graph_v2.py`
**Scope:** Small-Medium (2-3 days)
**Feature:** Add "Graph" tab to flow run detail page

**Backend Work:**
File to create:
- `src/prefect/server/api/graph_v2.py`

Endpoints needed:
```python
@router.get("/flow-runs/{flow_run_id}/graph/")
async def get_flow_run_graph(flow_run_id: str):
    """Get task graph for a flow run"""
    return {
        "flow_run_id": flow_run_id,
        "nodes": [
            {"id": "task-1", "name": "extract_data", "state": "completed"},
            {"id": "task-2", "name": "transform_data", "state": "completed"},
            {"id": "task-3", "name": "load_data", "state": "running"}
        ],
        "edges": [
            {"from": "task-1", "to": "task-2"},
            {"from": "task-2", "to": "task-3"}
        ]
    }
```

**Frontend Work:**
Files to create:
- `ui-v2/src/api/graph/index.ts`
- `ui-v2/src/components/flow-runs/flow-run-graph/index.tsx`
- `ui-v2/e2e/flow-runs/flow-run-graph.spec.ts`

Files to modify:
- `ui-v2/src/routes/runs/flow-run.$id.tsx` - Add "Graph" to tab enum (line 17)

**UI Components:**
- Simple node-edge visualization (could use react-flow or simple table initially)
- Empty state when no graph available

**E2E Tests (3 scenarios):**
1. Navigate to Graph tab
2. View graph with tasks
3. Empty state verification

---

#### PR 4: Flow Execution Traces Viewer
**Backend:** ❌ Need to create `traces_v2.py`
**Scope:** Small (1-2 days)
**Feature:** Add "Traces" tab to flow run detail page

**Backend Work:**
File to create:
- `src/prefect/server/api/traces_v2.py`

Endpoints:
```python
@router.get("/flow-runs/{flow_run_id}/traces/")
async def get_flow_run_traces(flow_run_id: str):
    """Get execution traces for a flow run"""
    return {
        "flow_run_id": flow_run_id,
        "traces": [
            {
                "trace_id": "trace-1",
                "span_type": "task",
                "name": "extract_data",
                "started_at": "2026-03-23T10:00:00Z",
                "duration_ms": 1500
            }
        ]
    }
```

**Frontend Work:**
Files to create:
- `ui-v2/src/api/traces/index.ts`
- `ui-v2/src/components/flow-runs/flow-run-traces/traces-table.tsx`
- `ui-v2/e2e/flow-runs/flow-run-traces.spec.ts`

Files to modify:
- `ui-v2/src/routes/runs/flow-run.$id.tsx` - Add "Traces" to tab enum

**UI Components:**
- Data table with columns: span_type, name, duration, started_at
- Filter by span type
- Badge for different span types

**E2E Tests (3 scenarios):**
1. Navigate to Traces tab
2. View traces table
3. Filter traces

---

#### PR 5: Flow Run Checkpoints Timeline
**Backend:** ❌ Need to create `checkpoints_v2.py`
**Scope:** Small (1-2 days)
**Feature:** Add checkpoints card to flow run detail

**Backend Work:**
File to create:
- `src/prefect/server/api/checkpoints_v2.py`

Endpoints:
```python
@router.get("/flow-runs/{flow_run_id}/checkpoints/")
async def get_flow_run_checkpoints(flow_run_id: str):
    """Get checkpoints for a flow run"""
    return {
        "flow_run_id": flow_run_id,
        "checkpoints": [
            {
                "id": "cp-1",
                "name": "data_extracted",
                "state": "completed",
                "created_at": "2026-03-23T10:00:00Z"
            }
        ]
    }
```

**Frontend Work:**
Files to create:
- `ui-v2/src/api/checkpoints/index.ts`
- `ui-v2/src/components/flow-runs/flow-run-checkpoints/checkpoint-timeline.tsx`
- `ui-v2/e2e/flow-runs/flow-run-checkpoints.spec.ts`

Files to modify:
- `ui-v2/src/routes/runs/flow-run.$id.tsx` - Add checkpoints card in Details tab

**UI Components:**
- Timeline/list view of checkpoints
- Accordion for expandable details
- Badge for checkpoint states

**E2E Tests (3 scenarios):**
1. View flow run with checkpoints
2. Expand checkpoint details
3. Verify ordering

---

#### PR 6: Flow Cost Profile Management
**Backend:** ❌ Need to create `flow_costs_v2.py`
**Scope:** Medium (3-4 days)
**Feature:** Add "Costs" tab to flow detail page

**Backend Work:**
File to create:
- `src/prefect/server/api/flow_costs_v2.py`

Endpoints:
```python
@router.post("/flows/{flow_id}/cost-profile/")
async def create_cost_profile(flow_id: str, body: dict):
    """Create cost profile"""

@router.get("/flows/{flow_id}/cost-profile/")
async def get_cost_profile(flow_id: str):
    """Get cost profile"""

@router.patch("/flows/{flow_id}/cost-profile/")
async def update_cost_profile(flow_id: str, body: dict):
    """Update cost profile"""

@router.delete("/flows/{flow_id}/cost-profile/")
async def delete_cost_profile(flow_id: str):
    """Delete cost profile"""

@router.get("/flows/{flow_id}/cost-history/")
async def get_cost_history(flow_id: str):
    """Get cost history for charts"""
```

**Frontend Work:**
Files to create:
- `ui-v2/src/api/flow-costs/index.ts` - Full CRUD
- `ui-v2/src/components/flows/detail/flow-costs-tab/index.tsx`
- `ui-v2/src/components/flows/detail/flow-costs-tab/cost-profile-form.tsx`
- `ui-v2/src/components/flows/detail/flow-costs-tab/cost-history-chart.tsx`
- `ui-v2/e2e/flows/flow-costs.spec.ts`

Files to modify:
- `ui-v2/src/routes/flows/flow.$id.tsx` - Add "costs" to tab enum

**UI Components:**
- Form with currency, cost_per_second, cost_per_task
- Line chart for cost history (recharts)
- CRUD operations

**E2E Tests (6 scenarios):**
1. Navigate to Costs tab
2. Create cost profile
3. View cost profile
4. Edit cost profile
5. Delete cost profile
6. Form validation

---

#### PR 7: Flow Quota Management Dashboard
**Backend:** ❌ Need to create `quotas_v2.py`
**Scope:** Medium (3-4 days)
**Feature:** Add "Quotas" tab to flow detail page

**Backend Work:**
File to create:
- `src/prefect/server/api/quotas_v2.py`

Endpoints:
```python
@router.post("/flows/{flow_id}/quota/")
async def create_quota(flow_id: str, body: dict):
    """Create quota configuration"""

@router.get("/flows/{flow_id}/quota/")
async def get_quota(flow_id: str):
    """Get quota config and usage"""

@router.patch("/flows/{flow_id}/quota/")
async def update_quota(flow_id: str, body: dict):
    """Update quota"""

@router.post("/flows/{flow_id}/quota/reset/")
async def reset_quota(flow_id: str):
    """Reset quota usage"""
```

**Frontend Work:**
Files to create:
- `ui-v2/src/api/quotas/index.ts`
- `ui-v2/src/components/flows/detail/flow-quotas-tab/index.tsx`
- `ui-v2/src/components/flows/detail/flow-quotas-tab/quota-config-form.tsx`
- `ui-v2/src/components/flows/detail/flow-quotas-tab/quota-usage-card.tsx`
- `ui-v2/e2e/flows/flow-quotas.spec.ts`

Files to modify:
- `ui-v2/src/routes/flows/flow.$id.tsx` - Add "quotas" to tab enum

**UI Components:**
- Progress bars for concurrent/daily/hourly usage
- Form for quota limits
- Color-coded badges
- Reset button with confirmation

**E2E Tests (6 scenarios):**
1. View quotas tab
2. Create quota
3. View usage metrics
4. Update limits
5. Reset usage
6. Delete quota

---

#### PR 8: Task Validation Results Panel
**Backend:** ❌ Need to create `task_validation_v2.py`
**Scope:** Small (2 days)
**Feature:** Add validation section to task run detail

**Backend Work:**
File to create:
- `src/prefect/server/api/task_validation_v2.py`

Endpoints:
```python
@router.get("/task-runs/{task_run_id}/validation/")
async def get_validation_result(task_run_id: str):
    """Get validation results"""
    return {
        "task_run_id": task_run_id,
        "status": "passed",  # or "failed"
        "schema": {...},
        "errors": []
    }
```

**Frontend Work:**
Files to create:
- `ui-v2/src/api/task-validation/index.ts`
- `ui-v2/src/components/task-runs/task-validation-results/validation-card.tsx`
- `ui-v2/e2e/runs/task-validation.spec.ts`

Files to modify:
- `ui-v2/src/routes/runs/task-run.$id.tsx` - Add validation section

**UI Components:**
- Card with success/error states
- Badge for validation status
- JSON viewer for schema
- Alert for errors

**E2E Tests (3 scenarios):**
1. View task with validation success
2. View validation errors
3. Expand schema details

---

## Implementation Order (Recommended)

1. **PR 1: Flow Impact Analysis** - Backend exists, establish patterns ⭐ START
2. **PR 2: Concurrency Limits UI** - Backend exists (if UI work needed)
3. **PR 3: Flow Run Graph** - Simple visualization
4. **PR 4: Flow Execution Traces** - Simple table
5. **PR 5: Flow Run Checkpoints** - Simple timeline
6. **PR 8: Task Validation** - Simple card
7. **PR 6: Flow Cost Management** - More complex CRUD
8. **PR 7: Flow Quota Management** - Most complex

---

## Common Patterns to Follow

### Backend API Pattern (Mock Endpoints)
```python
from prefect.server.utilities.server import PrefectRouter

router = PrefectRouter(prefix="/feature-v2", tags=["Feature V2"])

@router.get("/resources/{id}/")
async def get_resource(id: str):
    """Get resource by ID"""
    return {
        "id": id,
        "name": "example",
        "data": {...}
    }
```

### Frontend API Module Pattern
```typescript
// ui-v2/src/api/feature/index.ts
import { queryOptions } from "@tanstack/react-query";
import { getQueryService } from "@/api/service";

export const queryKeyFactory = {
  all: () => ["feature"] as const,
  detail: (id: string) => [...queryKeyFactory.all(), id] as const,
};

export const buildGetFeatureQuery = (id: string) =>
  queryOptions({
    queryKey: queryKeyFactory.detail(id),
    queryFn: async () => {
      const res = await (await getQueryService()).GET("/feature-v2/resources/{id}/", {
        params: { path: { id } },
      });
      return res.data;
    },
  });
```

### Tab Addition Pattern
```typescript
// In ui-v2/src/routes/flows/flow.$id.tsx (line 62)
const searchParams = z
  .object({
    tab: z.enum(["runs", "deployments", "details", "newtab"]).optional().default("runs"),
    // ... rest of search params
  })
```

### E2E Test Pattern
```typescript
import { test, expect } from "../fixtures";

test.describe("Feature Tab", () => {
  test("navigates to tab and displays content", async ({ page }) => {
    await page.goto("/flows/flow/some-id");
    await page.getByRole("tab", { name: /newtab/i }).click();
    await expect(page.getByText(/feature content/i)).toBeVisible();
  });
});
```

---

## Per-PR Checklist

- [ ] Backend API file created (if needed)
- [ ] Backend router registered in `src/prefect/server/api/__init__.py`
- [ ] Frontend API module created
- [ ] UI components created
- [ ] Route modified to add tab (if applicable)
- [ ] E2E tests written
- [ ] Manual testing completed
- [ ] PR created with clear description

---

## Next Steps

1. **Investigate PR 2** - Check if concurrency limits UI already exists
2. **Start PR 1** - Implement Impact Analysis UI (backend ready)
3. **Create backend stubs** - For PRs 3-8 as we get to them
4. **Follow patterns** - Use existing code as reference
5. **Test thoroughly** - E2E tests for each feature

---

## Notes

- This plan is more realistic - we'll build both backend (simple mocks) and frontend together
- Each PR is fully functional and testable
- We start with what exists (Impact API) to establish patterns
- Mock backends can be enhanced later with real database integration
- All PRs are independent (can work in parallel or sequentially)
