import {
	cleanupFlows,
	createFlow,
	expect,
	test,
	waitForServerHealth,
} from "../fixtures";

const TEST_PREFIX = "e2e-flow-impact-";

test.describe("Flow Impact Tab", () => {
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

	test("Navigate to Impact tab and verify render", async ({
		page,
		apiClient,
	}) => {
		const flowName = `${TEST_PREFIX}impact-nav-${Date.now()}`;
		const flow = await createFlow(apiClient, flowName);

		await page.goto(`/flows/flow/${flow.id}`);

		// Click Impact tab
		await page.getByRole("tab", { name: "Impact" }).click();

		// Verify URL updated
		await expect(page).toHaveURL(/tab=impact/);

		// Verify Impact tab content is visible
		await expect(
			page.getByRole("heading", { name: "Dependency Graph" }),
		).toBeVisible({ timeout: 10000 });

		await expect(
			page.getByRole("heading", { name: "Register Dependencies" }),
		).toBeVisible();
	});

	test("Display dependency graph with upstream and downstream flows", async ({
		page,
		apiClient,
	}) => {
		const flowName = `${TEST_PREFIX}graph-${Date.now()}`;
		const flow = await createFlow(apiClient, flowName);

		await page.goto(`/flows/flow/${flow.id}?tab=impact`);

		// Verify dependency graph section is visible
		await expect(
			page.getByRole("heading", { name: "Dependency Graph" }),
		).toBeVisible({ timeout: 10000 });

		// Check for empty state or graph data
		// Since the mock API returns static data, we should see the graph
		await expect(
			page.getByText(/Graph Depth:|No dependencies registered/i),
		).toBeVisible();

		// Verify upstream/downstream sections are present
		await expect(page.getByText(/Upstream Dependencies/i)).toBeVisible();
		await expect(page.getByText(/Downstream Dependencies/i)).toBeVisible();
	});

	test("Display affected flows table when downstream dependencies exist", async ({
		page,
		apiClient,
	}) => {
		const flowName = `${TEST_PREFIX}affected-${Date.now()}`;
		const flow = await createFlow(apiClient, flowName);

		await page.goto(`/flows/flow/${flow.id}?tab=impact`);

		// Wait for page to load
		await expect(
			page.getByRole("heading", { name: "Dependency Graph" }),
		).toBeVisible({ timeout: 10000 });

		// If the mock API returns downstream flows, the table should be visible
		// Check for either the table or empty state
		const hasDownstreamFlows = await page
			.getByRole("heading", { name: "Downstream Dependencies" })
			.isVisible();

		if (hasDownstreamFlows) {
			// Verify table columns exist
			await expect(page.getByRole("columnheader", { name: /Flow ID/i })).toBeVisible();
			await expect(page.getByRole("columnheader", { name: /Impact Level/i })).toBeVisible();
		}
	});

	test("Register new dependencies using the form", async ({
		page,
		apiClient,
	}) => {
		const flowName = `${TEST_PREFIX}register-${Date.now()}`;
		const flow = await createFlow(apiClient, flowName);

		await page.goto(`/flows/flow/${flow.id}?tab=impact`);

		// Wait for page to load
		await expect(
			page.getByRole("heading", { name: "Register Dependencies" }),
		).toBeVisible({ timeout: 10000 });

		// Find the input field
		const input = page.getByPlaceholder(/flow-abc-123/i);
		await expect(input).toBeVisible();

		// Enter downstream flow IDs
		await input.fill("flow-test-1, flow-test-2, flow-test-3");

		// Click register button
		const registerButton = page.getByRole("button", {
			name: /Register Dependencies/i,
		});
		await registerButton.click();

		// Verify success message appears
		// Note: This depends on the toast notification system
		await expect(
			page.getByText(/Registered|Success/i).first(),
		).toBeVisible({ timeout: 5000 });
	});
});
