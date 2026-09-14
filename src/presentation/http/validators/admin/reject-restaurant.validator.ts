import { z } from "zod";

export const rejectRestaurantParamSchema = z.object({
	id: z.uuid("Invalid restaurant ID format. Must be a valid UUID"),
});

export const rejectRestaurantBodySchema = z.object({
	reason: z
		.string()
		.trim()
		.min(1, "Rejection reason cannot be empty")
		.max(500, "Rejection reason must not exceed 500 characters"),
});

export type RejectRestaurantParam = z.infer<typeof rejectRestaurantParamSchema>;
export type RejectRestaurantParams = RejectRestaurantParam;
export type RejectRestaurantBody = z.infer<typeof rejectRestaurantBodySchema>;

