import type { TableShapeType } from "@domain/constants/table.constants";

export interface ICreateTableInputDTO {
	tableNumber: string;
	restaurantId: string;
	userId: string;
	sectionId: string;
	capacity: number;
	tableType: TableShapeType;
}

export interface ICreateTableOutputDTO {
	id: string;
	restaurantId: string;
	tableNumber: string;
	capacity: number;
	sectionId: string;
	type: TableShapeType;
	isActive: boolean;
	createdAt: string;
}
