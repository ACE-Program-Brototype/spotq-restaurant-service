import { z } from "zod";
import { messages } from "@/shared/constants/message.constants.ts";

export const createMenuItemParamsSchema = z.object({
	restaurantId: z.string().uuid({ message: messages.INVALID_RESTAURANT_ID }),
});

export const createMenuItemImageSchema = z.object({
	object_key: z.string().trim().min(1).optional(),
	objectKey: z.string().trim().min(1).optional(),
	display_order: z.number().int().min(0).optional(),
	displayOrder: z.number().int().min(0).optional(),
});

export const createMenuItemVariantSchema = z.object({
	sku: z.string().trim().max(100).optional().nullable(),
	name: z
		.string()
		.trim()
		.min(1, { message: messages.VARIANT_NAME_REQUIRED })
		.max(255, { message: messages.MENU_ITEM_NAME_MAX_LENGTH }),
	price: z.number().min(0, { message: messages.VARIANT_PRICE_NEGATIVE }),
	is_default: z.boolean().optional(),
	isDefault: z.boolean().optional(),
});

export const createMenuItemAddonSchema = z.object({
	addon_id: z.string().uuid().optional(),
	addonId: z.string().uuid().optional(),
	price_override: z.number().min(0).optional().nullable(),
	priceOverride: z.number().min(0).optional().nullable(),
	display_order: z.number().int().min(0).optional(),
	displayOrder: z.number().int().min(0).optional(),
});

export const createMenuItemBodySchema = z
	.object({
		category_id: z.string().uuid().optional(),
		categoryId: z.string().uuid().optional(),
		name: z
			.string()
			.trim()
			.min(1, { message: messages.MENU_ITEM_NAME_REQUIRED })
			.max(255, { message: messages.MENU_ITEM_NAME_MAX_LENGTH }),
		description: z.string().trim().max(1000).optional().nullable(),
		price: z
			.number()
			.min(0, { message: messages.MENU_ITEM_PRICE_NEGATIVE })
			.optional(),
		preparation_time: z.number().int().min(0).optional().nullable(),
		preparationTime: z.number().int().min(0).optional().nullable(),
		calories: z.number().int().min(0).optional().nullable(),
		is_vegetarian: z.boolean().optional(),
		isVegetarian: z.boolean().optional(),
		is_featured: z.boolean().optional(),
		isFeatured: z.boolean().optional(),
		is_available: z.boolean().optional(),
		isAvailable: z.boolean().optional(),
		images: z.array(createMenuItemImageSchema).optional(),
		variants: z.array(createMenuItemVariantSchema).optional(),
		addons: z.array(createMenuItemAddonSchema).optional(),
	})
	.refine(
		(data) =>
			data.price !== undefined ||
			(data.variants && data.variants.length > 0),
		{
			message: messages.MENU_ITEM_PRICE_NEGATIVE,
			path: ["price"],
		},
	);

export type CreateMenuItemParams = z.infer<typeof createMenuItemParamsSchema>;
export type CreateMenuItemBody = z.infer<typeof createMenuItemBodySchema>;

