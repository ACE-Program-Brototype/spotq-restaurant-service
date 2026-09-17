import { z } from "zod";
import { StaffPhone } from "@/domain/value-objects/phone.vo.ts";
import { messages } from "@/shared/constants/message.constants.ts";

export const updateStaffProfileParamsSchema = z.object({
	restaurantId: z.string().trim().min(1, messages.RESTAURANT_ID_REQUIRED),
	staffId: z.string().trim().min(1, messages.STAFF_ID_REQUIRED),
});

export const updateStaffProfileBodySchema = z
	.object({
		name: z
			.string()
			.trim()
			.min(2, messages.FULLNAME_MIN_LENGTH)
			.max(100, messages.FULLNAME_MAX_LENGTH)
			.optional(),
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
		avatar_url: z.string().trim().min(1).max(500).nullable().optional(),
		avatarUrl: z.string().trim().min(1).max(500).nullable().optional(),
	})
	.strict()
	.refine(
		(data) =>
			data.name !== undefined ||
			data.fullname !== undefined ||
			data.phone !== undefined ||
			data.avatar_url !== undefined ||
			data.avatarUrl !== undefined,
		messages.AT_LEAST_ONE_FIELD_REQUIRED,
	);

export type UpdateStaffProfileParams = z.infer<
	typeof updateStaffProfileParamsSchema
>;
export type UpdateStaffProfileBody = z.infer<
	typeof updateStaffProfileBodySchema
>;
