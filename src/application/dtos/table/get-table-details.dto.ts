import type {
	TableShapeType,
	TableStatusType,
} from "@domain/constants/table.constants";

export interface GetTableDetailsInputDTO {
	tableId: string;
	restaurantId: string;
	userId: string;
}

export interface GetTableDetailsOutputDTO {
	tableId: string;
	restaurantId: string;
	sectionId: string;
	sectionName: string;
	tableCode: string;
	capacity: number;
	shape: TableShapeType;
	currentOccupancy: number;
	status: TableStatusType;
	createdAt: string;
}
