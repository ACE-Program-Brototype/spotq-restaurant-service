import type { Restaurant } from "@prisma/client";
import type { OnboardRestaurantDto } from "@/application/dto/restaurant-onboarding.dto";

export interface OnboardRestaurantResult {
	restaurant: Restaurant;
	accessToken: string;
	refreshToken: string;
}

export interface IOnboardRestaurantUseCase {
	execute(
		dto: OnboardRestaurantDto,
		verificationToken: string,
	): Promise<OnboardRestaurantResult>;
}
