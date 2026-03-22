import {
	cleanupFlows,
	createFlow,
	expect,
	test,
	waitForServerHealth,
} from "../fixtures";

const TEST_PREFIX = "e2e-retry-budgets-";

test.describe("Flow Retry Budget Tracker", () => {
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

	test("retry budget API returns data", async ({ apiClient }) => {
		const flowName = `${TEST_PREFIX}budget-${Date.now()}`;
		const flow = await createFlow(apiClient, flowName);

		const response = await apiClient.GET(
			"/retry-budgets-v2/flows/{flow_id}/retry-budget/",
			{
				params: { path: { flow_id: flow.id } },
			},
		);

		expect(response.data).toBeDefined();
		expect(response.data?.flow_id).toBe(flow.id);
		expect(response.data?.retry_budget).toBeDefined();
		expect(response.data?.current_usage).toBeDefined();
		expect(response.data?.usage_percentages).toBeDefined();
	});

	test("retry history API returns data", async ({ apiClient }) => {
		const flowName = `${TEST_PREFIX}history-${Date.now()}`;
		const flow = await createFlow(apiClient, flowName);

		const response = await apiClient.GET(
			"/retry-budgets-v2/flows/{flow_id}/retry-history/",
			{
				params: {
					path: { flow_id: flow.id },
					query: { days: 7 },
				},
			},
		);

		expect(response.data).toBeDefined();
		expect(response.data?.flow_id).toBe(flow.id);
		expect(response.data?.period_days).toBe(7);
		expect(response.data?.history).toBeDefined();
		expect(Array.isArray(response.data?.history)).toBe(true);
	});

	test("create retry budget API works", async ({ apiClient }) => {
		const flowName = `${TEST_PREFIX}create-${Date.now()}`;
		const flow = await createFlow(apiClient, flowName);

		const response = await apiClient.POST(
			"/retry-budgets-v2/flows/{flow_id}/retry-budget/",
			{
				params: { path: { flow_id: flow.id } },
				body: {
					max_retries_per_task: 3,
					max_retries_per_hour: 50,
					max_retries_per_day: 200,
					max_total_retry_duration_minutes: 120,
					enabled: true,
				} as never,
			},
		);

		expect(response.data).toBeDefined();
		expect(response.data?.flow_id).toBe(flow.id);
		expect(response.data?.max_retries_per_task).toBe(3);
		expect(response.data?.enabled).toBe(true);
	});

	test("delete retry budget API works", async ({ apiClient }) => {
		const flowName = `${TEST_PREFIX}delete-${Date.now()}`;
		const flow = await createFlow(apiClient, flowName);

		const response = await apiClient.DELETE(
			"/retry-budgets-v2/flows/{flow_id}/retry-budget/",
			{
				params: { path: { flow_id: flow.id } },
			},
		);

		expect(response.data).toBeDefined();
		expect(response.data?.success).toBe(true);
	});

	test("reset retry budget API works", async ({ apiClient }) => {
		const flowName = `${TEST_PREFIX}reset-${Date.now()}`;
		const flow = await createFlow(apiClient, flowName);

		const response = await apiClient.POST(
			"/retry-budgets-v2/flows/{flow_id}/retry-budget/reset/",
			{
				params: { path: { flow_id: flow.id } },
			},
		);

		expect(response.data).toBeDefined();
		expect(response.data?.flow_id).toBe(flow.id);
		expect(response.data?.reset_at).toBeDefined();
		expect(response.data?.current_usage.retries_this_hour).toBe(0);
	});

	test("retry events API returns data", async ({ apiClient }) => {
		const flowName = `${TEST_PREFIX}events-${Date.now()}`;
		const flow = await createFlow(apiClient, flowName);

		const response = await apiClient.GET(
			"/retry-budgets-v2/flows/{flow_id}/retry-events/",
			{
				params: {
					path: { flow_id: flow.id },
					query: { limit: 20 },
				},
			},
		);

		expect(response.data).toBeDefined();
		expect(response.data?.flow_id).toBe(flow.id);
		expect(response.data?.events).toBeDefined();
		expect(Array.isArray(response.data?.events)).toBe(true);
	});
});
