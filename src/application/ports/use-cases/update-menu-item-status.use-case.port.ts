import type { RestaurantOwnerMenuItemDetailsResponseDto } from "@/application/dtos/menu-item/get-restaurant-owner-menu-item-details.dto.ts";
import type { UpdateMenuItemStatusInputDto } from "@/application/dtos/menu-item/update-menu-item-status.dto.ts";

export interface IUpdateMenuItemStatusUseCase {
	execute(
		input: UpdateMenuItemStatusInputDto,
	): Promise<RestaurantOwnerMenuItemDetailsResponseDto>;
}
