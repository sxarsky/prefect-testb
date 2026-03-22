import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { getQueryService } from "@/api/service";

/**
 * Types for Impact Analysis API responses
 */
export type FlowDependency = {
	flow_id: string;
	impact_level: "high" | "medium" | "low";
};

export type DependencyGraphResponse = {
	flow_id: string;
	dependencies: {
		upstream: string[];
		downstream: string[];
	};
	depth: number;
	total_connected_flows: number;
};

export type ImpactAnalysisResponse = {
	flow_run_id: string;
	directly_affected: number;
	indirectly_affected: number;
	critical_flows_affected: number;
	affected_flows: FlowDependency[];
};

export type RegisterDependenciesRequest = {
	flow_id: string;
	downstream_flows: string[];
};

export type RegisterDependenciesResponse = {
	flow_id: string;
	downstream_flows: string[];
	registered_count: number;
	registered_at: string;
};

/**
 * Query key factory for impact-related queries
 *
 * @property {function} all - Returns base key for all impact queries
 * @property {function} dependencyGraph - Generates key for dependency graph query
 * @property {function} flowRunImpact - Generates key for flow run impact query
 */
export const queryKeyFactory = {
	all: () => ["impact"] as const,
	dependencyGraph: (flowId: string) =>
		[...queryKeyFactory.all(), "dependency-graph", flowId] as const,
	flowRunImpact: (flowRunId: string) =>
		[...queryKeyFactory.all(), "flow-run-impact", flowRunId] as const,
};

/**
 * Builds a query configuration for fetching a flow's dependency graph
 *
 * @param flowId - Flow ID to get dependencies for
 * @returns Query configuration object with:
 *   - queryKey: Unique key for caching
 *   - queryFn: Function to fetch the dependency graph
 *   - staleTime: Time in ms before data is considered stale
 *
 * @example
 * ```ts
 * const { data } = useQuery(buildGetDependencyGraphQuery('flow-123'));
 * // data: { flow_id: 'flow-123', dependencies: { upstream: [...], downstream: [...] }, ... }
 * ```
 */
export const buildGetDependencyGraphQuery = (flowId: string) =>
	queryOptions({
		queryKey: queryKeyFactory.dependencyGraph(flowId),
		queryFn: async (): Promise<DependencyGraphResponse> => {
			const res = await (
				await getQueryService()
			).GET("/impact-v2/flows/{flow_id}/dependency-graph/", {
				params: { path: { flow_id: flowId } },
			});
			if (!res.data) {
				throw new Error("'data' expected");
			}
			return res.data as DependencyGraphResponse;
		},
		staleTime: 30000, // 30 seconds
	});

/**
 * Builds a query configuration for analyzing flow run impact
 *
 * @param flowRunId - Flow run ID to analyze impact for
 * @returns Query configuration object
 *
 * @example
 * ```ts
 * const { data } = useQuery(buildAnalyzeFlowRunImpactQuery('run-123'));
 * // data: { flow_run_id: 'run-123', directly_affected: 5, ... }
 * ```
 */
export const buildAnalyzeFlowRunImpactQuery = (flowRunId: string) =>
	queryOptions({
		queryKey: queryKeyFactory.flowRunImpact(flowRunId),
		queryFn: async (): Promise<ImpactAnalysisResponse> => {
			const res = await (
				await getQueryService()
			).GET("/impact-v2/flow-runs/{flow_run_id}/impact-analysis/", {
				params: { path: { flow_run_id: flowRunId } },
			});
			if (!res.data) {
				throw new Error("'data' expected");
			}
			return res.data as ImpactAnalysisResponse;
		},
		staleTime: 30000, // 30 seconds
	});

/**
 * Hook for registering flow dependencies
 *
 * @returns Mutation object for registering dependencies with loading/error states
 *
 * @example
 * ```ts
 * const { registerDependencies, isPending } = useRegisterFlowDependencies();
 *
 * registerDependencies({
 *   flow_id: 'flow-123',
 *   downstream_flows: ['flow-456', 'flow-789']
 * }, {
 *   onSuccess: () => console.log('Dependencies registered'),
 *   onError: (error) => console.error('Failed:', error)
 * });
 * ```
 */
export const useRegisterFlowDependencies = () => {
	const queryClient = useQueryClient();

	const { mutate: registerDependencies, ...rest } = useMutation({
		mutationFn: async (
			request: RegisterDependenciesRequest,
		): Promise<RegisterDependenciesResponse> => {
			const res = await (
				await getQueryService()
			).POST("/impact-v2/flows/{flow_id}/dependencies/", {
				params: { path: { flow_id: request.flow_id } },
				body: request.downstream_flows as never,
			});
			if (!res.data) {
				throw new Error("'data' expected");
			}
			return res.data as RegisterDependenciesResponse;
		},
		onSuccess: (_, variables) => {
			// Invalidate dependency graph query for the affected flow
			void queryClient.invalidateQueries({
				queryKey: queryKeyFactory.dependencyGraph(variables.flow_id),
			});
		},
	});

	return { registerDependencies, ...rest };
};
