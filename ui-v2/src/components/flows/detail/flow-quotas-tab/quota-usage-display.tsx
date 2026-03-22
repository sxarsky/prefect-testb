import type { JSX } from "react";
import { toast } from "sonner";
import type {
	CurrentUsage,
	QuotaConfig,
	UsagePercentages,
} from "@/api/quotas";
import { useResetQuotaUsage } from "@/api/quotas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type QuotaUsageDisplayProps = {
	quotaConfig: QuotaConfig;
	currentUsage: CurrentUsage;
	usagePercentages: UsagePercentages;
};

export function QuotaUsageDisplay({
	quotaConfig,
	currentUsage,
	usagePercentages,
}: QuotaUsageDisplayProps): JSX.Element {
	const { resetQuotaUsage, isPending: isResetting } = useResetQuotaUsage();

	// Helper to get progress bar color based on usage percentage
	const getProgressColor = (percentage: number) => {
		if (percentage >= 80) return "bg-red-500";
		if (percentage >= 50) return "bg-yellow-500";
		return "bg-green-500";
	};

	// Helper to get status badge variant
	const getStatusBadge = (percentage: number) => {
		if (percentage >= 80)
			return (
				<Badge variant="destructive" className="ml-2">
					Critical
				</Badge>
			);
		if (percentage >= 50)
			return (
				<Badge variant="secondary" className="ml-2 bg-yellow-500/10 text-yellow-500">
					Warning
				</Badge>
			);
		return (
			<Badge variant="default" className="ml-2">
				OK
			</Badge>
		);
	};

	const handleReset = () => {
		if (
			window.confirm(
				"Are you sure you want to reset quota usage counters? This will reset hourly and daily counters to zero.",
			)
		) {
			resetQuotaUsage(quotaConfig.flow_id, {
				onSuccess: () => {
					toast.success("Quota usage counters reset successfully");
				},
				onError: (error) => {
					toast.error(`Failed to reset quota usage: ${error.message}`);
				},
			});
		}
	};

	return (
		<div className="space-y-6">
			{/* Concurrent Runs */}
			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<div className="flex items-center">
						<span className="font-medium">Concurrent Runs</span>
						{getStatusBadge(usagePercentages.concurrent)}
					</div>
					<span className="text-sm text-muted-foreground">
						{current_usage.concurrent_runs} / {quota_config.max_concurrent_runs}
					</span>
				</div>
				<Progress
					value={usagePercentages.concurrent}
					className={cn(
						"h-2",
						usagePercentages.concurrent >= 80 && "bg-red-100",
						usagePercentages.concurrent >= 50 &&
							usagePercentages.concurrent < 80 &&
							"bg-yellow-100",
						usagePercentages.concurrent < 50 && "bg-green-100",
					)}
					indicatorClassName={getProgressColor(usagePercentages.concurrent)}
				/>
				<p className="text-xs text-muted-foreground">
					{usagePercentages.concurrent.toFixed(1)}% of concurrent limit
				</p>
			</div>

			{/* Hourly Runs */}
			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<div className="flex items-center">
						<span className="font-medium">Runs This Hour</span>
						{getStatusBadge(usagePercentages.hourly)}
					</div>
					<span className="text-sm text-muted-foreground">
						{currentUsage.runs_this_hour} / {quota_config.max_runs_per_hour}
					</span>
				</div>
				<Progress
					value={usagePercentages.hourly}
					className={cn(
						"h-2",
						usagePercentages.hourly >= 80 && "bg-red-100",
						usagePercentages.hourly >= 50 &&
							usagePercentages.hourly < 80 &&
							"bg-yellow-100",
						usagePercentages.hourly < 50 && "bg-green-100",
					)}
					indicatorClassName={getProgressColor(usagePercentages.hourly)}
				/>
				<p className="text-xs text-muted-foreground">
					{usagePercentages.hourly.toFixed(1)}% of hourly limit
				</p>
			</div>

			{/* Daily Runs */}
			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<div className="flex items-center">
						<span className="font-medium">Runs Today</span>
						{getStatusBadge(usagePercentages.daily)}
					</div>
					<span className="text-sm text-muted-foreground">
						{currentUsage.runs_today} / {quota_config.max_runs_per_day}
					</span>
				</div>
				<Progress
					value={usagePercentages.daily}
					className={cn(
						"h-2",
						usagePercentages.daily >= 80 && "bg-red-100",
						usagePercentages.daily >= 50 &&
							usagePercentages.daily < 80 &&
							"bg-yellow-100",
						usagePercentages.daily < 50 && "bg-green-100",
					)}
					indicatorClassName={getProgressColor(usagePercentages.daily)}
				/>
				<p className="text-xs text-muted-foreground">
					{usagePercentages.daily.toFixed(1)}% of daily limit
				</p>
			</div>

			{/* Total Duration */}
			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<div className="flex items-center">
						<span className="font-medium">Duration Today</span>
						{getStatusBadge(usagePercentages.duration)}
					</div>
					<span className="text-sm text-muted-foreground">
						{currentUsage.total_duration_today_hours.toFixed(1)}h /{" "}
						{quota_config.max_total_duration_hours}h
					</span>
				</div>
				<Progress
					value={usagePercentages.duration}
					className={cn(
						"h-2",
						usagePercentages.duration >= 80 && "bg-red-100",
						usagePercentages.duration >= 50 &&
							usagePercentages.duration < 80 &&
							"bg-yellow-100",
						usagePercentages.duration < 50 && "bg-green-100",
					)}
					indicatorClassName={getProgressColor(usagePercentages.duration)}
				/>
				<p className="text-xs text-muted-foreground">
					{usagePercentages.duration.toFixed(1)}% of duration limit
				</p>
			</div>

			{/* Reset Button */}
			<div className="flex items-center justify-between border-t pt-4">
				<div>
					<p className="text-sm font-medium">Reset Usage Counters</p>
					<p className="text-xs text-muted-foreground">
						Last reset: {new Date(currentUsage.last_reset).toLocaleString()}
					</p>
				</div>
				<Button
					variant="outline"
					onClick={handleReset}
					disabled={isResetting}
				>
					{isResetting ? "Resetting..." : "Reset Now"}
				</Button>
			</div>
		</div>
	);
}
