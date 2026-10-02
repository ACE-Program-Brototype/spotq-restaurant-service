import type { MenuItem } from "@/domain/entities/menu-item.entity.ts";
import type { MenuItemVariant } from "@/domain/entities/menu-item-variant.entity.ts";
import type { IBaseRepository } from "@/domain/repositories/base.repository.interface.ts";

export interface MenuItemImageData {
	id: string;
	menuItemId: string;
	objectKey: string;
	displayOrder: number;
	createdAt: Date;
}

export interface MenuItemAddonLinkData {
	id: string;
	menuItemId: string;
	addonId: string;
	name: string;
	price: number;
	priceOverride: number | null;
}

export interface MenuItemAggregate {
	item: MenuItem;
	images: MenuItemImageData[];
	variants: MenuItemVariant[];
	addons: MenuItemAddonLinkData[];
}

export interface CreateMenuItemRepositoryParams {
	menuItem: MenuItem;
	images: Array<{ objectKey: string; displayOrder: number }>;
	variants: MenuItemVariant[];
	addons: Array<{
		addonId: string;
		priceOverride: number | null;
	}>;
}

export interface MenuItemQueryFilterParams {
	restaurantId: string;
	categoryId?: string;
	categoryIsActive?: boolean;
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

export interface MenuItemDetailsCategoryData {
	id: string;
	name: string;
	description: string | null;
	isActive: boolean;
}

export interface MenuItemDetailsAddonData {
	id: string;
	menuItemId: string;
	addonId: string;
	name: string;
	description: string | null;
	price: number;
	priceOverride: number | null;
	imageKey: string | null;
	isAvailable: boolean;
	isDeleted: boolean;
}

export interface MenuItemDetailsAggregate {
	item: MenuItem;
	category: MenuItemDetailsCategoryData | null;
	images: MenuItemImageData[];
	variants: MenuItemVariant[];
	addons: MenuItemDetailsAddonData[];
}

export interface StaffMenuItemVariantData {
	id: string;
	name: string;
	sku: string | null;
	price: number;
	isDefault: boolean;
	isAvailable: boolean;
}

export interface StaffMenuItemResultItem {
	id: string;
	name: string;
	sku: string | null;
	description: string | null;
	basePrice: number;
	categoryId: string;
	categoryName: string;
	categoryDisplayOrder: number;
	categoryIsActive: boolean;
	isAvailable: boolean;
	unavailabilityReason: string | null;
	autoResetAt: Date | null;
	variantCount: number;
	hasVariants: boolean;
	variants: StaffMenuItemVariantData[];
	createdAt: Date;
	updatedAt: Date;
}

export interface StaffMenuItemQueryFilterParams {
	restaurantId: string;
	categoryId?: string;
	isAvailable?: boolean;
	includeInactive?: boolean;
	includeVariants?: boolean;
	search?: string;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
	page?: number;
	limit?: number;
}

export interface StaffMenuItemQueryResult {
	items: StaffMenuItemResultItem[];
	total: number;
}

export interface IMenuItemRepository extends IBaseRepository<MenuItem, string> {
	createWithDetails(
		params: CreateMenuItemRepositoryParams,
	): Promise<MenuItemAggregate>;
	findById(id: string): Promise<MenuItem | null>;
	findByIdAndRestaurantId(
		menuItemId: string,
		restaurantId: string,
	): Promise<MenuItemDetailsAggregate | null>;
	findByNameAndRestaurantId(
		nameOrRestaurantId: string,
		restaurantIdOrName: string,
	): Promise<MenuItem | null>;
	findManyWithFiltersAndStats(
		params: MenuItemQueryFilterParams,
	): Promise<MenuItemQueryResult>;
	findManyStaffMenuItems(
		params: StaffMenuItemQueryFilterParams,
	): Promise<StaffMenuItemQueryResult>;
	getRestaurantMenuStats(restaurantId: string): Promise<RestaurantMenuStats>;
}
