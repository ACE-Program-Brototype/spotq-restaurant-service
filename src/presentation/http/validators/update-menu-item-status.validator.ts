import { z } from "zod";
import { messages } from "@/shared/constants/message.constants.ts";

export const updateMenuItemStatusParamsSchema = z
	.object({
		restaurantId: z.uuid({ message: messages.INVALID_RESTAURANT_ID }),
		menuItemId: z.uuid({ message: messages.INVALID_MENU_ITEM_ID }),
	})
	.strict();

export const updateMenuItemStatusBodySchema = z
	.object({
		isAvailable: z
			.boolean({
				message: messages.MENU_ITEM_IS_AVAILABLE_INVALID,
			})
			.optional(),
		is_available: z
			.boolean({
				message: messages.MENU_ITEM_IS_AVAILABLE_INVALID,
			})
			.optional(),
	})
	.strict()
	.refine(
		(data) => data.isAvailable !== undefined || data.is_available !== undefined,
		{
			message: messages.MENU_ITEM_IS_AVAILABLE_INVALID,
		},
	);

export type UpdateMenuItemStatusParams = z.infer<
	typeof updateMenuItemStatusParamsSchema
>;
export type UpdateMenuItemStatusBody = z.infer<
	typeof updateMenuItemStatusBodySchema
>;
