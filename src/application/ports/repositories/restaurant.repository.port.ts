import { CreateRestaurantDto } from "@/application/dto/restaurant-registration.dto";
import { Restaurant } from "@prisma/client";

export interface IRestaurantRepository {
	existsByEmail(email: string): Promise<boolean>;

	createRestaurant(data: CreateRestaurantDto): Promise<Restaurant>;
}
