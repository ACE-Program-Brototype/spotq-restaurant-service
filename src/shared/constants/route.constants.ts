export const SYSTEM_ROUTES = {
	HEALTH: "/health",
	READY: "/ready",
	METRICS: "/metrics",
} as const;

export const RESTAURANT_ROUTES = {
	EMAIL_OTP: "/otp",
	VERIFY_EMAIL: "/otp/verify",
	RESEND_EMAIL_OTP: "/otp/resend",
	REFRESH_ACCESS_TOKEN: "/refresh-token",
	REGISTRATION_REFRESH_TOKEN: "/refresh-token",
	ONBOARD: "/onboarding",
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
	RESTAURANT_ADDONS: "/:restaurantId/addons",
	RESTAURANT_ADDON_UPDATE: "/:restaurantId/addons/:addonId",
	RESTAURANT_ADDON_DELETE: "/:restaurantId/addons/:addonId",
	MENU_CATEGORIES: "/:restaurantId/menu/categories",
	MENU_CATEGORY_UPDATE: "/:restaurantId/menu/categories/:categoryId",
	MENU_CATEGORY_STATUS_UPDATE:
		"/:restaurantId/menu/categories/:categoryId/status",
	MENU_CATEGORY_DELETE: "/:restaurantId/menu/categories/:categoryId",
	MENU_ITEMS: "/:restaurantId/menu/items",
	MENU_ITEM_DETAIL: "/:restaurantId/menu/items/:menuItemId",
	MENU_ITEM_UPDATE: "/:restaurantId/menu/items/:menuItemId",
	STAFF_MENU_ITEMS: "/:restaurantId/staff/menu/items",
	STAFF_MENU_ITEMS_PREFIX: "/restaurants/:restaurantId/staff/menu/items",
	STAFF_MENU_CATEGORIES: "/:restaurantId/staff/menu/categories",
	STAFF_MENU_CATEGORIES_PREFIX:
		"/restaurants/:restaurantId/staff/menu/categories",
	MENU_ITEM_STATUS_UPDATE: "/:restaurantId/menu/items/:menuItemId/status",
	CUSTOMER_MENU_ITEM_DETAIL: "/customer/:restaurantId/menu/items/:menuItemId",
	MENU_ITEM_DELETE: "/:restaurantId/menu/items/:menuItemId",
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
	RESTAURANT_MENU_CATEGORIES: "/restaurants/:restaurantId/menu/categories",
} as const;

export const JWKS_ROUTES = {
	BASE: "/.well-known",
	JWKS: "/jwks.json",
} as const;

export type RestaurantRoute =
	(typeof RESTAURANT_ROUTES)[keyof typeof RESTAURANT_ROUTES];

export type SystemRoute = (typeof SYSTEM_ROUTES)[keyof typeof SYSTEM_ROUTES];

export type StaffRoute = (typeof STAFF_ROUTES)[keyof typeof STAFF_ROUTES];

export type StorageRoute = (typeof STORAGE_ROUTES)[keyof typeof STORAGE_ROUTES];
export type AdminRoute = (typeof ADMIN_ROUTES)[keyof typeof ADMIN_ROUTES];
export type JwksRoute = (typeof JWKS_ROUTES)[keyof typeof JWKS_ROUTES];
