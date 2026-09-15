import { z } from "zod";

export const updateRestaurantDtoSchema = z
	.object({
		name: z
			.string()
			.trim()
			.min(2, "Name must be at least 2 characters")
			.optional(),
		phone: z
			.string()
			.trim()
			.min(7, "Phone must be at least 7 characters")
			.optional(),
		ownerName: z
			.string()
			.trim()
			.min(2, "Owner name must be at least 2 characters")
			.optional(),
	})
	.optional();

export const updateProfileDtoSchema = z
	.object({
		logoKey: z.string().nullable().optional(),
		coverImageKey: z.string().nullable().optional(),
		description: z.string().nullable().optional(),
		cuisineType: z.string().nullable().optional(),
		averageCost: z
			.number()
			.min(0, "Average cost cannot be negative")
			.optional(),
	})
	.optional();

export const updateSettingsDtoSchema = z
	.object({
		acceptsQueue: z.boolean().optional(),
		acceptsQrOrders: z.boolean().optional(),
		loyaltyEnabled: z.boolean().optional(),
		autoAcceptQueue: z.boolean().optional(),
	})
	.optional();

export const updateBusinessHoursItemDtoSchema = z.object({
	dayOfWeek: z.number().int().min(1).max(7),
	openTime: z.string().nullable().optional(),
	closeTime: z.string().nullable().optional(),
	isClosed: z.boolean().optional(),
});

export const updateRestaurantProfileSchema = z.object({
	restaurant: updateRestaurantDtoSchema,
	profile: updateProfileDtoSchema,
	settings: updateSettingsDtoSchema,
	businessHours: z.array(updateBusinessHoursItemDtoSchema).optional(),
});
