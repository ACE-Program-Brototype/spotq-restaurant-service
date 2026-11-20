import type { TableShapeType } from "@domain/constants/table.constants";

export interface IUpdateTableInputDto {
	tableCode?: string;
	capacity?: number;
	sectionId?: string;
	type?: TableShapeType;
	userId: string;
	restaurantId: string;
    tableId: string
}
