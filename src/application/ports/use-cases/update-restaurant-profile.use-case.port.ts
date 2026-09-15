import type { RestaurantProfileResponseDto } from "../../dtos/restaurant/restaurant-profile-response.dto";
import type { UpdateRestaurantProfileDto } from "../../dtos/restaurant/update-restaurant-profile.dto";

export interface IUpdateRestaurantProfileUseCase {
	execute(
		restaurantId: string,
		dto: UpdateRestaurantProfileDto,
	): Promise<RestaurantProfileResponseDto>;
}
