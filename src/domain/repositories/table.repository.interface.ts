import type { Table } from "@domain/entities/table.entity";
import type { IBaseRepository } from "./base.repository.interface";

export interface TableFilterParams {
	page: number;
	limit: number;
	minCapacity?: number;
	restaurantId?: string;
	sectionId?: string;
	status?: Table['status'],
	createdFrom?: Date;
	createdTo?: Date;
	sortBy: "createdAt" | "tableCode";
	sortOrder: "asc" | "desc";
}

export interface TableWithSection {
	table: Table;
	sectionName: string;
}

export interface TableAvailabilityData {
	restaurantId: string;
	availableTableCapacities: number[];
}

export type StaffTablesBySection = Record<string, Table[]>;

export interface ITableRepository extends IBaseRepository<Table> {
	/**
	 * Creates Table using Table Entity
	 * @param table Table
	 */
	create(table: Table): Promise<Table>;

	/**
	 * Find Table by Id. If not return null
	 * @param id string
	 */
	findById(id: string): Promise<Table | null>;

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
	softDelete(id: string): Promise<void>;

	/**
	 * Find Table by code and Restaurant Id
	 * @param code string TableCode
	 * @param restaurantId string
	 */
	findByTableCodeAndRestaurant(
		code: string,
		restaurantId: string,
	): Promise<Table | null>;

	findManyWithSection(
		filter: TableFilterParams,
	): Promise<{ tables: TableWithSection[]; total: number }>;

	getAvailability(restaurantId: string): Promise<TableAvailabilityData>;
}
