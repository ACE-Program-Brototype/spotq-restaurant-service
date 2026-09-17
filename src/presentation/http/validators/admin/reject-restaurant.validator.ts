import { z } from "zod";
import { messages } from "@/shared/constants/message.constants.ts";

export const rejectRestaurantParamSchema = z.object({
	id: z.uuid(messages.INVALID_RESTAURANT_ID_FORMAT),
});

export const rejectRestaurantBodySchema = z.object({
	reason: z
		.string()
		.trim()
		.min(1, messages.REJECTION_REASON_EMPTY)
		.max(500, messages.REJECTION_REASON_MAX_LENGTH),
});

export type RejectRestaurantParam = z.infer<typeof rejectRestaurantParamSchema>;
export type RejectRestaurantParams = RejectRestaurantParam;
export type RejectRestaurantBody = z.infer<typeof rejectRestaurantBodySchema>;
