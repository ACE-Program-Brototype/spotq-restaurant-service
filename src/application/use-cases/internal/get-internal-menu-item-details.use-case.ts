import { inject, injectable } from "inversify";
import type {
	GetInternalMenuItemDetailsInputDto,
	InternalMenuItemDetailsResponseDto,
} from "@/application/dtos/internal/get-internal-menu-item-details.dto.ts";
import { MenuItemMapper } from "@/application/mappers/menu-item.mapper.ts";
import type { IMenuItemRepository } from "@/application/ports/repositories/menu-item.repository.port.ts";
import type { IGetInternalMenuItemDetailsUseCase } from "@/application/ports/use-cases/get-internal-menu-item-details.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import { MenuItemNotFoundError } from "@/domain/errors/menu-item.errors.ts";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";
import type { IRestaurantRepository } from "@/domain/repositories/restaurant.repository.interface.ts";
import { messages } from "@/shared/constants/message.constants.ts";

@injectable()
export class GetInternalMenuItemDetailsUseCase
	implements IGetInternalMenuItemDetailsUseCase
{
	constructor(
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,
		@inject(TYPES.Repositories.MenuItemRepository)
		private readonly menuItemRepository: IMenuItemRepository,
	) {}

	public async execute(
		input: GetInternalMenuItemDetailsInputDto,
	): Promise<InternalMenuItemDetailsResponseDto> {
		const restaurant = await this.restaurantRepository.findById(
			input.restaurantId,
		);
		if (
			!restaurant ||
			restaurant.isBlocked ||
			!restaurant.statusVO.isActive() ||
			!restaurant.isSubscriptionActive
		) {
			throw new RestaurantNotFoundError(messages.RESTAURANT_NOT_FOUND);
		}

		const aggregate = await this.menuItemRepository.findByIdAndRestaurantId(
			input.menuItemId,
			input.restaurantId,
		);
		if (!aggregate || (aggregate.category && !aggregate.category.isActive)) {
			throw new MenuItemNotFoundError(messages.MENU_ITEM_NOT_FOUND);
		}

		return MenuItemMapper.toInternalDetailsResponseDto(aggregate);
	}
}
