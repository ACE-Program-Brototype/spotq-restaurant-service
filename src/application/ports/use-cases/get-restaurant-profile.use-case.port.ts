import type { RestaurantProfileResponseDto } from "@/application/dtos/restaurant/restaurant-profile-response.dto.ts";

export interface IGetRestaurantProfileUseCase {
	execute(restaurantId: string): Promise<RestaurantProfileResponseDto>;
}
