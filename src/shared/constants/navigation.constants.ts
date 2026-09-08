export const RESTAURANT_NAVIGATION_TARGETS = {
	DASHBOARD: "/restaurant/dashboard",
	ONBOARDING: "/restaurant/onboarding",
	SUBSCRIPTION: "/restaurant/subscription",
	REJECTED: "/restaurant/rejected",
} as const;

export type RestaurantNavigationTarget =
	(typeof RESTAURANT_NAVIGATION_TARGETS)[keyof typeof RESTAURANT_NAVIGATION_TARGETS];
