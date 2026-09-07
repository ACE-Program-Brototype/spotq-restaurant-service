import { prisma } from "@/config/prisma.ts";

export interface RestaurantStatusOutput {
	restaurantId: string;
	restaurantName: string;
	verificationStatus: string;
	isSubscriptionActive: boolean;
	subscriptionPlanCode: string | null;
	subscriptionEndsAt: string | null;
	navigationTarget: string;
}

export class GetRestaurantStatusUseCase {
	async execute(restaurantId: string): Promise<RestaurantStatusOutput | null> {
		if (!restaurantId) return null;

		const restaurant = await prisma.restaurant.findUnique({
			where: { id: restaurantId },
			select: {
				id: true,
				restaurantName: true,
				status: true,
				isSubscriptionActive: true,
				subscriptionPlanCode: true,
				subscriptionEndsAt: true,
				isBlocked: true,
			},
		});

		if (!restaurant) return null;

		let navigationTarget = "/restaurant/dashboard";

		if (restaurant.status === "PENDING") {
			navigationTarget = "/restaurant/onboarding";
		} else if (restaurant.status === "REJECTED") {
			navigationTarget = "/restaurant/rejected";
		} else if (
			restaurant.status === "APPROVED" &&
			!restaurant.isSubscriptionActive
		) {
			navigationTarget = "/restaurant/subscription";
		} else if (restaurant.isSubscriptionActive) {
			navigationTarget = "/restaurant/dashboard";
		}

		return {
			restaurantId: restaurant.id,
			restaurantName: restaurant.restaurantName,
			verificationStatus: restaurant.status,
			isSubscriptionActive: restaurant.isSubscriptionActive,
			subscriptionPlanCode: restaurant.subscriptionPlanCode,
			subscriptionEndsAt: restaurant.subscriptionEndsAt
				? restaurant.subscriptionEndsAt.toISOString()
				: null,
			navigationTarget,
		};
	}
}

export const getRestaurantStatusUseCase = new GetRestaurantStatusUseCase();
