import { inject, injectable } from "inversify";
import type {
	AddonResponseDto,
	CreateAddonInputDto,
} from "@/application/dtos/addon/create-addon.dto.ts";
import type { IAddonRepository } from "@/application/ports/repositories/addon.repository.port.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import type { ICreateAddonUseCase } from "@/application/ports/use-cases/create-addon.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import { Addon } from "@/domain/entities/addon.entity.ts";
import { AddonAlreadyExistsError } from "@/domain/errors/addon.errors.ts";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";
import { messages } from "@/shared/constants/message.constants.ts";

@injectable()
export class CreateAddonUseCase implements ICreateAddonUseCase {
	constructor(
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,
		@inject(TYPES.Repositories.AddonRepository)
		private readonly addonRepository: IAddonRepository,
	) {}

	public async execute(input: CreateAddonInputDto): Promise<AddonResponseDto> {
		const restaurant = await this.restaurantRepository.findById(
			input.restaurantId,
		);
		if (!restaurant) {
			throw new RestaurantNotFoundError(messages.RESTAURANT_NOT_FOUND);
		}

		const trimmedName = input.name.trim();
		const existingAddon =
			await this.addonRepository.findByNameAndRestaurantId(
				trimmedName,
				input.restaurantId,
			);
		if (existingAddon) {
			throw new AddonAlreadyExistsError(messages.ADDON_ALREADY_EXISTS);
		}

		const entity = Addon.create({
			restaurantId: input.restaurantId,
			name: trimmedName,
			description: input.description,
			price: input.price,
			imageKey: input.imageKey,
			isAvailable: input.isAvailable,
		});

		const created = await this.addonRepository.create(entity);

		return {
			id: created.id,
			restaurantId: created.restaurantId,
			name: created.name,
			description: created.description,
			price: created.price,
			imageKey: created.imageKey,
			isAvailable: created.isAvailable,
			createdAt: created.createdAt.toISOString(),
			updatedAt: created.updatedAt.toISOString(),
		};
	}
}
