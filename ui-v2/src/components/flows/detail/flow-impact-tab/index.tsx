import { useSuspenseQuery } from "@tanstack/react-query";
import type { JSX } from "react";
import { buildGetDependencyGraphQuery } from "@/api/impact";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AffectedFlowsTable } from "./affected-flows-table";
import { DependencyGraph } from "./dependency-graph";
import { RegisterDependenciesForm } from "./register-dependencies-form";

type FlowImpactTabProps = {
	flowId: string;
};

/**
 * Flow Impact Analysis Tab
 *
 * Displays:
 * - Dependency graph showing upstream and downstream flows
 * - Affected flows table (when analyzing impact)
 * - Form to register new dependencies
 */
export function FlowImpactTab({ flowId }: FlowImpactTabProps): JSX.Element {
	const { data: dependencyGraph } = useSuspenseQuery(
		buildGetDependencyGraphQuery(flowId),
	);

	const hasDependencies =
		dependencyGraph.dependencies.upstream.length > 0 ||
		dependencyGraph.dependencies.downstream.length > 0;

	return (
		<div className="flex flex-col gap-4">
			{/* Dependency Graph Card */}
			<Card>
				<CardHeader>
					<CardTitle>Dependency Graph</CardTitle>
				</CardHeader>
				<CardContent>
					{hasDependencies ? (
						<DependencyGraph
							flowId={flowId}
							dependencies={dependencyGraph.dependencies}
							depth={dependencyGraph.depth}
							totalConnectedFlows={dependencyGraph.total_connected_flows}
						/>
					) : (
						<div className="py-8 text-center text-muted-foreground">
							<p>No dependencies registered for this flow.</p>
							<p className="text-sm mt-2">
								Register dependencies below to track flow impact.
							</p>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Affected Flows Table - shows flows that depend on this one */}
			{dependencyGraph.dependencies.downstream.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Downstream Dependencies</CardTitle>
					</CardHeader>
					<CardContent>
						<AffectedFlowsTable
							downstreamFlows={dependencyGraph.dependencies.downstream}
						/>
					</CardContent>
				</Card>
			)}

			{/* Register Dependencies Form */}
			<Card>
				<CardHeader>
					<CardTitle>Register Dependencies</CardTitle>
				</CardHeader>
				<CardContent>
					<RegisterDependenciesForm flowId={flowId} />
				</CardContent>
			</Card>
		</div>
	);
}
