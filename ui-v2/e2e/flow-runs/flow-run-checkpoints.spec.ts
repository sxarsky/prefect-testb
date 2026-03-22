import {
	cleanupFlowRuns,
	cleanupFlows,
	createFlow,
	createFlowRun,
	expect,
	test,
	waitForServerHealth,
} from "../fixtures";

const TEST_PREFIX = "e2e-checkpoints-";

test.describe("Flow Run Checkpoints", () => {
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

	test("checkpoints API returns data", async ({ apiClient }) => {
		const flowName = `${TEST_PREFIX}checkpoints-${Date.now()}`;
		const flow = await createFlow(apiClient, flowName);
		const flowRun = await createFlowRun(apiClient, {
			flowId: flow.id,
			name: `${TEST_PREFIX}run-${Date.now()}`,
			state: { type: "COMPLETED", name: "Completed" },
		});

		// Test the checkpoints API endpoint
		const response = await apiClient.GET(
			"/checkpoints-v2/flow-runs/{flow_run_id}/checkpoints/",
			{
				params: { path: { flow_run_id: flowRun.id } },
			},
		);

		expect(response.data).toBeDefined();
		expect(response.data?.flow_run_id).toBe(flowRun.id);
		expect(response.data?.checkpoints).toBeDefined();
		expect(Array.isArray(response.data?.checkpoints)).toBe(true);
		expect(response.data?.total_checkpoints).toBeGreaterThanOrEqual(0);
	});

	test("checkpoint details API returns data", async ({ apiClient }) => {
		const checkpointId = "checkpoint-2";

		// Test the checkpoint details endpoint
		const response = await apiClient.GET(
			"/checkpoints-v2/checkpoints/{checkpoint_id}",
			{
				params: { path: { checkpoint_id: checkpointId } },
			},
		);

		expect(response.data).toBeDefined();
		expect(response.data?.id).toBe(checkpointId);
		expect(response.data?.name).toBeDefined();
		expect(response.data?.state).toBeDefined();
		expect(response.data?.metadata).toBeDefined();
		expect(response.data?.state_data).toBeDefined();
	});

	test("create checkpoint API works", async ({ apiClient }) => {
		const flowName = `${TEST_PREFIX}create-cp-${Date.now()}`;
		const flow = await createFlow(apiClient, flowName);
		const flowRun = await createFlowRun(apiClient, {
			flowId: flow.id,
			name: `${TEST_PREFIX}run-create-${Date.now()}`,
			state: { type: "RUNNING", name: "Running" },
		});

		// Create a checkpoint
		const response = await apiClient.POST(
			"/checkpoints-v2/flow-runs/{flow_run_id}/checkpoints/",
			{
				params: { path: { flow_run_id: flowRun.id } },
				body: {
					name: "test_checkpoint",
					metadata: { test: true },
				} as never,
			},
		);

		expect(response.data).toBeDefined();
		expect(response.data?.flow_run_id).toBe(flowRun.id);
		expect(response.data?.name).toBe("test_checkpoint");
		expect(response.data?.id).toBeDefined();
	});
});
