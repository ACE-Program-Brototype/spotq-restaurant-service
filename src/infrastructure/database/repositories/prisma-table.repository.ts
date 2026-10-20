import { TYPES } from "@config/di/types";
import { TABLE_STATUS } from "@domain/constants/table.constants";
import type { Table } from "@domain/entities/table.entity";
import {
	TableAlreadyExistsError,
	TableNotFoundError,
} from "@domain/errors/table.errors";
import type {
	ITableRepository,
	StaffTablesBySection,
	TableAvailabilityData,
	TableFilterParams,
	TableWithSection,
} from "@domain/repositories/table.repository.interface";
import type { Prisma, Table as PrismaTable } from "@prisma/client";
import type { PrismaClient } from "@prisma/client/extension";
import { inject, injectable } from "inversify";
import { PRISMA_ERROR_CODES } from "../constants/prisma-error-codes.constants";
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

@injectable()
export class PrismaTableRepository
	extends PrismaBaseRepository<Table, PrismaTable, PrismaClient["table"]>
	implements ITableRepository
{
	private static readonly ERROR_MAP: PrismaErrorMap = {
		[PRISMA_ERROR_CODES.UNIQUE_CONSTRAINT]: () => new TableAlreadyExistsError(),
		[PRISMA_ERROR_CODES.RECORD_NOT_FOUND]: () => new TableNotFoundError(),
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

	async findById(id: string): Promise<Table | null> {
		return await super.findOne<Prisma.TableWhereInput>({
			id,
			isDeleted: false,
		});
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

	async getAvailability(restaurantId: string): Promise<TableAvailabilityData> {
		const availableTables = await this.run<Array<{ capacity: number }>>(() =>
			this.delegate.findMany({
				where: {
					restaurantId,
					isDeleted: false,
					isActive: true,
					status: TABLE_STATUS.AVAILABLE,
				},
				select: { capacity: true },
			}),
		);
		return {
			restaurantId,
			availableTableCapacities: availableTables.map((table) => table.capacity),
		};
	}

	async countActiveBySectionId(sectionId: string): Promise<number> {
		return this.run(async () =>
			this.delegate.count({
				where: {
					sectionId,
					isDeleted: false,
				},
			}),
		);
	}
}
