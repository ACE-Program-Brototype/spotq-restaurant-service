import type { CreateRestaurantDto } from "@/application/dto/restaurant-onboarding.dto";
import type { IBaseRepository } from "@/application/ports/repositories/base.repository.port";
import type { Restaurant } from "@prisma/client";

export interface IRestaurantRepository extends IBaseRepository<Restaurant> {
	existsByEmail(email: string): Promise<boolean>;

	createRestaurant(data: CreateRestaurantDto): Promise<Restaurant>;

	findByEmail(email: string): Promise<Restaurant | null>;
}
