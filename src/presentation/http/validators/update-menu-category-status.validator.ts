import { z } from "zod";
import { messages } from "@/shared/constants/message.constants.ts";

export const updateMenuCategoryStatusParamsSchema = z
	.object({
		restaurantId: z.uuid({ message: messages.INVALID_RESTAURANT_ID }),
		categoryId: z.uuid({ message: messages.INVALID_CATEGORY_ID }),
	})
	.strict();

export const updateMenuCategoryStatusBodySchema = z
	.object({
		isActive: z.boolean({
			error: messages.CATEGORY_IS_ACTIVE_INVALID,
		}),
	})
	.strict();

export type UpdateMenuCategoryStatusParams = z.infer<
	typeof updateMenuCategoryStatusParamsSchema
>;
export type UpdateMenuCategoryStatusBody = z.infer<
	typeof updateMenuCategoryStatusBodySchema
>;
