import { z } from "zod";
import {
	ADDON_DESCRIPTION_MAX_LENGTH,
	ADDON_NAME_MAX_LENGTH,
	ADDON_PRICE_MAX,
} from "@/domain/constants/addon.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";

export const updateAddonParamsSchema = z
	.object({
		restaurantId: z.uuid({ message: messages.INVALID_RESTAURANT_ID }),
		addonId: z.uuid({ message: messages.INVALID_ADDON_ID }),
	})
	.strict();

export const updateAddonBodySchema = z
	.object({
		name: z
			.string()
			.trim()
			.min(1, { message: messages.ADDON_NAME_REQUIRED })
			.max(ADDON_NAME_MAX_LENGTH, { message: messages.ADDON_NAME_MAX_LENGTH })
			.optional(),
		description: z
			.string()
			.trim()
			.max(ADDON_DESCRIPTION_MAX_LENGTH, {
				message: messages.ADDON_DESCRIPTION_MAX_LENGTH,
			})
			.nullable()
			.optional(),
		price: z
			.number()
			.min(0, { message: messages.ADDON_PRICE_NEGATIVE })
			.max(ADDON_PRICE_MAX, { message: messages.ADDON_PRICE_MAX_EXCEEDED })
			.optional(),
		imageKey: z.string().trim().max(500).nullable().optional(),
		isAvailable: z.boolean().optional(),
	})
	.strict()
	.refine(
		(data) =>
			data.name !== undefined ||
			data.description !== undefined ||
			data.price !== undefined ||
			data.imageKey !== undefined ||
			data.isAvailable !== undefined,
		{
			message: messages.AT_LEAST_ONE_FIELD_REQUIRED,
		},
	);

export type UpdateAddonParams = z.infer<typeof updateAddonParamsSchema>;
export type UpdateAddonBody = z.infer<typeof updateAddonBodySchema>;
