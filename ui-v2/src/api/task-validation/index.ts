import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { getQueryService } from "@/api/service";

/**
 * Types for Task Validation API
 */
export type ValidationResult = {
	id: string;
	check_name: string;
	check_type: string;
	status: "passed" | "failed" | "skipped";
	message: string;
	details: Record<string, unknown>;
	timestamp: string;
};

export type TaskValidationResponse = {
	task_run_id: string;
	validation_status: "passed" | "failed" | "partial";
	total_checks: number;
	passed_checks: number;
	failed_checks: number;
	skipped_checks: number;
	validation_results: ValidationResult[];
};

export type FlowValidationSummary = {
	flow_id: string;
	total_task_runs: number;
	validated_task_runs: number;
	overall_pass_rate: number;
	validation_stats: {
		total_checks: number;
		passed_checks: number;
		failed_checks: number;
		skipped_checks: number;
	};
	check_type_breakdown: Record<
		string,
		{ total: number; passed: number; failed: number }
	>;
	recent_failures: Array<{
		task_run_id: string;
		check_name: string;
		timestamp: string;
	}>;
};

/**
 * Query key factory
 */
export const queryKeyFactory = {
	all: () => ["task-validation"] as const,
	taskValidation: (taskRunId: string) =>
		[...queryKeyFactory.all(), "task-run", taskRunId] as const,
	flowSummary: (flowId: string) =>
		[...queryKeyFactory.all(), "flow-summary", flowId] as const,
};

/**
 * Build query for task validation results
 */
export const buildGetTaskValidationQuery = (taskRunId: string) =>
	queryOptions({
		queryKey: queryKeyFactory.taskValidation(taskRunId),
		queryFn: async (): Promise<TaskValidationResponse> => {
			const res = await (
				await getQueryService()
			).GET("/task-validation-v2/task-runs/{task_run_id}/validation/", {
				params: { path: { task_run_id: taskRunId } },
			});
			if (!res.data) {
				throw new Error("'data' expected");
			}
			return res.data as TaskValidationResponse;
		},
		staleTime: 30000,
	});

/**
 * Build query for flow validation summary
 */
export const buildGetFlowValidationSummaryQuery = (flowId: string) =>
	queryOptions({
		queryKey: queryKeyFactory.flowSummary(flowId),
		queryFn: async (): Promise<FlowValidationSummary> => {
			const res = await (
				await getQueryService()
			).GET("/task-validation-v2/flows/{flow_id}/validation-summary/", {
				params: { path: { flow_id: flowId } },
			});
			if (!res.data) {
				throw new Error("'data' expected");
			}
			return res.data as FlowValidationSummary;
		},
		staleTime: 60000,
	});

/**
 * Hook for creating validation results
 */
export const useCreateValidationResult = () => {
	const queryClient = useQueryClient();

	const { mutate: createValidationResult, ...rest } = useMutation({
		mutationFn: async ({
			taskRunId,
			data,
		}: {
			taskRunId: string;
			data: {
				check_name: string;
				check_type: string;
				status: string;
				message: string;
				details?: Record<string, unknown>;
			};
		}): Promise<ValidationResult> => {
			const res = await (
				await getQueryService()
			).POST("/task-validation-v2/task-runs/{task_run_id}/validation/", {
				params: { path: { task_run_id: taskRunId } },
				body: data as never,
			});
			if (!res.data) {
				throw new Error("'data' expected");
			}
			return res.data as ValidationResult;
		},
		onSuccess: (_, variables) => {
			void queryClient.invalidateQueries({
				queryKey: queryKeyFactory.taskValidation(variables.taskRunId),
			});
		},
	});

	return { createValidationResult, ...rest };
};
