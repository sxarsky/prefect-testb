import { useSuspenseQuery } from "@tanstack/react-query";
import { useState, type JSX } from "react";
import { buildGetFlowRunTracesQuery } from "@/api/traces";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

/**
 * Flow Run Traces Component
 *
 * Displays execution traces for a flow run
 * Shows trace spans with filtering capabilities
 */
export function FlowRunTraces({ flowRunId }: FlowRunTracesProps): JSX.Element {
	const { data: tracesData } = useSuspenseQuery(
		buildGetFlowRunTracesQuery(flowRunId),
	);

	const [searchTerm, setSearchTerm] = useState("");
	const [spanTypeFilter, setSpanTypeFilter] = useState<string | null>(null);

	// Filter traces based on search and span type
	const filteredTraces = tracesData.traces.filter((trace) => {
		const matchesSearch = trace.name
			.toLowerCase()
			.includes(searchTerm.toLowerCase());
		const matchesType = !spanTypeFilter || trace.span_type === spanTypeFilter;
		return matchesSearch && matchesType;
	});

	// Get unique span types for filtering
	const spanTypes = Array.from(
		new Set(tracesData.traces.map((t) => t.span_type)),
	);

	// Helper to get badge variant based on status
	const getStatusBadgeVariant = (status: string) => {
		switch (status.toLowerCase()) {
			case "completed":
				return "default";
			case "failed":
				return "destructive";
			case "running":
				return "secondary";
			default:
				return "outline";
		}
	};

	// Helper to format duration
	const formatDuration = (durationMs: number) => {
		if (durationMs < 1000) return `${durationMs}ms`;
		if (durationMs < 60000) return `${(durationMs / 1000).toFixed(2)}s`;
		return `${(durationMs / 60000).toFixed(2)}m`;
	};

	if (tracesData.traces.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-12 text-center">
				<p className="text-muted-foreground">
					No traces available for this flow run.
				</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			{/* Summary Card */}
			<Card>
				<CardHeader>
					<CardTitle>Trace Summary</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex gap-6">
						<div className="flex flex-col">
							<span className="text-2xl font-bold">
								{tracesData.total_spans}
							</span>
							<span className="text-sm text-muted-foreground">Total Spans</span>
						</div>
						<div className="flex flex-col">
							<span className="text-2xl font-bold">{spanTypes.length}</span>
							<span className="text-sm text-muted-foreground">Span Types</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Filters */}
			<div className="flex gap-4">
				<Input
					placeholder="Search by name..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="max-w-sm"
				/>
				<div className="flex gap-2">
					<Badge
						variant={spanTypeFilter === null ? "default" : "outline"}
						className="cursor-pointer"
						onClick={() => setSpanTypeFilter(null)}
					>
						All
					</Badge>
					{spanTypes.map((type) => (
						<Badge
							key={type}
							variant={spanTypeFilter === type ? "default" : "outline"}
							className="cursor-pointer"
							onClick={() => setSpanTypeFilter(type)}
						>
							{type}
						</Badge>
					))}
				</div>
			</div>

			{/* Traces Table */}
			<Card>
				<CardContent className="p-0">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Type</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Duration</TableHead>
								<TableHead>Started At</TableHead>
								<TableHead>Ended At</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredTraces.map((trace) => (
								<TableRow key={trace.span_id}>
									<TableCell className="font-medium">{trace.name}</TableCell>
									<TableCell>
										<Badge variant="outline">{trace.span_type}</Badge>
									</TableCell>
									<TableCell>
										<Badge variant={getStatusBadgeVariant(trace.status)}>
											{trace.status}
										</Badge>
									</TableCell>
									<TableCell>{formatDuration(trace.duration_ms)}</TableCell>
									<TableCell className="text-sm text-muted-foreground">
										{new Date(trace.started_at).toLocaleString()}
									</TableCell>
									<TableCell className="text-sm text-muted-foreground">
										{new Date(trace.ended_at).toLocaleString()}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
					{filteredTraces.length === 0 && (
						<div className="py-8 text-center text-muted-foreground">
							No traces match your filters.
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
