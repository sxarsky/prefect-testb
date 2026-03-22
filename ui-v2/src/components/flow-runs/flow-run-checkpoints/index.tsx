import { useSuspenseQuery } from "@tanstack/react-query";
import { Check, ChevronDown, ChevronRight, Clock } from "lucide-react";
import { useState, type JSX } from "react";
import { buildGetFlowRunCheckpointsQuery } from "@/api/checkpoints";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type FlowRunCheckpointsProps = {
	flowRunId: string;
};

/**
 * Flow Run Checkpoints Component
 *
 * Displays checkpoint timeline for a flow run
 * Shows checkpoint progression with expandable details
 */
export function FlowRunCheckpoints({
	flowRunId,
}: FlowRunCheckpointsProps): JSX.Element {
	const { data: checkpointsData } = useSuspenseQuery(
		buildGetFlowRunCheckpointsQuery(flowRunId),
	);

	const [expandedCheckpoints, setExpandedCheckpoints] = useState<Set<string>>(
		new Set(),
	);

	const toggleCheckpoint = (checkpointId: string) => {
		setExpandedCheckpoints((prev) => {
			const next = new Set(prev);
			if (next.has(checkpointId)) {
				next.delete(checkpointId);
			} else {
				next.add(checkpointId);
			}
			return next;
		});
	};

	// Helper to get badge variant based on state
	const getStateBadgeVariant = (state: string) => {
		switch (state.toLowerCase()) {
			case "completed":
				return "default";
			case "active":
				return "secondary";
			case "failed":
				return "destructive";
			default:
				return "outline";
		}
	};

	// Helper to get icon based on state
	const getStateIcon = (state: string) => {
		switch (state.toLowerCase()) {
			case "completed":
				return <Check className="h-5 w-5 text-green-500" />;
			case "active":
				return <Clock className="h-5 w-5 text-blue-500" />;
			default:
				return <div className="h-5 w-5 rounded-full border-2" />;
		}
	};

	if (checkpointsData.checkpoints.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-12 text-center">
				<p className="text-muted-foreground">
					No checkpoints available for this flow run.
				</p>
				<p className="text-sm text-muted-foreground mt-2">
					Checkpoints are created automatically during flow execution.
				</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			{/* Summary Card */}
			<Card>
				<CardHeader>
					<CardTitle>Checkpoint Summary</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex gap-6">
						<div className="flex flex-col">
							<span className="text-2xl font-bold">
								{checkpointsData.total_checkpoints}
							</span>
							<span className="text-sm text-muted-foreground">
								Total Checkpoints
							</span>
						</div>
						<div className="flex flex-col">
							<span className="text-2xl font-bold text-green-500">
								{
									checkpointsData.checkpoints.filter(
										(c) => c.state === "completed",
									).length
								}
							</span>
							<span className="text-sm text-muted-foreground">Completed</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Checkpoint Timeline */}
			<Card>
				<CardHeader>
					<CardTitle>Checkpoint Timeline</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="relative">
						{/* Timeline line */}
						<div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

						{/* Checkpoints */}
						<div className="space-y-4">
							{checkpointsData.checkpoints.map((checkpoint, index) => {
								const isExpanded = expandedCheckpoints.has(checkpoint.id);
								const isLast = index === checkpointsData.checkpoints.length - 1;

								return (
									<div key={checkpoint.id} className="relative pl-14">
										{/* Timeline node */}
										<div
											className={cn(
												"absolute left-3.5 top-3 flex h-10 w-10 items-center justify-center rounded-full border-4 border-background bg-card",
												!isLast && "z-10",
											)}
										>
											{getStateIcon(checkpoint.state)}
										</div>

										{/* Checkpoint card */}
										<Card className="hover:bg-muted/50 transition-colors">
											<CardContent className="p-4">
												<div className="flex items-start justify-between">
													<div className="flex-1">
														<div className="flex items-center gap-2 mb-1">
															<h4 className="font-semibold">
																{checkpoint.name}
															</h4>
															<Badge variant={getStateBadgeVariant(checkpoint.state)}>
																{checkpoint.state}
															</Badge>
														</div>
														<p className="text-sm text-muted-foreground">
															{new Date(checkpoint.created_at).toLocaleString()}
														</p>
													</div>

													<Button
														variant="ghost"
														size="sm"
														onClick={() => toggleCheckpoint(checkpoint.id)}
													>
														{isExpanded ? (
															<ChevronDown className="h-4 w-4" />
														) : (
															<ChevronRight className="h-4 w-4" />
														)}
													</Button>
												</div>

												{/* Expanded metadata */}
												{isExpanded && checkpoint.metadata && (
													<div className="mt-4 pt-4 border-t">
														<h5 className="text-sm font-medium mb-2">
															Metadata
														</h5>
														<dl className="grid grid-cols-2 gap-2 text-sm">
															{Object.entries(checkpoint.metadata).map(
																([key, value]) => (
																	<div key={key}>
																		<dt className="text-muted-foreground">
																			{key}:
																		</dt>
																		<dd className="font-medium">
																			{String(value)}
																		</dd>
																	</div>
																),
															)}
														</dl>
													</div>
												)}
											</CardContent>
										</Card>
									</div>
								);
							})}
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
