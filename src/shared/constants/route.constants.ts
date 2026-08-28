export const SYSTEM_ROUTES = {
	HEALTH: "/health",
	READY: "/ready",
	METRICS: "/metrics",
} as const;

export const RESTAURANT_ROUTES = {
	EMAIL_OTP: "/registration/email-otp",
	VERIFY_EMAIL: "/registration/email-otp/verify",
	RESEND_EMAIL_OTP: "/registration/resend-email-otp",
	ONBOARD: "/onboarding",
} as const;

export type RestaurantRoute =
	(typeof RESTAURANT_ROUTES)[keyof typeof RESTAURANT_ROUTES];

export type SystemRoute = (typeof SYSTEM_ROUTES)[keyof typeof SYSTEM_ROUTES];
