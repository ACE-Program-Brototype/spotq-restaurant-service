export type MenuItemStatusFilter =
	| "ALL"
	| "AVAILABLE"
	| "OUT_OF_STOCK"
	| "available"
	| "out_of_stock";

export interface ListMenuItemsQueryDto {
	restaurantId: string;
	page?: number;
	limit?: number;
	search?: string;
	categoryId?: string;
	status?: MenuItemStatusFilter | string;
	minPrice?: number;
	maxPrice?: number;
	isVegetarian?: boolean;
	isFeatured?: boolean;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}

export interface MenuItemImageDto {
	id: string;
	objectKey: string;
	displayOrder: number;
}

export interface MenuItemVariantDto {
	id: string;
	name: string;
	price: number;
	sku: string | null;
	isDefault: boolean;
}

export interface MenuItemAddonDto {
	id: string;
	addonId: string;
	name: string;
	price: number;
	priceOverride: number | null;
}

export interface MenuItemListItemDto {
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
	createdAt: string;
	updatedAt: string;
}

export interface MenuItemStatsDto {
	totalCategories: number;
	totalMenuItems: number;
	availableItems: number;
	outOfStockItems: number;
}

export interface PaginationMetadataDto {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPrevPage: boolean;
}

export interface PaginatedMenuItemsResponseDto {
	stats: MenuItemStatsDto;
	items: MenuItemListItemDto[];
	pagination: PaginationMetadataDto;
}
