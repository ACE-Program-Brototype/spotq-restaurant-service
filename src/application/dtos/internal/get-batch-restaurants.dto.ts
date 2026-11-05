export interface GetBatchRestaurantsInputDTO {
	restaurantIds: string[];
}

export interface RestaurantBatchItemDTO {
	id: string;
	restaurantId: string;
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
