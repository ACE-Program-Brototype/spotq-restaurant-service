import { z } from "zod";
import { messages } from "@/shared/constants/message.constants.ts";
import { parseBooleanFilter } from "./utils/query-parser.util.ts";

export const getCustomerRestaurantDetailsParamsSchema = z
	.object({
		restaurantId: z
			.string()
			.uuid({ message: messages.INVALID_RESTAURANT_ID })
	})

export const getCustomerRestaurantDetailsQuerySchema = z.object({
	includeMenu: z.preprocess(parseBooleanFilter, z.boolean()).default(true),
	categoryId: z
		.string()
		.uuid({ message: messages.INVALID_CATEGORY_ID })
		.optional(),
});

export type GetCustomerRestaurantDetailsParams = z.infer<
	typeof getCustomerRestaurantDetailsParamsSchema
>;

export type GetCustomerRestaurantDetailsQuery = z.infer<
	typeof getCustomerRestaurantDetailsQuerySchema
>;
