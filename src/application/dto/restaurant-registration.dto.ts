import type { registerRestaurantSchema } from "@/presentation/http/validators/restaurant-registration.validator";
import z from "zod";

export type RegisterRestaurantDto = z.infer<
	typeof registerRestaurantSchema
>;

//repo dto
export interface CreateRestaurantDto {
	restaurantName: string;
	email: string;
	phone: string;
	ownerName: string;
	ownerEmail: string;
	passwordHash: string;
	emailVerifiedAt: Date;
}