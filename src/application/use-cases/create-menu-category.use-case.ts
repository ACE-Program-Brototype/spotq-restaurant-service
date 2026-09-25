
import { inject, injectable } from "inversify";
import type {
	CreateMenuCategoryInputDto,
	MenuCategoryResponseDto,
} from "@/application/dtos/menu/create-menu-category.dto.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import type { ICreateMenuCategoryUseCase } from "@/application/ports/use-cases/create-menu-category.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import { MenuCategory } from "@/domain/entities/menu-category.entity.ts";
import { CategoryAlreadyExistsError } from "@/domain/errors/menu-category.errors.ts";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";
import type { IMenuCategoryRepository } from "@/domain/repositories/menu-category.repository.interface.ts";
import { messages } from "@/shared/constants/message.constants.ts";

@injectable()
export class CreateMenuCategoryUseCase implements ICreateMenuCategoryUseCase {
	constructor(
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,
		@inject(TYPES.Repositories.MenuCategoryRepository)
		private readonly menuCategoryRepository: IMenuCategoryRepository,
	) {}

	public async execute(
		input: CreateMenuCategoryInputDto,
	): Promise<MenuCategoryResponseDto> {
		const restaurant = await this.restaurantRepository.findById(
			input.restaurantId,
		);
		if (!restaurant) {
			throw new RestaurantNotFoundError(messages.RESTAURANT_NOT_FOUND);
		}

		const trimmedName = input.name.trim();
		const existingCategory =
			await this.menuCategoryRepository.findByNameAndRestaurantId(
				input.restaurantId,
				trimmedName,
			);
		if (existingCategory) {
			throw new CategoryAlreadyExistsError(messages.CATEGORY_ALREADY_EXISTS);
		}

		const displayOrder =
			input.displayOrder !== undefined && input.displayOrder !== null
				? input.displayOrder
				: await this.menuCategoryRepository.getNextDisplayOrder(
						input.restaurantId,
					);

		const entity = MenuCategory.create({
			restaurantId: input.restaurantId,
			name: trimmedName,
			description: input.description,
			displayOrder,
			isActive: true,
		});

		const created = await this.menuCategoryRepository.create(entity);

		return {
			id: created.id,
			restaurantId: created.restaurantId,
			name: created.name,
			description: created.description,
			displayOrder: created.displayOrder,
			isActive: created.isActive,
			createdAt: created.createdAt.toISOString(),
			updatedAt: created.updatedAt.toISOString(),
		};
	}
}
