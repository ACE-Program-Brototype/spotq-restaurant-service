import type { OnboardRestaurantDto } from "@/application/dto/restaurant-onboarding.dto";

export interface IOnboardRestaurantUseCase {
	execute(dto: OnboardRestaurantDto, verificationToken: string): Promise<void>;
}
