import type { RestaurantStatusOutput } from "@/application/dtos/restaurant-status.dto.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import type { IGetRestaurantStatusUseCase } from "@/application/ports/use-cases/get-restaurant-status.use-case.port.ts";
import { TYPES } from "@/di/types.ts";
import { RESTAURANT_STATUS } from "@/domain/enums/restaurant-status.enum.ts";
import { RESTAURANT_NAVIGATION_TARGETS } from "@/shared/constants/navigation.constants.ts";
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

		let navigationTarget: string = RESTAURANT_NAVIGATION_TARGETS.DASHBOARD;

		if (restaurant.status === RESTAURANT_STATUS.PENDING) {
			navigationTarget = RESTAURANT_NAVIGATION_TARGETS.ONBOARDING;
		} else if (restaurant.status === RESTAURANT_STATUS.REJECTED) {
			navigationTarget = RESTAURANT_NAVIGATION_TARGETS.REJECTED;
		} else if (
			restaurant.status === RESTAURANT_STATUS.APPROVED &&
			!restaurant.isSubscriptionActive
		) {
			navigationTarget = RESTAURANT_NAVIGATION_TARGETS.SUBSCRIPTION;
		} else if (
			restaurant.status === RESTAURANT_STATUS.ACTIVE ||
			restaurant.isSubscriptionActive
		) {
			navigationTarget = RESTAURANT_NAVIGATION_TARGETS.DASHBOARD;
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

