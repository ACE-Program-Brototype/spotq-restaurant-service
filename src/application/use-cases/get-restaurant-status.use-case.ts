import type { RestaurantStatusOutput } from "@/application/dtos/restaurant-status.dto.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import type { IGetRestaurantStatusUseCase } from "@/application/ports/use-cases/get-restaurant-status.use-case.port.ts";
import { TYPES } from "@/di/types.ts";
import { inject, injectable } from "inversify";

@injectable()
export class GetRestaurantStatusUseCase implements IGetRestaurantStatusUseCase {
	constructor(
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,
	) {}

	async execute(restaurantId: string): Promise<RestaurantStatusOutput | null> {
		if (!restaurantId) return null;

		const restaurant = await this.restaurantRepository.findById(restaurantId);

		if (!restaurant) return null;

		let navigationTarget = "/restaurant/dashboard";

		if (restaurant.status === "PENDING") {
			navigationTarget = "/restaurant/onboarding";
		} else if (restaurant.status === "REJECTED") {
			navigationTarget = "/restaurant/rejected";
		} else if (
			restaurant.status === "APPROVED" &&
			!restaurant.isSubscriptionActive
		) {
			navigationTarget = "/restaurant/subscription";
		} else if (restaurant.isSubscriptionActive) {
			navigationTarget = "/restaurant/dashboard";
		}

		return {
			restaurantId: restaurant.id,
			restaurantName: restaurant.restaurantName,
			verificationStatus: restaurant.status,
			isSubscriptionActive: restaurant.isSubscriptionActive,
			subscriptionPlanCode: restaurant.subscriptionPlanCode,
			subscriptionEndsAt: restaurant.subscriptionEndsAt
				? restaurant.subscriptionEndsAt.toISOString()
				: null,
			navigationTarget,
		};
	}
}

