import type { TableStatusType } from "@domain/constants/table.constants";

export interface ReleaseTableItemDTO {
	tableId: string;
	occupancyToRelease: number;
}

export interface ReleaseTableInputDTO {
	restaurantId: string;
	userId: string;
	tables: ReleaseTableItemDTO[];
}

export interface ReleasedTableItemDTO {
	tableId: string;
	tableCode: string;
	status: TableStatusType;
	currentOccupancy: number;
	capacity: number;
}

export interface ReleaseTableResponseDTO {
	releasedTables: ReleasedTableItemDTO[];
}

export type ReleaseTableDTO = ReleaseTableResponseDTO;
