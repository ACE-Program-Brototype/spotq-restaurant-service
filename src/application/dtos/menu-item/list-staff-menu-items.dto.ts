export interface ListStaffMenuItemsQueryDto {
	restaurantId: string;
	categoryId?: string;
	isAvailable?: boolean;
	includeInactive?: boolean;
	includeVariants?: boolean;
	search?: string;
	page?: number;
	limit?: number;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
	userRole?: string;
}

export interface StaffMenuItemVariantDto {
	id: string;
	name: string;
	sku: string | null;
	price: number;
	isDefault: boolean;
	isAvailable: boolean;
}

export interface StaffMenuItemListItemDto {
	id: string;
	name: string;
	sku: string | null;
	description: string | null;
	basePrice: number;
	categoryId: string;
	categoryName: string;
	displayOrder: number;
	isActive: boolean;
	isAvailable: boolean;
	unavailabilityReason: string | null;
	autoResetAt: string | null;
	variantCount: number;
	hasVariants: boolean;
	variants: StaffMenuItemVariantDto[];
	updatedAt: string;
}

export interface StaffMenuItemsResponseDto {
	restaurantId: string;
	page: number;
	limit: number;
	totalCount: number;
	totalPages: number;
	items: StaffMenuItemListItemDto[];
}
