import { inject, injectable } from "inversify";
import type { OnboardRestaurantDto } from "@/application/dtos/restaurant/restaurant-onboarding.dto.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port";
import type { IOnboardRestaurantUseCase } from "@/application/ports/use-cases/onboard-restaurant.use-case.port.ts";
import { TYPES } from "@/config/di/types";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors";

@injectable()
export class OnboardRestaurantUseCase implements IOnboardRestaurantUseCase {
	constructor(
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,
	) {}

	async execute(
		dto: OnboardRestaurantDto,
		restaurantId: string,
	): Promise<void> {
		const restaurant = await this.restaurantRepository.findById(restaurantId);

		if (!restaurant) {
			throw new RestaurantNotFoundError();
		}

		restaurant.updateProfile(
			dto.restaurantName,
			dto.phone,
			dto.ownerName,
			restaurant.ownerEmail,
		);
		restaurant.completeOnboarding();

		await this.restaurantRepository.save(restaurant);
	}
}
