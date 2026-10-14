import type {
	UpdateMenuItemVariantStatusInputDto,
	UpdateMenuItemVariantStatusOutputDto,
} from "@application/dtos/menu-item/menu-item-variant.dto";
import type { IUpdateMenuItemVariantStatusUseCase } from "@application/ports/use-cases/menu-item/update-menu-item-variant-status.use-case.port";
import { TYPES } from "@config/di/types";
import {
	MenuItemNotFoundError,
	MenuItemVariantNotFoundError,
} from "@domain/errors/menu-item.errors";
import type { IMenuItemRepository } from "@domain/repositories/menu-item.repository.interface";
import { messages } from "@shared/constants/message.constants";
import { inject, injectable } from "inversify";

@injectable()
export class UpdateMenuItemVariantStatusUseCase
	implements IUpdateMenuItemVariantStatusUseCase
{
	constructor(
		@inject(TYPES.Repositories.MenuItemRepository)
		private readonly menuItemRepository: IMenuItemRepository,
	) {}

	async execute(
		input: UpdateMenuItemVariantStatusInputDto,
	): Promise<UpdateMenuItemVariantStatusOutputDto> {
		const menuItem = await this.menuItemRepository.findByIdAndRestaurantId(
			input.menuItemId,
			input.restaurantId,
		);
		if (!menuItem) {
			throw new MenuItemNotFoundError(messages.MENU_ITEM_NOT_FOUND);
		}

		const variant = menuItem.variants.find((v) => v.id === input.id);
		if (!variant) {
			throw new MenuItemVariantNotFoundError(
				messages.MENU_ITEM_VARIANT_NOT_FOUND,
			);
		}

		const result = await this.menuItemRepository.updateVariantAvailability(
			input.id,
			input.menuItemId,
			input.restaurantId,
			!variant.isAvailable,
		);

		return result;
	}
}
