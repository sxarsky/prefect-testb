import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { getQueryService } from "@/api/service";

/**
 * Types for Flow Cost API
 */
export type CostProfile = {
	id: string;
	flow_id: string;
	currency: string;
	cost_per_second: number;
	cost_per_task: number;
	cost_per_gb_memory: number;
	fixed_cost_per_run: number;
	created_at: string;
	updated_at: string;
};

export type CurrentSpending = {
	total_cost: number;
	total_runs: number;
	total_tasks: number;
	total_duration_seconds: number;
	average_cost_per_run: number;
};

export type FlowCostProfileResponse = {
	flow_id: string;
	cost_profile: CostProfile;
	current_spending: CurrentSpending;
};

export type CostHistoryEntry = {
	date: string;
	total_cost: number;
	run_count: number;
	average_cost_per_run: number;
	total_duration_seconds: number;
};

export type CostHistoryResponse = {
	flow_id: string;
	period_days: number;
	total_cost: number;
	total_runs: number;
	history: CostHistoryEntry[];
};

export type FlowRunCostBreakdown = {
	flow_run_id: string;
	total_cost: number;
	currency: string;
	breakdown: {
		fixed_cost: number;
		duration_cost: number;
		task_execution_cost: number;
		memory_usage_cost: number;
	};
	task_costs: Array<{
		task_name: string;
		task_run_id: string;
		cost: number;
		duration_seconds: number;
	}>;
	resource_metrics: {
		peak_memory_gb: number;
		avg_memory_gb: number;
		cpu_seconds: number;
	};
};

export type CostForecastEntry = {
	date: string;
	predicted_cost: number;
	confidence: number;
};

export type CostForecastResponse = {
	flow_id: string;
	forecast_days: number;
	total_forecast_cost: number;
	forecast: CostForecastEntry[];
	model: string;
};

/**
 * Query key factory
 */
export const queryKeyFactory = {
	all: () => ["flow-costs"] as const,
	costProfile: (flowId: string) =>
		[...queryKeyFactory.all(), "profile", flowId] as const,
	costHistory: (flowId: string, days: number) =>
		[...queryKeyFactory.all(), "history", flowId, days] as const,
	flowRunBreakdown: (flowRunId: string) =>
		[...queryKeyFactory.all(), "run-breakdown", flowRunId] as const,
	forecast: (flowId: string, days: number) =>
		[...queryKeyFactory.all(), "forecast", flowId, days] as const,
};

/**
 * Build query for flow cost profile
 */
export const buildGetFlowCostProfileQuery = (flowId: string) =>
	queryOptions({
		queryKey: queryKeyFactory.costProfile(flowId),
		queryFn: async (): Promise<FlowCostProfileResponse> => {
			const res = await (
				await getQueryService()
			).GET("/flow-costs-v2/flows/{flow_id}/cost-profile/", {
				params: { path: { flow_id: flowId } },
			});
			if (!res.data) {
				throw new Error("'data' expected");
			}
			return res.data as FlowCostProfileResponse;
		},
		staleTime: 30000,
	});

/**
 * Build query for cost history
 */
export const buildGetCostHistoryQuery = (flowId: string, days: number = 30) =>
	queryOptions({
		queryKey: queryKeyFactory.costHistory(flowId, days),
		queryFn: async (): Promise<CostHistoryResponse> => {
			const res = await (
				await getQueryService()
			).GET("/flow-costs-v2/flows/{flow_id}/cost-history/", {
				params: {
					path: { flow_id: flowId },
					query: { days },
				},
			});
			if (!res.data) {
				throw new Error("'data' expected");
			}
			return res.data as CostHistoryResponse;
		},
		staleTime: 60000,
	});

/**
 * Build query for flow run cost breakdown
 */
export const buildGetFlowRunCostBreakdownQuery = (flowRunId: string) =>
	queryOptions({
		queryKey: queryKeyFactory.flowRunBreakdown(flowRunId),
		queryFn: async (): Promise<FlowRunCostBreakdown> => {
			const res = await (
				await getQueryService()
			).GET("/flow-costs-v2/flow-runs/{flow_run_id}/cost-breakdown/", {
				params: { path: { flow_run_id: flowRunId } },
			});
			if (!res.data) {
				throw new Error("'data' expected");
			}
			return res.data as FlowRunCostBreakdown;
		},
		staleTime: 30000,
	});

/**
 * Build query for cost forecast
 */
export const buildGetCostForecastQuery = (flowId: string, days: number = 7) =>
	queryOptions({
		queryKey: queryKeyFactory.forecast(flowId, days),
		queryFn: async (): Promise<CostForecastResponse> => {
			const res = await (
				await getQueryService()
			).GET("/flow-costs-v2/flows/{flow_id}/cost-forecast/", {
				params: {
					path: { flow_id: flowId },
					query: { days },
				},
			});
			if (!res.data) {
				throw new Error("'data' expected");
			}
			return res.data as CostForecastResponse;
		},
		staleTime: 60000,
	});

/**
 * Hook for creating/updating cost profile
 */
export const useCreateCostProfile = () => {
	const queryClient = useQueryClient();

	const { mutate: createCostProfile, ...rest } = useMutation({
		mutationFn: async ({
			flowId,
			data,
		}: {
			flowId: string;
			data: {
				currency: string;
				cost_per_second: number;
				cost_per_task: number;
				cost_per_gb_memory: number;
				fixed_cost_per_run: number;
			};
		}): Promise<CostProfile> => {
			const res = await (
				await getQueryService()
			).POST("/flow-costs-v2/flows/{flow_id}/cost-profile/", {
				params: { path: { flow_id: flowId } },
				body: data as never,
			});
			if (!res.data) {
				throw new Error("'data' expected");
			}
			return res.data as CostProfile;
		},
		onSuccess: (_, variables) => {
			void queryClient.invalidateQueries({
				queryKey: queryKeyFactory.costProfile(variables.flowId),
			});
		},
	});

	return { createCostProfile, ...rest };
};

/**
 * Hook for deleting cost profile
 */
export const useDeleteCostProfile = () => {
	const queryClient = useQueryClient();

	const { mutate: deleteCostProfile, ...rest } = useMutation({
		mutationFn: async (flowId: string): Promise<{ success: boolean }> => {
			const res = await (
				await getQueryService()
			).DELETE("/flow-costs-v2/flows/{flow_id}/cost-profile/", {
				params: { path: { flow_id: flowId } },
			});
			if (!res.data) {
				throw new Error("'data' expected");
			}
			return res.data as { success: boolean };
		},
		onSuccess: (_, flowId) => {
			void queryClient.invalidateQueries({
				queryKey: queryKeyFactory.costProfile(flowId),
			});
		},
	});

	return { deleteCostProfile, ...rest };
};
