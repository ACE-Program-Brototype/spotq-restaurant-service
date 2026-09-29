import { z } from "zod";
import { messages } from "@/shared/constants/message.constants.ts";

export const createMenuItemParamsSchema = z.object({
	restaurantId: z.string().uuid({ message: messages.INVALID_RESTAURANT_ID }),
});

export const createMenuItemImageSchema = z
	.object({
		object_key: z.string().trim().min(1).optional(),
		objectKey: z.string().trim().min(1).optional(),
		display_order: z.number().int().min(0).optional(),
		displayOrder: z.number().int().min(0).optional(),
	})
	.refine(
		(data) => Boolean((data.objectKey && data.objectKey.trim().length > 0) || (data.object_key && data.object_key.trim().length > 0)),
		{ message: messages.STORAGE_KEY_REQUIRED },
	);

export const createMenuItemVariantSchema = z.object({
	sku: z.string().trim().max(100).optional().nullable(),
	name: z
		.string({ message: messages.VARIANT_NAME_REQUIRED })
		.trim()
		.min(1, { message: messages.VARIANT_NAME_REQUIRED })
		.max(255, { message: messages.MENU_ITEM_NAME_MAX_LENGTH }),
	price: z
		.number({ message: messages.VARIANT_PRICE_REQUIRED })
		.min(0, { message: messages.VARIANT_PRICE_NEGATIVE })
		.max(99999999.99, { message: messages.PRICE_EXCEEDS_MAXIMUM }),
	is_default: z.boolean().optional(),
	isDefault: z.boolean().optional(),
});

export const createMenuItemAddonSchema = z
	.object({
		addon_id: z.string().uuid().optional(),
		addonId: z.string().uuid().optional(),
		price_override: z
			.number()
			.min(0)
			.max(99999999.99, { message: messages.PRICE_EXCEEDS_MAXIMUM })
			.optional()
			.nullable(),
		priceOverride: z
			.number()
			.min(0)
			.max(99999999.99, { message: messages.PRICE_EXCEEDS_MAXIMUM })
			.optional()
			.nullable(),
	})
	.refine(
		(data) => Boolean(data.addonId || data.addon_id),
		{ message: messages.INVALID_ADDON_ID },
	);

export const createMenuItemBodySchema = z
	.object({
		category_id: z
			.string()
			.uuid({ message: messages.INVALID_CATEGORY_ID })
			.optional(),
		categoryId: z
			.string()
			.uuid({ message: messages.INVALID_CATEGORY_ID })
			.optional(),
		name: z
			.string({ message: messages.MENU_ITEM_NAME_REQUIRED })
			.trim()
			.min(1, { message: messages.MENU_ITEM_NAME_REQUIRED })
			.max(255, { message: messages.MENU_ITEM_NAME_MAX_LENGTH }),
		description: z
			.string({ message: messages.MENU_ITEM_DESCRIPTION_REQUIRED })
			.trim()
			.min(1, { message: messages.MENU_ITEM_DESCRIPTION_REQUIRED })
			.max(1000, { message: messages.MENU_ITEM_DESCRIPTION_MAX_LENGTH }),
		price: z
			.number()
			.min(0, { message: messages.MENU_ITEM_PRICE_NEGATIVE })
			.max(99999999.99, { message: messages.PRICE_EXCEEDS_MAXIMUM })
			.optional(),
		preparation_time: z
			.number({ message: messages.PREPARATION_TIME_REQUIRED })
			.int()
			.min(0, { message: messages.PREPARATION_TIME_NEGATIVE })
			.optional(),
		preparationTime: z
			.number({ message: messages.PREPARATION_TIME_REQUIRED })
			.int()
			.min(0, { message: messages.PREPARATION_TIME_NEGATIVE })
			.optional(),
		calories: z.number().int().min(0).optional().nullable(),
		is_vegetarian: z
			.boolean({ message: messages.IS_VEGETARIAN_REQUIRED })
			.optional(),
		isVegetarian: z
			.boolean({ message: messages.IS_VEGETARIAN_REQUIRED })
			.optional(),
		is_featured: z.boolean().optional(),
		isFeatured: z.boolean().optional(),
		is_available: z.boolean().optional().default(true),
		isAvailable: z.boolean().optional().default(true),
		images: z
			.array(createMenuItemImageSchema, {
				message: messages.MENU_ITEM_IMAGES_REQUIRED,
			})
			.min(1, { message: messages.MENU_ITEM_IMAGES_REQUIRED }),
		variants: z.array(createMenuItemVariantSchema).optional(),
		addons: z.array(createMenuItemAddonSchema).optional(),
	})
	.refine(
		(data) => Boolean(data.categoryId || data.category_id),
		{
			message: messages.CATEGORY_ID_REQUIRED,
			path: ["categoryId"],
		},
	)
	.refine(
		(data) =>
			data.preparationTime !== undefined ||
			data.preparation_time !== undefined,
		{
			message: messages.PREPARATION_TIME_REQUIRED,
			path: ["preparationTime"],
		},
	)
	.refine(
		(data) =>
			data.isVegetarian !== undefined ||
			data.is_vegetarian !== undefined,
		{
			message: messages.IS_VEGETARIAN_REQUIRED,
			path: ["isVegetarian"],
		},
	)
	.refine(
		(data) =>
			data.price !== undefined ||
			(data.variants && data.variants.length > 0),
		{
			message: messages.MENU_ITEM_PRICE_REQUIRED,
			path: ["price"],
		},
	)
	.refine(
		(data) => {
			if (!data.addons || data.addons.length <= 1) return true;
			const addonIds = data.addons
				.map((a) => (a.addonId ?? a.addon_id)?.trim())
				.filter(Boolean);
			return new Set(addonIds).size === addonIds.length;
		},
		{
			message: messages.DUPLICATE_ADDON_IN_MENU_ITEM,
			path: ["addons"],
		},
	);

export type CreateMenuItemParams = z.infer<typeof createMenuItemParamsSchema>;
export type CreateMenuItemBody = z.infer<typeof createMenuItemBodySchema>;

