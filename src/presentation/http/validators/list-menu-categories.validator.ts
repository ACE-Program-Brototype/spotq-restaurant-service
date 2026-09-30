import { z } from "zod";
import { messages } from "@/shared/constants/message.constants.ts";

export const listMenuCategoriesParamSchema = z.object({
	restaurantId: z
		.string()
		.uuid({ message: messages.INVALID_RESTAURANT_ID_FORMAT }),
});

export type ListMenuCategoriesParam = z.infer<
	typeof listMenuCategoriesParamSchema
>;
