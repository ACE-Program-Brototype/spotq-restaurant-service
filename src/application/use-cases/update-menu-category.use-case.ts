import { inject, injectable } from "inversify";
import type { MenuCategoryResponseDto } from "@/application/dtos/menu/create-menu-category.dto.ts";
import type { UpdateMenuCategoryInputDto } from "@/application/dtos/menu/update-menu-category.dto.ts";
import { MenuCategoryMapper } from "@/application/mappers/menu-category.mapper.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import type { IUpdateMenuCategoryUseCase } from "@/application/ports/use-cases/update-menu-category.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import {
	CategoryAlreadyExistsError,
	CategoryNotFoundError,
} from "@/domain/errors/menu-category.errors.ts";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";
import type { IMenuCategoryRepository } from "@/domain/repositories/menu-category.repository.interface.ts";
import { messages } from "@/shared/constants/message.constants.ts";

@injectable()
export class UpdateMenuCategoryUseCase implements IUpdateMenuCategoryUseCase {
	constructor(
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,
		@inject(TYPES.Repositories.MenuCategoryRepository)
		private readonly menuCategoryRepository: IMenuCategoryRepository,
	) {}

	public async execute(
		input: UpdateMenuCategoryInputDto,
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
		if (!category || category.restaurantId !== input.restaurantId) {
			throw new CategoryNotFoundError(messages.CATEGORY_NOT_FOUND);
		}

		if (input.name !== undefined) {
			const trimmedName = input.name.trim();
			if (trimmedName.toLowerCase() !== category.name.toLowerCase()) {
				const existingCategory =
					await this.menuCategoryRepository.findByNameAndRestaurantId(
						input.restaurantId,
						trimmedName,
					);
				if (existingCategory && existingCategory.id !== category.id) {
					throw new CategoryAlreadyExistsError(
						messages.CATEGORY_ALREADY_EXISTS,
					);
				}
			}
		}

		const previousDisplayOrder = category.displayOrder;

		category.update({
			name: input.name,
			description: input.description,
			displayOrder: input.displayOrder,
			isActive: input.isActive,
		});

		const updated = await this.menuCategoryRepository.updateCategory(
			category,
			input.displayOrder !== undefined ? previousDisplayOrder : undefined,
		);

		return MenuCategoryMapper.toResponseDto(updated);
	}
}
