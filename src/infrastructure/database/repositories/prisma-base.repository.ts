import { Prisma } from "@prisma/client";
import { injectable } from "inversify";
import { DomainError } from "@/domain/errors/domain.error.ts";
import { PersistenceError } from "@/infrastructure/errors/persistence.error.ts";
import { PRISMA_ERROR_CODES } from "../constants/prisma-error-codes.constants.ts";
import type {
	IBaseRepository,
	PaginatedResult,
	PaginationOptions,
} from "@/domain/repositories/base.repository.interface.ts";

export interface IEntityMapper<TDomain, TModel> {
	toDomain(raw: TModel): TDomain;
	toPersistence(entity: TDomain): TModel;
}

export type PrismaErrorFactory = (error: unknown) => Error;
export type PrismaErrorMap = Record<string, PrismaErrorFactory>;

@injectable()
export abstract class PrismaBaseRepository<
	TDomain extends { id: string },
	TModel,
	TDelegate = unknown,
> implements IBaseRepository<TDomain, string>
{
	constructor(
		protected readonly dbModel: TDelegate,
		protected readonly mapper: IEntityMapper<TDomain, TModel>,
		protected readonly errorMap: PrismaErrorMap = {},
	) {}

	private static readonly MAX_PAGE_SIZE = 100;

	// biome-ignore lint/suspicious/noExplicitAny: Internal bridge for generic base calls
	protected get delegate(): any {
		return this.dbModel;
	}

	/**
	 * Executes an asynchronous database operation, translating known Prisma errors
	 * and wrapping unknown infrastructure failures in a PersistenceError.
	 * Optionally accepts a method-specific errorMap to override default mappings.
	 */
	protected async run<R>(
		operation: () => Promise<R>,
		methodErrorMap?: PrismaErrorMap,
	): Promise<R> {
		try {
			return await operation();
		} catch (error) {
			throw this.translateError(error, methodErrorMap);
		}
	}

	/**
	 * Translates database and runtime errors into domain errors or PersistenceError.
	 * Standard JavaScript programming errors (TypeError, ReferenceError) are not masked.
	 */
	protected translateError(
		error: unknown,
		methodErrorMap?: PrismaErrorMap,
	): Error {
		if (error instanceof DomainError || error instanceof PersistenceError) {
			return error;
		}

		// Never mask programming bugs (e.g. TypeError, ReferenceError) as database persistence errors
		if (
			error instanceof TypeError ||
			error instanceof ReferenceError ||
			error instanceof RangeError
		) {
			return error;
		}

		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			const factory = methodErrorMap?.[error.code] ?? this.errorMap[error.code];
			if (factory) {
				try {
					return factory(error);
				} catch (factoryError) {
					return new PersistenceError(
						"Failed to map database error",
						factoryError,
					);
				}
			}

			const isRetryable =
				error.code === PRISMA_ERROR_CODES.POOL_TIMEOUT ||
				error.code === PRISMA_ERROR_CODES.TRANSACTION_TIMEOUT;

			return new PersistenceError(
				error.message || "Database operation failed",
				error,
				"PERSISTENCE_ERROR",
				isRetryable,
			);
		}

		if (error instanceof Prisma.PrismaClientInitializationError) {
			return new PersistenceError(
				error.message || "Database initialization failed",
				error,
				"PERSISTENCE_ERROR",
				true,
			);
		}

		if (error instanceof Prisma.PrismaClientRustPanicError) {
			return new PersistenceError(
				error.message || "Database engine panic",
				error,
				"PERSISTENCE_ERROR",
				false,
			);
		}

		return new PersistenceError(
			error instanceof Error ? error.message : "Database operation failed",
			error,
		);
	}

	public async findById(id: string): Promise<TDomain | null> {
		const record = await this.run(async () => {
			return (await this.delegate.findUnique({
				where: { id },
			})) as TModel | null;
		});
		return record ? this.mapper.toDomain(record) : null;
	}

	public async exists(id: string): Promise<boolean> {
		return this.run(async () => {
			const count = (await this.delegate.count({ where: { id } })) as number;
			return count > 0;
		});
	}

	public async save(entity: TDomain): Promise<void> {
		const data = this.mapper.toPersistence(entity);
		const { id, createdAt, ...updateData } = data as Record<string, unknown>;

		await this.run(async () => {
			await this.delegate.upsert({
				where: { id: entity.id },
				create: data,
				update: updateData,
			});
		});
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
			this.translateError(error);
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
			this.translateError(error);
			throw error;
		}
	}

	public async update(
		id: string,
		data: Record<string, unknown>,
	): Promise<TDomain> {
		const record = await this.run(async () => {
			return (await this.delegate.update({
				where: { id },
				data,
			})) as TModel;
		});
		return this.mapper.toDomain(record);
	}

	public async delete(id: string): Promise<void> {
		await this.run(async () => {
			await this.delegate.delete({ where: { id } });
		});
	}
}
