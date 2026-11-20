import { z } from "zod";
import { ANALYTICS_FALLBACKS } from "@/shared/constants/analytics.constants.ts";
import { ANALYTICS_VALIDATION_MESSAGES } from "@/shared/constants/analytics-validation.constants.ts";
import { isValidCalendarDate } from "@/shared/utils/date-range.util.ts";

export const getPlatformDashboardAnalyticsQuerySchema = z
	.object({
		period: z.enum(["DAY", "WEEK", "MONTH", "YEAR"]).optional(),
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
		billingCycle: z
			.enum(["ALL", "MONTHLY", "YEARLY"])
			.default("ALL")
			.optional(),
		// Backwards-compatible legacy parameters
		from: z
			.string()
			.datetime({ message: ANALYTICS_VALIDATION_MESSAGES.FROM_INVALID_ISO })
			.optional(),
		to: z
			.string()
			.datetime({ message: ANALYTICS_VALIDATION_MESSAGES.TO_INVALID_ISO })
			.optional(),
		fiscalYear: z.coerce
			.number()
			.int({
				message: ANALYTICS_VALIDATION_MESSAGES.FISCAL_YEAR_MUST_BE_INTEGER,
			})
			.min(2000, {
				message: ANALYTICS_VALIDATION_MESSAGES.FISCAL_YEAR_TOO_EARLY,
			})
			.max(2100, {
				message: ANALYTICS_VALIDATION_MESSAGES.FISCAL_YEAR_TOO_LATE,
			})
			.optional(),
	})
	.superRefine((data, ctx) => {
		// 1. Date range comparison when from & to are provided
		if (data.from && data.to) {
			if (new Date(data.from) > new Date(data.to)) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: ANALYTICS_VALIDATION_MESSAGES.FROM_BEFORE_TO,
					path: ["to"],
				});
			}
		}

		// 2. Calendar date validation (e.g., February 31, April 31)
		if (data.day !== undefined) {
			if (data.month === undefined) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message:
						ANALYTICS_VALIDATION_MESSAGES.MONTH_REQUIRED_WHEN_DAY_SPECIFIED,
					path: ["month"],
				});
			} else {
				const checkYear =
					data.year ?? data.fiscalYear ?? ANALYTICS_FALLBACKS.DEFAULT_LEAP_YEAR;
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

export type GetPlatformDashboardAnalyticsQuery = z.infer<
	typeof getPlatformDashboardAnalyticsQuerySchema
>;
