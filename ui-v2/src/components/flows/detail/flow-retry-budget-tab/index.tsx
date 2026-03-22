import { useSuspenseQuery } from "@tanstack/react-query";
import type { JSX } from "react";
import { buildGetRetryBudgetQuery } from "@/api/retry-budgets";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type FlowRetryBudgetTabProps = {
	flowId: string;
};

/**
 * Flow Retry Budget Tab Component
 *
 * Displays retry budget configuration and current usage for a flow
 */
export function FlowRetryBudgetTab({
	flowId,
}: FlowRetryBudgetTabProps): JSX.Element {
	const { data: budgetData } = useSuspenseQuery(
		buildGetRetryBudgetQuery(flowId),
	);

	const { retry_budget, current_usage, usage_percentages } = budgetData;

	// Helper to get progress bar color
	const getProgressColor = (percentage: number) => {
		if (percentage >= 80) return "bg-red-500";
		if (percentage >= 50) return "bg-yellow-500";
		return "bg-green-500";
	};

	// Helper to get status badge
	const getStatusBadge = (percentage: number) => {
		if (percentage >= 80)
			return <Badge variant="destructive">Critical</Badge>;
		if (percentage >= 50)
			return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500">Warning</Badge>;
		return <Badge>OK</Badge>;
	};

	return (
		<div className="flex flex-col gap-4">
			{/* Current Usage */}
			<Card>
				<CardHeader>
					<CardTitle>Retry Budget Usage</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-6">
						{/* Hourly Retries */}
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<span className="font-medium">Retries This Hour</span>
									{getStatusBadge(usage_percentages.hourly)}
								</div>
								<span className="text-sm text-muted-foreground">
									{current_usage.retries_this_hour} /{" "}
									{retry_budget.max_retries_per_hour}
								</span>
							</div>
							<Progress
								value={usage_percentages.hourly}
								className={cn(
									"h-2",
									usage_percentages.hourly >= 80 && "bg-red-100",
									usage_percentages.hourly >= 50 &&
										usage_percentages.hourly < 80 &&
										"bg-yellow-100",
									usage_percentages.hourly < 50 && "bg-green-100",
								)}
								indicatorClassName={getProgressColor(usage_percentages.hourly)}
							/>
							<p className="text-xs text-muted-foreground">
								{usage_percentages.hourly.toFixed(1)}% of hourly limit
							</p>
						</div>

						{/* Daily Retries */}
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<span className="font-medium">Retries Today</span>
									{getStatusBadge(usage_percentages.daily)}
								</div>
								<span className="text-sm text-muted-foreground">
									{current_usage.retries_today} / {retry_budget.max_retries_per_day}
								</span>
							</div>
							<Progress
								value={usage_percentages.daily}
								className={cn(
									"h-2",
									usage_percentages.daily >= 80 && "bg-red-100",
									usage_percentages.daily >= 50 &&
										usage_percentages.daily < 80 &&
										"bg-yellow-100",
									usage_percentages.daily < 50 && "bg-green-100",
								)}
								indicatorClassName={getProgressColor(usage_percentages.daily)}
							/>
							<p className="text-xs text-muted-foreground">
								{usage_percentages.daily.toFixed(1)}% of daily limit
							</p>
						</div>

						{/* Retry Duration */}
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<span className="font-medium">Total Retry Duration</span>
									{getStatusBadge(usage_percentages.duration)}
								</div>
								<span className="text-sm text-muted-foreground">
									{current_usage.total_retry_duration_today_minutes.toFixed(1)}m /{" "}
									{retry_budget.max_total_retry_duration_minutes}m
								</span>
							</div>
							<Progress
								value={usage_percentages.duration}
								className={cn(
									"h-2",
									usage_percentages.duration >= 80 && "bg-red-100",
									usage_percentages.duration >= 50 &&
										usage_percentages.duration < 80 &&
										"bg-yellow-100",
									usage_percentages.duration < 50 && "bg-green-100",
								)}
								indicatorClassName={getProgressColor(usage_percentages.duration)}
							/>
							<p className="text-xs text-muted-foreground">
								{usage_percentages.duration.toFixed(1)}% of duration limit
							</p>
						</div>

						{/* Active Retrying Tasks */}
						<div className="flex items-center justify-between border-t pt-4">
							<span className="font-medium">Active Retrying Tasks</span>
							<span className="text-2xl font-bold text-blue-500">
								{current_usage.active_retrying_tasks}
							</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Configuration Summary */}
			<Card>
				<CardHeader>
					<CardTitle>Budget Configuration</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<p className="text-sm text-muted-foreground">Max Per Task</p>
							<p className="text-lg font-semibold">
								{retry_budget.max_retries_per_task}
							</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Enabled</p>
							<p className="text-lg font-semibold">
								{retry_budget.enabled ? "Yes" : "No"}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
