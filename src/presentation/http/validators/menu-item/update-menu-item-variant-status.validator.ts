import { messages } from "@shared/constants/message.constants";
import z from "zod";

export const updateMenuItemVariantStatusParamsSchema = z
	.object({
		restaurantId: z.uuid({ message: messages.INVALID_RESTAURANT_ID }),
		itemId: z.uuid({ message: messages.INVALID_MENU_ITEM_ID }),
		variantId: z.uuid({ message: messages.INVALID_VARIANT_ID }),
	})
	.strict();

export type UpdateMenuItemVariantStatusParams = z.infer<
	typeof updateMenuItemVariantStatusParamsSchema
>;
