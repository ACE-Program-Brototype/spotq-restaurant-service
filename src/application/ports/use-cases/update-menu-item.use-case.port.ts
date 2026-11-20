import type { MenuItemResponseDto } from "@/application/dtos/menu-item/create-menu-item.dto.ts";
import type { UpdateMenuItemInputDto } from "@/application/dtos/menu-item/update-menu-item.dto.ts";

export interface IUpdateMenuItemUseCase {
	execute(input: UpdateMenuItemInputDto): Promise<MenuItemResponseDto>;
}
