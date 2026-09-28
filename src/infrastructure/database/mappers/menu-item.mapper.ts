import {
	Prisma,
	type MenuItem as PrismaMenuItem,
	type MenuItemVariant as PrismaMenuItemVariant,
} from "@prisma/client";
import { MenuItem } from "@/domain/entities/menu-item.entity.ts";
import { MenuItemVariant } from "@/domain/entities/menu-item-variant.entity.ts";
import type { IEntityMapper } from "../repositories/prisma-base.repository.ts";

export const MenuItemPersistenceMapper: IEntityMapper<
	MenuItem,
	PrismaMenuItem
> = {
	toDomain(raw: PrismaMenuItem): MenuItem {
		return MenuItem.reconstitute({
			id: raw.id,
			restaurantId: raw.restaurantId,
			categoryId: raw.categoryId,
			name: raw.name,
			description: raw.description,
			price: Number(raw.price),
			preparationTime: raw.preparationTime,
			calories: raw.calories,
			isVegetarian: raw.isVegetarian,
			isFeatured: raw.isFeatured,
			isAvailable: raw.isAvailable,
			createdAt: raw.createdAt,
			updatedAt: raw.updatedAt,
		});
	},

	toPersistence(entity: MenuItem): PrismaMenuItem {
		return {
			id: entity.id,
			restaurantId: entity.restaurantId,
			categoryId: entity.categoryId,
			name: entity.name,
			description: entity.description,
			price: new Prisma.Decimal(entity.price),
			preparationTime: entity.preparationTime,
			calories: entity.calories,
			isVegetarian: entity.isVegetarian,
			isFeatured: entity.isFeatured,
			isAvailable: entity.isAvailable,
			createdAt: entity.createdAt,
			updatedAt: entity.updatedAt,
		};
	},
};

export const MenuItemVariantPersistenceMapper: IEntityMapper<
	MenuItemVariant,
	PrismaMenuItemVariant
> = {
	toDomain(raw: PrismaMenuItemVariant): MenuItemVariant {
		return MenuItemVariant.reconstitute({
			id: raw.id,
			menuItemId: raw.menuItemId,
			sku: raw.sku,
			name: raw.name,
			price: Number(raw.price),
			isDefault: raw.isDefault,
			createdAt: raw.createdAt,
			updatedAt: raw.updatedAt,
		});
	},

	toPersistence(entity: MenuItemVariant): PrismaMenuItemVariant {
		return {
			id: entity.id,
			menuItemId: entity.menuItemId,
			sku: entity.sku,
			name: entity.name,
			price: new Prisma.Decimal(entity.price),
			isDefault: entity.isDefault,
			createdAt: entity.createdAt,
			updatedAt: entity.updatedAt,
		};
	},
};
