import type {
	GetMenuItemDetailsInputDto,
	MenuItemDetailsResponseDto,
} from "@/application/dtos/menu-item/get-menu-item-details.dto.ts";

export interface IGetMenuItemDetailsUseCase {
	execute(
		input: GetMenuItemDetailsInputDto,
	): Promise<MenuItemDetailsResponseDto>;
}
