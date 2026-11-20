import type {
	CustomerMenuItemDetailsResponseDto,
	GetCustomerMenuItemDetailsInputDto,
} from "@/application/dtos/menu-item/get-customer-menu-item-details.dto.ts";
import type { IUseCase } from "@/application/ports/use-cases/use-case.port.ts";

export interface IGetCustomerMenuItemDetailsUseCase
	extends IUseCase<
		GetCustomerMenuItemDetailsInputDto,
		CustomerMenuItemDetailsResponseDto
	> {}
