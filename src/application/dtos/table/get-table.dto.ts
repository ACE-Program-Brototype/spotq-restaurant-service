import type {
	TableShapeType,
	TableStatusType,
} from "@domain/constants/table.constants";

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
}

export interface ITableWithSectionDTO extends ITableDTO {
	sectionId: string;
	sectionName: string;
}

export interface IGetTablesOutputDTO {
	tables: ITableWithSectionDTO[];
	total: number;
}

export interface IGetTablesGroupedOutputDTO {
	sections: Record<string, ITableDTO[]>;
}
