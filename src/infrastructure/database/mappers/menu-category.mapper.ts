import type { MenuCategory as PrismaMenuCategory } from "@prisma/client";
import { MenuCategory } from "@/domain/entities/menu-category.entity.ts";
import type { IEntityMapper } from "../repositories/prisma-base.repository.ts";

export const MenuCategoryPersistenceMapper: IEntityMapper<
	MenuCategory,
	PrismaMenuCategory
> = {
	toDomain(raw: PrismaMenuCategory): MenuCategory {
		return MenuCategory.reconstitute({
			id: raw.id,
			restaurantId: raw.restaurantId,
			name: raw.name,
			description: raw.description,
			displayOrder: raw.displayOrder,
			isActive: raw.isActive,
			createdAt: raw.createdAt,
			updatedAt: raw.updatedAt,
		});
	},

	toPersistence(entity: MenuCategory): PrismaMenuCategory {
		return {
			id: entity.id,
			restaurantId: entity.restaurantId,
			name: entity.name,
			description: entity.description,
			displayOrder: entity.displayOrder,
			isActive: entity.isActive,
			createdAt: entity.createdAt,
			updatedAt: entity.updatedAt,
		};
	},
};
