import { inject, injectable } from "inversify";
import type {
	UnblockRestaurantDto,
	UnblockRestaurantResponseDto,
} from "@/application/dtos/admin/unblock-restaurant.dto.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import type { IUnblockRestaurantUseCase } from "@/application/ports/use-cases/admin/unblock-restaurant.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import {
	InvalidOnboardingStatusError,
	InvalidRestaurantStatusError,
	RestaurantNotBlockedError,
	RestaurantNotFoundError,
} from "@/domain/errors/restaurant.errors.ts";
import { logger } from "@/infrastructure/observability/logger.ts";
import { messages } from "@/shared/constants/message.constants.ts";

@injectable()
export class UnblockRestaurantUseCase implements IUnblockRestaurantUseCase {
	constructor(
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,
	) {}

	async execute(
		dto: UnblockRestaurantDto,
	): Promise<UnblockRestaurantResponseDto> {
		const restaurant = await this.restaurantRepository.findById(
			dto.restaurantId,
		);

		if (!restaurant) {
			throw new RestaurantNotFoundError();
		}

		if (restaurant.statusVO.isPending()) {
			throw new InvalidRestaurantStatusError(
				messages.CANNOT_MODIFY_PENDING_RESTAURANT,
			);
		}

		if (!restaurant.onboardingStatusVO.isCompleted()) {
			throw new InvalidOnboardingStatusError(
				messages.CANNOT_MODIFY_INCOMPLETE_ONBOARDING,
			);
		}

		if (!restaurant.isBlocked) {
			throw new RestaurantNotBlockedError();
		}

		restaurant.unblock();

		await this.restaurantRepository.update(restaurant.id, {
			isBlocked: restaurant.isBlocked,
			blockReason: restaurant.blockReason,
			status: restaurant.status,
		});

		const now = new Date();
		logger.info(
			{
				event: "restaurant.unblocked",
				restaurantId: restaurant.id,
				restaurantName: restaurant.restaurantName,
				adminId: dto.adminId ?? "unknown",
				timestamp: now.toISOString(),
			},
			`Restaurant ${restaurant.id} was unblocked by administrator ${dto.adminId ?? "unknown"}`,
		);

		return {
			id: restaurant.id,
			restaurantName: restaurant.restaurantName,
			status: restaurant.status,
			isBlocked: restaurant.isBlocked,
			blockReason: restaurant.blockReason,
			updatedAt: restaurant.updatedAt,
		};
	}
}
