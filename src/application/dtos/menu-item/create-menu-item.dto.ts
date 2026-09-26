export interface CreateMenuItemImageInputDto {
	objectKey: string;
	displayOrder?: number;
}

export interface CreateMenuItemVariantInputDto {
	sku?: string | null;
	name: string;
	price: number;
	isDefault?: boolean;
}

export interface CreateMenuItemAddonInputDto {
	addonId: string;
	priceOverride?: number | null;
}

export interface CreateMenuItemInputDto {
	restaurantId: string;
	categoryId: string;
	name: string;
	description?: string | null;
	price?: number;
	preparationTime?: number | null;
	calories?: number | null;
	isVegetarian?: boolean;
	isFeatured?: boolean;
	isAvailable?: boolean;
	images?: CreateMenuItemImageInputDto[];
	variants?: CreateMenuItemVariantInputDto[];
	addons?: CreateMenuItemAddonInputDto[];
}

export interface MenuItemImageResponseDto {
	id: string;
	objectKey: string;
	displayOrder: number;
}

export interface MenuItemVariantResponseDto {
	id: string;
	sku: string | null;
	name: string;
	price: number;
	isDefault: boolean;
}

export interface MenuItemAddonResponseDto {
	id: string;
	addonId: string;
	name: string;
	price: number;
	priceOverride: number | null;
}

export interface MenuItemResponseDto {
	id: string;
	restaurantId: string;
	categoryId: string;
	name: string;
	description: string | null;
	price: number;
	preparationTime: number | null;
	calories: number | null;
	isVegetarian: boolean;
	isFeatured: boolean;
	isAvailable: boolean;
	images: MenuItemImageResponseDto[];
	variants: MenuItemVariantResponseDto[];
	addons: MenuItemAddonResponseDto[];
	createdAt: string;
	updatedAt: string;
}
