export interface CustomerRestaurantDetailsInputDto {
	restaurantId: string;
	includeMenu?: boolean;
	categoryId?: string;
}

export interface CustomerRestaurantAddressDto {
	id: string;
	addressLine1: string;
	addressLine2: string | null;
	city: string;
	state: string;
	country: string;
	pincode: string;
	latitude: number;
	longitude: number;
}

export interface CustomerRestaurantSettingsDto {
	isOpened: boolean;
	isPreorder: boolean;
	acceptsQueue: boolean;
	acceptsQrOrders: boolean;
}

export interface CustomerRestaurantOperatingHourDto {
	id: string;
	dayOfWeek: number;
	isOpen: boolean;
	isClosed: boolean;
	openTime: string | null;
	closeTime: string | null;
}

export interface CustomerRestaurantImageDto {
	id: string;
	objectKey: string;
	displayOrder: number;
}

export interface CustomerRestaurantVariantDto {
	id: string;
	sku: string | null;
	name: string;
	price: number;
	isDefault: boolean;
	isAvailable: boolean;
}

export interface CustomerRestaurantAddonDto {
	id: string;
	addonId: string;
	name: string;
	description: string | null;
	price: number;
	priceOverride: number | null;
	imageKey: string | null;
	isAvailable: boolean;
}

export interface CustomerRestaurantMenuItemImageDto {
	id: string;
	objectKey: string;
	displayOrder: number;
}

export interface CustomerRestaurantMenuItemDto {
	id: string;
	name: string;
	description: string | null;
	price: number;
	preparationTime: number | null;
	calories: number | null;
	isVegetarian: boolean;
	isFeatured: boolean;
	isAvailable: boolean;
	images: CustomerRestaurantMenuItemImageDto[];
	variants: CustomerRestaurantVariantDto[];
	addons: CustomerRestaurantAddonDto[];
}

export interface CustomerRestaurantMenuCategoryDto {
	id: string;
	name: string;
	description: string | null;
	displayOrder: number;
	items: CustomerRestaurantMenuItemDto[];
}

export interface CustomerRestaurantDetailsOutputDto {
	id: string;
	restaurantName: string;
	phone: string;
	email: string;
	description: string | null;
	cuisineType: string | null;
	averageCost: number | null;
	coverImage: string | null;
	address: CustomerRestaurantAddressDto | null;
	settings: CustomerRestaurantSettingsDto | null;
	operatingHours: CustomerRestaurantOperatingHourDto[];
	images: CustomerRestaurantImageDto[];
	menu: CustomerRestaurantMenuCategoryDto[];
}
