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
	TableWithSection,
} from "@domain/repositories/table.repository.interface";
import type { Prisma, Table as PrismaTable } from "@prisma/client";
import type { PrismaClient } from "@prisma/client/extension";
import { inject } from "inversify";
import { TablePersistenceMapper } from "../mappers/table.mapper";
import {
	PrismaBaseRepository,
	type PrismaErrorMap,
} from "./prisma-base.repository";

type TableWithSectionRecord = Prisma.TableGetPayload<{
	include: {
		section: {
			select: {
				sectionName: true;
			};
		};
	};
}>;

export class PrismaTableRepository
	extends PrismaBaseRepository<Table, PrismaTable, PrismaClient["table"]>
	implements ITableRepository
{
	private static readonly ERROR_MAP: PrismaErrorMap = {
		P2002: () => new TableAlreadyExistsError(),
		P2025: () => new TableNotFoundError(),
	};
	constructor(
		@inject(TYPES.PrismaClient)
		prisma: PrismaClient,
	) {
		super(
			prisma.table,
			TablePersistenceMapper,
			PrismaTableRepository.ERROR_MAP,
		);
	}

	async findTableById(id: string): Promise<Table | null> {
		return await super.findOne<Prisma.TableWhereInput>({
			id,
			isDeleted: false,
		});
	}

	async createTable(table: Table): Promise<Table> {
		return await super.create(table);
	}

	async save(table: Table): Promise<void> {
		await super.save(table);
	}

	private static readonly SORT_COLUMNS = {
		createdAt: "createdAt",
		tableCode: "tableCode",
	} as const;

	async findManyWithFilter(
		filter: TableFilterParams,
	): Promise<{ table: Table[]; total: number }> {
		const sortColumn = PrismaTableRepository.SORT_COLUMNS[filter.sortBy];

		const { items, total } = await super.findPaginated({
			where: this.buildWhere(filter),
			orderBy: [{ [sortColumn]: filter.sortOrder }, { id: "asc" }],
			page: filter.page,
			limit: filter.limit,
		});

		return { table: items, total };
	}

	private buildWhere(filter: TableFilterParams): Prisma.TableWhereInput {
		const where: Prisma.TableWhereInput = { isDeleted: false };
		if (filter.restaurantId) {
			where.restaurantId = filter.restaurantId;
		}
		if (filter.sectionId) {
			where.sectionId = filter.sectionId;
		}

		if (filter.status) {
			where.status = filter.status;
		}

		if (filter.minCapacity !== undefined) {
			where.capacity = {
				gte: filter.minCapacity,
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
		const records = (await this.run(() =>
			this.delegate.findMany({
				where: { restaurantId, isDeleted: false },
				orderBy: [{ tableCode: "asc" }, { id: "asc" }],
			}),
		)) as PrismaTable[];
		return records.map((record) => this.mapper.toDomain(record));
	}

	async findAllGroupedBySection(
		restaurantId: string,
	): Promise<StaffTablesBySection> {
		const records = await this.run(
			() =>
				this.delegate.findMany({
					where: {
						restaurantId,
						isDeleted: false,
					},
					include: {
						section: {
							select: {
								sectionName: true,
							},
						},
					},
					orderBy: [{ tableCode: "asc" }, { id: "asc" }],
				}) as Promise<TableWithSectionRecord[]>,
		);

		return records.reduce<StaffTablesBySection>((grouped, record) => {
			const sectionName = record.section.sectionName;

			if (!grouped[sectionName]) {
				grouped[sectionName] = [];
			}

			// Pass only the scalar table record to the persistence mapper.
			const { section: _section, ...tableRecord } = record;

			grouped[sectionName].push(this.mapper.toDomain(tableRecord));

			return grouped;
		}, {});
	}

	async deleteTable(id: string): Promise<void> {
		await this.run(async () => {
			await this.delegate.update({
				where: { id, isDeleted: false },
				data: { isDeleted: true },
			});
		});
	}

	async findByTableCodeAndRestaurant(
		name: string,
		restaurantId: string,
	): Promise<Table | null> {
		return await super.findOne<Prisma.TableWhereInput>({
			tableCode: name,
			restaurantId,
			isDeleted: false,
		});
	}

	async findManyWithSection(
		filter: TableFilterParams,
	): Promise<{ tables: TableWithSection[]; total: number }> {
		const where = this.buildWhere(filter);
		const sortColumn = PrismaTableRepository.SORT_COLUMNS[filter.sortBy];
		const [records, total] = await this.run(
			async () =>
				await Promise.all([
					this.delegate.findMany({
						where,
						include: {
							section: {
								select: {
									sectionName: true,
								},
							},
						},
						orderBy: [{ [sortColumn]: filter.sortOrder }, { id: "asc" }],
						skip: (filter.page - 1) * filter.limit,
						take: filter.limit,
					}) as Promise<TableWithSectionRecord[]>,
					this.delegate.count({ where }),
				]),
		);

		return {
			tables: records.map((record) => ({
				table: this.mapper.toDomain(record),
				sectionName: record.section.sectionName,
			})),
			total,
		};
	}
}
