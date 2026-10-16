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
import { inject, injectable } from "inversify";
import { PRISMA_ERROR_CODES } from "../constants/prisma-error-codes.constants";
import { TableSectionPersistenceMapper } from "../mappers/table-section.mapper";
import type { PrismaErrorMap } from "./prisma-base.repository";
import { PrismaBaseRepository } from "./prisma-base.repository";

@injectable()
export class PrismaTableSectionRepository
	extends PrismaBaseRepository<
		TableSection,
		PrismaTableSection,
		PrismaClient["tableSection"]
	>
	implements ITableSectionRepository
{
	private static readonly ERROR_MAP: PrismaErrorMap = {
		[PRISMA_ERROR_CODES.UNIQUE_CONSTRAINT]: () =>
			new TableSectionAlreadyExists(),
		[PRISMA_ERROR_CODES.RECORD_NOT_FOUND]: () => new TableSectionNotFound(),
	};

	private static readonly SORT_COLUMNS = {
		createdAt: "createdAt",
		sectionName: "sectionName",
	} as const;

	constructor(
		@inject(TYPES.PrismaClient)
		prisma: PrismaClient,
	) {
		super(
			prisma.tableSection,
			TableSectionPersistenceMapper,
			PrismaTableSectionRepository.ERROR_MAP,
		);
	}

	async findTableSectionById(id: string): Promise<TableSection | null> {
		return this.findOne<Prisma.TableSectionWhereInput>({
			id,
			isDeleted: false,
		});
	}

	async createTableSection(tableSection: TableSection): Promise<TableSection> {
		return this.create(tableSection);
	}

	async findManyWithFilter(
		filter: TableSectionFilterParams,
	): Promise<{ tableSections: TableSection[]; total: number }> {
		const sortColumn = PrismaTableSectionRepository.SORT_COLUMNS[filter.sortBy];

		const { items, total } = await this.findPaginated<
			Prisma.TableSectionWhereInput,
			Prisma.TableSectionOrderByWithRelationInput[]
		>({
			where: this.buildWhere(filter),
			orderBy: [{ [sortColumn]: filter.sortOrder }, { id: "asc" }],
			page: filter.page,
			limit: filter.limit,
		});

		return { tableSections: items, total };
	}

	private buildWhere(
		filter: TableSectionFilterParams,
	): Prisma.TableSectionWhereInput {
		const where: Prisma.TableSectionWhereInput = {
			isDeleted: false,
		};

		if (filter.restaurantId) {
			where.restaurantId = filter.restaurantId;
		}

		if (filter.search) {
			where.sectionName = {
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

	async deleteTableSection(id: string): Promise<void> {
		await this.run(async () => {
			await this.delegate.update({
				where: {
					id,
					isDeleted: false,
				},
				data: {
					isDeleted: true,
				},
			});
		});
	}

	async findBySectionNameAndRestaurant(
		name: string,
		restaurantId: string,
	): Promise<TableSection | null> {
		return this.findOne<Prisma.TableSectionWhereInput>({
			sectionName: name,
			restaurantId,
			isDeleted: false,
		});
	}

	async findAllByRestaurantId(restaurantId: string): Promise<TableSection[]> {
		const records = await this.run(
			() =>
				this.delegate.findMany({
					where: {
						restaurantId,
						isDeleted: false,
					},
					orderBy: { sectionName: "asc" },
				}) as Promise<PrismaTableSection[]>,
		);

		return records.map((record) => this.mapper.toDomain(record));
	}
}
