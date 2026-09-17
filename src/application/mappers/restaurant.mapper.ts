import type { RestaurantListItemDTO } from "@/application/dtos/admin/list-restaurants.dto.ts";
import type { Restaurant } from "@/domain/entities/restaurant.entity.ts";

export const RestaurantMapper = {
	toListItemDTO(entity: Restaurant): RestaurantListItemDTO {
		return {
			id: entity.id,
			restaurant: entity.restaurantName,
			restaurant_name: entity.restaurantName,
			owner: entity.ownerName,
			owner_name: entity.ownerName,
			contact: {
				email: entity.email,
				phone: entity.phone,
				owner_email: entity.ownerEmail,
			},
			plan: entity.subscriptionPlanCode ?? "NONE",
			subscription_plan_code: entity.subscriptionPlanCode,
			status: entity.status,
			is_subscription_active: entity.isSubscriptionActive,
			onboarding_status: entity.onboardingStatus,
			is_blocked: entity.isBlocked,
			block_reason: entity.blockReason,
			created_at: entity.createdAt.toISOString(),
			updated_at: entity.updatedAt.toISOString(),
			subscription_ends_at: entity.subscriptionEndsAt
				? entity.subscriptionEndsAt.toISOString()
				: null,
		};
	},
};
