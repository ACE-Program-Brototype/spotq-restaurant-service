import type { OnboardingStatus } from "@/domain/value-objects/onboarding-status.vo.ts";
import type { RestaurantStatus } from "@/domain/value-objects/restaurant-status.vo.ts";
import type { SubscriptionPlan } from "@/domain/value-objects/subscription-plan.vo.ts";

export interface ListRestaurantsDTO {
	page?: number;
	limit?: number;
	search?: string;
	status?: RestaurantStatus;
	plan?: SubscriptionPlan;
	isSubscriptionActive?: boolean;
	onboardingStatus?: OnboardingStatus;
	createdFrom?: Date;
	createdTo?: Date;
	sortBy?:
		| "createdAt"
		| "restaurantName"
		| "ownerName"
		| "status"
		| "subscriptionPlanCode"
		| "updatedAt";
	sortOrder?: "asc" | "desc";
}

export interface RestaurantContactDTO {
	email: string;
	phone: string;
	owner_email: string;
}

export interface RestaurantListItemDTO {
	id: string;
	restaurant: string;
	restaurant_name: string;
	owner: string;
	owner_name: string;
	contact: RestaurantContactDTO;
	plan: string;
	subscription_plan_code: string | null;
	status: string;
	is_subscription_active: boolean;
	onboarding_status: string;
	is_blocked: boolean;
	block_reason: string | null;
	created_at: string;
	updated_at: string;
	subscription_ends_at: string | null;
}

export interface PaginationMetadataDTO {
	page: number;
	limit: number;
	total: number;
	total_pages: number;
	has_next_page: boolean;
	has_prev_page: boolean;
}

export interface PaginatedRestaurantsResponseDTO {
	restaurants: RestaurantListItemDTO[];
	pagination: PaginationMetadataDTO;
}
