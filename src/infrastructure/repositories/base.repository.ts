import type { IBaseRepository } from "@/application/ports/repositories/base.repository.port";
import type { PrismaClient } from "@prisma/client";

export abstract class BaseRepository<T> implements IBaseRepository<T> {
	constructor(
		protected readonly prisma: PrismaClient,
		protected readonly modelName: keyof PrismaClient,
	) {}

	async create(data: Partial<T>): Promise<T> {
		const model = this.prisma[this.modelName] as any;
		return model.create({ data });
	}

	async findById(id: string): Promise<T | null> {
		const model = this.prisma[this.modelName] as any;
		return model.findUnique({
			where: {
				id,
			},
		});
	}

	async findUnique(where: Record<string, unknown>): Promise<T | null> {
		const model = this.prisma[this.modelName] as any;
		return model.findUnique({
			where,
		});
	}

	async find(): Promise<T[]> {
		const model = this.prisma[this.modelName] as any;
		return model.findMany();
	}
}
