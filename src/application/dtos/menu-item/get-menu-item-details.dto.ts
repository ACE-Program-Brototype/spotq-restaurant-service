export interface GetMenuItemDetailsInputDto {
	restaurantId: string;
	menuItemId: string;
}

export interface MenuItemDetailCategoryDto {
	id: string;
	name: string;
	description: string | null;
}

export interface MenuItemDetailImageDto {
	id: string;
	objectKey: string;
	displayOrder: number;
}

export interface MenuItemDetailVariantDto {
	id: string;
	sku: string | null;
	name: string;
	price: number;
	isDefault: boolean;
	isAvailable: boolean;
}

export interface MenuItemDetailAddonDto {
	id: string;
	addonId: string;
	name: string;
	description: string | null;
	price: number;
	priceOverride: number | null;
	imageKey: string | null;
	isAvailable: boolean;
}

export interface MenuItemDetailsResponseDto {
	id: string;
	restaurantId: string;
	categoryId: string;
	categoryName: string;
	category: MenuItemDetailCategoryDto | null;
	name: string;
	description: string | null;
	price: number;
	preparationTime: number | null;
	calories: number | null;
	isVegetarian: boolean;
	isFeatured: boolean;
	isAvailable: boolean;
	images: MenuItemDetailImageDto[];
	variants: MenuItemDetailVariantDto[];
	addons: MenuItemDetailAddonDto[];
	createdAt: string;
	updatedAt: string;
}
