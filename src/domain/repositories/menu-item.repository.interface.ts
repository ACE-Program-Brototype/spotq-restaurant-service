import type { MenuItem } from "@/domain/entities/menu-item.entity.ts";
import type { IBaseRepository } from "@/domain/repositories/base.repository.interface.ts";

export interface MenuItemQueryFilterParams {
	restaurantId: string;
	categoryId?: string;
	search?: string;
	isAvailable?: boolean;
	isVegetarian?: boolean;
	isFeatured?: boolean;
	minPrice?: number;
	maxPrice?: number;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
	page?: number;
	limit?: number;
}

export interface MenuItemWithRelations {
	id: string;
	restaurantId: string;
	categoryId: string;
	categoryName: string;
	name: string;
	price: number;
	isVegetarian: boolean;
	isFeatured: boolean;
	isAvailable: boolean;
	image: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface RestaurantMenuStats {
	totalCategories: number;
	totalMenuItems: number;
	availableItems: number;
	outOfStockItems: number;
}

export interface MenuItemQueryResult {
	items: MenuItemWithRelations[];
	total: number;
	stats: RestaurantMenuStats;
}

export interface IMenuItemRepository extends IBaseRepository<MenuItem, string> {
	findByNameAndRestaurantId(
		restaurantId: string,
		name: string,
	): Promise<MenuItem | null>;
	findManyWithFiltersAndStats(
		params: MenuItemQueryFilterParams,
	): Promise<MenuItemQueryResult>;
	getRestaurantMenuStats(restaurantId: string): Promise<RestaurantMenuStats>;
}
