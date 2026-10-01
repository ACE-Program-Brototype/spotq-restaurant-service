import type { MenuCategoryResponseDto } from "@/application/dtos/menu/create-menu-category.dto.ts";
import type { UpdateMenuCategoryStatusInputDto } from "@/application/dtos/menu/update-menu-category-status.dto.ts";
import type { IUseCase } from "@/application/ports/use-cases/use-case.port.ts";

export interface IUpdateMenuCategoryStatusUseCase
	extends IUseCase<
		UpdateMenuCategoryStatusInputDto,
		MenuCategoryResponseDto
	> {}
