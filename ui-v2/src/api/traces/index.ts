import { queryOptions } from "@tanstack/react-query";
import { getQueryService } from "@/api/service";

export type Trace = {
	id: string;
	flow_run_id: string;
	span_type: string;
	name: string;
	start_time: string;
	end_time: string;
	duration_ms: number;
	status: string;
	parent_span_id: string | null;
};

export type FlowRunTracesResponse = {
	flow_run_id: string;
	traces: Trace[];
	total_spans: number;
};

export const queryKeyFactory = {
	all: () => ["traces"] as const,
	flowRunTraces: (flowRunId: string, spanType?: string) =>
		[...queryKeyFactory.all(), "flow-run", flowRunId, spanType] as const,
};

export const buildGetFlowRunTracesQuery = (flowRunId: string, spanType?: string) =>
	queryOptions({
		queryKey: queryKeyFactory.flowRunTraces(flowRunId, spanType),
		queryFn: async (): Promise<FlowRunTracesResponse> => {
			const res = await (
				await getQueryService()
			).GET("/traces-v2/flow-runs/{flow_run_id}/traces/", {
				params: {
					path: { flow_run_id: flowRunId },
					query: spanType ? { span_type: spanType } : {},
				},
			});
			if (!res.data) {
				throw new Error("'data' expected");
			}
			return res.data as FlowRunTracesResponse;
		},
		staleTime: 30000,
	});
