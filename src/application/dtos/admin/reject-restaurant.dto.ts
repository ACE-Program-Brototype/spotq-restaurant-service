export interface RejectRestaurantDto {
	restaurantId: string;
	reason: string;
	adminId?: string;
}

export interface RejectRestaurantResponseDto {
	id: string;
	restaurantName: string;
	status: string;
	rejectionReason: string;
	reviewedBy: string;
	reviewedAt: Date;
}
