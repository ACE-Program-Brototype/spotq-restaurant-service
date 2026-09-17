import { inject, injectable } from "inversify";
import type {
	ApproveRestaurantDto,
	ApproveRestaurantResponseDto,
} from "@/application/dtos/admin/approve-restaurant.dto.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import type { IApproveRestaurantUseCase } from "@/application/ports/use-cases/admin/approve-restaurant.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";
import { logger } from "@/infrastructure/observability/logger.ts";

@injectable()
export class ApproveRestaurantUseCase implements IApproveRestaurantUseCase {
	constructor(
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,
	) {}

	async execute(
		dto: ApproveRestaurantDto,
	): Promise<ApproveRestaurantResponseDto> {
		const restaurant = await this.restaurantRepository.findById(
			dto.restaurantId,
		);

		if (!restaurant) {
			throw new RestaurantNotFoundError();
		}

		restaurant.approve();

		await this.restaurantRepository.update(restaurant.id, {
			status: restaurant.status,
			rejectionReason: null,
		});

		const now = new Date();
		const adminId = dto.adminId ?? "unknown";

		logger.info(
			{
				event: "restaurant.approved",
				restaurantId: restaurant.id,
				restaurantName: restaurant.restaurantName,
				adminId,
				timestamp: now.toISOString(),
			},
			`Restaurant ${restaurant.id} was approved by administrator ${adminId}`,
		);

		return {
			id: restaurant.id,
			restaurantName: restaurant.restaurantName,
			status: restaurant.status,
			reviewedBy: adminId,
			reviewedAt: now,
		};
	}
}
