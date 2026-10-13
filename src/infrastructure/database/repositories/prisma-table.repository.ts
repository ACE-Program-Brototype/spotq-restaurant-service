import { TYPES } from "@config/di/types";
import type { Table } from "@domain/entities/table.entity";
import {
	TableAlreadyExistsError,
	TableNotFoundError,
} from "@domain/errors/table.errors";
import type {
	ITableRepository,
	StaffTablesBySection,
	TableFilterParams,
} from "@domain/repositories/table.repository.interface";
import { Prisma, type Table as PrismaTable } from "@prisma/client";
import type { PrismaClient } from "@prisma/client/extension";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { inject } from "inversify";
import { TablePersistenceMapper } from "../mappers/table.mapper";
import { PrismaBaseRepository } from "./prisma-base.repository";

export class PrismaTableRepository
	extends PrismaBaseRepository<Table, PrismaTable, PrismaClient["table"]>
	implements ITableRepository
{
	constructor(
		@inject(TYPES.PrismaClient)
		prisma: PrismaClient,
	) {
		super(prisma.table, TablePersistenceMapper);
	}

	protected override handlePrismaError(error: unknown): void {
		const code = (error as { code?: string })?.code;
		if (
			code === "P2002" ||
			(error instanceof PrismaClientKnownRequestError && error.code === "P2002")
		) {
			throw new TableAlreadyExistsError();
		}

		if (
			code === "P2025" ||
			(error instanceof PrismaClientKnownRequestError && error.code === "P2025")
		) {
			throw new TableNotFoundError();
		}
	}

	async findTableById(id: string): Promise<Table | null> {
		try {
			return await super.findOne<Prisma.TableWhereInput>({
				id,
				isDeleted: false,
			});
		} catch (error) {
			this.handlePrismaError(error);
			throw error;
		}
	}

	async createTable(table: Table): Promise<Table> {
		try {
			return await super.create(table);
		} catch (error) {
			this.handlePrismaError(error);
			throw error;
		}
	}

	async save(table: Table): Promise<void> {
		try {
			await super.save(table);
		} catch (error) {
			this.handlePrismaError(error);
			throw error;
		}
	}

	private static readonly SORT_COLUMNS = {
		createdAt: "createdAt",
		tableNumber: "tableNumber",
	} as const;

	async findManyWithFilter(
		filter: TableFilterParams,
	): Promise<{ table: Table[]; total: number }> {
		try {
			const sortColumn = PrismaTableRepository.SORT_COLUMNS[filter.sortBy];
			const { items, total } = await super.findPaginated({
				where: this.buildWhere(filter),
				orderBy: [{ [sortColumn]: filter.sortOrder }, { id: "asc" }],
				page: filter.page,
				limit: filter.limit,
			});

			return { table: items, total };
		} catch (error) {
			this.handlePrismaError(error);
			throw error;
		}
	}

	private buildWhere(filter: TableFilterParams): Prisma.TableWhereInput {
		const where: Prisma.TableWhereInput = { isDeleted: false };
		if (filter.restaurantId) {
			where.restaurantId = filter.restaurantId;
		}
		if (filter.sectionId) {
			where.sectionId = filter.sectionId;
		}

		if (filter.search) {
			where.tableNumber = {
				contains: filter.search,
				mode: Prisma.QueryMode.insensitive,
			};
		}

		if (filter.createdFrom || filter.createdTo) {
			where.createdAt = {
				...(filter.createdFrom && { gte: filter.createdFrom }),
				...(filter.createdTo && { lte: filter.createdTo }),
			};
		}

		return where;
	}

	async findAllByRestaurant(restaurantId: string): Promise<Table[]> {
		try {
			const records = (await this.delegate.findMany({
				where: { restaurantId, isDeleted: false },
				orderBy: [{ tableNumber: "asc" }, { id: "asc" }],
			})) as PrismaTable[];
			return records.map((record) => this.mapper.toDomain(record));
		} catch (error) {
			this.handlePrismaError(error);
			throw error;
		}
	}

	async findAllGroupedBySection(
		restaurantId: string,
	): Promise<StaffTablesBySection> {
		const tables = await this.findAllByRestaurant(restaurantId);

		return tables.reduce<StaffTablesBySection>((grouped, table) => {
			const sectionId = table.sectionId;
			if(!grouped[sectionId]){
				grouped[sectionId] = []
			}
			
			grouped[sectionId].push(table.tableNumber);
			return grouped;
		}, {});
	}

	async deleteTable(id: string): Promise<void> {
		try {
			await this.delegate.update({
				where: { id, isDeleted: false },
				data: { isDeleted: true },
			});
		} catch (error) {
			this.handlePrismaError(error);
			throw error;
		}
	}

	async findByTableNameAndRestaurant(
		name: string,
		restaurantId: string,
	): Promise<Table | null> {
		try {
			return await super.findOne<Prisma.TableWhereInput>({
				tableNumber: name,
				restaurantId,
				isDeleted: false,
			});
		} catch (error) {
			this.handlePrismaError(error);
			throw error;
		}
	}
}
