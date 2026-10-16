import type { RestaurantStatus } from "@/domain/value-objects/restaurant-status.vo.ts";

export interface RestaurantValidationResultDto {
	restaurantId: string;
	restaurantName: string;
	verificationStatus: RestaurantStatus;
	isBlocked: boolean;
	blockReason: string | null;
	isSubscriptionActive: boolean;
	subscriptionPlanCode: string | null;
	subscriptionEndsAt: string | null;
	canAccessQueueService: boolean;
}
