import type {
	CreateRestaurantDto,
	OnboardRestaurantDto,
} from "@/application/dtos/restaurant/restaurant-onboarding.dto.ts";
import type { RestaurantProfileResponseDto } from "@/application/dtos/restaurant/restaurant-profile-response.dto.ts";
import type { UpdateRestaurantProfileDto } from "@/application/dtos/restaurant/update-restaurant-profile.dto.ts";
import type { IBaseRepository } from "@/application/ports/repositories/base.repository.port";
import type { Restaurant } from "@/domain/entities/restaurant.entity";

export interface IRestaurantRepository extends IBaseRepository<Restaurant> {
	existsByEmail(email: string): Promise<boolean>;

	createRestaurant(data: CreateRestaurantDto): Promise<Restaurant>;

	findByEmail(email: string): Promise<Restaurant | null>;

	save(restaurant: Restaurant): Promise<void>;

	activateSubscription(
		restaurantId: string,
		planCode: string,
		currentPeriodEnd: Date,
		eventId: string,
	): Promise<boolean>;

	completeOnboarding(
		restaurant: Restaurant,
		dto: OnboardRestaurantDto,
	): Promise<Restaurant>;

	getRestaurantProfileDetails(
		restaurantId: string,
	): Promise<RestaurantProfileResponseDto | null>;

	updateProfileDetails(
		restaurantId: string,
		data: UpdateRestaurantProfileDto,
	): Promise<RestaurantProfileResponseDto>;
}
