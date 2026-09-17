export interface RestaurantAddressDto {
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

export interface RestaurantStaffMemberDto {
	id: string;
	fullname: string;
	email: string;
	phone: string;
	role: string;
	status: string;
	avatarUrl: string | null;
	createdAt: Date;
}

export interface RestaurantDocumentDto {
	id: string;
	documentType: string;
	documentName: string;
	documentKey: string;
	verificationStatus: string;
	uploadedAt: Date;
}

export interface RestaurantImageDto {
	id: string;
	objectKey: string;
	displayOrder: number;
	createdAt: Date;
}

export interface RestaurantOperatingHourDto {
	id: string;
	dayOfWeek: number;
	isOpen: boolean;
	openTime: Date | null;
	closeTime: Date | null;
}

export interface RestaurantSettingsDto {
	isOpened: boolean;
	isPreorder: boolean;
	isLoyaltyEnabled: boolean;
	cuisineType: string | null;
	seatingCapacity: number | null;
	openTime: Date | null;
	closeTime: Date | null;
}

export interface RestaurantProfileDto {
	coverImage: string | null;
	avatar: string | null;
	description: string | null;
	fssaiNumber: string | null;
	registerNumber: string | null;
	gstNumber: string | null;
}

export interface LinkedAccountDto {
	email: string;
	phone: string;
	isEmailVerified: boolean;
	lastLoginAt: Date | null;
}

export interface RestaurantDetailsResponseDto {
	id: string;
	restaurantName: string;
	category: string | null;
	email: string;
	phone: string;
	ownerName: string;
	ownerEmail: string;
	status: string;
	onboardingStatus: string;
	isBlocked: boolean;
	blockReason: string | null;
	isSubscriptionActive: boolean;
	subscriptionPlanCode: string | null;
	subscriptionEndsAt: Date | null;
	lastLoginAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
	address: RestaurantAddressDto | null;
	settings: RestaurantSettingsDto | null;
	profile: RestaurantProfileDto | null;
	operatingHours: RestaurantOperatingHourDto[];
	staff: RestaurantStaffMemberDto[];
	documents: RestaurantDocumentDto[];
	images: RestaurantImageDto[];
	linkedAccount: LinkedAccountDto;
}
