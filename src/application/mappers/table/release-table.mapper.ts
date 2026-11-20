import type { ReleaseTableResponseDTO } from "@application/dtos/table/release-table.dto";
import type { Table } from "@domain/entities/table.entity";

export const ReleaseTableMapper = {
	toResponseDTO(tables: Table[]): ReleaseTableResponseDTO {
		return {
			releasedTables: tables.map((table) => ({
				tableId: table.id,
				tableCode: table.tableCode,
				status: table.status,
				currentOccupancy: table.currentOccupancy,
				capacity: table.capacity,
			})),
		};
	},
};
