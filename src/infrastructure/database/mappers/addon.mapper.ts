import { Prisma, type Addon as PrismaAddon } from "@prisma/client";
import { Addon } from "@/domain/entities/addon.entity.ts";
import type { IEntityMapper } from "../repositories/prisma-base.repository.ts";

export const AddonPersistenceMapper: IEntityMapper<Addon, PrismaAddon> = {
	toDomain(raw: PrismaAddon): Addon {
		return Addon.reconstitute({
			id: raw.id,
			restaurantId: raw.restaurantId,
			name: raw.name,
			description: raw.description,
			price: Number(raw.price),
			imageKey: raw.imageKey,
			isAvailable: raw.isAvailable,
			createdAt: raw.createdAt,
			updatedAt: raw.updatedAt,
		});
	},

	toPersistence(entity: Addon): PrismaAddon {
		return {
			id: entity.id,
			restaurantId: entity.restaurantId,
			name: entity.name,
			description: entity.description,
			price: new Prisma.Decimal(entity.price),
			imageKey: entity.imageKey,
			isAvailable: entity.isAvailable,
			createdAt: entity.createdAt,
			updatedAt: entity.updatedAt,
		};
	},
};
