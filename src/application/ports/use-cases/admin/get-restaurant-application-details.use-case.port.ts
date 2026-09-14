import type {
	GetRestaurantApplicationDetailsDto,
	RestaurantApplicationDetailsResponseDto,
} from "@/application/dtos/admin/get-restaurant-application-details.dto.ts";

export interface IGetRestaurantApplicationDetailsUseCase {
	execute(
		dto: GetRestaurantApplicationDetailsDto,
	): Promise<RestaurantApplicationDetailsResponseDto>;
}
