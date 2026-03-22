import { queryOptions } from "@tanstack/react-query";
import { getQueryService } from "@/api/service";

export const buildGetQuotaConfigQuery = (flowId: string) =>
	queryOptions({
		queryKey: ["quotas", flowId],
		queryFn: async () => {
			const res = await (await getQueryService()).GET("/quotas-v2/flows/{flow_id}/quota-config/", {
				params: { path: { flow_id: flowId } },
			});
			return res.data;
		},
	});
