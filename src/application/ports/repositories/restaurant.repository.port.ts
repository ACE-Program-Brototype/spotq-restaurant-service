import type { CreateRestaurantDto } from "@/application/dto/restaurant-onboarding.dto";
import type { Restaurant } from "@prisma/client";

export interface IRestaurantRepository {
	existsByEmail(email: string): Promise<boolean>;

	createRestaurant(data: CreateRestaurantDto): Promise<Restaurant>;
}
