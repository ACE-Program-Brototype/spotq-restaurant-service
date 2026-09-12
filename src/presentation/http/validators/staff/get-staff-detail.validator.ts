import { z } from "zod";
import { messages } from "@/shared/constants/message.constants.ts";

const ID_REGEX = /^[a-zA-Z0-9_-]+$/;

export const getStaffDetailParamsSchema = z.object({
	restaurantId: z
		.string({
			required_error: messages.INVALID_RESTAURANT_ID,
			invalid_type_error: messages.INVALID_RESTAURANT_ID,
		})
		.trim()
		.min(1, messages.INVALID_RESTAURANT_ID)
		.max(100, messages.INVALID_RESTAURANT_ID)
		.regex(ID_REGEX, messages.INVALID_RESTAURANT_ID),
	staffId: z
		.string({
			required_error: messages.INVALID_STAFF_ID,
			invalid_type_error: messages.INVALID_STAFF_ID,
		})
		.trim()
		.min(1, messages.INVALID_STAFF_ID)
		.max(100, messages.INVALID_STAFF_ID)
		.regex(ID_REGEX, messages.INVALID_STAFF_ID),
});

export type GetStaffDetailParams = z.infer<typeof getStaffDetailParamsSchema>;
