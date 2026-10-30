export interface CustomerRestaurantDetailsInputDTO {
	restaurantId: string;
	includeMenu?: boolean;
	categoryId?: string;
	userId?: string;
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

export interface CustomerRestaurantQueueMembershipDTO {
	hasActiveQueue: boolean;
	isCurrentRestaurantQueue: boolean;
	queueEntryId?: string | null;
	queueNumber?: string | null;
	partySize?: number | null;
	status?: string | null;
	position?: number | null;
	estimatedWaitMinutes?: number | null;
	joinedAt?: Date | string | null;
}

export interface CustomerRestaurantQueueStatusDTO {
	hasJoinedAnyQueue: boolean | null;
	hasJoinedThisRestaurantQueue: boolean | null;
	isGuestUser: boolean;
	isQueueStatusAvailable: boolean;
}

export interface CustomerRestaurantDetailsOutputDTO {
	restaurantId: string;
	restaurantName: string;
	phone: string;
	email: string;
	type: string;
	description: string | null;
	cuisineType: string | null;
	averageCost: number | null;
	coverImage: string | null;
	address: CustomerRestaurantAddressDTO | null;
	settings: CustomerRestaurantSettingsDTO | null;
	operatingHours: CustomerRestaurantOperatingHourDTO[];
	images: CustomerRestaurantImageDTO[];
	menu: CustomerRestaurantMenuCategoryDTO[];
	queue: CustomerRestaurantQueueStatusDTO | null;
}
