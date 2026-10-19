import { inject, injectable } from "inversify";
import type { RestaurantValidationResultDto } from "@/application/dtos/internal/validate-restaurant.dto.ts";
import { RestaurantMapper } from "@/application/mappers/restaurant.mapper.ts";
import type { IValidateRestaurantEligibilityUseCase } from "@/application/ports/use-cases/validate-restaurant-eligibility.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";
import type { IRestaurantRepository } from "@/domain/repositories/restaurant.repository.interface.ts";
import { messages } from "@/shared/constants/message.constants.ts";

@injectable()
export class ValidateRestaurantEligibilityUseCase
	implements IValidateRestaurantEligibilityUseCase
{
	constructor(
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,
	) {}

	async execute(restaurantId: string): Promise<RestaurantValidationResultDto> {
		const record = await this.restaurantRepository.findValidationDetailsById(
			restaurantId.trim(),
		);

		if (!record) {
			throw new RestaurantNotFoundError(messages.RESTAURANT_NOT_FOUND);
		}

		const { restaurant, acceptsQueue } = record;
		const now = new Date();

		return RestaurantMapper.toValidationResultDTO(
			restaurant,
			acceptsQueue,
			now,
		);
	}
}
