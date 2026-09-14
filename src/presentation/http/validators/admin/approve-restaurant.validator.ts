import { z } from "zod";

export const approveRestaurantParamSchema = z.object({
	id: z.uuid("Invalid restaurant ID format. Must be a valid UUID"),
});

export type ApproveRestaurantParam = z.infer<
	typeof approveRestaurantParamSchema
>;
export type ApproveRestaurantParams = ApproveRestaurantParam;

