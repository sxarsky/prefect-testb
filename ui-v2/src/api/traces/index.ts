import { queryOptions } from "@tanstack/react-query";
import { getQueryService } from "@/api/service";

/**
 * Types for Traces API responses
 */
export type TraceSpan = {
	trace_id: string;
	span_id: string;
	span_type: string;
	name: string;
	started_at: string;
	ended_at: string;
	duration_ms: number;
	status: string;
	parent_span_id: string | null;
};

export type FlowRunTracesResponse = {
	flow_run_id: string;
	traces: TraceSpan[];
	total_spans: number;
};

/**
 * Query key factory for traces-related queries
 */
export const queryKeyFactory = {
	all: () => ["traces"] as const,
	flowRunTraces: (flowRunId: string) =>
		[...queryKeyFactory.all(), "flow-run", flowRunId] as const,
};

/**
 * Builds a query configuration for fetching flow run traces
 *
 * @param flowRunId - Flow run ID to get traces for
 * @returns Query configuration object
 */
export const buildGetFlowRunTracesQuery = (flowRunId: string) =>
	queryOptions({
		queryKey: queryKeyFactory.flowRunTraces(flowRunId),
		queryFn: async (): Promise<FlowRunTracesResponse> => {
			const res = await (
				await getQueryService()
			).GET("/traces-v2/flow-runs/{flow_run_id}/traces/", {
				params: { path: { flow_run_id: flowRunId } },
			});
			if (!res.data) {
				throw new Error("'data' expected");
			}
			return res.data as FlowRunTracesResponse;
		},
		staleTime: 30000, // 30 seconds
	});
