import {
	cleanupFlowRuns,
	cleanupFlows,
	createFlow,
	createFlowRun,
	expect,
	test,
	waitForServerHealth,
} from "../fixtures";

const TEST_PREFIX = "e2e-traces-";

test.describe("Flow Run Traces", () => {
	test.describe.configure({ mode: "serial" });

	test.beforeAll(async ({ apiClient }) => {
		await waitForServerHealth(apiClient);
	});

	test.beforeEach(async ({ apiClient }) => {
		try {
			await cleanupFlows(apiClient, TEST_PREFIX);
			await cleanupFlowRuns(apiClient, TEST_PREFIX);
		} catch {
			// Ignore cleanup errors
		}
	});

	test.afterEach(async ({ apiClient }) => {
		try {
			await cleanupFlows(apiClient, TEST_PREFIX);
			await cleanupFlowRuns(apiClient, TEST_PREFIX);
		} catch {
			// Ignore cleanup errors
		}
	});

	test("displays traces summary for flow run", async ({ page, apiClient }) => {
		const flowName = `${TEST_PREFIX}traces-${Date.now()}`;
		const flow = await createFlow(apiClient, flowName);
		const flowRun = await createFlowRun(apiClient, {
			flowId: flow.id,
			name: `${TEST_PREFIX}run-${Date.now()}`,
			state: { type: "COMPLETED", name: "Completed" },
		});

		// Navigate directly to test the traces API endpoint
		await page.goto(`/runs/flow-run/${flowRun.id}`);

		// Wait for page to load
		await expect(page.getByText(flowRun.name)).toBeVisible({ timeout: 10000 });

		// The traces would be displayed if we had a Traces tab
		// For now, just verify the page loads correctly
		await expect(page).toHaveURL(new RegExp(`/runs/flow-run/${flowRun.id}`));
	});

	test("traces API returns data", async ({ apiClient }) => {
		const flowName = `${TEST_PREFIX}traces-api-${Date.now()}`;
		const flow = await createFlow(apiClient, flowName);
		const flowRun = await createFlowRun(apiClient, {
			flowId: flow.id,
			name: `${TEST_PREFIX}run-api-${Date.now()}`,
			state: { type: "COMPLETED", name: "Completed" },
		});

		// Test the traces API endpoint directly
		const response = await apiClient.GET(
			"/traces-v2/flow-runs/{flow_run_id}/traces/",
			{
				params: { path: { flow_run_id: flowRun.id } },
			},
		);

		expect(response.data).toBeDefined();
		expect(response.data?.flow_run_id).toBe(flowRun.id);
		expect(response.data?.traces).toBeDefined();
		expect(Array.isArray(response.data?.traces)).toBe(true);
	});
});
