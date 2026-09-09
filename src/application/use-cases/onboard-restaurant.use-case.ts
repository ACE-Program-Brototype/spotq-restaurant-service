import { inject, injectable } from "inversify";
import type { OnboardRestaurantDto } from "@/application/dtos/restaurant/restaurant-onboarding.dto.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port";
import type { IOnboardRestaurantUseCase } from "@/application/ports/use-cases/onboard-restaurant.use-case.port.ts";
import { TYPES } from "@/di/types";
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

		await this.restaurantRepository.update(restaurantId, {
			restaurantName: dto.restaurantName,
			phone: dto.phone,
			ownerName: dto.ownerName,
		});
	}
}
