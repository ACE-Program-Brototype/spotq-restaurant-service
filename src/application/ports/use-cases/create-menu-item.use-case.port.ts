import type {
	CreateMenuItemInputDto,
	MenuItemResponseDto,
} from "@/application/dtos/menu-item/create-menu-item.dto.ts";

export interface ICreateMenuItemUseCase {
	execute(dto: CreateMenuItemInputDto): Promise<MenuItemResponseDto>;
}
