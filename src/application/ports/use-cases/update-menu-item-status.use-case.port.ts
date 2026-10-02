import type { MenuItemDetailsResponseDto } from "@/application/dtos/menu-item/get-menu-item-details.dto.ts";
import type { UpdateMenuItemStatusInputDto } from "@/application/dtos/menu-item/update-menu-item-status.dto.ts";

export interface IUpdateMenuItemStatusUseCase {
	execute(
		input: UpdateMenuItemStatusInputDto,
	): Promise<MenuItemDetailsResponseDto>;
}
