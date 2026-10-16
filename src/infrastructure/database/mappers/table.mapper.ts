import { Table } from "@domain/entities/table.entity";
import type { Table as PrismaTable } from "@prisma/client";
import type { IEntityMapper } from "../repositories/prisma-base.repository";

export const TablePersistenceMapper: IEntityMapper<Table, PrismaTable> = {
	toDomain(raw: PrismaTable): Table {
		return Table.reconstitute({
			id: raw.id,
			sectionId: raw.sectionId,
			restaurantId: raw.restaurantId,
			tableCode: raw.tableCode,
			capacity: raw.capacity,
			currentOccupancy: raw.currentOccupancy,
			tableShape: raw.tableShape,
			status: raw.status,
			isActive: raw.isActive,
			createdAt: raw.createdAt,
			updatedAt: raw.updatedAt,
			isDeleted: raw.isDeleted,
		});
	},
	toPersistence(entity: Table): PrismaTable {
		return {
			id: entity.id,
			sectionId: entity.sectionId,
			restaurantId: entity.restaurantId,
			capacity: entity.capacity,
			currentOccupancy: entity.currentOccupancy,
			tableCode: entity.tableCode,
			tableShape: entity.tableShape,
			isActive: entity.isActive,
			createdAt: entity.createdAt,
			updatedAt: entity.updatedAt,
			isDeleted: entity.isDeleted,
			status: entity.status,
		};
	},
};
