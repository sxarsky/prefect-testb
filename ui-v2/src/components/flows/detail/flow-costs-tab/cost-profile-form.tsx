import { zodResolver } from "@hookform/resolvers/zod";
import type { JSX } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import type { CostProfile } from "@/api/flow-costs";
import {
	useCreateCostProfile,
	useDeleteCostProfile,
} from "@/api/flow-costs";
import { Button } from "@/components/ui/button";
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

const costProfileSchema = z.object({
	currency: z.string().min(3).max(3).default("USD"),
	cost_per_second: z.coerce.number().min(0),
	cost_per_task: z.coerce.number().min(0),
	cost_per_gb_memory: z.coerce.number().min(0),
	fixed_cost_per_run: z.coerce.number().min(0),
});

type CostProfileFormData = z.infer<typeof costProfileSchema>;

type CostProfileFormProps = {
	flowId: string;
	costProfile: CostProfile;
};

export function CostProfileForm({
	flowId,
	costProfile,
}: CostProfileFormProps): JSX.Element {
	const { createCostProfile, isPending: isCreating } = useCreateCostProfile();
	const { deleteCostProfile, isPending: isDeleting } = useDeleteCostProfile();

	const form = useForm<CostProfileFormData>({
		resolver: zodResolver(costProfileSchema),
		defaultValues: {
			currency: costProfile.currency,
			cost_per_second: costProfile.cost_per_second,
			cost_per_task: costProfile.cost_per_task,
			cost_per_gb_memory: costProfile.cost_per_gb_memory,
			fixed_cost_per_run: costProfile.fixed_cost_per_run,
		},
	});

	const onSubmit = (data: CostProfileFormData) => {
		createCostProfile(
			{ flowId, data },
			{
				onSuccess: () => {
					toast.success("Cost profile updated successfully");
				},
				onError: (error) => {
					toast.error(`Failed to update cost profile: ${error.message}`);
				},
			},
		);
	};

	const handleDelete = () => {
		if (
			window.confirm("Are you sure you want to delete this cost profile?")
		) {
			deleteCostProfile(flowId, {
				onSuccess: () => {
					toast.success("Cost profile deleted successfully");
				},
				onError: (error) => {
					toast.error(`Failed to delete cost profile: ${error.message}`);
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
						name="currency"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Currency</FormLabel>
								<FormControl>
									<Input placeholder="USD" {...field} maxLength={3} />
								</FormControl>
								<FormDescription>
									3-letter currency code (e.g., USD, EUR, GBP)
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="fixed_cost_per_run"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Fixed Cost Per Run</FormLabel>
								<FormControl>
									<Input
										type="number"
										step="0.01"
										min="0"
										placeholder="0.10"
										{...field}
									/>
								</FormControl>
								<FormDescription>
									Fixed cost charged for each flow run
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="cost_per_second"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Cost Per Second</FormLabel>
								<FormControl>
									<Input
										type="number"
										step="0.0001"
										min="0"
										placeholder="0.0001"
										{...field}
									/>
								</FormControl>
								<FormDescription>Cost per second of execution</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="cost_per_task"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Cost Per Task</FormLabel>
								<FormControl>
									<Input
										type="number"
										step="0.01"
										min="0"
										placeholder="0.05"
										{...field}
									/>
								</FormControl>
								<FormDescription>Cost per task execution</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="cost_per_gb_memory"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Cost Per GB Memory</FormLabel>
								<FormControl>
									<Input
										type="number"
										step="0.0001"
										min="0"
										placeholder="0.0025"
										{...field}
									/>
								</FormControl>
								<FormDescription>
									Cost per GB of memory used
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<div className="flex gap-2">
					<Button type="submit" disabled={isCreating}>
						{isCreating ? "Saving..." : "Save Cost Profile"}
					</Button>
					<Button
						type="button"
						variant="destructive"
						onClick={handleDelete}
						disabled={isDeleting}
					>
						{isDeleting ? "Deleting..." : "Delete Profile"}
					</Button>
				</div>
			</form>
		</Form>
	);
}
