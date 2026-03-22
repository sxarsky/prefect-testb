import {
	cleanupFlows,
	createFlow,
	expect,
	test,
	waitForServerHealth,
} from "../fixtures";

const TEST_PREFIX = "e2e-costs-";

test.describe("Flow Cost & Resource Profiler", () => {
	test.describe.configure({ mode: "serial" });

	test.beforeAll(async ({ apiClient }) => {
		await waitForServerHealth(apiClient);
	});

	test.beforeEach(async ({ apiClient }) => {
		try {
			await cleanupFlows(apiClient, TEST_PREFIX);
		} catch {
			// Ignore cleanup errors
		}
	});

	test.afterEach(async ({ apiClient }) => {
		try {
			await cleanupFlows(apiClient, TEST_PREFIX);
		} catch {
			// Ignore cleanup errors
		}
	});

	test("cost profile API returns data", async ({ apiClient }) => {
		const flowName = `${TEST_PREFIX}cost-${Date.now()}`;
		const flow = await createFlow(apiClient, flowName);

		const response = await apiClient.GET(
			"/flow-costs-v2/flows/{flow_id}/cost-profile/",
			{
				params: { path: { flow_id: flow.id } },
			},
		);

		expect(response.data).toBeDefined();
		expect(response.data?.flow_id).toBe(flow.id);
		expect(response.data?.cost_profile).toBeDefined();
		expect(response.data?.cost_profile.currency).toBeDefined();
		expect(response.data?.current_spending).toBeDefined();
		expect(response.data?.current_spending.total_cost).toBeGreaterThanOrEqual(
			0,
		);
	});

	test("cost history API returns data", async ({ apiClient }) => {
		const flowName = `${TEST_PREFIX}history-${Date.now()}`;
		const flow = await createFlow(apiClient, flowName);

		const response = await apiClient.GET(
			"/flow-costs-v2/flows/{flow_id}/cost-history/",
			{
				params: {
					path: { flow_id: flow.id },
					query: { days: 30 },
				},
			},
		);

		expect(response.data).toBeDefined();
		expect(response.data?.flow_id).toBe(flow.id);
		expect(response.data?.period_days).toBe(30);
		expect(response.data?.history).toBeDefined();
		expect(Array.isArray(response.data?.history)).toBe(true);
		expect(response.data?.history.length).toBeGreaterThan(0);
	});

	test("create cost profile API works", async ({ apiClient }) => {
		const flowName = `${TEST_PREFIX}create-${Date.now()}`;
		const flow = await createFlow(apiClient, flowName);

		const response = await apiClient.POST(
			"/flow-costs-v2/flows/{flow_id}/cost-profile/",
			{
				params: { path: { flow_id: flow.id } },
				body: {
					currency: "USD",
					cost_per_second: 0.0001,
					cost_per_task: 0.05,
					cost_per_gb_memory: 0.0025,
					fixed_cost_per_run: 0.1,
				} as never,
			},
		);

		expect(response.data).toBeDefined();
		expect(response.data?.flow_id).toBe(flow.id);
		expect(response.data?.currency).toBe("USD");
		expect(response.data?.cost_per_second).toBe(0.0001);
		expect(response.data?.id).toBeDefined();
	});

	test("delete cost profile API works", async ({ apiClient }) => {
		const flowName = `${TEST_PREFIX}delete-${Date.now()}`;
		const flow = await createFlow(apiClient, flowName);

		const response = await apiClient.DELETE(
			"/flow-costs-v2/flows/{flow_id}/cost-profile/",
			{
				params: { path: { flow_id: flow.id } },
			},
		);

		expect(response.data).toBeDefined();
		expect(response.data?.success).toBe(true);
	});

	test("flow run cost breakdown API returns data", async ({ apiClient }) => {
		const flowRunId = "test-run-123";

		const response = await apiClient.GET(
			"/flow-costs-v2/flow-runs/{flow_run_id}/cost-breakdown/",
			{
				params: { path: { flow_run_id: flowRunId } },
			},
		);

		expect(response.data).toBeDefined();
		expect(response.data?.flow_run_id).toBe(flowRunId);
		expect(response.data?.total_cost).toBeGreaterThanOrEqual(0);
		expect(response.data?.breakdown).toBeDefined();
		expect(response.data?.task_costs).toBeDefined();
		expect(Array.isArray(response.data?.task_costs)).toBe(true);
	});

	test("cost forecast API returns predictions", async ({ apiClient }) => {
		const flowName = `${TEST_PREFIX}forecast-${Date.now()}`;
		const flow = await createFlow(apiClient, flowName);

		const response = await apiClient.GET(
			"/flow-costs-v2/flows/{flow_id}/cost-forecast/",
			{
				params: {
					path: { flow_id: flow.id },
					query: { days: 7 },
				},
			},
		);

		expect(response.data).toBeDefined();
		expect(response.data?.flow_id).toBe(flow.id);
		expect(response.data?.forecast_days).toBe(7);
		expect(response.data?.forecast).toBeDefined();
		expect(Array.isArray(response.data?.forecast)).toBe(true);
		expect(response.data?.forecast.length).toBe(7);
		// Check forecast entries have required fields
		const firstForecast = response.data?.forecast[0];
		expect(firstForecast?.date).toBeDefined();
		expect(firstForecast?.predicted_cost).toBeGreaterThanOrEqual(0);
		expect(firstForecast?.confidence).toBeGreaterThan(0);
		expect(firstForecast?.confidence).toBeLessThanOrEqual(1);
	});
});
