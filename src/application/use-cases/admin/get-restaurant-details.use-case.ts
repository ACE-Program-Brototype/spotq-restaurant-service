import { inject, injectable } from "inversify";
import type { RestaurantDetailsResponseDto } from "@/application/dtos/admin/restaurant-details.dto.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import type { IGetRestaurantDetailsUseCase } from "@/application/ports/use-cases/admin/get-restaurant-details.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";

@injectable()
export class GetRestaurantDetailsUseCase
	implements IGetRestaurantDetailsUseCase
{
	constructor(
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,
	) {}

	async execute(restaurantId: string): Promise<RestaurantDetailsResponseDto> {
		const details =
			await this.restaurantRepository.findCompletedDetailsById(restaurantId);

		if (!details) {
			throw new RestaurantNotFoundError();
		}

		return details;
	}
}
