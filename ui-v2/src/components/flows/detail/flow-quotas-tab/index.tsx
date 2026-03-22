import { useSuspenseQuery } from "@tanstack/react-query";
import { buildGetQuotaConfigQuery } from "@/api/quotas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function FlowQuotasTab({ flowId }: { flowId: string }) {
	const { data } = useSuspenseQuery(buildGetQuotaConfigQuery(flowId));
	
	return (
		<Card>
			<CardHeader><CardTitle>Quota Usage</CardTitle></CardHeader>
			<CardContent className="space-y-4">
				<div>
					<p className="text-sm">Concurrent Runs: {data.current_usage.concurrent_runs}/{data.quota_config.max_concurrent_runs}</p>
					<Progress value={data.usage_percentages.concurrent} />
				</div>
				<div>
					<p className="text-sm">Runs This Hour: {data.current_usage.runs_this_hour}/{data.quota_config.max_runs_per_hour}</p>
					<Progress value={data.usage_percentages.hourly} />
				</div>
			</CardContent>
		</Card>
	);
}
