import { TABLE_SECTION_MODE } from "@domain/constants/table-section.constants";
import { messages } from "@shared/constants/message.constants";
import { z } from "zod";

export const getTableSectionParamsSchema = z
	.object({
		restaurantId: z.uuid({
			message: messages.INVALID_RESTAURANT_ID,
		}),
	})
	.strict();

export const getTableSectionQuerySchema = z
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

		mode: z
			.enum(TABLE_SECTION_MODE, {
				error: messages.INVALID_TABLE_SECTION_MODE,
			})
			.default(TABLE_SECTION_MODE.ALL),
	})
	.strict();

export type GetTableSectionParams = z.infer<
	typeof getTableSectionParamsSchema
>;

export type GetTableSectionQuery = z.infer<
	typeof getTableSectionQuerySchema
>;