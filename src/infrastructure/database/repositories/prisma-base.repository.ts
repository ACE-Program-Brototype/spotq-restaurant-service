import { Prisma } from "@prisma/client";
import { injectable } from "inversify";
import { DomainError } from "@/domain/errors/domain.error.ts";
import type { IBaseRepository } from "@/domain/repositories/base.repository.interface.ts";
import { PersistenceError } from "@/infrastructure/errors/persistence.error.ts";
import { PRISMA_ERROR_CODES } from "../constants/prisma-error-codes.constants.ts";

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
