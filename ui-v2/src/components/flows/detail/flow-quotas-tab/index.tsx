import { useSuspenseQuery } from "@tanstack/react-query";
import type { JSX } from "react";
import { buildGetQuotaConfigQuery } from "@/api/quotas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuotaConfigForm } from "./quota-config-form";
import { QuotaUsageDisplay } from "./quota-usage-display";

type FlowQuotasTabProps = {
	flowId: string;
};

/**
 * Flow Quotas Tab Component
 *
 * Displays quota configuration and current usage for a flow
 */
export function FlowQuotasTab({ flowId }: FlowQuotasTabProps): JSX.Element {
	const { data: quotaData } = useSuspenseQuery(
		buildGetQuotaConfigQuery(flowId),
	);

	const { quota_config, current_usage, usage_percentages } = quotaData;

	return (
		<div className="flex flex-col gap-4">
			{/* Current Usage */}
			<Card>
				<CardHeader>
					<CardTitle>Current Usage</CardTitle>
				</CardHeader>
				<CardContent>
					<QuotaUsageDisplay
						quotaConfig={quota_config}
						currentUsage={current_usage}
						usagePercentages={usage_percentages}
					/>
				</CardContent>
			</Card>

			{/* Quota Configuration */}
			<Card>
				<CardHeader>
					<CardTitle>Quota Configuration</CardTitle>
				</CardHeader>
				<CardContent>
					<QuotaConfigForm flowId={flowId} quotaConfig={quota_config} />
				</CardContent>
			</Card>
		</div>
	);
}
