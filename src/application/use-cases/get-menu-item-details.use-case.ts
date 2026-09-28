import { inject, injectable } from "inversify";
import type {
	GetMenuItemDetailsInputDto,
	MenuItemDetailsResponseDto,
} from "@/application/dtos/menu-item/get-menu-item-details.dto.ts";
import { MenuItemMapper } from "@/application/mappers/menu-item.mapper.ts";
import type { IMenuItemRepository } from "@/application/ports/repositories/menu-item.repository.port.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import type { IGetMenuItemDetailsUseCase } from "@/application/ports/use-cases/get-menu-item-details.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import { MenuItemNotFoundError } from "@/domain/errors/menu-item.errors.ts";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";
import { messages } from "@/shared/constants/message.constants.ts";

@injectable()
export class GetMenuItemDetailsUseCase implements IGetMenuItemDetailsUseCase {
	constructor(
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,
		@inject(TYPES.Repositories.MenuItemRepository)
		private readonly menuItemRepository: IMenuItemRepository,
	) {}

	public async execute(
		input: GetMenuItemDetailsInputDto,
	): Promise<MenuItemDetailsResponseDto> {
		const restaurant = await this.restaurantRepository.findById(
			input.restaurantId,
		);
		if (!restaurant) {
			throw new RestaurantNotFoundError(messages.RESTAURANT_NOT_FOUND);
		}

		const aggregate = await this.menuItemRepository.findByIdAndRestaurantId(
			input.menuItemId,
			input.restaurantId,
		);
		if (!aggregate) {
			throw new MenuItemNotFoundError(messages.MENU_ITEM_NOT_FOUND);
		}

		return MenuItemMapper.toDetailsResponseDto(aggregate);
	}
}
