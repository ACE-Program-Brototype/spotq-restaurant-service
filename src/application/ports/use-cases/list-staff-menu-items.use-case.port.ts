import type {
	ListStaffMenuItemsQueryDto,
	StaffMenuItemsResponseDto,
} from "@/application/dtos/menu-item/list-staff-menu-items.dto.ts";

export interface IListStaffMenuItemsUseCase {
	execute(dto: ListStaffMenuItemsQueryDto): Promise<StaffMenuItemsResponseDto>;
}
