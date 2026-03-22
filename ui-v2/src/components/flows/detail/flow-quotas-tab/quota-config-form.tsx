import { zodResolver } from "@hookform/resolvers/zod";
import type { JSX } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import type { QuotaConfig } from "@/api/quotas";
import {
	useCreateQuotaConfig,
	useDeleteQuotaConfig,
} from "@/api/quotas";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const quotaConfigSchema = z.object({
	max_concurrent_runs: z.coerce.number().min(1),
	max_runs_per_hour: z.coerce.number().min(1),
	max_runs_per_day: z.coerce.number().min(1),
	max_total_duration_hours: z.coerce.number().min(0.1),
	enabled: z.boolean(),
});

type QuotaConfigFormData = z.infer<typeof quotaConfigSchema>;

type QuotaConfigFormProps = {
	flowId: string;
	quotaConfig: QuotaConfig;
};

export function QuotaConfigForm({
	flowId,
	quotaConfig,
}: QuotaConfigFormProps): JSX.Element {
	const { createQuotaConfig, isPending: isCreating } = useCreateQuotaConfig();
	const { deleteQuotaConfig, isPending: isDeleting } = useDeleteQuotaConfig();

	const form = useForm<QuotaConfigFormData>({
		resolver: zodResolver(quotaConfigSchema),
		defaultValues: {
			max_concurrent_runs: quotaConfig.max_concurrent_runs,
			max_runs_per_hour: quotaConfig.max_runs_per_hour,
			max_runs_per_day: quotaConfig.max_runs_per_day,
			max_total_duration_hours: quotaConfig.max_total_duration_hours,
			enabled: quotaConfig.enabled,
		},
	});

	const onSubmit = (data: QuotaConfigFormData) => {
		createQuotaConfig(
			{ flowId, data },
			{
				onSuccess: () => {
					toast.success("Quota configuration updated successfully");
				},
				onError: (error) => {
					toast.error(`Failed to update quota configuration: ${error.message}`);
				},
			},
		);
	};

	const handleDelete = () => {
		if (
			window.confirm(
				"Are you sure you want to delete this quota configuration? This will remove all quota limits for this flow.",
			)
		) {
			deleteQuotaConfig(flowId, {
				onSuccess: () => {
					toast.success("Quota configuration deleted successfully");
				},
				onError: (error) => {
					toast.error(`Failed to delete quota configuration: ${error.message}`);
				},
			});
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<FormField
						control={form.control}
						name="max_concurrent_runs"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Max Concurrent Runs</FormLabel>
								<FormControl>
									<Input
										type="number"
										min="1"
										placeholder="5"
										{...field}
									/>
								</FormControl>
								<FormDescription>
									Maximum number of concurrent flow runs
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="max_runs_per_hour"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Max Runs Per Hour</FormLabel>
								<FormControl>
									<Input
										type="number"
										min="1"
										placeholder="20"
										{...field}
									/>
								</FormControl>
								<FormDescription>
									Maximum flow runs allowed per hour
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="max_runs_per_day"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Max Runs Per Day</FormLabel>
								<FormControl>
									<Input
										type="number"
										min="1"
										placeholder="100"
										{...field}
									/>
								</FormControl>
								<FormDescription>
									Maximum flow runs allowed per day
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="max_total_duration_hours"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Max Duration (Hours)</FormLabel>
								<FormControl>
									<Input
										type="number"
										step="0.1"
										min="0.1"
										placeholder="24"
										{...field}
									/>
								</FormControl>
								<FormDescription>
									Maximum total execution time per day
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<FormField
					control={form.control}
					name="enabled"
					render={({ field }) => (
						<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
							<FormControl>
								<Checkbox
									checked={field.value}
									onCheckedChange={field.onChange}
								/>
							</FormControl>
							<div className="space-y-1 leading-none">
								<FormLabel>Enable Quota Enforcement</FormLabel>
								<FormDescription>
									When enabled, flow runs will be queued or rejected if quotas are
									exceeded
								</FormDescription>
							</div>
						</FormItem>
					)}
				/>

				<div className="flex gap-2">
					<Button type="submit" disabled={isCreating}>
						{isCreating ? "Saving..." : "Save Quota Configuration"}
					</Button>
					<Button
						type="button"
						variant="destructive"
						onClick={handleDelete}
						disabled={isDeleting}
					>
						{isDeleting ? "Deleting..." : "Delete Configuration"}
					</Button>
				</div>
			</form>
		</Form>
	);
}
