import { inject, injectable } from "inversify";
import type {
	ListMenuCategoriesInputDto,
	ListMenuCategoriesResponseDto,
} from "@/application/dtos/menu/list-menu-categories.dto.ts";
import type { IMenuCategoryRepositoryPort } from "@/application/ports/repositories/menu-category.repository.port.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import type { IListRestaurantMenuCategoriesUseCase } from "@/application/ports/use-cases/list-restaurant-menu-categories.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";
import { messages } from "@/shared/constants/message.constants.ts";

@injectable()
export class ListRestaurantMenuCategoriesUseCase
	implements IListRestaurantMenuCategoriesUseCase
{
	constructor(
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,
		@inject(TYPES.Repositories.MenuCategoryRepository)
		private readonly menuCategoryRepository: IMenuCategoryRepositoryPort,
	) {}

	public async execute(
		input: ListMenuCategoriesInputDto,
	): Promise<ListMenuCategoriesResponseDto> {
		const restaurant = await this.restaurantRepository.findById(
			input.restaurantId,
		);
		if (!restaurant) {
			throw new RestaurantNotFoundError(messages.RESTAURANT_NOT_FOUND);
		}

		const categories = await this.menuCategoryRepository.findByRestaurantId(
			input.restaurantId,
		);

		return {
			restaurantId: input.restaurantId,
			categories: categories.map((category) => ({
				id: category.id,
				name: category.name,
				description: category.description,
				isActive: category.isActive,
				displayOrder: category.displayOrder,
			})),
		};
	}
}
