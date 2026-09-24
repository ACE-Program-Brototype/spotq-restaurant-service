import { inject, injectable } from "inversify";
import type { AddonResponseDto } from "@/application/dtos/addon/create-addon.dto.ts";
import type { IAddonRepository } from "@/application/ports/repositories/addon.repository.port.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import type { IListRestaurantAddonsUseCase } from "@/application/ports/use-cases/list-restaurant-addons.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";
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

		return addons.map((addon) => ({
			id: addon.id,
			restaurantId: addon.restaurantId,
			name: addon.name,
			description: addon.description,
			price: addon.price,
			imageKey: addon.imageKey,
			isAvailable: addon.isAvailable,
			createdAt: addon.createdAt.toISOString(),
			updatedAt: addon.updatedAt.toISOString(),
		}));
	}
}
