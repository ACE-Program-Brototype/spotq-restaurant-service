export const SYSTEM_ROUTES = {
	HEALTH: "/health",
	READY: "/ready",
	METRICS: "/metrics",
} as const;

export const RESTAURANT_ROUTES = {
	EMAIL_OTP: "/registration/email-otp",
	VERIFY_EMAIL: "/registration/email-otp/verify",
	RESEND_EMAIL_OTP: "/registration/resend-email-otp",
	REFRESH_ACCESS_TOKEN: "/refresh-token",
	REGISTRATION_REFRESH_TOKEN: "/registration/refresh-token",
	ONBOARD: "/onboard",
	STAFF_STATUS_UPDATE: "/:restaurantId/staff/:staffId/status",
	STAFF_UPDATE: "/:restaurantId/staff/:staffId",
	STAFF_LIST: "/:restaurantId/staff",
	UPDATE_STAFF_PROFILE: "/:restaurantId/staff/:staffId",
	STATUS: "/me/status",
	VERIFICATION_STATUS: "/verification-status",
	STAFF_REMOVE: "/:restaurantId/staff/:staffId",
	VERIFICATION_STATUS_BY_ID: "/:id/verification-status",
	PROFILE: "/profile",
	STAFF_DETAIL: "/:restaurantId/staff/:staffId",
	STAFF_DETAIL_FULL: "/api/v1/restaurants/:restaurantId/staff/:staffId",
	STAFF_DETAIL_PREFIX: "/restaurants/:restaurantId/staff/:staffId",
} as const;

export const STAFF_ROUTES = {
	BASE: "/staff",
	LOGIN: "/login",
	SELECT_RESTAURANT: "/select-restaurant",
	LOGOUT: "/logout",
	REFRESH_TOKEN: "/refresh-token",
	FORGOT_PASSWORD: "/forgot-password",
	VERIFY_FORGOT_PASSWORD_OTP: "/forgot-password/verify",
	RESEND_FORGOT_PASSWORD_OTP: "/forgot-password/resend-otp",
	RESET_PASSWORD: "/reset-password",
	INVITATIONS: "/invitations",
	VALIDATE_INVITATION: "/invitations/validate",
	ACCEPT_INVITATION: "/invitations/accept",
	RESEND_INVITATION: "/invitations/resend",
	REVOKE_INVITATION: "/invitations/revoke",
	GET_PROFILE: "/profile/me",
} as const;

export const STORAGE_ROUTES = {
	BASE: "/storage",
	PRESIGNED_URL: "/presigned-url",
} as const;

export const ADMIN_ROUTES = {
	BASE: "/admin",
	APPLICATIONS: "/restaurants/applications",
	APPLICATION_DETAILS: "/restaurants/applications/:id",
	APPROVE_RESTAURANT: "/restaurants/:id/approve",
	REJECT_RESTAURANT: "/restaurants/:id/reject",
	RESTAURANTS: "/restaurants",
	GET_RESTAURANT_DETAILS: "/restaurants/:id",
	BLOCK_RESTAURANT: "/restaurants/:id/block",
	UNBLOCK_RESTAURANT: "/restaurants/:id/unblock",
} as const;

export type RestaurantRoute =
	(typeof RESTAURANT_ROUTES)[keyof typeof RESTAURANT_ROUTES];

export type SystemRoute = (typeof SYSTEM_ROUTES)[keyof typeof SYSTEM_ROUTES];

export type StaffRoute = (typeof STAFF_ROUTES)[keyof typeof STAFF_ROUTES];

export type StorageRoute = (typeof STORAGE_ROUTES)[keyof typeof STORAGE_ROUTES];
export type AdminRoute = (typeof ADMIN_ROUTES)[keyof typeof ADMIN_ROUTES];
