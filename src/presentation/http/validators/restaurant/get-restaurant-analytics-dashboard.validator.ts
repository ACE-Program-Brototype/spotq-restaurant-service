import { z } from "zod";
import { messages } from "@/shared/constants/message.constants.ts";
import { isValidCalendarDate } from "@/shared/utils/date-range.util.ts";

export const getRestaurantAnalyticsDashboardParamsSchema = z
	.object({
		restaurantId: z.string().uuid({ message: messages.INVALID_RESTAURANT_ID }),
	})
	.strict();

export const getRestaurantAnalyticsDashboardQuerySchema = z
	.object({
		interval: z
			.enum(["DAY", "WEEK", "MONTH", "YEAR"])
			.default("MONTH")
			.optional(),
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
		status: z.enum(["ALL", "COMPLETED", "CANCELLED"]).default("ALL").optional(),
		page: z.coerce
			.number()
			.int({ message: "page must be an integer" })
			.min(1, { message: "page must be at least 1" })
			.default(1)
			.optional(),
		limit: z.coerce
			.number()
			.int({ message: "limit must be an integer" })
			.min(1, { message: "limit must be at least 1" })
			.max(100, { message: "limit cannot exceed 100" })
			.default(10)
			.optional(),
	})
	.strict()
	.superRefine((data, ctx) => {
		if (data.day !== undefined) {
			if (data.month === undefined) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "month is required when day is specified",
					path: ["month"],
				});
			} else {
				const checkYear = data.year ?? 2024;
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

export type GetRestaurantAnalyticsDashboardParams = z.infer<
	typeof getRestaurantAnalyticsDashboardParamsSchema
>;

export type GetRestaurantAnalyticsDashboardQuery = z.infer<
	typeof getRestaurantAnalyticsDashboardQuerySchema
>;
