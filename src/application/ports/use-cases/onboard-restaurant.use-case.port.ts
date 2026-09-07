import type { OnboardRestaurantDto } from "@/application/dtos/restaurant/restaurant-onboarding.dto.ts";

export interface IOnboardRestaurantUseCase {
	execute(dto: OnboardRestaurantDto, verificationToken: string): Promise<void>;
}
