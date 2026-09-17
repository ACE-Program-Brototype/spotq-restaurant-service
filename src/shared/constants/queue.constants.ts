export const QUEUE_NAMES = {
	EMAIL: "email-queue",
	SUBSCRIPTION_EVENTS: "restaurant-subscription-events",
} as const;

export const JOB_NAMES = {
	EMAIL: {
		VERIFICATION_OTP: "verification-otp",
		TRANSACTIONAL: "send-email",
	},
	SUBSCRIPTION: {
		ACTIVATED: "subscription.activated",
	},
} as const;

export const QUEUE_CONFIG = {
	BACKOFF_TYPE: "exponential" as const,
	REMOVE_ON_COMPLETE: true,
} as const;
