import type {
	CreateMenuCategoryInputDto,
	MenuCategoryResponseDto,
} from "@/application/dtos/menu/create-menu-category.dto.ts";
import type { IUseCase } from "./use-case.port.ts";

export interface ICreateMenuCategoryUseCase
	extends IUseCase<CreateMenuCategoryInputDto, MenuCategoryResponseDto> {}
