import { ArrowDown, ArrowUp, GitBranch } from "lucide-react";
import type { JSX } from "react";
import { Badge } from "@/components/ui/badge";

type DependencyGraphProps = {
	flowId: string;
	dependencies: {
		upstream: string[];
		downstream: string[];
	};
	depth: number;
	totalConnectedFlows: number;
};

/**
 * Dependency Graph Component
 *
 * Displays a visual representation of flow dependencies
 * Shows upstream flows (this flow depends on) and downstream flows (depend on this flow)
 */
export function DependencyGraph({
	flowId,
	dependencies,
	depth,
	totalConnectedFlows,
}: DependencyGraphProps): JSX.Element {
	return (
		<div className="flex flex-col gap-6">
			{/* Summary Stats */}
			<div className="flex items-center gap-4">
				<div className="flex items-center gap-2">
					<GitBranch className="h-4 w-4 text-muted-foreground" />
					<span className="text-sm text-muted-foreground">
						Graph Depth: <span className="font-medium text-foreground">{depth}</span>
					</span>
				</div>
				<div className="flex items-center gap-2">
					<span className="text-sm text-muted-foreground">
						Total Connected Flows:{" "}
						<span className="font-medium text-foreground">{totalConnectedFlows}</span>
					</span>
				</div>
			</div>

			{/* Dependency Visualization */}
			<div className="grid gap-6 md:grid-cols-2">
				{/* Upstream Dependencies */}
				<div className="flex flex-col gap-3">
					<div className="flex items-center gap-2">
						<ArrowUp className="h-4 w-4 text-blue-500" />
						<h4 className="font-semibold">Upstream Dependencies</h4>
						<Badge variant="secondary">{dependencies.upstream.length}</Badge>
					</div>
					{dependencies.upstream.length > 0 ? (
						<div className="rounded-md border">
							<ul className="divide-y">
								{dependencies.upstream.map((upstreamFlowId) => (
									<li
										key={upstreamFlowId}
										className="px-3 py-2 text-sm hover:bg-muted/50"
									>
										<code className="text-xs">{upstreamFlowId}</code>
									</li>
								))}
							</ul>
						</div>
					) : (
						<p className="text-sm text-muted-foreground">
							This flow has no upstream dependencies
						</p>
					)}
				</div>

				{/* Downstream Dependencies */}
				<div className="flex flex-col gap-3">
					<div className="flex items-center gap-2">
						<ArrowDown className="h-4 w-4 text-green-500" />
						<h4 className="font-semibold">Downstream Dependencies</h4>
						<Badge variant="secondary">{dependencies.downstream.length}</Badge>
					</div>
					{dependencies.downstream.length > 0 ? (
						<div className="rounded-md border">
							<ul className="divide-y">
								{dependencies.downstream.map((downstreamFlowId) => (
									<li
										key={downstreamFlowId}
										className="px-3 py-2 text-sm hover:bg-muted/50"
									>
										<code className="text-xs">{downstreamFlowId}</code>
									</li>
								))}
							</ul>
						</div>
					) : (
						<p className="text-sm text-muted-foreground">
							No flows depend on this flow
						</p>
					)}
				</div>
			</div>

			{/* Current Flow Indicator */}
			<div className="flex items-center justify-center py-4">
				<div className="rounded-md border border-primary bg-primary/10 px-4 py-2">
					<p className="text-sm font-medium">
						Current Flow: <code className="text-xs">{flowId}</code>
					</p>
				</div>
			</div>
		</div>
	);
}
