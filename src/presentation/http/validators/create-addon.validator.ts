import { z } from "zod";
import {
	ADDON_DESCRIPTION_MAX_LENGTH,
	ADDON_NAME_MAX_LENGTH,
	ADDON_PRICE_MAX,
} from "@/domain/constants/addon.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";

export const createAddonParamsSchema = z
	.object({
		restaurantId: z.uuid({ message: messages.INVALID_RESTAURANT_ID }),
	})
	.strict();

export const createAddonBodySchema = z
	.object({
		name: z
			.string()
			.trim()
			.min(1, { message: messages.ADDON_NAME_REQUIRED })
			.max(ADDON_NAME_MAX_LENGTH, { message: messages.ADDON_NAME_MAX_LENGTH }),
		description: z
			.string()
			.trim()
			.max(ADDON_DESCRIPTION_MAX_LENGTH, {
				message: messages.ADDON_DESCRIPTION_MAX_LENGTH,
			})
			.optional()
			.nullable(),
		price: z
			.number()
			.min(0, { message: messages.ADDON_PRICE_NEGATIVE })
			.max(ADDON_PRICE_MAX, { message: messages.ADDON_PRICE_MAX_EXCEEDED }),
		imageKey: z.string().trim().max(500).optional().nullable(),
		isAvailable: z.boolean().optional(),
	})
	.strict();

export const listAddonsParamsSchema = z
	.object({
		restaurantId: z.uuid({ message: messages.INVALID_RESTAURANT_ID }),
	})
	.strict();

export type CreateAddonParams = z.infer<typeof createAddonParamsSchema>;
export type CreateAddonBody = z.infer<typeof createAddonBodySchema>;
export type ListAddonsParams = z.infer<typeof listAddonsParamsSchema>;
