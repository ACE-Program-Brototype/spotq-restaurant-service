import type { RestaurantDetailsResponseDto } from "@/application/dtos/admin/restaurant-details.dto.ts";

export interface IGetRestaurantDetailsUseCase {
	execute(restaurantId: string): Promise<RestaurantDetailsResponseDto>;
}
