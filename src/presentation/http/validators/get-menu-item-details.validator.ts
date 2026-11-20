import { z } from "zod";
import { messages } from "@/shared/constants/message.constants.ts";

export const getMenuItemDetailsParamsSchema = z.object({
	restaurantId: z.uuid({ message: messages.INVALID_RESTAURANT_ID }),
	menuItemId: z.uuid({ message: messages.INVALID_MENU_ITEM_ID }),
});

export type GetMenuItemDetailsParams = z.infer<
	typeof getMenuItemDetailsParamsSchema
>;
