import { useState, type JSX } from "react";
import { toast } from "sonner";
import { useRegisterFlowDependencies } from "@/api/impact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type RegisterDependenciesFormProps = {
	flowId: string;
};

/**
 * Register Dependencies Form
 *
 * Allows users to register downstream dependencies for a flow
 * Dependencies are entered as comma-separated flow IDs
 */
export function RegisterDependenciesForm({
	flowId,
}: RegisterDependenciesFormProps): JSX.Element {
	const [flowIds, setFlowIds] = useState("");
	const { registerDependencies, isPending } = useRegisterFlowDependencies();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!flowIds.trim()) {
			toast.error("Please enter at least one downstream flow ID");
			return;
		}

		// Parse comma-separated flow IDs
		const downstreamFlows = flowIds
			.split(",")
			.map((id) => id.trim())
			.filter((id) => id.length > 0);

		if (downstreamFlows.length === 0) {
			toast.error("Please enter valid flow IDs");
			return;
		}

		registerDependencies(
			{
				flow_id: flowId,
				downstream_flows: downstreamFlows,
			},
			{
				onSuccess: (data) => {
					toast.success(
						`Registered ${data.registered_count} downstream ${data.registered_count === 1 ? "dependency" : "dependencies"}`,
					);
					setFlowIds(""); // Clear form
				},
				onError: (error) => {
					toast.error(`Failed to register dependencies: ${error.message}`);
				},
			},
		);
	};

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-4">
			<div className="flex flex-col gap-2">
				<Label htmlFor="downstream-flows">
					Downstream Flow IDs (comma-separated)
				</Label>
				<Input
					id="downstream-flows"
					type="text"
					placeholder="flow-abc-123, flow-def-456, flow-ghi-789"
					value={flowIds}
					onChange={(e) => setFlowIds(e.target.value)}
					disabled={isPending}
				/>
				<p className="text-sm text-muted-foreground">
					Enter flow IDs that depend on this flow, separated by commas
				</p>
			</div>

			<div className="flex justify-end">
				<Button type="submit" disabled={isPending}>
					{isPending ? "Registering..." : "Register Dependencies"}
				</Button>
			</div>
		</form>
	);
}
