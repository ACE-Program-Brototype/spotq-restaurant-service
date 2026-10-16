import { messages } from "@shared/constants/message.constants";
import z from "zod";

export const deleteTableParamsSchema = z
	.object({
		restaurantId: z.uuid({
			message: messages.INVALID_RESTAURANT_ID,
		}),
		tableId: z.uuid({
			message: messages.INVALID_RESTAURANT_ID,
		}),
	})
	.strict();
