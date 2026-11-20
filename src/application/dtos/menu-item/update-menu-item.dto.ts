export interface UpdateMenuItemImageInputDto {
	id?: string;
	objectKey: string;
	displayOrder?: number;
}

export interface UpdateMenuItemVariantInputDto {
	id?: string;
	sku?: string | null;
	name: string;
	price: number;
	isDefault?: boolean;
	isAvailable?: boolean;
}

export interface UpdateMenuItemAddonInputDto {
	addonId: string;
	priceOverride?: number | null;
}

export interface UpdateMenuItemInputDto {
	restaurantId: string;
	menuItemId: string;
	categoryId?: string;
	name?: string;
	description?: string | null;
	price?: number;
	preparationTime?: number | null;
	calories?: number | null;
	isVegetarian?: boolean;
	isFeatured?: boolean;
	isAvailable?: boolean;
	images?: UpdateMenuItemImageInputDto[];
	variants?: UpdateMenuItemVariantInputDto[];
	addons?: UpdateMenuItemAddonInputDto[];
}
