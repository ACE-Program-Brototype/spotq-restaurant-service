import { inject, injectable } from "inversify";
import type { AddonResponseDto } from "@/application/dtos/addon/create-addon.dto.ts";
import { AddonMapper } from "@/application/mappers/addon.mapper.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import type { IListRestaurantAddonsUseCase } from "@/application/ports/use-cases/list-restaurant-addons.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";
import type { IAddonRepository } from "@/domain/repositories/addon.repository.interface.ts";
import { messages } from "@/shared/constants/message.constants.ts";

@injectable()
export class ListRestaurantAddonsUseCase
	implements IListRestaurantAddonsUseCase
{
	constructor(
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,
		@inject(TYPES.Repositories.AddonRepository)
		private readonly addonRepository: IAddonRepository,
	) {}

	public async execute(restaurantId: string): Promise<AddonResponseDto[]> {
		const restaurant = await this.restaurantRepository.findById(restaurantId);
		if (!restaurant) {
			throw new RestaurantNotFoundError(messages.RESTAURANT_NOT_FOUND);
		}

		const addons = await this.addonRepository.findByRestaurantId(restaurantId);

		return addons.map((addon) => AddonMapper.toResponseDto(addon));
	}
}
