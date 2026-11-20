import type { TableStatusType } from "@domain/constants/table.constants";

export interface IReleaseTableInputDTO {
	tables: { tableId: string; occupancyToRelease: number }[];
	restaurantId: string;
}

export interface IReleaseTableOutputDTO {
	releasedTables: {
		tableId: string;
		status: TableStatusType;
		currentOccupancy: number;
	}[];
}
