import { inject, injectable } from "inversify";
import type { DeleteMenuItemInputDto } from "@/application/dtos/menu-item/delete-menu-item.dto.ts";
import type { IMenuItemRepository } from "@/application/ports/repositories/menu-item.repository.port.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import type { IDeleteMenuItemUseCase } from "@/application/ports/use-cases/delete-menu-item.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import { MenuItemNotFoundError } from "@/domain/errors/menu-item.errors.ts";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";
import { messages } from "@/shared/constants/message.constants.ts";

/**
 * Use case to delete (soft delete) a menu item from the restaurant catalog.
 *
 * Adheres strictly to Clean Architecture and SOLID principles:
 * - Validates restaurant existence.
 * - Enforces multi-tenant isolation by verifying that the menu item belongs to the given restaurant.
 * - Prevents operating on already-deleted menu items (returning 404 NOT_FOUND).
 * - Enforces soft-delete on domain entity, preserving referential integrity and order histories.
 */
@injectable()
export class DeleteMenuItemUseCase implements IDeleteMenuItemUseCase {
	constructor(
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,
		@inject(TYPES.Repositories.MenuItemRepository)
		private readonly menuItemRepository: IMenuItemRepository,
	) {}

	public async execute(input: DeleteMenuItemInputDto): Promise<void> {
		const restaurant = await this.restaurantRepository.findById(
			input.restaurantId,
		);
		if (!restaurant) {
			throw new RestaurantNotFoundError(messages.RESTAURANT_NOT_FOUND);
		}

		const menuItem = await this.menuItemRepository.findById(input.menuItemId);
		if (
			!menuItem ||
			menuItem.restaurantId !== input.restaurantId ||
			menuItem.isDeleted
		) {
			throw new MenuItemNotFoundError(messages.MENU_ITEM_NOT_FOUND);
		}

		menuItem.softDelete();

		await this.menuItemRepository.updateMenuItem(menuItem);
	}
}
