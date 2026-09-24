import { inject, injectable } from "inversify";
import type { MenuCategoryResponseDto } from "@/application/dtos/menu/create-menu-category.dto.ts";
import type { IMenuCategoryRepositoryPort } from "@/application/ports/repositories/menu-category.repository.port.ts";
import type { IListMenuCategoriesUseCase } from "@/application/ports/use-cases/list-menu-categories.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";

@injectable()
export class ListMenuCategoriesUseCase implements IListMenuCategoriesUseCase {
	constructor(
		@inject(TYPES.Repositories.MenuCategoryRepository)
		private readonly menuCategoryRepository: IMenuCategoryRepositoryPort,
	) {}

	public async execute(restaurantId: string): Promise<MenuCategoryResponseDto[]> {
		const categories =
			await this.menuCategoryRepository.findByRestaurantId(restaurantId);

		return categories.map((cat) => ({
			id: cat.id,
			restaurantId: cat.restaurantId,
			name: cat.name,
			description: cat.description,
			displayOrder: cat.displayOrder,
			isActive: cat.isActive,
			createdAt: cat.createdAt.toISOString(),
			updatedAt: cat.updatedAt.toISOString(),
		}));
	}
}
