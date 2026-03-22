import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { JSX } from "react";
import { buildGetFlowRunTracesQuery } from "@/api/traces";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

type FlowRunTracesProps = {
	flowRunId: string;
};

export function FlowRunTraces({ flowRunId }: FlowRunTracesProps): JSX.Element {
	const [spanTypeFilter, setSpanTypeFilter] = useState<string | undefined>();
	const [searchQuery, setSearchQuery] = useState("");

	const { data: tracesData } = useSuspenseQuery(
		buildGetFlowRunTracesQuery(flowRunId, spanTypeFilter),
	);

	const filteredTraces = tracesData.traces.filter((trace) =>
		trace.name.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const formatDuration = (ms: number) => {
		if (ms < 1000) return `${ms}ms`;
		if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
		return `${(ms / 60000).toFixed(2)}m`;
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Execution Traces ({tracesData.total_spans})</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="mb-4 flex gap-4">
					<Input
						placeholder="Search by span name..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="max-w-xs"
					/>
					<Select
						value={spanTypeFilter}
						onValueChange={(value) =>
							setSpanTypeFilter(value === "all" ? undefined : value)
						}
					>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Filter by type" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Types</SelectItem>
							<SelectItem value="task">Task</SelectItem>
							<SelectItem value="flow">Flow</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Span Name</TableHead>
							<TableHead>Type</TableHead>
							<TableHead>Duration</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Start Time</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredTraces.map((trace) => (
							<TableRow key={trace.id}>
								<TableCell className="font-medium">{trace.name}</TableCell>
								<TableCell>
									<Badge variant="outline">{trace.span_type}</Badge>
								</TableCell>
								<TableCell>{formatDuration(trace.duration_ms)}</TableCell>
								<TableCell>
									<Badge
										variant={
											trace.status === "completed" ? "default" : "destructive"
										}
									>
										{trace.status}
									</Badge>
								</TableCell>
								<TableCell className="text-sm text-muted-foreground">
									{new Date(trace.start_time).toLocaleTimeString()}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
