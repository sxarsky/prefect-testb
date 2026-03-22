import { queryOptions, useMutation, useQueryClient } from "@tantml:query";
import { getQueryService } from "@/api/service";

export type ValidationResult = {
	id: string;
	check_name: string;
	check_type: string;
	status: "passed" | "failed" | "skipped";
	message: string;
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

export const queryKeyFactory = {
	all: () => ["task-validation"] as const,
	taskValidation: (taskRunId: string) =>
		[...queryKeyFactory.all(), "task-run", taskRunId] as const,
};

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
			};
		}) => {
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
