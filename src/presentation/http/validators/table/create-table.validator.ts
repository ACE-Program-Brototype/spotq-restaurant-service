import { TABLE_SHAPE_VALUES } from "@domain/constants/table.constants";
import { messages } from "@shared/constants/message.constants";
import z from "zod";

export const createTableParamsSchema = z
	.object({
		restaurantId: z.uuid({ message: messages.INVALID_RESTAURANT_ID }),
	})
	.strict();

export const createTableBodySchema = z
	.object({
		tableNumber: z
			.string({ message: messages.TABLE_CODE_REQUIRED })
			.trim()
			.min(1, { message: messages.INVALID_TABLE_CODE })
			.max(50, { message: messages.TABLE_CODE_MAX }),
		sectionId: z
			.string({ error: messages.TABLE_SECTION_ID_REQUIRED })
			.trim()
			.min(1, { message: messages.TABLE_SECTION_ID_REQUIRED })
			.uuid({message : messages.INVALID_TABLE_SECTION_ID}),
		capacity: z
			.number({ message: messages.TABLE_CAPACITY_REQUIRED })
			.int()
			.positive({ message: messages.INVALID_TABLE_CAPACITY }),
		tableType: z.enum(TABLE_SHAPE_VALUES, {
			message: messages.INVALID_TABLE_SHAPE,
		}),
	})
	.strict();

export type CreateTableParams = z.infer<typeof createTableParamsSchema>;
export type CreateTableBody = z.infer<typeof createTableBodySchema>;
