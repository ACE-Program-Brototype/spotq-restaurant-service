import { z } from "zod";

export const getRestaurantDetailsParamSchema = z.object({
	id: z.uuid("Invalid restaurant ID format. Must be a valid UUID"),
});

export type GetRestaurantDetailsParam = z.infer<
	typeof getRestaurantDetailsParamSchema
>;
