import { inject, injectable } from "inversify";
import type { RestaurantProfileResponseDto } from "@/application/dtos/restaurant/restaurant-profile-response.dto";
import type { UpdateRestaurantProfileDto } from "@/application/dtos/restaurant/update-restaurant-profile.dto";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port";
import type { IUpdateRestaurantProfileUseCase } from "@/application/ports/use-cases/update-restaurant-profile.use-case.port";
import { TYPES } from "@/config/di/types";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";

@injectable()
export class UpdateRestaurantProfileUseCase
	implements IUpdateRestaurantProfileUseCase
{
	constructor(
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,
	) {}

	async execute(
		restaurantId: string,
		dto: UpdateRestaurantProfileDto,
	): Promise<RestaurantProfileResponseDto> {
		const restaurant = await this.restaurantRepository.findById(restaurantId);
		if (!restaurant) {
			throw new RestaurantNotFoundError();
		}

		return await this.restaurantRepository.updateProfileDetails(
			restaurantId,
			dto,
		);
	}
}
