import { inject, injectable } from "inversify";
import type { RestaurantOwnerMenuItemDetailsResponseDto } from "@/application/dtos/menu-item/get-restaurant-owner-menu-item-details.dto.ts";
import type { UpdateMenuItemStatusInputDto } from "@/application/dtos/menu-item/update-menu-item-status.dto.ts";
import { MenuItemMapper } from "@/application/mappers/menu-item.mapper.ts";
import type { IMenuItemRepository } from "@/application/ports/repositories/menu-item.repository.port.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import type { IUpdateMenuItemStatusUseCase } from "@/application/ports/use-cases/update-menu-item-status.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import { MenuItemNotFoundError } from "@/domain/errors/menu-item.errors.ts";
import {
	RestaurantAccountBlockedError,
	RestaurantNotFoundError,
} from "@/domain/errors/restaurant.errors.ts";
import { messages } from "@/shared/constants/message.constants.ts";

/**
 * Use case to toggle / update the availability status of a menu item and its variants.
 *
 * Adheres strictly to Clean Architecture and SOLID principles:
 * - Validates restaurant existence and blocked status.
 * - Enforces multi-tenant isolation by verifying menu item ownership.
 * - Prevents modifying deleted items (returning 404 NOT_FOUND).
 * - Updates domain entity availability state.
 * - Persists availability update across menu item and all corresponding variants atomically.
 * - Returns the updated details response representation.
 */
@injectable()
export class UpdateMenuItemStatusUseCase
	implements IUpdateMenuItemStatusUseCase
{
	constructor(
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,
		@inject(TYPES.Repositories.MenuItemRepository)
		private readonly menuItemRepository: IMenuItemRepository,
	) {}

	public async execute(
		input: UpdateMenuItemStatusInputDto,
	): Promise<RestaurantOwnerMenuItemDetailsResponseDto> {
		const restaurant = await this.restaurantRepository.findById(
			input.restaurantId,
		);
		if (!restaurant) {
			throw new RestaurantNotFoundError(messages.RESTAURANT_NOT_FOUND);
		}

		if (restaurant.isBlocked) {
			throw new RestaurantAccountBlockedError(
				messages.RESTAURANT_ACCOUNT_BLOCKED,
			);
		}

		const menuItem = await this.menuItemRepository.findById(input.menuItemId);
		if (
			!menuItem ||
			menuItem.restaurantId !== input.restaurantId ||
			menuItem.isDeleted
		) {
			throw new MenuItemNotFoundError(messages.MENU_ITEM_NOT_FOUND);
		}

		menuItem.updateAvailability(input.isAvailable);

		await this.menuItemRepository.updateAvailability(menuItem);

		const updatedAggregate =
			await this.menuItemRepository.findByIdAndRestaurantId(
				input.menuItemId,
				input.restaurantId,
			);

		if (!updatedAggregate) {
			throw new MenuItemNotFoundError(messages.MENU_ITEM_NOT_FOUND);
		}

		return MenuItemMapper.toRestaurantOwnerDetailsResponseDto(updatedAggregate);
	}
}
