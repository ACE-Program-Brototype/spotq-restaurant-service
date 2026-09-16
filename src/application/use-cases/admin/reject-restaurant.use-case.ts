import { inject, injectable } from "inversify";
import type {
	RejectRestaurantDto,
	RejectRestaurantResponseDto,
} from "@/application/dtos/admin/reject-restaurant.dto.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import type { IRejectRestaurantUseCase } from "@/application/ports/use-cases/admin/reject-restaurant.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";
import { logger } from "@/infrastructure/observability/logger.ts";

@injectable()
export class RejectRestaurantUseCase implements IRejectRestaurantUseCase {
	constructor(
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,
	) {}

	async execute(dto: RejectRestaurantDto): Promise<RejectRestaurantResponseDto> {
		const restaurant = await this.restaurantRepository.findById(
			dto.restaurantId,
		);

		if (!restaurant) {
			throw new RestaurantNotFoundError();
		}

		restaurant.reject(dto.reason);

		await this.restaurantRepository.update(restaurant.id, {
			status: restaurant.status,
			rejectionReason: restaurant.rejectionReason,
		});

		const now = new Date();
		const adminId = dto.adminId ?? "unknown";

		logger.info(
			{
				event: "restaurant.rejected",
				restaurantId: restaurant.id,
				restaurantName: restaurant.restaurantName,
				adminId,
				reason: dto.reason,
				timestamp: now.toISOString(),
			},
			`Restaurant ${restaurant.id} was rejected by administrator ${adminId}`,
		);

		return {
			id: restaurant.id,
			restaurantName: restaurant.restaurantName,
			status: restaurant.status,
			rejectionReason: dto.reason.trim(),
			reviewedBy: adminId,
			reviewedAt: now,
		};
	}
}
