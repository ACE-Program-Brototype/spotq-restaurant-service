import { TYPES } from "@config/di/types";
import type { TableSection } from "@domain/entities/table-section.entity";
import {
	TableSectionAlreadyExists,
	TableSectionNotFound,
} from "@domain/errors/table-section.errors";
import type {
	ITableSectionRepository,
	TableSectionFilterParams,
} from "@domain/repositories/table-section.respository.interface";
import {
	Prisma,
	type TableSection as PrismaTableSection,
} from "@prisma/client";
import type { PrismaClient } from "@prisma/client/extension";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { inject } from "inversify";
import { TableSectionPersistenceMapper } from "../mappers/table-section.mapper";
import { PrismaBaseRepository } from "./prisma-base.repository";

export class PrismaTableSectionRepository
	extends PrismaBaseRepository<
		TableSection,
		PrismaTableSection,
		PrismaClient["table_section"]
	>
	implements ITableSectionRepository
{
	constructor(
		@inject(TYPES.PrismaClient)
		prisma: PrismaClient,
	) {
		console.log(prisma.tableSection, "HIIIII_______");
		super(prisma.tableSection, TableSectionPersistenceMapper);
	}

	protected override handlePrismaError(
		error: unknown,
		_context?: unknown,
	): void {
		const code = (error as { code?: string })?.code;
		if (
			code === "P2002" ||
			(error instanceof PrismaClientKnownRequestError && error.code === "P2002")
		) {
			throw new TableSectionAlreadyExists();
		}

		if (
			code === "P2025" ||
			(error instanceof PrismaClientKnownRequestError && error.code === "P2025")
		) {
			throw new TableSectionNotFound();
		}
	}

	async findTableSectionById(id: string): Promise<TableSection | null> {
		try {
			return await super.findById(id);
		} catch (error) {
			this.handlePrismaError(error);
			throw error;
		}
	}

	async createTableSection(tableSection: TableSection): Promise<void> {
		try {
			await super.create(tableSection);
		} catch (error) {
			this.handlePrismaError(error);
		}
	}

	// maps domain field name to prisma field name
	private static readonly SORT_COLUMNS = {
		createdAt: "created_at",
		sectionName: "section_name",
	};

	async findManyWithFilter(
		filter: TableSectionFilterParams,
	): Promise<{ tableSections: TableSection[]; total: number }> {
		try {
			const sortColumn =
				PrismaTableSectionRepository.SORT_COLUMNS[filter.sortBy];

			const { items, total } = await super.findPaginated({
				where: this.buildWhere(filter),
				orderBy: [{ [sortColumn]: filter.sortOrder }, { id: "asc" }],
				page: filter.page,
				limit: filter.limit,
			});

			return { tableSections: items, total };
		} catch (error) {
			this.handlePrismaError(error);
			throw error;
		}
	}

	private buildWhere(
		filter: TableSectionFilterParams,
	): Prisma.TableSectionWhereInput {
		const where: Prisma.TableSectionWhereInput = { isDeleted: false };

		// if restaurantId exists filter by it
		if (filter.restaurantId) where.restaurantId = filter.restaurantId;

		// if search exists search sectionName with it
		if (filter.search) {
			where.sectionName = {
				contains: filter.search,
				mode: Prisma.QueryMode.insensitive,
			};
		}

		// if createdFrom exists look for items gte it
		// if createdTo existss look for items lte it
		if (filter.createdFrom || filter.createdTo) {
			where.createdAt = {
				...(filter.createdFrom && { gte: filter.createdFrom }),
				...(filter.createdTo && { lte: filter.createdTo }),
			};
		}

		return where;
	}

	async deleteTableSection(id: string): Promise<void> {
		try {
			// Handled isDelete here instead of baseRepo because softDelete
			// is not used in BaseRepo
			return this.delegate.update({
				where: { id: id },
				data: { isDeleted: false },
			});
		} catch (error) {
			this.handlePrismaError(error);
			throw error;
		}
	}

	async findBySectionName(name: string): Promise<TableSection | null> {
		try {
			return await super.findOne<Prisma.TableSectionWhereInput>({
				sectionName: name,
			});
		} catch (error) {
			this.handlePrismaError(error);
			throw error;
		}
	}
}
