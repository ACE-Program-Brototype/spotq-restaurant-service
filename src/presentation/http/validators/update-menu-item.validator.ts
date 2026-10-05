import { z } from "zod";
import { messages } from "@/shared/constants/message.constants.ts";

export const updateMenuItemParamsSchema = z.object({
	restaurantId: z.string().uuid({ message: messages.INVALID_RESTAURANT_ID }),
	menuItemId: z.string().uuid({ message: messages.INVALID_MENU_ITEM_ID }),
});

export const updateMenuItemImageSchema = z
	.object({
		id: z.string().uuid().optional(),
		object_key: z.string().trim().min(1).optional(),
		objectKey: z.string().trim().min(1).optional(),
		display_order: z.number().int().min(0).optional(),
		displayOrder: z.number().int().min(0).optional(),
	})
	.refine(
		(data) =>
			Boolean(
				(data.objectKey && data.objectKey.trim().length > 0) ||
					(data.object_key && data.object_key.trim().length > 0),
			),
		{ message: messages.STORAGE_KEY_REQUIRED },
	);

export const updateMenuItemVariantSchema = z.object({
	id: z.string().uuid().optional(),
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
	is_available: z.boolean().optional(),
	isAvailable: z.boolean().optional(),
});

export const updateMenuItemAddonSchema = z
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
	.refine((data) => Boolean(data.addonId || data.addon_id), {
		message: messages.INVALID_ADDON_ID,
	});

export const updateMenuItemBodySchema = z
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
			.string()
			.trim()
			.min(1, { message: messages.MENU_ITEM_NAME_REQUIRED })
			.max(255, { message: messages.MENU_ITEM_NAME_MAX_LENGTH })
			.optional(),
		description: z
			.string()
			.trim()
			.max(1000, { message: messages.MENU_ITEM_DESCRIPTION_MAX_LENGTH })
			.optional()
			.nullable(),
		price: z
			.number()
			.min(0, { message: messages.MENU_ITEM_PRICE_NEGATIVE })
			.max(99999999.99, { message: messages.PRICE_EXCEEDS_MAXIMUM })
			.optional(),
		preparation_time: z
			.number()
			.int()
			.min(0, { message: messages.PREPARATION_TIME_NEGATIVE })
			.optional()
			.nullable(),
		preparationTime: z
			.number()
			.int()
			.min(0, { message: messages.PREPARATION_TIME_NEGATIVE })
			.optional()
			.nullable(),
		calories: z.number().int().min(0).optional().nullable(),
		is_vegetarian: z.boolean().optional(),
		isVegetarian: z.boolean().optional(),
		is_featured: z.boolean().optional(),
		isFeatured: z.boolean().optional(),
		is_available: z.boolean().optional(),
		isAvailable: z.boolean().optional(),
		images: z.array(updateMenuItemImageSchema).optional(),
		variants: z.array(updateMenuItemVariantSchema).optional(),
		addons: z.array(updateMenuItemAddonSchema).optional(),
	})
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
	)
	.refine(
		(data) => {
			if (!data.variants || data.variants.length <= 1) return true;
			const variantIds = data.variants
				.map((v) => v.id?.trim())
				.filter((id): id is string => Boolean(id));
			return new Set(variantIds).size === variantIds.length;
		},
		{
			message: messages.DUPLICATE_VARIANT_IN_MENU_ITEM,
			path: ["variants"],
		},
	)
	.refine(
		(data) => {
			if (!data.variants || data.variants.length <= 1) return true;
			const defaultCount = data.variants.filter(
				(v) => v.isDefault ?? v.is_default,
			).length;
			return defaultCount <= 1;
		},
		{
			message: messages.MULTIPLE_DEFAULT_VARIANTS,
			path: ["variants"],
		},
	)
	.refine(
		(data) => {
			return (
				data.categoryId !== undefined ||
				data.category_id !== undefined ||
				data.name !== undefined ||
				data.description !== undefined ||
				data.price !== undefined ||
				data.preparationTime !== undefined ||
				data.preparation_time !== undefined ||
				data.calories !== undefined ||
				data.isVegetarian !== undefined ||
				data.is_vegetarian !== undefined ||
				data.isFeatured !== undefined ||
				data.is_featured !== undefined ||
				data.isAvailable !== undefined ||
				data.is_available !== undefined ||
				data.images !== undefined ||
				data.variants !== undefined ||
				data.addons !== undefined
			);
		},
		{
			message: messages.AT_LEAST_ONE_FIELD_REQUIRED,
		},
	);

export type UpdateMenuItemParams = z.infer<typeof updateMenuItemParamsSchema>;
export type UpdateMenuItemBody = z.infer<typeof updateMenuItemBodySchema>;
