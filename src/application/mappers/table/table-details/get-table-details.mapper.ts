import type { Table } from "@domain/entities/table.entity";

export const GetTableDetailsMapper = {
	toResponseDTO(table: Table, sectionName: string) {
		return {
			tableId: table.id,
			restaurantId: table.restaurantId,
			sectionId: table.sectionId,
			sectionName,
			tableCode: table.tableCode,
			capacity: table.capacity,
			shape: table.tableShape,
			currentOccupancy: table.currentOccupancy,
			status: table.status,
			createdAt: table.createdAt.toISOString(),
		};
	},
};
