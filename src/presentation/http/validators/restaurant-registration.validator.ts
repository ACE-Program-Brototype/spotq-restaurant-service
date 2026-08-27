import { z } from "zod";

export const registerRestaurantSchema = z.object({
	restaurantName: z.string().trim().min(1),
	phone: z.string().trim().min(1),
	ownerName: z.string().trim().min(1),
	ownerEmail: z.email(),
	password: z.string().min(8),
});