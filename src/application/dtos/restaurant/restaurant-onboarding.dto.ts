export interface DocumentItemDto {
	documentName: string;
	documentKey: string;
}

export interface OnboardDocumentsDto {
	fssai: DocumentItemDto;
	businessRegistration: DocumentItemDto;
	ownerIdentity: DocumentItemDto;
	gst: DocumentItemDto;
	businessPan: DocumentItemDto;
}

export interface OnboardImageDto {
	objectKey: string;
	fileName?: string;
	displayOrder: number;
}

export interface OnboardLocationDto {
	addressLine1: string;
	addressLine2?: string;
	city: string;
	state: string;
	country: string;
	pincode: string;
	latitude: number;
	longitude: number;
}

export interface OnboardRestaurantDto {
	restaurantName: string;
	phone: string;
	ownerName: string;
	seatingCapacity?: number;
	documents?: OnboardDocumentsDto;
	restaurantImages?: OnboardImageDto[];
	location?: OnboardLocationDto;
}

export interface CreateRestaurantDto {
	restaurantName: string;
	email: string;
	phone: string;
	ownerName: string;
	ownerEmail: string;
	emailVerifiedAt: Date;
}
