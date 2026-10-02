import { inject, injectable } from "inversify";
import type {
	ListStaffMenuItemsQueryDto,
	StaffMenuItemsResponseDto,
} from "@/application/dtos/menu-item/list-staff-menu-items.dto.ts";
import { MenuItemMapper } from "@/application/mappers/menu-item.mapper.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import type { IListStaffMenuItemsUseCase } from "@/application/ports/use-cases/list-staff-menu-items.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import {
	RestaurantAccountBlockedError,
	RestaurantNotFoundError,
} from "@/domain/errors/restaurant.errors.ts";
import type { IMenuItemRepository } from "@/domain/repositories/menu-item.repository.interface.ts";
import { messages } from "@/shared/constants/message.constants.ts";

const MANAGER_ADMIN_ROLES = new Set([
	"manager",
	"admin",
	"restaurant_admin",
	"restaurant_owner",
	"owner",
	"restaurant",
]);

@injectable()
export class ListStaffMenuItemsUseCase implements IListStaffMenuItemsUseCase {
	constructor(
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,
		@inject(TYPES.Repositories.MenuItemRepository)
		private readonly menuItemRepository: IMenuItemRepository,
	) {}

	public async execute(
		dto: ListStaffMenuItemsQueryDto,
	): Promise<StaffMenuItemsResponseDto> {
		const restaurant = await this.restaurantRepository.findById(
			dto.restaurantId,
		);
		if (!restaurant) {
			throw new RestaurantNotFoundError(messages.RESTAURANT_NOT_FOUND);
		}

		if (restaurant.isBlocked) {
			throw new RestaurantAccountBlockedError(
				messages.RESTAURANT_ACCOUNT_BLOCKED,
			);
		}

		const page = dto.page && dto.page > 0 ? dto.page : 1;
		const rawLimit = dto.limit && dto.limit > 0 ? dto.limit : 50;
		const limit = Math.min(rawLimit, 100);

		let includeInactive = false;
		if (dto.includeInactive === true) {
			const normalizedRole = dto.userRole?.toLowerCase().trim() || "";
			if (MANAGER_ADMIN_ROLES.has(normalizedRole)) {
				includeInactive = true;
			}
		}

		const includeVariants = dto.includeVariants !== false;

		const { items, total } =
			await this.menuItemRepository.findManyStaffMenuItems({
				restaurantId: dto.restaurantId,
				categoryId: dto.categoryId,
				isAvailable: dto.isAvailable,
				includeInactive,
				includeVariants,
				search: dto.search?.trim(),
				sortBy: dto.sortBy,
				sortOrder: dto.sortOrder,
				page,
				limit,
			});

		return MenuItemMapper.toStaffMenuItemsResponse(
			dto.restaurantId,
			items,
			total,
			page,
			limit,
		);
	}
}
