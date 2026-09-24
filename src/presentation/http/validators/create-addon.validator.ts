import { z } from "zod";
import { messages } from "@/shared/constants/message.constants.ts";

export const createAddonParamsSchema = z.object({
	restaurantId: z.string().uuid({ message: messages.INVALID_RESTAURANT_ID }),
});

export const createAddonBodySchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, { message: messages.ADDON_NAME_REQUIRED })
		.max(255, { message: messages.ADDON_NAME_MAX_LENGTH }),
	description: z
		.string()
		.trim()
		.max(1000, { message: messages.ADDON_DESCRIPTION_MAX_LENGTH })
		.optional()
		.nullable(),
	price: z
		.number()
		.min(0, { message: messages.ADDON_PRICE_NEGATIVE }),
	image_key: z.string().trim().max(500).optional().nullable(),
	imageKey: z.string().trim().max(500).optional().nullable(),
	is_available: z.boolean().optional(),
	isAvailable: z.boolean().optional(),
});

export const listAddonsParamsSchema = z.object({
	restaurantId: z.string().uuid({ message: messages.INVALID_RESTAURANT_ID }),
});

export type CreateAddonParams = z.infer<typeof createAddonParamsSchema>;
export type CreateAddonBody = z.infer<typeof createAddonBodySchema>;
export type ListAddonsParams = z.infer<typeof listAddonsParamsSchema>;
