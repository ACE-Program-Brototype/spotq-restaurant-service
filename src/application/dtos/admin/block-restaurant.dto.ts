export interface BlockRestaurantDto {
	restaurantId: string;
	reason: string;
	adminId?: string;
}

export interface BlockRestaurantResponseDto {
	id: string;
	restaurantName: string;
	status: string;
	isBlocked: boolean;
	blockReason: string | null;
	updatedAt: Date;
}
