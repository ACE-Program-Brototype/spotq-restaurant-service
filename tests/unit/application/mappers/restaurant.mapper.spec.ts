import { describe, expect, it } from "@jest/globals";
import { RestaurantMapper } from "@/application/mappers/restaurant.mapper.ts";
import { Restaurant } from "@/domain/entities/restaurant.entity.ts";

describe("RestaurantMapper", () => {
	it("should map Restaurant entity to snake_case RestaurantListItemDTO", () => {
		const restaurant = Restaurant.reconstitute({
			id: "rest-uuid-1",
			restaurantName: "The Gourmet Grill",
			email: "info@gourmetgrill.com",
			phone: "+919876543210",
			ownerName: "Robert Chef",
			ownerEmail: "robert@gourmetgrill.com",
			status: "ACTIVE",
			onboardingStatus: "COMPLETED",
			emailVerifiedAt: new Date("2026-01-01T00:00:00.000Z"),
			isSubscriptionActive: true,
			subscriptionPlanCode: "ENTERPRISE",
			subscriptionEndsAt: new Date("2027-01-01T00:00:00.000Z"),
			isBlocked: false,
			blockReason: null,
			createdAt: new Date("2026-01-01T00:00:00.000Z"),
			updatedAt: new Date("2026-01-02T00:00:00.000Z"),
		});

		const dto = RestaurantMapper.toListItemDTO(restaurant);

		expect(dto).toEqual({
			id: "rest-uuid-1",
			restaurant: "The Gourmet Grill",
			restaurant_name: "The Gourmet Grill",
			owner: "Robert Chef",
			owner_name: "Robert Chef",
			contact: {
				email: "info@gourmetgrill.com",
				phone: "+919876543210",
				owner_email: "robert@gourmetgrill.com",
			},
			plan: "ENTERPRISE",
			subscription_plan_code: "ENTERPRISE",
			status: "ACTIVE",
			is_subscription_active: true,
			onboarding_status: "COMPLETED",
			is_blocked: false,
			block_reason: null,
			created_at: "2026-01-01T00:00:00.000Z",
			updated_at: "2026-01-02T00:00:00.000Z",
			subscription_ends_at: "2027-01-01T00:00:00.000Z",
		});
	});

	it("should default plan to 'NONE' when subscriptionPlanCode is null", () => {
		const restaurant = Restaurant.reconstitute({
			id: "rest-uuid-2",
			restaurantName: "Free Diner",
			email: "info@freediner.com",
			phone: "+919876543210",
			ownerName: "Sam Free",
			ownerEmail: "sam@freediner.com",
			status: "PENDING",
			onboardingStatus: "PENDING",
			emailVerifiedAt: null,
			isSubscriptionActive: false,
			subscriptionPlanCode: null,
			subscriptionEndsAt: null,
			isBlocked: false,
			blockReason: null,
			createdAt: new Date("2026-01-01T00:00:00.000Z"),
			updatedAt: new Date("2026-01-01T00:00:00.000Z"),
		});

		const dto = RestaurantMapper.toListItemDTO(restaurant);

		expect(dto.plan).toBe("NONE");
		expect(dto.subscription_plan_code).toBeNull();
		expect(dto.subscription_ends_at).toBeNull();
	});
});
