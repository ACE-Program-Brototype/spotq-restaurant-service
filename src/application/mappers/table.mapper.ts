import type {
	ITableDTO,
	ITableWithSectionDTO,
} from "@application/dtos/table/get-table.dto";
import type { Table } from "@domain/entities/table.entity";
import type { TableWithSection } from "@domain/repositories/table.repository.interface";

export const TableMapper = {
	toDTO(table: Table): ITableDTO {
		return {
			id: table.id,
			tableCode: table.tableCode,
			capacity: table.capacity,
			status: table.status,
			sectionId: table.sectionId,
			tableShape: table.tableShape,
			currentOccupancy: table.currentOccupancy,
		};
	},

	toWithSectionDTO(record: TableWithSection): ITableWithSectionDTO {
		return {
			...TableMapper.toDTO(record.table),
			sectionName: record.sectionName,
		};
	},
};
