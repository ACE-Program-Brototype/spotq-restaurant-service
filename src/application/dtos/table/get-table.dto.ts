import type {
	TableModeType,
	TableShapeType,
	TableStatusType,
} from "@domain/constants/table.constants";

export interface IGetTableInputDTO {
	restaurantId: string;
	userId: string;
	page: number;
	limit: number;
	mode: TableModeType;
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
