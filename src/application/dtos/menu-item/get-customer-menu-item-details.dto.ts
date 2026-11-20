export interface GetCustomerMenuItemDetailsInputDto {
	restaurantId: string;
	menuItemId: string;
}

export interface CustomerMenuItemDetailCategoryDto {
	id: string;
	name: string;
	description: string | null;
}

export interface CustomerMenuItemDetailImageDto {
	id: string;
	objectKey: string;
	displayOrder: number;
}

export interface CustomerMenuItemDetailVariantDto {
	id: string;
	sku: string | null;
	name: string;
	price: number;
	isDefault: boolean;
	isAvailable: boolean;
}

export interface CustomerMenuItemDetailAddonDto {
	id: string;
	addonId: string;
	name: string;
	description: string | null;
	price: number;
	priceOverride: number | null;
	imageKey: string | null;
	isAvailable: boolean;
}

export interface CustomerMenuItemDetailsResponseDto {
	id: string;
	restaurantId: string;
	categoryId: string;
	categoryName: string;
	category: CustomerMenuItemDetailCategoryDto | null;
	name: string;
	description: string | null;
	price: number;
	preparationTime: number | null;
	calories: number | null;
	isVegetarian: boolean;
	isFeatured: boolean;
	images: CustomerMenuItemDetailImageDto[];
	variants: CustomerMenuItemDetailVariantDto[];
	addons: CustomerMenuItemDetailAddonDto[];
}
