import type { onboardRestaurantSchema } from "@/presentation/http/validators/restaurant-onboard.validator";
import type { z } from "zod";

export type OnboardRestaurantDto = z.infer<typeof onboardRestaurantSchema>;

//repo dto
export interface CreateRestaurantDto {
	restaurantName: string;
	email: string;
	phone: string;
	ownerName: string;
	ownerEmail: string;
	emailVerifiedAt: Date;
}
