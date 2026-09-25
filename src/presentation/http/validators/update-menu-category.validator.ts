import { z } from "zod";
import { messages } from "@/shared/constants/message.constants.ts";

export const updateMenuCategoryParamsSchema = z
	.object({
		restaurantId: z.uuid({ message: messages.INVALID_RESTAURANT_ID }),
		categoryId: z.uuid({ message: messages.INVALID_CATEGORY_ID }),
	})
	.strict();

export const updateMenuCategoryBodySchema = z
	.object({
		name: z
			.string()
			.trim()
			.min(1, messages.CATEGORY_NAME_REQUIRED)
			.max(255, messages.CATEGORY_NAME_MAX_LENGTH)
			.optional(),
		description: z
			.string()
			.trim()
			.max(1000, messages.CATEGORY_DESCRIPTION_MAX_LENGTH)
			.nullable()
			.optional(),
		displayOrder: z.number().int().nonnegative().optional(),
		isActive: z.boolean().optional(),
	})
	.strict()
	.refine(
		(data) =>
			data.name !== undefined ||
			data.description !== undefined ||
			data.displayOrder !== undefined ||
			data.isActive !== undefined,
		{
			message: messages.AT_LEAST_ONE_FIELD_REQUIRED,
		},
	);

export type UpdateMenuCategoryParams = z.infer<
	typeof updateMenuCategoryParamsSchema
>;
export type UpdateMenuCategoryBody = z.infer<
	typeof updateMenuCategoryBodySchema
>;
