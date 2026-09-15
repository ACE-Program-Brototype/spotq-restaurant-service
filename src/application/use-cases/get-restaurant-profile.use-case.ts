import { inject, injectable } from "inversify";
import type { RestaurantProfileResponseDto } from "@/application/dtos/restaurant/restaurant-profile-response.dto.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import type { IGetRestaurantProfileUseCase } from "@/application/ports/use-cases/get-restaurant-profile.use-case.port.ts";
import { TYPES } from "@/config/di/types";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";

@injectable()
export class GetRestaurantProfileUseCase
	implements IGetRestaurantProfileUseCase
{
	constructor(
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,
	) {}

	async execute(restaurantId: string): Promise<RestaurantProfileResponseDto> {
		if (!this.restaurantRepository.getRestaurantProfileDetails) {
			throw new RestaurantNotFoundError();
		}

		const result =
			await this.restaurantRepository.getRestaurantProfileDetails(restaurantId);

		if (!result) {
			throw new RestaurantNotFoundError();
		}

		return result;
	}
}
