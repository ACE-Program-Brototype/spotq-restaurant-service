import { inject, injectable } from "inversify";
import type {
	ListMenuItemsQueryDto,
	PaginatedMenuItemsResponseDto,
} from "@/application/dtos/menu-item/list-menu-items.dto.ts";
import { MenuItemMapper } from "@/application/mappers/menu-item.mapper.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import type { IListMenuItemsUseCase } from "@/application/ports/use-cases/list-menu-items.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import {
	DEFAULT_LIMIT,
	DEFAULT_PAGE,
	DEFAULT_SORT_BY,
	DEFAULT_SORT_ORDER,
	MAX_LIMIT,
} from "@/domain/constants/menu-item.constants.ts";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";
import type { IMenuItemRepository } from "@/domain/repositories/menu-item.repository.interface.ts";
import { messages } from "@/shared/constants/message.constants.ts";

@injectable()
export class ListMenuItemsUseCase implements IListMenuItemsUseCase {
	constructor(
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,
		@inject(TYPES.Repositories.MenuItemRepository)
		private readonly menuItemRepository: IMenuItemRepository,
	) {}

	public async execute(
		dto: ListMenuItemsQueryDto,
	): Promise<PaginatedMenuItemsResponseDto> {
		const restaurant = await this.restaurantRepository.findById(
			dto.restaurantId,
		);
		if (!restaurant) {
			throw new RestaurantNotFoundError(messages.RESTAURANT_NOT_FOUND);
		}

		const page = dto.page && dto.page > 0 ? dto.page : DEFAULT_PAGE;
		const rawLimit = dto.limit && dto.limit > 0 ? dto.limit : DEFAULT_LIMIT;
		const limit = Math.min(rawLimit, MAX_LIMIT);
		const sortBy = dto.sortBy || DEFAULT_SORT_BY;
		const sortOrder = dto.sortOrder || DEFAULT_SORT_ORDER;

		let isAvailable: boolean | undefined;
		if (typeof dto.status === "string") {
			const normalizedStatus = dto.status.trim().toUpperCase();
			if (normalizedStatus === "AVAILABLE") {
				isAvailable = true;
			} else if (normalizedStatus === "OUT_OF_STOCK") {
				isAvailable = false;
			}
		}

		const { items, total, stats } =
			await this.menuItemRepository.findManyWithFiltersAndStats({
				restaurantId: dto.restaurantId,
				categoryId: dto.categoryId,
				search: dto.search?.trim(),
				isAvailable,
				isVegetarian: dto.isVegetarian,
				isFeatured: dto.isFeatured,
				minPrice: dto.minPrice,
				maxPrice: dto.maxPrice,
				sortBy,
				sortOrder,
				page,
				limit,
			});

		return MenuItemMapper.toPaginatedResponse(items, total, stats, page, limit);
	}
}
