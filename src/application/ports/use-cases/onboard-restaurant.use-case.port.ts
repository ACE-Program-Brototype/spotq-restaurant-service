import type { OnboardRestaurantDto } from "@/application/dtos/restaurant/restaurant-onboarding.dto.ts";

export interface IOnboardRestaurantUseCase {
	execute(dto: OnboardRestaurantDto, restaurantId: string): Promise<void>;
}
