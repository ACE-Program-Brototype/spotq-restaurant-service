export interface RestaurantDetailsDto {
	name: string;
	phone: string;
	ownerName: string;
}

export interface ProfileDetailsDto {
	logo: string | null;
	coverImage: string | null;
	description: string | null;
	cuisineType: string | null;
	averageCost: number;
}

export interface SettingsDetailsDto {
	acceptsQueue: boolean;
	acceptsQrOrders: boolean;
	loyaltyEnabled: boolean;
	autoAcceptQueue: boolean;
}

export interface BusinessHoursItemDto {
	dayOfWeek: number;
	openTime: string | null;
	closeTime: string | null;
	isClosed: boolean;
}

export interface RestaurantProfileResponseDto {
	restaurant: RestaurantDetailsDto;
	profile: ProfileDetailsDto;
	settings: SettingsDetailsDto;
	businessHours: BusinessHoursItemDto[];
}
