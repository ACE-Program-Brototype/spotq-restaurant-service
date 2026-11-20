import { z } from "zod";
import { messages } from "@/shared/constants/message.constants.ts";
import { ANALYTICS_VALIDATION_MESSAGES } from "@/shared/constants/analytics-validation.constants.ts";
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
			.int({ message: ANALYTICS_VALIDATION_MESSAGES.DAY_MUST_BE_INTEGER })
			.min(1, { message: ANALYTICS_VALIDATION_MESSAGES.DAY_OUT_OF_RANGE })
			.max(31, { message: ANALYTICS_VALIDATION_MESSAGES.DAY_OUT_OF_RANGE })
			.optional(),
		month: z.coerce
			.number()
			.int({ message: ANALYTICS_VALIDATION_MESSAGES.MONTH_MUST_BE_INTEGER })
			.min(1, { message: ANALYTICS_VALIDATION_MESSAGES.MONTH_OUT_OF_RANGE })
			.max(12, { message: ANALYTICS_VALIDATION_MESSAGES.MONTH_OUT_OF_RANGE })
			.optional(),
		year: z.coerce
			.number()
			.int({ message: ANALYTICS_VALIDATION_MESSAGES.YEAR_MUST_BE_INTEGER })
			.min(2000, { message: ANALYTICS_VALIDATION_MESSAGES.YEAR_TOO_EARLY })
			.max(2100, { message: ANALYTICS_VALIDATION_MESSAGES.YEAR_TOO_LATE })
			.optional(),
		status: z.enum(["ALL", "COMPLETED", "CANCELLED"]).default("ALL").optional(),
		page: z.coerce
			.number()
			.int({ message: ANALYTICS_VALIDATION_MESSAGES.PAGE_MUST_BE_INTEGER })
			.min(1, { message: ANALYTICS_VALIDATION_MESSAGES.PAGE_MIN })
			.default(1)
			.optional(),
		limit: z.coerce
			.number()
			.int({ message: ANALYTICS_VALIDATION_MESSAGES.LIMIT_MUST_BE_INTEGER })
			.min(1, { message: ANALYTICS_VALIDATION_MESSAGES.LIMIT_MIN })
			.max(100, { message: ANALYTICS_VALIDATION_MESSAGES.LIMIT_MAX })
			.default(10)
			.optional(),
	})
	.strict()
	.superRefine((data, ctx) => {
		if (data.day !== undefined) {
			if (data.month === undefined) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message:
						ANALYTICS_VALIDATION_MESSAGES.MONTH_REQUIRED_WHEN_DAY_SPECIFIED,
					path: ["month"],
				});
			} else {
				const checkYear = data.year ?? 2024;
				if (!isValidCalendarDate(checkYear, data.month, data.day)) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: ANALYTICS_VALIDATION_MESSAGES.formatInvalidCalendarDate(
							data.day,
							data.month,
							checkYear,
						),
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
