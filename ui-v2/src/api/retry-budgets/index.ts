import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { getQueryService } from "@/api/service";

/**
 * Types for Retry Budget API
 */
export type RetryBudget = {
	id: string;
	flow_id: string;
	max_retries_per_task: number;
	max_retries_per_hour: number;
	max_retries_per_day: number;
	max_total_retry_duration_minutes: number;
	enabled: boolean;
	created_at: string;
	updated_at: string;
};

export type RetryCurrentUsage = {
	retries_this_hour: number;
	retries_today: number;
	total_retry_duration_today_minutes: number;
	active_retrying_tasks: number;
	last_reset: string;
};

export type RetryUsagePercentages = {
	hourly: number;
	daily: number;
	duration: number;
};

export type RetryBudgetResponse = {
	flow_id: string;
	retry_budget: RetryBudget;
	current_usage: RetryCurrentUsage;
	usage_percentages: RetryUsagePercentages;
};

export type RetryHistoryEntry = {
	date: string;
	total_retries: number;
	budget_violations: number;
	failed_tasks: number;
	avg_retries_per_task: number;
	total_retry_duration_minutes: number;
};

export type RetryHistoryResponse = {
	flow_id: string;
	period_days: number;
	total_violations: number;
	history: RetryHistoryEntry[];
};

export type RetryEvent = {
	id: string;
	flow_id: string;
	task_run_id: string;
	task_name: string;
	retry_attempt: number;
	max_retries: number;
	timestamp: string;
	reason: string;
	retry_delay_seconds: number;
	status: string;
};

export type RetryEventsResponse = {
	flow_id: string;
	total_events: number;
	events: RetryEvent[];
};

/**
 * Query key factory
 */
export const queryKeyFactory = {
	all: () => ["retry-budgets"] as const,
	retryBudget: (flowId: string) =>
		[...queryKeyFactory.all(), "budget", flowId] as const,
	retryHistory: (flowId: string, days: number) =>
		[...queryKeyFactory.all(), "history", flowId, days] as const,
	retryEvents: (flowId: string, limit: number) =>
		[...queryKeyFactory.all(), "events", flowId, limit] as const,
};

/**
 * Build query for retry budget configuration
 */
export const buildGetRetryBudgetQuery = (flowId: string) =>
	queryOptions({
		queryKey: queryKeyFactory.retryBudget(flowId),
		queryFn: async (): Promise<RetryBudgetResponse> => {
			const res = await (
				await getQueryService()
			).GET("/retry-budgets-v2/flows/{flow_id}/retry-budget/", {
				params: { path: { flow_id: flowId } },
			});
			if (!res.data) {
				throw new Error("'data' expected");
			}
			return res.data as RetryBudgetResponse;
		},
		staleTime: 30000,
	});

/**
 * Build query for retry history
 */
export const buildGetRetryHistoryQuery = (flowId: string, days: number = 7) =>
	queryOptions({
		queryKey: queryKeyFactory.retryHistory(flowId, days),
		queryFn: async (): Promise<RetryHistoryResponse> => {
			const res = await (
				await getQueryService()
			).GET("/retry-budgets-v2/flows/{flow_id}/retry-history/", {
				params: {
					path: { flow_id: flowId },
					query: { days },
				},
			});
			if (!res.data) {
				throw new Error("'data' expected");
			}
			return res.data as RetryHistoryResponse;
		},
		staleTime: 60000,
	});

/**
 * Build query for retry events
 */
export const buildGetRetryEventsQuery = (flowId: string, limit: number = 20) =>
	queryOptions({
		queryKey: queryKeyFactory.retryEvents(flowId, limit),
		queryFn: async (): Promise<RetryEventsResponse> => {
			const res = await (
				await getQueryService()
			).GET("/retry-budgets-v2/flows/{flow_id}/retry-events/", {
				params: {
					path: { flow_id: flowId },
					query: { limit },
				},
			});
			if (!res.data) {
				throw new Error("'data' expected");
			}
			return res.data as RetryEventsResponse;
		},
		staleTime: 30000,
	});

/**
 * Hook for creating/updating retry budget
 */
export const useCreateRetryBudget = () => {
	const queryClient = useQueryClient();

	const { mutate: createRetryBudget, ...rest } = useMutation({
		mutationFn: async ({
			flowId,
			data,
		}: {
			flowId: string;
			data: {
				max_retries_per_task: number;
				max_retries_per_hour: number;
				max_retries_per_day: number;
				max_total_retry_duration_minutes: number;
				enabled: boolean;
			};
		}): Promise<RetryBudget> => {
			const res = await (
				await getQueryService()
			).POST("/retry-budgets-v2/flows/{flow_id}/retry-budget/", {
				params: { path: { flow_id: flowId } },
				body: data as never,
			});
			if (!res.data) {
				throw new Error("'data' expected");
			}
			return res.data as RetryBudget;
		},
		onSuccess: (_, variables) => {
			void queryClient.invalidateQueries({
				queryKey: queryKeyFactory.retryBudget(variables.flowId),
			});
		},
	});

	return { createRetryBudget, ...rest };
};

/**
 * Hook for deleting retry budget
 */
export const useDeleteRetryBudget = () => {
	const queryClient = useQueryClient();

	const { mutate: deleteRetryBudget, ...rest } = useMutation({
		mutationFn: async (flowId: string): Promise<{ success: boolean }> => {
			const res = await (
				await getQueryService()
			).DELETE("/retry-budgets-v2/flows/{flow_id}/retry-budget/", {
				params: { path: { flow_id: flowId } },
			});
			if (!res.data) {
				throw new Error("'data' expected");
			}
			return res.data as { success: boolean };
		},
		onSuccess: (_, flowId) => {
			void queryClient.invalidateQueries({
				queryKey: queryKeyFactory.retryBudget(flowId),
			});
		},
	});

	return { deleteRetryBudget, ...rest };
};

/**
 * Hook for resetting retry budget usage
 */
export const useResetRetryBudget = () => {
	const queryClient = useQueryClient();

	const { mutate: resetRetryBudget, ...rest } = useMutation({
		mutationFn: async (
			flowId: string,
		): Promise<{ flow_id: string; reset_at: string; current_usage: RetryCurrentUsage }> => {
			const res = await (
				await getQueryService()
			).POST("/retry-budgets-v2/flows/{flow_id}/retry-budget/reset/", {
				params: { path: { flow_id: flowId } },
			});
			if (!res.data) {
				throw new Error("'data' expected");
			}
			return res.data as {
				flow_id: string;
				reset_at: string;
				current_usage: RetryCurrentUsage;
			};
		},
		onSuccess: (_, flowId) => {
			void queryClient.invalidateQueries({
				queryKey: queryKeyFactory.retryBudget(flowId),
			});
		},
	});

	return { resetRetryBudget, ...rest };
};
