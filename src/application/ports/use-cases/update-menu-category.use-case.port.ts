import type { MenuCategoryResponseDto } from "@/application/dtos/menu/create-menu-category.dto.ts";
import type { UpdateMenuCategoryInputDto } from "@/application/dtos/menu/update-menu-category.dto.ts";

export interface IUpdateMenuCategoryUseCase {
	execute(input: UpdateMenuCategoryInputDto): Promise<MenuCategoryResponseDto>;
}
