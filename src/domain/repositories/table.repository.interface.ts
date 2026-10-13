import type { Table } from "@domain/entities/table.entity";
import type { IBaseRepository } from "./base.repository.interface";

export interface TableFilterParams {
	page: number;
	limit: number;
	search?: string;
	restaurantId?: string;
	sectionId?: string;
	createdFrom?: Date;
	createdTo?: Date;
	sortBy: "createdAt" | "tableNumber";
	sortOrder: "asc" | "desc";
}

export type StaffTablesBySection = Record<string, string[]>;

export interface ITableRepository extends IBaseRepository<Table> {
	/**
	 * Creates Table using Table Entity
	 * @param table Table
	 */
	createTable(table: Table): Promise<Table>;

	/**
	 * Find Table by Id. If not return null
	 * @param id string
	 */
	findTableById(id: string): Promise<Table | null>;

	/**
	 * Save Table to Db
	 * @param table Table
	 */
	save(table: Table): Promise<void>;

	/**
	 * Paginated result with filter
	 * @param filter TableFilterParams
	 */
	findManyWithFilter(
		filter: TableFilterParams,
	): Promise<{ table: Table[]; total: number }>;

	/**
	 * return all table
	 * @param restaurantId string
	 */
	findAllByRestaurant(restaurantId: string): Promise<Table[]>;

	/**
	 * Tables grouped by section
	 * @param restaurantId string
	 * @returns StaffTablesBySection
	 */
	findAllGroupedBySection(restaurantId: string): Promise<StaffTablesBySection>;

	/**
	 * Soft Deletes Table by Id
	 * @param id string
	 */
	deleteTable(id: string): Promise<void>;

	/**
	 * Find Table by name and Restaurant Id
	 * @param name string TableName
	 * @param restaurantId string
	 */
	findByTableNameAndRestaurant(
		name: string,
		restaurantId: string,
	): Promise<Table | null>;
}
