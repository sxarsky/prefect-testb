import { queryOptions } from "@tanstack/react-query";
import { getQueryService } from "@/api/service";

export const buildGetRetryBudgetQuery = (flowId: string) =>
	queryOptions({
		queryKey: ["retry-budgets", flowId],
		queryFn: async () => {
			const res = await (await getQueryService()).GET("/retry-budgets-v2/flows/{flow_id}/retry-budget/", {
				params: { path: { flow_id: flowId } },
			});
			return res.data;
		},
	});
