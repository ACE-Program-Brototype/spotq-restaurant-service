import { inject, injectable } from "inversify";
import type { DeleteAddonInputDto } from "@/application/dtos/addon/delete-addon.dto.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import type { IDeleteAddonUseCase } from "@/application/ports/use-cases/delete-addon.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import { AddonNotFoundError } from "@/domain/errors/addon.errors.ts";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";
import type { IAddonRepository } from "@/domain/repositories/addon.repository.interface.ts";
import { messages } from "@/shared/constants/message.constants.ts";

/**
 * Use case to delete (soft delete) a menu item add-on from the restaurant catalog.
 *
 * Adheres strictly to Clean Architecture and SOLID principles:
 * - Validates restaurant existence.
 * - Enforces multi-tenant isolation by verifying that the add-on belongs to the given restaurant.
 * - Prevents operating on already-deleted add-ons (returning 404 NOT_FOUND).
 * - Enforces soft-delete on domain entity, preserving referential integrity and order histories.
 */
@injectable()
export class DeleteAddonUseCase implements IDeleteAddonUseCase {
	constructor(
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,
		@inject(TYPES.Repositories.AddonRepository)
		private readonly addonRepository: IAddonRepository,
	) { }

	public async execute(input: DeleteAddonInputDto): Promise<void> {
		const restaurant = await this.restaurantRepository.findById(
			input.restaurantId,
		);
		if (!restaurant) {
			throw new RestaurantNotFoundError(messages.RESTAURANT_NOT_FOUND);
		}

		const addon = await this.addonRepository.findById(input.addonId);
		if (
			!addon ||
			addon.restaurantId !== input.restaurantId ||
			addon.isDeleted
		) {
			throw new AddonNotFoundError(messages.ADDON_NOT_FOUND);
		}

		addon.softDelete();

		await this.addonRepository.updateAddon(addon);
	}
}
