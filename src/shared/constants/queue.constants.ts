export const QUEUE_NAMES = {
	EMAIL: "email",
	SUBSCRIPTION_EVENTS: "restaurant-subscription-events",
} as const;

export const JOB_NAMES = {
	EMAIL: {
		VERIFICATION_OTP: "verification-otp",
	},
	SUBSCRIPTION: {
		ACTIVATED: "subscription.activated",
	},
} as const;
