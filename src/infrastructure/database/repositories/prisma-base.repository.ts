import { injectable } from "inversify";
import type {
	IBaseRepository,
	PaginatedResult,
	PaginationOptions,
} from "@/domain/repositories/base.repository.interface.ts";

export interface IEntityMapper<TDomain, TModel> {
	toDomain(raw: TModel): TDomain;
	toPersistence(entity: TDomain): TModel;
}

@injectable()
export abstract class PrismaBaseRepository<
	TDomain extends { id: string },
	TModel,
	TDelegate,
> implements IBaseRepository<TDomain, string>
{
	constructor(
		protected readonly dbModel: TDelegate,
		protected readonly mapper: IEntityMapper<TDomain, TModel>,
	) {}

	private static readonly MAX_PAGE_SIZE = 100;

	// biome-ignore lint/suspicious/noExplicitAny: Internal bridge for generic base calls
	protected get delegate(): any {
		return this.dbModel;
	}

	public async findById(id: string): Promise<TDomain | null> {
		const record = (await this.delegate.findUnique({
			where: { id },
		})) as TModel | null;
		return record ? this.mapper.toDomain(record) : null;
	}

	public async exists(id: string): Promise<boolean> {
		const count = (await this.delegate.count({ where: { id } })) as number;
		return count > 0;
	}

	public async save(entity: TDomain): Promise<void> {
		try {
			const data = this.mapper.toPersistence(entity);
			const { id, createdAt, ...updateData } = data as Record<string, unknown>;

			await this.delegate.upsert({
				where: { id: entity.id },
				create: data,
				update: updateData,
			});
		} catch (error) {
			this.handlePrismaError(error, entity);
			throw error;
		}
	}

	public async create(entity: TDomain): Promise<TDomain> {
		try {
			const record = await this.delegate.create({
				data: this.mapper.toPersistence(entity),
			});
			return this.mapper.toDomain(record);
		} catch (error) {
			this.handlePrismaError(error, entity);
			throw error;
		}
	}

	public async findPaginated<TWhere = unknown, TOrderBy = unknown>(
		options: PaginationOptions<TWhere, TOrderBy>,
	): Promise<PaginatedResult<TDomain>> {
		try {
			const { where, orderBy, page, limit } = options;
			const take = Math.min(
				Math.max(limit, 1),
				PrismaBaseRepository.MAX_PAGE_SIZE,
			);
			const skip = (Math.max(page, 1) - 1) * take;
			const [records, total] = await Promise.all([
				this.delegate.findMany({ where, orderBy, skip, take }) as Promise<
					TModel[]
				>,
				this.delegate.count({ where }) as Promise<number>,
			]);

			return {
				items: records.map((r) => this.mapper.toDomain(r)),
				total,
			};
		} catch (error) {
			this.handlePrismaError(error);
			throw error;
		}
	}

	public async findOne<TWhere = unknown>(
		where: TWhere,
	): Promise<TDomain | null> {
		try {
			const record = (await this.delegate.findFirst({
				where,
			})) as TModel | null;

			return record ? this.mapper.toDomain(record) : null;
		} catch (error) {
			this.handlePrismaError(error);
			throw error;
		}
	}

	public async update(
		id: string,
		data: Record<string, unknown>,
	): Promise<TDomain> {
		try {
			const record = (await this.delegate.update({
				where: { id },
				data,
			})) as TModel;
			return this.mapper.toDomain(record);
		} catch (error) {
			this.handlePrismaError(error, id);
			throw error;
		}
	}

	public async delete(id: string): Promise<void> {
		try {
			await this.delegate.delete({ where: { id } });
		} catch (error) {
			this.handlePrismaError(error, id);
			throw error;
		}
	}

	/**
	 * Subclasses can override this hook to translate Prisma errors (e.g., P2002, P2025)
	 * to domain-specific errors.
	 */
	protected handlePrismaError(_error: unknown, _context?: unknown): void {}
}
