import { useSuspenseQuery } from "@tanstack/react-query";
import { buildGetRetryBudgetQuery } from "@/api/retry-budgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function FlowRetryBudgetTab({ flowId }: { flowId: string }) {
	const { data } = useSuspenseQuery(buildGetRetryBudgetQuery(flowId));
	
	return (
		<Card>
			<CardHeader><CardTitle>Retry Budget Usage</CardTitle></CardHeader>
			<CardContent className="space-y-4">
				<div>
					<p className="text-sm">Retries This Hour: {data.current_usage.retries_this_hour}/{data.retry_budget.max_retries_per_hour}</p>
					<Progress value={data.usage_percentages.hourly} />
				</div>
				<div>
					<p className="text-sm">Retries Today: {data.current_usage.retries_today}/{data.retry_budget.max_retries_per_day}</p>
					<Progress value={data.usage_percentages.daily} />
				</div>
			</CardContent>
		</Card>
	);
}
