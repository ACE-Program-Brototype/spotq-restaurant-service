import { inject, injectable } from "inversify";
import type { MenuCategoryResponseDto } from "@/application/dtos/menu/create-menu-category.dto.ts";
import type { UpdateMenuCategoryStatusInputDto } from "@/application/dtos/menu/update-menu-category-status.dto.ts";
import { MenuCategoryMapper } from "@/application/mappers/menu-category.mapper.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import type { IUpdateMenuCategoryStatusUseCase } from "@/application/ports/use-cases/update-menu-category-status.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import { CategoryNotFoundError } from "@/domain/errors/menu-category.errors.ts";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";
import type { IMenuCategoryRepository } from "@/domain/repositories/menu-category.repository.interface.ts";
import { messages } from "@/shared/constants/message.constants.ts";

@injectable()
export class UpdateMenuCategoryStatusUseCase
	implements IUpdateMenuCategoryStatusUseCase
{
	constructor(
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,
		@inject(TYPES.Repositories.MenuCategoryRepository)
		private readonly menuCategoryRepository: IMenuCategoryRepository,
	) {}

	public async execute(
		input: UpdateMenuCategoryStatusInputDto,
	): Promise<MenuCategoryResponseDto> {
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

		if (category.isActive === input.isActive) {
			return MenuCategoryMapper.toResponseDto(category);
		}

		category.updateStatus(input.isActive);

		const updated = await this.menuCategoryRepository.updateCategory(category);

		return MenuCategoryMapper.toResponseDto(updated);
	}
}
