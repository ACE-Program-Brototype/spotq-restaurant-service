
import { TABLE_STATUS } from "@domain/constants/table.constants";
import { messages } from "@shared/constants/message.constants";
import { z } from "zod";

export const getTableParamsSchema = z
	.object({
		restaurantId: z.uuid({
			message: messages.INVALID_RESTAURANT_ID,
		}),
	})
	.strict();

export const getTableQuerySchema = z
	.object({
		page: z.coerce
			.number({ error: messages.INVALID_PAGE })
			.int({ message: messages.INVALID_PAGE })
			.positive({ message: messages.INVALID_PAGE })
			.default(1),

		limit: z.coerce
			.number({ error: messages.INVALID_LIMIT })
			.int({ message: messages.INVALID_LIMIT })
			.positive({ message: messages.INVALID_LIMIT })
			.max(100, { message: messages.LIMIT_EXCEEDS_MAX })
			.default(10),

		sectionId: z
			.uuid({
				message: messages.TABLE_SECTION_ID_REQUIRED,
			})
			.optional(),

		status: z
			.enum(TABLE_STATUS, {
				error: messages.INVALID_TABLE_STATUS,
			})
			.optional(),

		minCapacity: z.coerce
			.number({ error: messages.INVALID_TABLE_CAPACITY })
			.int({ message: messages.INVALID_TABLE_CAPACITY })
			.min(1, { message: messages.INVALID_TABLE_CAPACITY })
			.max(50, { message: messages.INVALID_TABLE_CAPACITY })
			.optional(),
	})
	.strict();

export const getTableAvailabilityQuerySchema = z
	.object({
		partySize: z.coerce.number().int().min(1).max(50),
	})
	.strict();

export type GetTableParams = z.infer<typeof getTableParamsSchema>;

export type GetTableQuery = z.infer<typeof getTableQuerySchema>;
