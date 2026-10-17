import { messages } from "@shared/constants/message.constants";
import { z } from "zod";

export const assignTableParamsSchema = z.object({
	restaurantId: z.string().uuid(messages.INVALID_RESTAURANT_ID),
});

export const assignTableBodySchema = z.object({
	tables: z
		.array(
			z.object({
				tableId: z.string().uuid(messages.INVALID_TABLE_ID),
				capacity: z.number().int().positive(messages.INVALID_TABLE_CAPACITY),
			}),
		)
		.min(1, messages.TABLES_REQUIRED),
});

// Combined type inference if you want to use them in controllers/middleware later
export type AssignTableParamsDTO = z.infer<typeof assignTableParamsSchema>;
export type AssignTableBodyDTO = z.infer<typeof assignTableBodySchema>;
