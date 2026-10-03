import { z } from "zod";
import { messages } from "@/shared/constants/message.constants.ts";

export const deleteMenuItemParamsSchema = z
	.object({
		restaurantId: z.uuid({ message: messages.INVALID_RESTAURANT_ID }),
		menuItemId: z.uuid({ message: messages.INVALID_MENU_ITEM_ID }),
	})
	.strict();

export type DeleteMenuItemParams = z.infer<typeof deleteMenuItemParamsSchema>;
