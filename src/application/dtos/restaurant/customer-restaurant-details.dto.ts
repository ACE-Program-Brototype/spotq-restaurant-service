export interface CustomerRestaurantDetailsInputDTO {
	restaurantId: string;
	includeMenu?: boolean;
	categoryId?: string;
}

export interface CustomerRestaurantAddressDTO {
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

export interface CustomerRestaurantSettingsDTO {
	isOpened: boolean;
	isPreorder: boolean;
	acceptsQueue: boolean;
	acceptsQrOrders: boolean;
}

export interface CustomerRestaurantOperatingHourDTO {
	id: string;
	dayOfWeek: number;
	isOpen: boolean;
	isClosed: boolean;
	openTime: string | null;
	closeTime: string | null;
}

export interface CustomerRestaurantImageDTO {
	id: string;
	objectKey: string;
	displayOrder: number;
}

export interface CustomerRestaurantVariantDTO {
	id: string;
	sku: string | null;
	name: string;
	price: number;
	isDefault: boolean;
	isAvailable: boolean;
}

export interface CustomerRestaurantAddonDTO {
	id: string;
	addonId: string;
	name: string;
	description: string | null;
	price: number;
	priceOverride: number | null;
	imageKey: string | null;
	isAvailable: boolean;
}

export interface CustomerRestaurantMenuItemImageDTO {
	id: string;
	objectKey: string;
	displayOrder: number;
}

export interface CustomerRestaurantMenuItemDTO {
	id: string;
	name: string;
	description: string | null;
	price: number;
	preparationTime: number | null;
	calories: number | null;
	isVegetarian: boolean;
	isFeatured: boolean;
	isAvailable: boolean;
	images: CustomerRestaurantMenuItemImageDTO[];
	variants: CustomerRestaurantVariantDTO[];
	addons: CustomerRestaurantAddonDTO[];
}

export interface CustomerRestaurantMenuCategoryDTO {
	id: string;
	name: string;
	description: string | null;
	displayOrder: number;
	items: CustomerRestaurantMenuItemDTO[];
}

export interface CustomerRestaurantDetailsOutputDTO {
	id: string;
	restaurantName: string;
	phone: string;
	email: string;
	description: string | null;
	cuisineType: string | null;
	averageCost: number | null;
	coverImage: string | null;
	address: CustomerRestaurantAddressDTO | null;
	settings: CustomerRestaurantSettingsDTO | null;
	operatingHours: CustomerRestaurantOperatingHourDTO[];
	images: CustomerRestaurantImageDTO[];
	menu: CustomerRestaurantMenuCategoryDTO[];
}
