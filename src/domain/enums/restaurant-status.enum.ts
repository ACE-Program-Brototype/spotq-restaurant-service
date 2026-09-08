export const RESTAURANT_STATUS = {
	PENDING: "PENDING",
	APPROVED: "APPROVED",
	REJECTED: "REJECTED",
	SUSPENDED: "SUSPENDED",
	ACTIVE: "ACTIVE",
	INACTIVE: "INACTIVE",
} as const;

export type RestaurantStatus =
	(typeof RESTAURANT_STATUS)[keyof typeof RESTAURANT_STATUS];

export const ONBOARDING_STATUS = {
	PENDING: "PENDING",
	COMPLETED: "COMPLETED",
} as const;

export type OnboardingStatus =
	(typeof ONBOARDING_STATUS)[keyof typeof ONBOARDING_STATUS];
