import type {
	MenuItemListItemDto,
	MenuItemStatsDto,
	PaginatedMenuItemsResponseDto,
} from "@/application/dtos/menu-item/list-menu-items.dto.ts";
import type {
	MenuItemWithRelations,
	RestaurantMenuStats,
} from "@/domain/repositories/menu-item.repository.interface.ts";

export const MenuItemMapper = {
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
