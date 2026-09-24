import type { MenuCategoryResponseDto } from "@/application/dtos/menu/create-menu-category.dto.ts";

export interface IListMenuCategoriesUseCase {
	execute(restaurantId: string): Promise<MenuCategoryResponseDto[]>;
}
