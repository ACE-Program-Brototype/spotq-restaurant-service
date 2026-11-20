export interface RestaurantStatusOutput {
	restaurantId: string;
	restaurantName: string;
	verificationStatus: string;
	isSubscriptionActive: boolean;
	subscriptionPlanCode: string | null;
	subscriptionEndsAt: string | null;
	navigationTarget: string;
}
