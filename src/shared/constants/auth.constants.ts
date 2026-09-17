export const AUTH_ROLES = {
	RESTAURANT_OWNER: "restaurant_owner",
	STAFF: "staff",
} as const;

export type AuthRole = (typeof AUTH_ROLES)[keyof typeof AUTH_ROLES];

export const TOKEN_TYPES = {
	ACCESS: "access",
	REFRESH: "refresh",
} as const;

export type TokenType = (typeof TOKEN_TYPES)[keyof typeof TOKEN_TYPES];
