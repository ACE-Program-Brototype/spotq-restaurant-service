import type {
	GetInternalMenuItemDetailsInputDto,
	InternalMenuItemDetailsResponseDto,
} from "@/application/dtos/internal/get-internal-menu-item-details.dto.ts";

export interface IGetInternalMenuItemDetailsUseCase {
	execute(
		input: GetInternalMenuItemDetailsInputDto,
	): Promise<InternalMenuItemDetailsResponseDto>;
}
