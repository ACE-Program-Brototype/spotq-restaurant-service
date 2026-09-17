import { inject, injectable } from "inversify";
import type {
	GetRestaurantApplicationDetailsDto,
	RestaurantApplicationDetailsResponseDto,
} from "@/application/dtos/admin/get-restaurant-application-details.dto.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import type { IGetRestaurantApplicationDetailsUseCase } from "@/application/ports/use-cases/admin/get-restaurant-application-details.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";

@injectable()
export class GetRestaurantApplicationDetailsUseCase
	implements IGetRestaurantApplicationDetailsUseCase
{
	constructor(
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,
	) {}

	async execute(
		dto: GetRestaurantApplicationDetailsDto,
	): Promise<RestaurantApplicationDetailsResponseDto> {
		const details = await this.restaurantRepository.findByIdWithDetails(
			dto.restaurantId,
		);

		if (!details) {
			throw new RestaurantNotFoundError();
		}

		return details;
	}
}
