export const SYSTEM_ROUTES = {
	HEALTH: "/health",
	READY: "/ready",
	METRICS: "/metrics",
} as const;

export const RESTAURANT_ROUTES = {
	EMAIL_OTP: "/registration/email-otp",
	VERIFY_EMAIL: "/registration/email-otp/verify",
	RESEND_EMAIL_OTP: "/registration/resend-email-otp",
	REFRESH_ACCESS_TOKEN: "/auth/refresh",
	ONBOARD: "/onboard",
} as const;

export const STAFF_ROUTES = {
	BASE: "/staff",
	LOGIN: "/login",
	LOGOUT: "/logout",
	REFRESH_TOKEN: "/refresh-token",
	FORGOT_PASSWORD: "/forgot-password",
	VERIFY_FORGOT_PASSWORD_OTP: "/forgot-password/verify",
	RESEND_FORGOT_PASSWORD_OTP: "/forgot-password/resend-otp",
	RESET_PASSWORD: "/reset-password",
} as const;

export type RestaurantRoute =
	(typeof RESTAURANT_ROUTES)[keyof typeof RESTAURANT_ROUTES];

export type SystemRoute = (typeof SYSTEM_ROUTES)[keyof typeof SYSTEM_ROUTES];

export type StaffRoute = (typeof STAFF_ROUTES)[keyof typeof STAFF_ROUTES];
