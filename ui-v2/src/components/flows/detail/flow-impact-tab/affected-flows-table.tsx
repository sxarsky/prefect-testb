import type { JSX } from "react";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

type AffectedFlowsTableProps = {
	downstreamFlows: string[];
};

/**
 * Affected Flows Table
 *
 * Displays a table of flows that are downstream dependencies
 * (i.e., flows that would be affected if this flow fails)
 */
export function AffectedFlowsTable({
	downstreamFlows,
}: AffectedFlowsTableProps): JSX.Element {
	if (downstreamFlows.length === 0) {
		return (
			<div className="py-8 text-center text-muted-foreground">
				<p>No downstream flows to display.</p>
			</div>
		);
	}

	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Flow ID</TableHead>
						<TableHead>Impact Level</TableHead>
						<TableHead>Status</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{downstreamFlows.map((flowId, index) => {
						// Simulate impact levels for demo purposes
						// In a real implementation, this would come from the API
						const impactLevel = index === 0 ? "high" : index === 1 ? "medium" : "low";

						return (
							<TableRow key={flowId}>
								<TableCell>
									<code className="text-xs">{flowId}</code>
								</TableCell>
								<TableCell>
									<Badge
										variant={
											impactLevel === "high"
												? "destructive"
												: impactLevel === "medium"
													? "default"
													: "secondary"
										}
									>
										{impactLevel.toUpperCase()}
									</Badge>
								</TableCell>
								<TableCell>
									<span className="text-sm text-muted-foreground">
										Downstream Dependency
									</span>
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
}
