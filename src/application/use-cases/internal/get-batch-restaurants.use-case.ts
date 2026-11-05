import { inject, injectable } from "inversify";
import type {
	GetBatchRestaurantsInputDto,
	RestaurantBatchItemDto,
} from "@/application/dtos/internal/get-batch-restaurants.dto.ts";
import type { IGetBatchRestaurantsUseCase } from "@/application/ports/use-cases/internal/get-batch-restaurants.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import type { IRestaurantRepository } from "@/domain/repositories/restaurant.repository.interface.ts";

@injectable()
export class GetBatchRestaurantsUseCase implements IGetBatchRestaurantsUseCase {
	constructor(
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,
	) {}

	async execute(
		input: GetBatchRestaurantsInputDto,
	): Promise<RestaurantBatchItemDto[]> {
		const uniqueIds = Array.from(
			new Set(input.restaurantIds.map((id) => id.trim())),
		).filter(Boolean);

		if (uniqueIds.length === 0) {
			return [];
		}

		const records = await this.restaurantRepository.findBatchByIds(uniqueIds);

		return records.map((record) => ({
			id: record.id,
			restaurantName: record.restaurantName,
			ownerName: record.ownerName,
			ownerEmail: record.ownerEmail,
			email: record.email,
			phone: record.phone,
			status: record.status,
			onboardingStatus: record.onboardingStatus,
			isBlocked: record.isBlocked,
			blockReason: record.blockReason,
			isSubscriptionActive: record.isSubscriptionActive,
			subscriptionPlanCode: record.subscriptionPlanCode,
			subscriptionEndsAt: record.subscriptionEndsAt
				? record.subscriptionEndsAt.toISOString()
				: null,
		}));
	}
}
