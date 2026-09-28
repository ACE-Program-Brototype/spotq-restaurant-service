import type { MenuItemResponseDto } from "@/application/dtos/menu-item/create-menu-item.dto.ts";
import type { MenuItemDetailsResponseDto } from "@/application/dtos/menu-item/get-menu-item-details.dto.ts";
import type {
	MenuItemListItemDto,
	MenuItemStatsDto,
	PaginatedMenuItemsResponseDto,
} from "@/application/dtos/menu-item/list-menu-items.dto.ts";
import type {
	MenuItemAggregate,
	MenuItemDetailsAggregate,
	MenuItemWithRelations,
	RestaurantMenuStats,
} from "@/domain/repositories/menu-item.repository.interface.ts";

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

	toDetailsResponseDto(
		aggregate: MenuItemDetailsAggregate,
	): MenuItemDetailsResponseDto {
		const category = aggregate.category
			? {
					id: aggregate.category.id,
					name: aggregate.category.name,
					description: aggregate.category.description,
				}
			: null;

		return {
			id: aggregate.item.id,
			restaurantId: aggregate.item.restaurantId,
			categoryId: aggregate.item.categoryId,
			categoryName: aggregate.category?.name ?? "",
			category,
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
				isAvailable: aggregate.item.isAvailable,
			})),
			addons: aggregate.addons.map((a) => ({
				id: a.id,
				addonId: a.addonId,
				name: a.name,
				description: a.description,
				price: a.priceOverride !== null ? a.priceOverride : a.price,
				priceOverride: a.priceOverride,
				imageKey: a.imageKey,
				isAvailable: a.isAvailable && aggregate.item.isAvailable,
			})),
			createdAt: aggregate.item.createdAt.toISOString(),
			updatedAt: aggregate.item.updatedAt.toISOString(),
		};
	},

	toListItemDto(raw: MenuItemWithRelations): MenuItemListItemDto {
		return {
			id: raw.id,
			restaurantId: raw.restaurantId,
			categoryId: raw.categoryId,
			categoryName: raw.categoryName,
			name: raw.name,
			price: raw.price,
			isVegetarian: raw.isVegetarian,
			isFeatured: raw.isFeatured,
			isAvailable: raw.isAvailable,
			image: raw.image,
			createdAt: raw.createdAt.toISOString(),
			updatedAt: raw.updatedAt.toISOString(),
		};
	},

	toStatsDto(stats: RestaurantMenuStats): MenuItemStatsDto {
		return {
			totalCategories: stats.totalCategories,
			totalMenuItems: stats.totalMenuItems,
			availableItems: stats.availableItems,
			outOfStockItems: stats.outOfStockItems,
		};
	},

	toPaginatedResponse(
		items: MenuItemWithRelations[],
		total: number,
		stats: RestaurantMenuStats,
		page: number,
		limit: number,
	): PaginatedMenuItemsResponseDto {
		const totalPages = Math.ceil(total / limit) || 0;

		return {
			stats: MenuItemMapper.toStatsDto(stats),
			items: items.map((item) => MenuItemMapper.toListItemDto(item)),
			pagination: {
				page,
				limit,
				total,
				totalPages,
				hasNextPage: page < totalPages,
				hasPrevPage: page > 1,
			},
		};
	},
};
