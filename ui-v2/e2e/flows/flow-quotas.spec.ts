import {
	cleanupFlows,
	createFlow,
	expect,
	test,
	waitForServerHealth,
} from "../fixtures";

const TEST_PREFIX = "e2e-quotas-";

test.describe("Flow Quota Management System", () => {
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

	test("quota config API returns data", async ({ apiClient }) => {
		const flowName = `${TEST_PREFIX}config-${Date.now()}`;
		const flow = await createFlow(apiClient, flowName);

		const response = await apiClient.GET(
			"/quotas-v2/flows/{flow_id}/quota-config/",
			{
				params: { path: { flow_id: flow.id } },
			},
		);

		expect(response.data).toBeDefined();
		expect(response.data?.flow_id).toBe(flow.id);
		expect(response.data?.quota_config).toBeDefined();
		expect(response.data?.quota_config.max_concurrent_runs).toBeGreaterThan(0);
		expect(response.data?.current_usage).toBeDefined();
		expect(response.data?.usage_percentages).toBeDefined();
	});

	test("quota history API returns data", async ({ apiClient }) => {
		const flowName = `${TEST_PREFIX}history-${Date.now()}`;
		const flow = await createFlow(apiClient, flowName);

		const response = await apiClient.GET(
			"/quotas-v2/flows/{flow_id}/quota-history/",
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
		expect(response.data?.history.length).toBe(7);
	});

	test("create quota config API works", async ({ apiClient }) => {
		const flowName = `${TEST_PREFIX}create-${Date.now()}`;
		const flow = await createFlow(apiClient, flowName);

		const response = await apiClient.POST(
			"/quotas-v2/flows/{flow_id}/quota-config/",
			{
				params: { path: { flow_id: flow.id } },
				body: {
					max_concurrent_runs: 5,
					max_runs_per_hour: 20,
					max_runs_per_day: 100,
					max_total_duration_hours: 24,
					enabled: true,
				} as never,
			},
		);

		expect(response.data).toBeDefined();
		expect(response.data?.flow_id).toBe(flow.id);
		expect(response.data?.max_concurrent_runs).toBe(5);
		expect(response.data?.enabled).toBe(true);
		expect(response.data?.id).toBeDefined();
	});

	test("delete quota config API works", async ({ apiClient }) => {
		const flowName = `${TEST_PREFIX}delete-${Date.now()}`;
		const flow = await createFlow(apiClient, flowName);

		const response = await apiClient.DELETE(
			"/quotas-v2/flows/{flow_id}/quota-config/",
			{
				params: { path: { flow_id: flow.id } },
			},
		);

		expect(response.data).toBeDefined();
		expect(response.data?.success).toBe(true);
	});

	test("reset quota usage API works", async ({ apiClient }) => {
		const flowName = `${TEST_PREFIX}reset-${Date.now()}`;
		const flow = await createFlow(apiClient, flowName);

		const response = await apiClient.POST(
			"/quotas-v2/flows/{flow_id}/quota-config/reset/",
			{
				params: { path: { flow_id: flow.id } },
			},
		);

		expect(response.data).toBeDefined();
		expect(response.data?.flow_id).toBe(flow.id);
		expect(response.data?.reset_at).toBeDefined();
		expect(response.data?.current_usage).toBeDefined();
		expect(response.data?.current_usage.concurrent_runs).toBe(0);
		expect(response.data?.current_usage.runs_this_hour).toBe(0);
		expect(response.data?.current_usage.runs_today).toBe(0);
	});

	test("quota violations API returns data", async ({ apiClient }) => {
		const flowName = `${TEST_PREFIX}violations-${Date.now()}`;
		const flow = await createFlow(apiClient, flowName);

		const response = await apiClient.GET(
			"/quotas-v2/flows/{flow_id}/quota-violations/",
			{
				params: {
					path: { flow_id: flow.id },
					query: { limit: 10 },
				},
			},
		);

		expect(response.data).toBeDefined();
		expect(response.data?.flow_id).toBe(flow.id);
		expect(response.data?.total_violations).toBeGreaterThanOrEqual(0);
		expect(response.data?.violations).toBeDefined();
		expect(Array.isArray(response.data?.violations)).toBe(true);
	});

	test("quota overview API returns data", async ({ apiClient }) => {
		const response = await apiClient.GET("/quotas-v2/quota-overview/");

		expect(response.data).toBeDefined();
		expect(response.data?.total_flows_with_quotas).toBeGreaterThanOrEqual(0);
		expect(response.data?.total_active_quotas).toBeGreaterThanOrEqual(0);
		expect(response.data?.flows_near_quota).toBeGreaterThanOrEqual(0);
		expect(response.data?.flows).toBeDefined();
		expect(Array.isArray(response.data?.flows)).toBe(true);
	});

	test("usage percentages calculated correctly", async ({ apiClient }) => {
		const flowName = `${TEST_PREFIX}percentages-${Date.now()}`;
		const flow = await createFlow(apiClient, flowName);

		const response = await apiClient.GET(
			"/quotas-v2/flows/{flow_id}/quota-config/",
			{
				params: { path: { flow_id: flow.id } },
			},
		);

		expect(response.data).toBeDefined();
		const percentages = response.data?.usage_percentages;
		expect(percentages).toBeDefined();

		// Verify all percentages are between 0 and 100
		expect(percentages?.concurrent).toBeGreaterThanOrEqual(0);
		expect(percentages?.concurrent).toBeLessThanOrEqual(100);
		expect(percentages?.hourly).toBeGreaterThanOrEqual(0);
		expect(percentages?.hourly).toBeLessThanOrEqual(100);
		expect(percentages?.daily).toBeGreaterThanOrEqual(0);
		expect(percentages?.daily).toBeLessThanOrEqual(100);
		expect(percentages?.duration).toBeGreaterThanOrEqual(0);
		expect(percentages?.duration).toBeLessThanOrEqual(100);
	});
});
