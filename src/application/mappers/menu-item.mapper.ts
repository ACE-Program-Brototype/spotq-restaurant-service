import type { MenuItemResponseDto } from "@/application/dtos/menu-item/create-menu-item.dto.ts";
import type { MenuItemAggregate } from "@/domain/repositories/menu-item.repository.interface.ts";

export const MenuItemMapper = {
	toResponseDto(aggregate: MenuItemAggregate): MenuItemResponseDto {
		return {
			id: aggregate.item.id,
			restaurantId: aggregate.item.restaurantId,
			categoryId: aggregate.item.categoryId,
			name: aggregate.item.name,
			description: aggregate.item.description,
			price: aggregate.item.price,
			preparationTime: aggregate.item.preparationTime,
			calories: aggregate.item.calories,
			isVegetarian: aggregate.item.isVegetarian,
			isFeatured: aggregate.item.isFeatured,
			isAvailable: aggregate.item.isAvailable,
			images: aggregate.images.map((img) => ({
				id: img.id,
				objectKey: img.objectKey,
				displayOrder: img.displayOrder,
			})),
			variants: aggregate.variants.map((v) => ({
				id: v.id,
				sku: v.sku,
				name: v.name,
				price: v.price,
				isDefault: v.isDefault,
			})),
			addons: aggregate.addons.map((a) => ({
				id: a.id,
				addonId: a.addonId,
				name: a.name,
				price: a.price,
				priceOverride: a.priceOverride,
			})),
			createdAt: aggregate.item.createdAt.toISOString(),
			updatedAt: aggregate.item.updatedAt.toISOString(),
		};
	},
};
