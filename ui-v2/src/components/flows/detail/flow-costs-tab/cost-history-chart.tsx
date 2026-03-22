import { useSuspenseQuery } from "@tanstack/react-query";
import type { JSX } from "react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { buildGetCostHistoryQuery } from "@/api/flow-costs";

type CostHistoryChartProps = {
	flowId: string;
	days?: number;
};

export function CostHistoryChart({
	flowId,
	days = 30,
}: CostHistoryChartProps): JSX.Element {
	const { data: historyData } = useSuspenseQuery(
		buildGetCostHistoryQuery(flowId, days),
	);

	return (
		<div className="w-full">
			<div className="mb-4 flex items-center justify-between">
				<div>
					<p className="text-sm text-muted-foreground">
						Total Cost: ${historyData.total_cost.toFixed(2)}
					</p>
					<p className="text-sm text-muted-foreground">
						Total Runs: {historyData.total_runs}
					</p>
				</div>
			</div>

			<ResponsiveContainer width="100%" height={300}>
				<AreaChart data={historyData.history}>
					<defs>
						<linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
							<stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
						</linearGradient>
					</defs>
					<CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
					<XAxis
						dataKey="date"
						className="text-xs"
						tickFormatter={(value) => {
							const date = new Date(value);
							return `${date.getMonth() + 1}/${date.getDate()}`;
						}}
					/>
					<YAxis
						className="text-xs"
						tickFormatter={(value) => `$${value.toFixed(2)}`}
					/>
					<Tooltip
						content={({ active, payload }) => {
							if (active && payload && payload.length) {
								const data = payload[0].payload;
								return (
									<div className="rounded-lg border bg-background p-3 shadow-md">
										<p className="font-semibold">{data.date}</p>
										<p className="text-sm text-blue-500">
											Cost: ${data.total_cost.toFixed(2)}
										</p>
										<p className="text-sm text-muted-foreground">
											Runs: {data.run_count}
										</p>
										<p className="text-sm text-muted-foreground">
											Avg: ${data.average_cost_per_run.toFixed(3)}/run
										</p>
									</div>
								);
							}
							return null;
						}}
					/>
					<Area
						type="monotone"
						dataKey="total_cost"
						stroke="#3b82f6"
						strokeWidth={2}
						fill="url(#costGradient)"
					/>
				</AreaChart>
			</ResponsiveContainer>
		</div>
	);
}
