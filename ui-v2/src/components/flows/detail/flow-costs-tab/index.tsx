import { useSuspenseQuery } from "@tanstack/react-query";
import type { JSX } from "react";
import { buildGetFlowCostProfileQuery } from "@/api/flow-costs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CostHistoryChart } from "./cost-history-chart";
import { CostProfileForm } from "./cost-profile-form";

type FlowCostsTabProps = {
	flowId: string;
};

/**
 * Flow Costs Tab Component
 *
 * Displays cost profile configuration and spending metrics for a flow
 */
export function FlowCostsTab({ flowId }: FlowCostsTabProps): JSX.Element {
	const { data: costData } = useSuspenseQuery(
		buildGetFlowCostProfileQuery(flowId),
	);

	const { cost_profile, current_spending } = costData;

	return (
		<div className="flex flex-col gap-4">
			{/* Cost Profile Configuration */}
			<Card>
				<CardHeader>
					<CardTitle>Cost Profile Configuration</CardTitle>
				</CardHeader>
				<CardContent>
					<CostProfileForm flowId={flowId} costProfile={cost_profile} />
				</CardContent>
			</Card>

			{/* Current Spending Summary */}
			<Card>
				<CardHeader>
					<CardTitle>Current Spending</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 gap-4 md:grid-cols-5">
						<div className="flex flex-col">
							<span className="text-2xl font-bold text-blue-500">
								{cost_profile.currency} {current_spending.total_cost.toFixed(2)}
							</span>
							<span className="text-sm text-muted-foreground">Total Cost</span>
						</div>
						<div className="flex flex-col">
							<span className="text-2xl font-bold">
								{current_spending.total_runs}
							</span>
							<span className="text-sm text-muted-foreground">Total Runs</span>
						</div>
						<div className="flex flex-col">
							<span className="text-2xl font-bold">
								{current_spending.total_tasks}
							</span>
							<span className="text-sm text-muted-foreground">Total Tasks</span>
						</div>
						<div className="flex flex-col">
							<span className="text-2xl font-bold">
								{Math.floor(current_spending.total_duration_seconds / 60)}m
							</span>
							<span className="text-sm text-muted-foreground">
								Total Duration
							</span>
						</div>
						<div className="flex flex-col">
							<span className="text-2xl font-bold text-green-500">
								{cost_profile.currency}{" "}
								{current_spending.average_cost_per_run.toFixed(3)}
							</span>
							<span className="text-sm text-muted-foreground">
								Avg Cost/Run
							</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Cost History Chart */}
			<Card>
				<CardHeader>
					<CardTitle>Cost History (Last 30 Days)</CardTitle>
				</CardHeader>
				<CardContent>
					<CostHistoryChart flowId={flowId} />
				</CardContent>
			</Card>
		</div>
	);
}
