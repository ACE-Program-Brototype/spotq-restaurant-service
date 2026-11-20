import { TableSection } from "@domain/entities/table-section.entity";
import type { TableSection as PrismaTableSection } from "@prisma/client";
import type { IEntityMapper } from "../repositories/prisma-base.repository";
export const TableSectionPersistenceMapper: IEntityMapper<
	TableSection,
	PrismaTableSection
> = {
	toDomain(raw: PrismaTableSection) {
		return TableSection.reconstitute({
			id: raw.id,
			restaurantId: raw.restaurantId,
			sectionName: raw.sectionName,
			createdAt: raw.createdAt,
			updatedAt: raw.updatedAt,
			isDeleted: raw.isDeleted,
		});
	},

	toPersistence(entity: TableSection): PrismaTableSection {
		return {
			id: entity.id,
			restaurantId: entity.restaurantId,
			sectionName: entity.sectionName,
			createdAt: entity.createdAt,
			updatedAt: entity.updatedAt,
			isDeleted: entity.isDeleted,
		};
	},
};
