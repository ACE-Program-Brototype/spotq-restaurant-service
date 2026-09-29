import { inject, injectable } from "inversify";
import type { DeleteMenuCategoryInputDto } from "@/application/dtos/menu/delete-menu-category.dto.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import type { IDeleteMenuCategoryUseCase } from "@/application/ports/use-cases/delete-menu-category.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import {
	CategoryHasMenuItemsError,
	CategoryNotFoundError,
} from "@/domain/errors/menu-category.errors.ts";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";
import type { IMenuCategoryRepository } from "@/domain/repositories/menu-category.repository.interface.ts";
import { messages } from "@/shared/constants/message.constants.ts";

/**
 * Use case to delete (soft delete) an existing menu category for a restaurant.
 *
 * Adheres strictly to Clean Architecture and SOLID principles:
 * - Verifies existence of the target restaurant.
 * - Enforces multi-tenant data isolation by validating category ownership.
 * - Prevents operating on already soft-deleted categories (returns 404 NOT_FOUND).
 * - Enforces business safeguard: blocks deletion and throws 409 Conflict if category has menu items.
 * - Executes soft-delete on the domain entity, maintaining referential integrity.
 */
@injectable()
export class DeleteMenuCategoryUseCase implements IDeleteMenuCategoryUseCase {
	constructor(
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,
		@inject(TYPES.Repositories.MenuCategoryRepository)
		private readonly menuCategoryRepository: IMenuCategoryRepository,
	) {}

	public async execute(input: DeleteMenuCategoryInputDto): Promise<void> {
		const restaurant = await this.restaurantRepository.findById(
			input.restaurantId,
		);
		if (!restaurant) {
			throw new RestaurantNotFoundError(messages.RESTAURANT_NOT_FOUND);
		}

		const category = await this.menuCategoryRepository.findById(
			input.categoryId,
		);
		if (
			!category ||
			category.restaurantId !== input.restaurantId ||
			category.isDeleted
		) {
			throw new CategoryNotFoundError(messages.CATEGORY_NOT_FOUND);
		}

		const hasMenuItems = await this.menuCategoryRepository.hasMenuItems(
			input.categoryId,
		);
		if (hasMenuItems) {
			throw new CategoryHasMenuItemsError(messages.CATEGORY_HAS_MENU_ITEMS);
		}

		category.softDelete();

		await this.menuCategoryRepository.updateCategory(category);
	}
}
