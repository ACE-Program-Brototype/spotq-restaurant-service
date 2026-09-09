import type { OnboardRestaurantDto } from "@/application/dto/restaurant-onboarding.dto";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port";
import type { IOnboardRestaurantUseCase } from "@/application/ports/use-case/onboard-restaurant.use-case.port";
import { TYPES } from "@/di/types";
import { inject, injectable } from "inversify";

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
			throw new Error("Restaurant not found");
		}

		await this.restaurantRepository.update(restaurantId, {
			restaurantName: dto.restaurantName,
			phone: dto.phone,
			ownerName: dto.ownerName,
		});
	}
}
