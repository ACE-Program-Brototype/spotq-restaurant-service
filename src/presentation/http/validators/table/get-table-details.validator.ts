import { messages } from "@shared/constants/message.constants";
import z from "zod";

export const getTableDetailsParamsSchema = z
	.object({
		restaurantId: z.uuid({
			message: messages.INVALID_RESTAURANT_ID,
		}),
		tableId: z.uuid({
			message: messages.TABLE_ID_REQUIRED,
		}),
	})
	.strict();

export type GetTableDetailsParams = z.infer<typeof getTableDetailsParamsSchema>;
