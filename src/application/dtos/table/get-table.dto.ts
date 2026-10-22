import type {
	TableShapeType,
	TableStatusType,
} from "@domain/constants/table.constants";
import { TableStats } from "@domain/repositories/table.repository.interface";

export interface IGetTableInputDTO {
	restaurantId: string;
	userId: string;
	page: number;
	limit: number;
	sectionId?: string;
	status?: TableStatusType;
	minCapacity?: number;
}

export interface ITableDTO {
	id: string;
	tableCode: string;
	tableShape: TableShapeType;
	capacity: number;
	status: TableStatusType;
	currentOccupancy: number;
	sectionId: string;
}

export interface ITableWithSectionDTO extends ITableDTO {
	sectionName: string;
}

export interface IGetTablesOutputDTO {
	tables: ITableWithSectionDTO[];
	total: number;
	stats: TableStats;
}

export interface IGetTablesGroupedOutputDTO {
	sections: Record<string, ITableDTO[]>;
}
