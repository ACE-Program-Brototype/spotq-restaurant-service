import { z } from "zod";
import { messages } from "@/shared/constants/message.constants.ts";

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const updateRestaurantDtoSchema = z
	.object({
		name: z
			.string()
			.trim()
			.min(2, messages.NAME_MIN_LENGTH)
			.optional(),
		phone: z
			.string()
			.trim()
			.min(7, messages.PHONE_MIN_LENGTH)
			.optional(),
		ownerName: z
			.string()
			.trim()
			.min(2, messages.OWNER_NAME_MIN_LENGTH)
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
			.min(0, messages.AVERAGE_COST_INVALID)
			.optional(),
	})
	.optional();

export const updateSettingsDtoSchema = z
	.object({
		isOpened: z.boolean().optional(),
		isPreorder: z.boolean().optional(),
		seatingCapacity: z
			.number()
			.int()
			.min(0, messages.SEATING_CAPACITY_INVALID)
			.optional(),
		acceptsQueue: z.boolean().optional(),
		acceptsQrOrders: z.boolean().optional(),
		loyaltyEnabled: z.boolean().optional(),
		autoAcceptQueue: z.boolean().optional(),
	})
	.optional();

export const updateBusinessHoursItemDtoSchema = z
	.object({
		dayOfWeek: z.number().int().min(1).max(7),
		openTime: z
			.string()
			.regex(TIME_REGEX, messages.INVALID_TIME_FORMAT)
			.nullable()
			.optional(),
		closeTime: z
			.string()
			.regex(TIME_REGEX, messages.INVALID_TIME_FORMAT)
			.nullable()
			.optional(),
		isClosed: z.boolean().optional(),
	})
	.refine(
		(item) => {
			if (!item.isClosed && item.openTime && item.closeTime) {
				return item.openTime < item.closeTime;
			}
			return true;
		},
		{
			message: messages.CLOSE_TIME_MUST_BE_AFTER_OPEN_TIME,
			path: ["closeTime"],
		},
	);

export const updateRestaurantProfileSchema = z.object({
	restaurant: updateRestaurantDtoSchema,
	profile: updateProfileDtoSchema,
	settings: updateSettingsDtoSchema,
	businessHours: z.array(updateBusinessHoursItemDtoSchema).optional(),
});
