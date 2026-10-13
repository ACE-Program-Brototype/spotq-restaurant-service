import { injectable } from "inversify";
import { DomainError } from "@/domain/errors/domain.error.ts";
import type { IBaseRepository } from "@/domain/repositories/base.repository.interface.ts";
import { PersistenceError } from "@/infrastructure/errors/persistence.error.ts";

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
	 */
	protected async run<R>(operation: () => Promise<R>): Promise<R> {
		try {
			return await operation();
		} catch (error) {
			throw this.translateError(error);
		}
	}

	/**
	 * Translates database and runtime errors into domain errors or PersistenceError.
	 */
	protected translateError(error: unknown): Error {
		if (error instanceof DomainError) {
			return error;
		}

		if (error instanceof PersistenceError) {
			return error;
		}

		const code = (error as { code?: string })?.code;
		if (code && this.errorMap[code]) {
			return this.errorMap[code](error);
		}

		try {
			this.handlePrismaError(error);
		} catch (handledError) {
			if (handledError instanceof Error) {
				return handledError;
			}
		}

		return new PersistenceError(
			error instanceof Error ? error.message : "Database operation failed",
			error,
		);
	}

	public async findById(id: string): Promise<TDomain | null> {
		return this.run(async () => {
			const record = (await this.delegate.findUnique({
				where: { id },
			})) as TModel | null;
			return record ? this.mapper.toDomain(record) : null;
		});
	}

	public async exists(id: string): Promise<boolean> {
		return this.run(async () => {
			const count = (await this.delegate.count({ where: { id } })) as number;
			return count > 0;
		});
	}

	public async save(entity: TDomain): Promise<void> {
		return this.run(async () => {
			const data = this.mapper.toPersistence(entity);
			const { id, createdAt, ...updateData } = data as Record<string, unknown>;

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
		return this.run(async () => {
			const record = (await this.delegate.update({
				where: { id },
				data,
			})) as TModel;
			return this.mapper.toDomain(record);
		});
	}

	public async delete(id: string): Promise<void> {
		return this.run(async () => {
			await this.delegate.delete({ where: { id } });
		});
	}

	/**
	 * Subclasses can override this hook to translate Prisma errors.
	 * Prefer configuring errorMap in constructor instead.
	 */
	protected handlePrismaError(_error: unknown, _context?: unknown): void {}
}
