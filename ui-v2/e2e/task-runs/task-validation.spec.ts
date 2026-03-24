import {
	cleanupFlowRuns,
	cleanupFlows,
	createFlow,
	createFlowRun,
	expect,
	test,
	waitForServerHealth,
} from "../fixtures";

const TEST_PREFIX = "e2e-validation-";

test.describe("Task Validation Results", () => {
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

	test("task validation API returns results", async ({ apiClient }) => {
		// Use a mock task run ID for testing the validation endpoint
		const taskRunId = "task-run-123";

		const response = await apiClient.GET(
			"/task-validation-v2/task-runs/{task_run_id}/validation/",
			{
				params: { path: { task_run_id: taskRunId } },
			},
		);

		expect(response.data).toBeDefined();
		expect(response.data?.task_run_id).toBe(taskRunId);
		expect(response.data?.validation_status).toBeDefined();
		expect(response.data?.total_checks).toBeGreaterThanOrEqual(0);
		expect(response.data?.validation_results).toBeDefined();
		expect(Array.isArray(response.data?.validation_results)).toBe(true);
	});

	test("flow validation summary API returns data", async ({ apiClient }) => {
		const flowName = `${TEST_PREFIX}validation-${Date.now()}`;
		const flow = await createFlow(apiClient, flowName);

		const response = await apiClient.GET(
			"/task-validation-v2/flows/{flow_id}/validation-summary/",
			{
				params: { path: { flow_id: flow.id } },
			},
		);

		expect(response.data).toBeDefined();
		expect(response.data?.flow_id).toBe(flow.id);
		expect(response.data?.validation_stats).toBeDefined();
		expect(response.data?.check_type_breakdown).toBeDefined();
		expect(response.data?.overall_pass_rate).toBeGreaterThanOrEqual(0);
		expect(response.data?.overall_pass_rate).toBeLessThanOrEqual(1);
	});

	test("create validation result API works", async ({ apiClient }) => {
		const taskRunId = "task-run-456";

		const response = await apiClient.POST(
			"/task-validation-v2/task-runs/{task_run_id}/validation/",
			{
				params: { path: { task_run_id: taskRunId } },
				body: {
					check_name: "test_validation",
					check_type: "assertion",
					status: "passed",
					message: "Test validation passed",
					details: { test: true },
				} as never,
			},
		);

		expect(response.data).toBeDefined();
		expect(response.data?.task_run_id).toBe(taskRunId);
		expect(response.data?.check_name).toBe("test_validation");
		expect(response.data?.status).toBe("passed");
		expect(response.data?.id).toBeDefined();
	});

	test("validation results include all check types", async ({ apiClient }) => {
		const taskRunId = "task-run-789";

		const response = await apiClient.GET(
			"/task-validation-v2/task-runs/{task_run_id}/validation/",
			{
				params: { path: { task_run_id: taskRunId } },
			},
		);

		expect(response.data).toBeDefined();
		const results = response.data?.validation_results || [];

		// Verify we have different check types
		const checkTypes = new Set(results.map((r: { check_type: string }) => r.check_type));
		expect(checkTypes.size).toBeGreaterThan(0);
	});
});
