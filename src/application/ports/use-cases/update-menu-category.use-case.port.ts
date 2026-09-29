import type { MenuCategoryResponseDto } from "@/application/dtos/menu/create-menu-category.dto.ts";
import type { UpdateMenuCategoryInputDto } from "@/application/dtos/menu/update-menu-category.dto.ts";
import type { IUseCase } from "@/application/ports/use-cases/use-case.port.ts";

export interface IUpdateMenuCategoryUseCase
	extends IUseCase<UpdateMenuCategoryInputDto, MenuCategoryResponseDto> {}
