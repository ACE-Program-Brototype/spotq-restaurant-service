import type { TableStatusType } from "@domain/constants/table.constants";

export interface IUpdateTableStatusInputDTO {
	userId: string;
	restaurantId: string;
	tableId: string;
	status: Extract<TableStatusType, "AVAILABLE" | "MAINTENANCE">;
}

export interface IUpdateTableStatusOutputDTO {
	tableId: string;
	status: string;
	updatedAt: string;
}
