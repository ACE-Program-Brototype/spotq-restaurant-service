export interface GetInternalMenuItemDetailsInputDto {
	restaurantId: string;
	menuItemId: string;
}

export interface InternalMenuItemDetailCategoryDto {
	id: string;
	name: string;
	description: string | null;
}

export interface InternalMenuItemDetailImageDto {
	id: string;
	objectKey: string;
	displayOrder: number;
}

export interface InternalMenuItemDetailVariantDto {
	id: string;
	sku: string | null;
	name: string;
	price: number;
	isDefault: boolean;
	isAvailable: boolean;
}

export interface InternalMenuItemDetailAddonDto {
	id: string;
	addonId: string;
	name: string;
	description: string | null;
	price: number;
	priceOverride: number | null;
	imageKey: string | null;
	isAvailable: boolean;
}

export interface InternalMenuItemDetailsResponseDto {
	id: string;
	restaurantId: string;
	categoryId: string;
	categoryName: string;
	category: InternalMenuItemDetailCategoryDto | null;
	name: string;
	description: string | null;
	price: number;
	preparationTime: number | null;
	calories: number | null;
	isVegetarian: boolean;
	isFeatured: boolean;
	isAvailable: boolean;
	images: InternalMenuItemDetailImageDto[];
	variants: InternalMenuItemDetailVariantDto[];
	addons: InternalMenuItemDetailAddonDto[];
}
