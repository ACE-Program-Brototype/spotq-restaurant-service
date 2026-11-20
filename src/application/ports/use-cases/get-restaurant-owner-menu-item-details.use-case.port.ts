import type {
	GetRestaurantOwnerMenuItemDetailsInputDto,
	RestaurantOwnerMenuItemDetailsResponseDto,
} from "@/application/dtos/menu-item/get-restaurant-owner-menu-item-details.dto.ts";
import type { IUseCase } from "@/application/ports/use-cases/use-case.port.ts";

export interface IGetRestaurantOwnerMenuItemDetailsUseCase
	extends IUseCase<
		GetRestaurantOwnerMenuItemDetailsInputDto,
		RestaurantOwnerMenuItemDetailsResponseDto
	> {}
