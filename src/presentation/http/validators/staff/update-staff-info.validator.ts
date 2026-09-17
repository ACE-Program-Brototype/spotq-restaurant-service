import { z } from "zod";
import { StaffPhone } from "@/domain/value-objects/phone.vo.ts";
import { messages } from "@/shared/constants/message.constants.ts";

/**
 * Schema to validate route path parameters for updating staff information.
 */
export const updateStaffInfoParamsSchema = z.object({
	restaurantId: z.string().trim().min(1, messages.RESTAURANT_ID_REQUIRED),
	staffId: z.string().trim().min(1, messages.STAFF_ID_REQUIRED),
});

/**
 * Schema to validate request body for updating staff information.
 * Allows updating name, phone, or both.
 * Disallows unsupported fields (strict mode) and requires at least one field.
 */
export const updateStaffInfoSchema = z
	.object({
		fullname: z
			.string()
			.trim()
			.min(2, messages.FULLNAME_MIN_LENGTH)
			.max(100, messages.FULLNAME_MAX_LENGTH)
			.optional(),
		phone: z
			.string()
			.trim()
			.regex(
				/^(?:(?:\+91|91|0)[\s-]?)?[6-9]\d{9}$/,
				messages.INVALID_INDIAN_PHONE_FORMAT,
			)
			.transform((val) => StaffPhone.normalize(val))
			.optional(),
	})
	.strict()
	.refine((data) => data.fullname !== undefined || data.phone !== undefined, {
		message: messages.AT_LEAST_ONE_FIELD_REQUIRED,
	});

export type UpdateStaffInfoParams = z.infer<typeof updateStaffInfoParamsSchema>;
export type UpdateStaffInfoInput = z.infer<typeof updateStaffInfoSchema>;
