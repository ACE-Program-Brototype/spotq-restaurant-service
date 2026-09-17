import { z } from "zod";

export const getRestaurantApplicationDetailsParamSchema = z.object({
	id: z.uuid("Invalid restaurant ID format. Must be a valid UUID"),
});

export type GetRestaurantApplicationDetailsParam = z.infer<
	typeof getRestaurantApplicationDetailsParamSchema
>;
export type GetRestaurantApplicationDetailsParams =
	GetRestaurantApplicationDetailsParam;
