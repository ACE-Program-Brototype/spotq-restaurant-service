import type { RestaurantVerificationStatusResponseDto } from "@/application/dtos/restaurant/restaurant-verification-status.dto.ts";

export interface IGetRestaurantVerificationStatusUseCase {
	execute(
		restaurantId: string,
	): Promise<RestaurantVerificationStatusResponseDto>;
}
