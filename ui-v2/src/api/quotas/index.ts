import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { getQueryService } from "@/api/service";

/**
 * Types for Quota Management API
 */
export type QuotaConfig = {
	id: string;
	flow_id: string;
	max_concurrent_runs: number;
	max_runs_per_hour: number;
	max_runs_per_day: number;
	max_total_duration_hours: number;
	enabled: boolean;
	created_at: string;
	updated_at: string;
};

export type CurrentUsage = {
	concurrent_runs: number;
	runs_this_hour: number;
	runs_today: number;
	total_duration_today_hours: number;
	last_reset: string;
};

export type UsagePercentages = {
	concurrent: number;
	hourly: number;
	daily: number;
	duration: number;
};

export type QuotaConfigResponse = {
	flow_id: string;
	quota_config: QuotaConfig;
	current_usage: CurrentUsage;
	usage_percentages: UsagePercentages;
};

export type QuotaHistoryEntry = {
	date: string;
	total_runs: number;
	quota_violations: number;
	peak_concurrent: number;
	total_duration_hours: number;
};

export type QuotaHistoryResponse = {
	flow_id: string;
	period_days: number;
	total_violations: number;
	history: QuotaHistoryEntry[];
};

export type QuotaViolation = {
	id: string;
	flow_id: string;
	violation_type: string;
	timestamp: string;
	quota_limit: number;
	actual_value: number;
	action_taken: string;
	message: string;
};

export type QuotaViolationsResponse = {
	flow_id: string;
	total_violations: number;
	violations: QuotaViolation[];
};

export type QuotaOverviewFlow = {
	flow_id: string;
	flow_name: string;
	quota_status: "ok" | "warning" | "critical";
	highest_usage_percentage: number;
	violations_today: number;
};

export type QuotaOverviewResponse = {
	total_flows_with_quotas: number;
	total_active_quotas: number;
	flows_near_quota: number;
	total_violations_today: number;
	flows: QuotaOverviewFlow[];
};

/**
 * Query key factory
 */
export const queryKeyFactory = {
	all: () => ["quotas"] as const,
	quotaConfig: (flowId: string) =>
		[...queryKeyFactory.all(), "config", flowId] as const,
	quotaHistory: (flowId: string, days: number) =>
		[...queryKeyFactory.all(), "history", flowId, days] as const,
	quotaViolations: (flowId: string, limit: number) =>
		[...queryKeyFactory.all(), "violations", flowId, limit] as const,
	overview: () => [...queryKeyFactory.all(), "overview"] as const,
};

/**
 * Build query for quota configuration
 */
export const buildGetQuotaConfigQuery = (flowId: string) =>
	queryOptions({
		queryKey: queryKeyFactory.quotaConfig(flowId),
		queryFn: async (): Promise<QuotaConfigResponse> => {
			const res = await (
				await getQueryService()
			).GET("/quotas-v2/flows/{flow_id}/quota-config/", {
				params: { path: { flow_id: flowId } },
			});
			if (!res.data) {
				throw new Error("'data' expected");
			}
			return res.data as QuotaConfigResponse;
		},
		staleTime: 30000,
	});

/**
 * Build query for quota history
 */
export const buildGetQuotaHistoryQuery = (flowId: string, days: number = 7) =>
	queryOptions({
		queryKey: queryKeyFactory.quotaHistory(flowId, days),
		queryFn: async (): Promise<QuotaHistoryResponse> => {
			const res = await (
				await getQueryService()
			).GET("/quotas-v2/flows/{flow_id}/quota-history/", {
				params: {
					path: { flow_id: flowId },
					query: { days },
				},
			});
			if (!res.data) {
				throw new Error("'data' expected");
			}
			return res.data as QuotaHistoryResponse;
		},
		staleTime: 60000,
	});

/**
 * Build query for quota violations
 */
export const buildGetQuotaViolationsQuery = (
	flowId: string,
	limit: number = 10,
) =>
	queryOptions({
		queryKey: queryKeyFactory.quotaViolations(flowId, limit),
		queryFn: async (): Promise<QuotaViolationsResponse> => {
			const res = await (
				await getQueryService()
			).GET("/quotas-v2/flows/{flow_id}/quota-violations/", {
				params: {
					path: { flow_id: flowId },
					query: { limit },
				},
			});
			if (!res.data) {
				throw new Error("'data' expected");
			}
			return res.data as QuotaViolationsResponse;
		},
		staleTime: 30000,
	});

/**
 * Build query for quota overview
 */
export const buildGetQuotaOverviewQuery = () =>
	queryOptions({
		queryKey: queryKeyFactory.overview(),
		queryFn: async (): Promise<QuotaOverviewResponse> => {
			const res = await (await getQueryService()).GET("/quotas-v2/quota-overview/");
			if (!res.data) {
				throw new Error("'data' expected");
			}
			return res.data as QuotaOverviewResponse;
		},
		staleTime: 60000,
	});

/**
 * Hook for creating/updating quota config
 */
export const useCreateQuotaConfig = () => {
	const queryClient = useQueryClient();

	const { mutate: createQuotaConfig, ...rest } = useMutation({
		mutationFn: async ({
			flowId,
			data,
		}: {
			flowId: string;
			data: {
				max_concurrent_runs: number;
				max_runs_per_hour: number;
				max_runs_per_day: number;
				max_total_duration_hours: number;
				enabled: boolean;
			};
		}): Promise<QuotaConfig> => {
			const res = await (
				await getQueryService()
			).POST("/quotas-v2/flows/{flow_id}/quota-config/", {
				params: { path: { flow_id: flowId } },
				body: data as never,
			});
			if (!res.data) {
				throw new Error("'data' expected");
			}
			return res.data as QuotaConfig;
		},
		onSuccess: (_, variables) => {
			void queryClient.invalidateQueries({
				queryKey: queryKeyFactory.quotaConfig(variables.flowId),
			});
		},
	});

	return { createQuotaConfig, ...rest };
};

/**
 * Hook for deleting quota config
 */
export const useDeleteQuotaConfig = () => {
	const queryClient = useQueryClient();

	const { mutate: deleteQuotaConfig, ...rest } = useMutation({
		mutationFn: async (flowId: string): Promise<{ success: boolean }> => {
			const res = await (
				await getQueryService()
			).DELETE("/quotas-v2/flows/{flow_id}/quota-config/", {
				params: { path: { flow_id: flowId } },
			});
			if (!res.data) {
				throw new Error("'data' expected");
			}
			return res.data as { success: boolean };
		},
		onSuccess: (_, flowId) => {
			void queryClient.invalidateQueries({
				queryKey: queryKeyFactory.quotaConfig(flowId),
			});
		},
	});

	return { deleteQuotaConfig, ...rest };
};

/**
 * Hook for resetting quota usage
 */
export const useResetQuotaUsage = () => {
	const queryClient = useQueryClient();

	const { mutate: resetQuotaUsage, ...rest } = useMutation({
		mutationFn: async (
			flowId: string,
		): Promise<{ flow_id: string; reset_at: string; current_usage: CurrentUsage }> => {
			const res = await (
				await getQueryService()
			).POST("/quotas-v2/flows/{flow_id}/quota-config/reset/", {
				params: { path: { flow_id: flowId } },
			});
			if (!res.data) {
				throw new Error("'data' expected");
			}
			return res.data as {
				flow_id: string;
				reset_at: string;
				current_usage: CurrentUsage;
			};
		},
		onSuccess: (_, flowId) => {
			void queryClient.invalidateQueries({
				queryKey: queryKeyFactory.quotaConfig(flowId),
			});
		},
	});

	return { resetQuotaUsage, ...rest };
};
