export interface OnboardRestaurantDto {
	restaurantName: string;
	phone: string;
	ownerName: string;
}

//repo dto
export interface CreateRestaurantDto {
	restaurantName: string;
	email: string;
	phone: string;
	ownerName: string;
	ownerEmail: string;
	emailVerifiedAt: Date;
}
