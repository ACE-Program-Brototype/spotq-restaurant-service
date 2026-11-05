export interface GetBatchRestaurantsInputDto {
	restaurantIds: string[];
}

export interface RestaurantBatchItemDto {
	id: string;
	restaurantName: string;
	ownerName: string;
	ownerEmail: string;
	email: string;
	phone: string;
	status: string;
	onboardingStatus: string;
	isBlocked: boolean;
	blockReason: string | null;
	isSubscriptionActive: boolean;
	subscriptionPlanCode: string | null;
	subscriptionEndsAt: string | null;
}
