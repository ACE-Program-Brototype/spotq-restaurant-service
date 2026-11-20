export interface ApproveRestaurantDto {
	restaurantId: string;
	adminId?: string;
}

export interface ApproveRestaurantResponseDto {
	id: string;
	restaurantName: string;
	status: string;
	reviewedBy: string;
	reviewedAt: Date;
}
