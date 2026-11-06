import { z } from "zod";

export const getPlatformDashboardAnalyticsQuerySchema = z
	.object({
		from: z
			.string()
			.datetime({ message: "Invalid ISO date format for 'from'" })
			.optional(),
		to: z
			.string()
			.datetime({ message: "Invalid ISO date format for 'to'" })
			.optional(),
		billingCycle: z.enum(["ALL", "MONTHLY", "YEARLY"]).default("ALL"),
		fiscalYear: z.coerce
			.number()
			.int({ message: "fiscalYear must be an integer" })
			.min(2020, { message: "fiscalYear must be 2020 or later" })
			.max(2100, { message: "fiscalYear must be 2100 or earlier" })
			.optional(),
	})
	.refine(
		(data) => {
			if (data.from && data.to) {
				return new Date(data.from) <= new Date(data.to);
			}
			return true;
		},
		{
			message: "'from' date must be earlier than or equal to 'to' date",
			path: ["to"],
		},
	);

export type GetPlatformDashboardAnalyticsQuery = z.infer<
	typeof getPlatformDashboardAnalyticsQuerySchema
>;

