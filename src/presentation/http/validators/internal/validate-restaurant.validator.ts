import { z } from "zod";
import { messages } from "@/shared/constants/message.constants.ts";

export const validateRestaurantParamsSchema = z.object({
	restaurantId: z
		.string()
		.trim()
		.uuid({ message: messages.INVALID_RESTAURANT_ID_FORMAT }),
});

export type ValidateRestaurantParams = z.infer<
	typeof validateRestaurantParamsSchema
>;
