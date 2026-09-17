export interface UpdateRestaurantDto {
	name?: string;
	phone?: string;
	ownerName?: string;
}

export interface UpdateProfileDto {
	logoKey?: string | null;
	coverImageKey?: string | null;
	description?: string | null;
	cuisineType?: string | null;
	averageCost?: number;
}

export interface UpdateSettingsDto {
	isOpened?: boolean;
	isPreorder?: boolean;
	seatingCapacity?: number;
	acceptsQueue?: boolean;
	acceptsQrOrders?: boolean;
	loyaltyEnabled?: boolean;
	autoAcceptQueue?: boolean;
}

export interface UpdateBusinessHoursItemDto {
	dayOfWeek: number;
	openTime?: string | null;
	closeTime?: string | null;
	isClosed?: boolean;
}

export interface UpdateRestaurantProfileDto {
	restaurant?: UpdateRestaurantDto;
	profile?: UpdateProfileDto;
	settings?: UpdateSettingsDto;
	businessHours?: UpdateBusinessHoursItemDto[];
}
