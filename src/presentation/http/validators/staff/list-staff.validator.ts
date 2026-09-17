import { z } from "zod";
import { env } from "@/config/env.ts";
import { STAFF_STATUSES } from "@/domain/value-objects/staff-status.vo.ts";
import { messages } from "@/shared/constants/message.constants.ts";

export const listStaffSchema = z.object({
	page: z.coerce
		.number()
		.int()
		.min(1, { message: messages.INVALID_QUERY_PARAMETERS })
		.default(1),
	limit: z.coerce
		.number()
		.int()
		.min(1, { message: messages.INVALID_QUERY_PARAMETERS })
		.max(env.PAGINATION_MAX_LIMIT, {
			message: messages.INVALID_QUERY_PARAMETERS,
		})
		.default(20),
	status: z
		.enum(STAFF_STATUSES, {
			message: messages.INVALID_STAFF_STATUS,
		})
		.optional(),
	search: z
		.string()
		.trim()
		.transform((val) => (val === "" ? undefined : val))
		.optional(),
	sortBy: z
		.enum(["createdAt"], {
			message: messages.INVALID_SORT_FIELD,
		})
		.default("createdAt"),
	sortOrder: z
		.enum(["ASC", "DESC", "asc", "desc"], {
			message: messages.INVALID_SORT_ORDER,
		})
		.transform((val) => val.toUpperCase() as "ASC" | "DESC")
		.default("DESC"),
});

export type ListStaffQuery = z.infer<typeof listStaffSchema>;
