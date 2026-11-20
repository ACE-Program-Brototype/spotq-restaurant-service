import type {
	ListMenuCategoriesInputDto,
	ListMenuCategoriesResponseDto,
} from "@/application/dtos/menu/list-menu-categories.dto.ts";

export interface IListRestaurantMenuCategoriesUseCase {
	execute(
		input: ListMenuCategoriesInputDto,
	): Promise<ListMenuCategoriesResponseDto>;
}
