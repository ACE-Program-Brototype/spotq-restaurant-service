import { inject, injectable } from "inversify";
import type {
	RestaurantVerificationStatusResponseDto,
	VerificationStatus,
} from "@/application/dtos/restaurant/restaurant-verification-status.dto.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import type { IGetRestaurantVerificationStatusUseCase } from "@/application/ports/use-cases/get-verification-status.use-case.port.ts";
import { TYPES } from "@/config/di/types";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";

@injectable()
export class GetRestaurantVerificationStatusUseCase
	implements IGetRestaurantVerificationStatusUseCase
{
	constructor(
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,
	) {}

	async execute(
		restaurantId: string,
	): Promise<RestaurantVerificationStatusResponseDto> {
		const restaurant = await this.restaurantRepository.findById(restaurantId);

		if (!restaurant) {
			throw new RestaurantNotFoundError();
		}

		let status: VerificationStatus;
		let rejectionReason: string | undefined;

		if (restaurant.status === "APPROVED" || restaurant.status === "ACTIVE") {
			status = "VERIFIED";
		} else if (restaurant.status === "REJECTED" || restaurant.isBlocked) {
			status = "REJECTED";
			rejectionReason =
				restaurant.blockReason || "Registration request was rejected.";
		} else if (restaurant.onboardingStatus === "COMPLETED") {
			status = "UNDER_REVIEW";
		} else {
			status = "SUBMITTED";
		}

		return {
			status,
			rejectionReason,
			submittedAt: restaurant.createdAt.toISOString(),
			updatedAt: restaurant.updatedAt.toISOString(),
		};
	}
}
