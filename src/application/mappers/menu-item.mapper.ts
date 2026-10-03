import type { MenuItemResponseDto } from "@/application/dtos/menu-item/create-menu-item.dto.ts";
import type { CustomerMenuItemDetailsResponseDto } from "@/application/dtos/menu-item/get-customer-menu-item-details.dto.ts";
import type { RestaurantOwnerMenuItemDetailsResponseDto } from "@/application/dtos/menu-item/get-restaurant-owner-menu-item-details.dto.ts";
import type {
	MenuItemListItemDto,
	MenuItemStatsDto,
	PaginatedMenuItemsResponseDto,
} from "@/application/dtos/menu-item/list-menu-items.dto.ts";
import type {
	StaffMenuItemListItemDto,
	StaffMenuItemsResponseDto,
} from "@/application/dtos/menu-item/list-staff-menu-items.dto.ts";
import type {
	MenuItemAggregate,
	MenuItemDetailsAggregate,
	MenuItemWithRelations,
	RestaurantMenuStats,
	StaffMenuItemResultItem,
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
				isAvailable: v.isAvailable,
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

	toRestaurantOwnerDetailsResponseDto(
		aggregate: MenuItemDetailsAggregate,
	): RestaurantOwnerMenuItemDetailsResponseDto {
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
				isAvailable: aggregate.item.isAvailable && v.isAvailable,
			})),
			addons: aggregate.addons.map((a) => ({
				id: a.id,
				addonId: a.addonId,
				name: a.name,
				description: a.description,
				price: a.price,
				priceOverride: a.priceOverride,
				imageKey: a.imageKey,
				isAvailable: a.isAvailable,
			})),
			createdAt: aggregate.item.createdAt.toISOString(),
			updatedAt: aggregate.item.updatedAt.toISOString(),
		};
	},

	toCustomerDetailsResponseDto(
		aggregate: MenuItemDetailsAggregate,
	): CustomerMenuItemDetailsResponseDto {
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
				price: a.price,
				priceOverride: a.priceOverride,
				imageKey: a.imageKey,
				isAvailable: a.isAvailable,
			})),
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

	toStaffMenuItemDto(item: StaffMenuItemResultItem): StaffMenuItemListItemDto {
		return {
			id: item.id,
			name: item.name,
			sku: item.sku,
			description: item.description,
			basePrice: item.basePrice,
			categoryId: item.categoryId,
			categoryName: item.categoryName,
			displayOrder: item.categoryDisplayOrder,
			isActive: item.categoryIsActive,
			isAvailable: item.isAvailable,
			unavailabilityReason: item.unavailabilityReason,
			autoResetAt: item.autoResetAt ? item.autoResetAt.toISOString() : null,
			variantCount: item.variantCount,
			hasVariants: item.hasVariants,
			variants: item.variants,
			updatedAt: item.updatedAt.toISOString(),
		};
	},

	toStaffMenuItemsResponse(
		restaurantId: string,
		items: StaffMenuItemResultItem[],
		total: number,
		page: number,
		limit: number,
	): StaffMenuItemsResponseDto {
		const totalPages = Math.ceil(total / limit) || 0;

		return {
			restaurantId,
			page,
			limit,
			totalCount: total,
			totalPages,
			items: items.map((item) => MenuItemMapper.toStaffMenuItemDto(item)),
		};
	},
};
