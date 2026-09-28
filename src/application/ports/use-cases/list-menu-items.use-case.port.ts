import type {
	ListMenuItemsQueryDto,
	PaginatedMenuItemsResponseDto,
} from "@/application/dtos/menu-item/list-menu-items.dto.ts";

export interface IListMenuItemsUseCase {
	execute(dto: ListMenuItemsQueryDto): Promise<PaginatedMenuItemsResponseDto>;
}
