/**
 * Validator schema for staff restaurant selection.
 * Validates the ephemeral selection token and destination restaurant UUID format.
 */
import { z } from "zod";
import { messages } from "@/shared/constants/message.constants.ts";

export const selectRestaurantSchema = z.object({
	selectToken: z
		.string({ message: messages.SELECTION_TOKEN_REQUIRED })
		.min(1, messages.SELECTION_TOKEN_REQUIRED),
	restaurantId: z
		.string({ message: messages.RESTAURANT_ID_REQUIRED })
		.uuid(messages.INVALID_RESTAURANT_ID_FORMAT),
});

export type SelectRestaurantInput = z.infer<typeof selectRestaurantSchema>;
