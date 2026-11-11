import { z } from "zod";
import { ANALYTICS_FALLBACKS } from "@/shared/constants/analytics.constants.ts";
import { isValidCalendarDate } from "@/shared/utils/date-range.util.ts";

export const getPlatformDashboardAnalyticsQuerySchema = z
	.object({
		period: z.enum(["DAY", "WEEK", "MONTH", "YEAR"]).optional(),
		day: z.coerce
			.number()
			.int({ message: "day must be an integer" })
			.min(1, { message: "day must be between 1 and 31" })
			.max(31, { message: "day must be between 1 and 31" })
			.optional(),
		month: z.coerce
			.number()
			.int({ message: "month must be an integer" })
			.min(1, { message: "month must be between 1 and 12" })
			.max(12, { message: "month must be between 1 and 12" })
			.optional(),
		year: z.coerce
			.number()
			.int({ message: "year must be an integer" })
			.min(2000, { message: "year must be 2000 or later" })
			.max(2100, { message: "year must be 2100 or earlier" })
			.optional(),
		billingCycle: z
			.enum(["ALL", "MONTHLY", "YEARLY"])
			.default("ALL")
			.optional(),
		// Backwards-compatible legacy parameters
		from: z
			.string()
			.datetime({ message: "Invalid ISO date format for 'from'" })
			.optional(),
		to: z
			.string()
			.datetime({ message: "Invalid ISO date format for 'to'" })
			.optional(),
		fiscalYear: z.coerce
			.number()
			.int({ message: "fiscalYear must be an integer" })
			.min(2000, { message: "fiscalYear must be 2000 or later" })
			.max(2100, { message: "fiscalYear must be 2100 or earlier" })
			.optional(),
	})
	.superRefine((data, ctx) => {
		// 1. Date range comparison when from & to are provided
		if (data.from && data.to) {
			if (new Date(data.from) > new Date(data.to)) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "'from' date must be earlier than or equal to 'to' date",
					path: ["to"],
				});
			}
		}

		// 2. Calendar date validation (e.g., February 31, April 31)
		if (data.day !== undefined) {
			if (data.month === undefined) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "month is required when day is specified",
					path: ["month"],
				});
			} else {
				const checkYear =
					data.year ?? data.fiscalYear ?? ANALYTICS_FALLBACKS.DEFAULT_LEAP_YEAR;
				if (!isValidCalendarDate(checkYear, data.month, data.day)) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: `Invalid calendar date: day ${data.day} does not exist in month ${data.month} of year ${checkYear}`,
						path: ["day"],
					});
				}
			}
		}
	});

export type GetPlatformDashboardAnalyticsQuery = z.infer<
	typeof getPlatformDashboardAnalyticsQuerySchema
>;
