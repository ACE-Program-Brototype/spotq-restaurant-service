import { z } from "zod";

export const blockRestaurantParamSchema = z.object({
	id: z.uuid("Invalid restaurant ID format. Must be a valid UUID"),
});

export const blockRestaurantBodySchema = z.object({
	reason: z
		.string()
		.trim()
		.min(1, "Block reason cannot be empty")
		.max(500, "Block reason must not exceed 500 characters"),
});

export type BlockRestaurantParam = z.infer<typeof blockRestaurantParamSchema>;
export type BlockRestaurantBody = z.infer<typeof blockRestaurantBodySchema>;
