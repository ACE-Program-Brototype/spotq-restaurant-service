import { z } from "zod";

export const unblockRestaurantParamSchema = z.object({
	id: z.uuid("Invalid restaurant ID format. Must be a valid UUID"),
});

export type UnblockRestaurantParam = z.infer<
	typeof unblockRestaurantParamSchema
>;
