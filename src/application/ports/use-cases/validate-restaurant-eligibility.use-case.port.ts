import type { RestaurantValidationResultDto } from "@/application/dtos/internal/validate-restaurant.dto.ts";

export interface IValidateRestaurantEligibilityUseCase {
	execute(restaurantId: string): Promise<RestaurantValidationResultDto>;
}
