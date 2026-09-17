export const AUTH_ROLES = {
	RESTAURANT_OWNER: "restaurant_owner",
	RESTAURANT_ADMIN: "restaurant_admin",
	RESTAURANT: "restaurant",
	OWNER: "owner",
	ADMIN: "admin",
	STAFF: "staff",
} as const;

export type AuthRole = (typeof AUTH_ROLES)[keyof typeof AUTH_ROLES];

export const ALLOWED_OWNER_ROLES: ReadonlySet<string> = new Set([
	AUTH_ROLES.RESTAURANT_OWNER,
	AUTH_ROLES.RESTAURANT_ADMIN,
	AUTH_ROLES.RESTAURANT,
	AUTH_ROLES.OWNER,
	AUTH_ROLES.ADMIN,
]);

export const TOKEN_TYPES = {
	ACCESS: "access",
	REFRESH: "refresh",
} as const;

export type TokenType = (typeof TOKEN_TYPES)[keyof typeof TOKEN_TYPES];
