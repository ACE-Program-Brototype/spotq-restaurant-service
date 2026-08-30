import { injectable } from "inversify";
import type { IBaseRepository } from "@/domain/repositories/base.repository.interface.ts";

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

	// biome-ignore lint/suspicious/noExplicitAny: Internal bridge for generic base calls
	private get delegate(): any {
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
	protected handlePrismaError(_error: unknown, _context?: unknown): void {
		// Subclasses override if needed
	}
}
