import type { TableSection } from "@domain/entities/table-section.entity";
import type { IBaseRepository } from "./base.repository.interface";

export interface TableSectionFilterParams {
	page: number;
	limit: number;
	search?: string;
	restaurantId?: string;
	createdFrom?: Date;
	createdTo?: Date;
	sortBy: "createdAt" | "sectionName";
	sortOrder: "asc" | "desc";
}
export interface ITableSectionRepository extends IBaseRepository<TableSection> {
	/**
	 * Find table section by id
	 * @param id table section id
	 */
	findTableSectionById(id: string): Promise<TableSection | null>;

	/**
	 * Creates a table section row
	 * @param tableSection TableSection Entity
	 */
	createTableSection(tableSection: TableSection): Promise<TableSection>;

	/**
	 * Saves the table section to db
	 * @param tableSection TableSection Entity
	 */
	save(tableSection: TableSection): Promise<void>;

	/**
	 * Filters and gives Paginated results
	 * @param filter Table Filters params
	 */
	findManyWithFilter(
		filter: TableSectionFilterParams,
	): Promise<{ tableSections: TableSection[]; total: number }>;

	/**
	 * Deletes table section by id
	 * @param id TableSection.id
	 */
	deleteTableSection(id: string): Promise<void>;

	findBySectionNameAndRestaurant(
		name: string,
		restaurantId: string,
	): Promise<TableSection | null>;
}
