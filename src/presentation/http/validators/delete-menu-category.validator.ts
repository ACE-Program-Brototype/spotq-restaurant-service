import { z } from "zod";
import { messages } from "@/shared/constants/message.constants.ts";

export const deleteMenuCategoryParamsSchema = z
	.object({
		restaurantId: z.uuid({ message: messages.INVALID_RESTAURANT_ID }),
		categoryId: z.uuid({ message: messages.INVALID_CATEGORY_ID }),
	})
	.strict();

export type DeleteMenuCategoryParams = z.infer<
	typeof deleteMenuCategoryParamsSchema
>;
