import type { DeleteMenuCategoryInputDto } from "@/application/dtos/menu/delete-menu-category.dto.ts";

export interface IDeleteMenuCategoryUseCase {
	execute(input: DeleteMenuCategoryInputDto): Promise<void>;
}
