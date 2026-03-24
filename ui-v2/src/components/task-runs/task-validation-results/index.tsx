import { useSuspenseQuery } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import type { JSX } from "react";
import { buildGetTaskValidationQuery } from "@/api/task-validation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type TaskValidationResultsProps = {
	taskRunId: string;
};

/**
 * Task Validation Results Component
 *
 * Displays validation results for a task run
 * Shows pass/fail statistics, detailed results, and quality metrics
 */
export function TaskValidationResults({
	taskRunId,
}: TaskValidationResultsProps): JSX.Element {
	const { data: validationData } = useSuspenseQuery(
		buildGetTaskValidationQuery(taskRunId),
	);

	// Helper to get status icon
	const getStatusIcon = (status: string) => {
		switch (status) {
			case "passed":
				return <CheckCircle2 className="h-5 w-5 text-green-500" />;
			case "failed":
				return <XCircle className="h-5 w-5 text-red-500" />;
			case "skipped":
				return <AlertCircle className="h-5 w-5 text-yellow-500" />;
			default:
				return null;
		}
	};

	// Helper to get badge variant
	const getBadgeVariant = (status: string) => {
		switch (status) {
			case "passed":
				return "default";
			case "failed":
				return "destructive";
			case "skipped":
				return "secondary";
			default:
				return "outline";
		}
	};

	// Helper to get check type badge color
	const getCheckTypeBadge = (type: string) => {
		const variants: Record<string, string> = {
			schema: "bg-blue-500/10 text-blue-500",
			assertion: "bg-purple-500/10 text-purple-500",
			data_quality: "bg-orange-500/10 text-orange-500",
			business_rule: "bg-cyan-500/10 text-cyan-500",
			performance: "bg-green-500/10 text-green-500",
		};
		return variants[type] || "bg-gray-500/10 text-gray-500";
	};

	const passRate =
		validationData.total_checks > 0
			? (validationData.passed_checks / validationData.total_checks) * 100
			: 0;

	return (
		<div className="flex flex-col gap-4">
			{/* Summary Card */}
			<Card>
				<CardHeader>
					<CardTitle>Validation Summary</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{/* Overall Status */}
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								{getStatusIcon(validationData.validation_status)}
								<span className="font-semibold capitalize">
									{validationData.validation_status}
								</span>
							</div>
							<Badge variant={getBadgeVariant(validationData.validation_status)}>
								{validationData.passed_checks}/{validationData.total_checks}{" "}
								checks passed
							</Badge>
						</div>

						{/* Pass Rate Progress */}
						<div className="space-y-2">
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Pass Rate</span>
								<span className="font-medium">{passRate.toFixed(1)}%</span>
							</div>
							<Progress
								value={passRate}
								className={cn(
									passRate === 100 && "bg-green-100",
									passRate < 100 &&
										passRate >= 80 &&
										"bg-yellow-100",
									passRate < 80 && "bg-red-100",
								)}
							/>
						</div>

						{/* Statistics */}
						<div className="grid grid-cols-3 gap-4">
							<div className="flex flex-col">
								<span className="text-2xl font-bold text-green-500">
									{validationData.passed_checks}
								</span>
								<span className="text-sm text-muted-foreground">Passed</span>
							</div>
							<div className="flex flex-col">
								<span className="text-2xl font-bold text-red-500">
									{validationData.failed_checks}
								</span>
								<span className="text-sm text-muted-foreground">Failed</span>
							</div>
							<div className="flex flex-col">
								<span className="text-2xl font-bold text-yellow-500">
									{validationData.skipped_checks}
								</span>
								<span className="text-sm text-muted-foreground">Skipped</span>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Validation Results Table */}
			<Card>
				<CardHeader>
					<CardTitle>Validation Checks</CardTitle>
				</CardHeader>
				<CardContent className="p-0">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Status</TableHead>
								<TableHead>Check Name</TableHead>
								<TableHead>Type</TableHead>
								<TableHead>Message</TableHead>
								<TableHead>Time</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{validationData.validation_results.map((result) => (
								<TableRow key={result.id}>
									<TableCell>{getStatusIcon(result.status)}</TableCell>
									<TableCell className="font-medium">
										{result.check_name}
									</TableCell>
									<TableCell>
										<Badge
											variant="outline"
											className={getCheckTypeBadge(result.check_type)}
										>
											{result.check_type}
										</Badge>
									</TableCell>
									<TableCell className="max-w-md truncate">
										{result.message}
									</TableCell>
									<TableCell className="text-sm text-muted-foreground">
										{new Date(result.timestamp).toLocaleTimeString()}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
