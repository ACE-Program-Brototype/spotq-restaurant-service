import { z } from "zod";

export const onboardRestaurantSchema = z.object({
	restaurantName: z.string().trim().min(1),
	phone: z.string().trim().min(1),
	ownerName: z.string().trim().min(1),
});
