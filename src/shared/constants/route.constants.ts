export const SYSTEM_ROUTES = {
	HEALTH: "/health",
	READY: "/ready",
	METRICS: "/metrics",
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
