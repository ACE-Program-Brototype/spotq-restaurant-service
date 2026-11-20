import { z } from "zod";
import { messages } from "@/shared/constants/message.constants.ts";

export const createMenuCategoryParamsSchema = z.object({
	restaurantId: z.string().uuid({ message: messages.INVALID_RESTAURANT_ID }),
});

export const createMenuCategoryBodySchema = z.object({
	name: z.string().trim().min(1, messages.CATEGORY_NAME_REQUIRED).max(255),
	description: z.string().trim().max(1000).nullable().optional(),
	displayOrder: z.number().int().nonnegative().optional(),
});

export type CreateMenuCategoryParams = z.infer<
	typeof createMenuCategoryParamsSchema
>;
export type CreateMenuCategoryBody = z.infer<
	typeof createMenuCategoryBodySchema
>;
