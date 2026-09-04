import type { PrismaClient } from "@prisma/client";
import type { IBaseRepository } from "@/application/ports/repositories/base.repository.port";

type PrismaModelDelegate<T> = {
	create: (args: { data: Partial<T> }) => Promise<T>;
	findUnique: (args: { where: Record<string, unknown> }) => Promise<T | null>;
	findMany: () => Promise<T[]>;
};

export abstract class BaseRepository<T> implements IBaseRepository<T> {
	constructor(
		protected readonly prisma: PrismaClient,
		protected readonly modelName: keyof PrismaClient,
	) {}

	private getModel(): PrismaModelDelegate<T> {
		return this.prisma[this.modelName] as unknown as PrismaModelDelegate<T>;
	}

	async create(data: Partial<T>): Promise<T> {
		const model = this.getModel();
		return model.create({ data });
	}

	async findById(id: string): Promise<T | null> {
		const model = this.getModel();
		return model.findUnique({
			where: {
				id,
			},
		});
	}

	async findUnique(where: Record<string, unknown>): Promise<T | null> {
		const model = this.getModel();
		return model.findUnique({
			where,
		});
	}

	async find(): Promise<T[]> {
		const model = this.getModel();
		return model.findMany();
	}
}
