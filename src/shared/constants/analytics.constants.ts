export const REPORTING_TIMEZONE = "Asia/Kolkata";

export const ANALYTICS_PERIODS = {
	DAY: "DAY",
	WEEK: "WEEK",
	MONTH: "MONTH",
	YEAR: "YEAR",
} as const;

export type AnalyticsPeriod =
	(typeof ANALYTICS_PERIODS)[keyof typeof ANALYTICS_PERIODS];

export const BILLING_CYCLES = {
	ALL: "ALL",
	MONTHLY: "MONTHLY",
	YEARLY: "YEARLY",
} as const;

export type BillingCycle = (typeof BILLING_CYCLES)[keyof typeof BILLING_CYCLES];

export const ORDER_STATUS_FILTERS = {
	COMPLETED: "COMPLETED",
	ALL: "ALL",
} as const;

export type OrderStatusFilter =
	(typeof ORDER_STATUS_FILTERS)[keyof typeof ORDER_STATUS_FILTERS];

export const ANALYTICS_ERROR_CODES = {
	PAYMENT_SERVICE_UNAVAILABLE: "PAYMENT_SERVICE_UNAVAILABLE",
	USER_SERVICE_UNAVAILABLE: "USER_SERVICE_UNAVAILABLE",
	ORDER_SERVICE_UNAVAILABLE: "ORDER_SERVICE_UNAVAILABLE",
} as const;

export type AnalyticsErrorCode =
	(typeof ANALYTICS_ERROR_CODES)[keyof typeof ANALYTICS_ERROR_CODES];

export const ANALYTICS_FALLBACKS = {
	UNKNOWN_MENU_ITEM: "Unknown Item",
	DEFAULT_LEAP_YEAR: 2024,
	SYSTEM_ADMIN_CALLER: "system-admin",
	ADMIN_ROLE: "admin",
} as const;
