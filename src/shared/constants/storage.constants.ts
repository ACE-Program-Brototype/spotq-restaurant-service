const MB_IN_BYTES = 1024 * 1024;

export const MAX_FILE_SIZE_BYTES = {
	DOCUMENTS: 5 * MB_IN_BYTES,
	IMAGES: 5 * MB_IN_BYTES,
	PROFILE: 2 * MB_IN_BYTES,
	RECEIPTS: 5 * MB_IN_BYTES,
	MENUS: 10 * MB_IN_BYTES,
} as const;

export const STORAGE_ENTITY_TYPES = {
	RESTAURANTS: "restaurants",
	RESTAURANT: "restaurant",
	USERS: "users",
	USER: "user",
	STAFF: "staff",
} as const;

export const RESTAURANT_STORAGE_ENTITY_TYPES: ReadonlySet<string> = new Set([
	STORAGE_ENTITY_TYPES.RESTAURANTS,
	STORAGE_ENTITY_TYPES.RESTAURANT,
]);

export const USER_STAFF_STORAGE_ENTITY_TYPES: ReadonlySet<string> = new Set([
	STORAGE_ENTITY_TYPES.USERS,
	STORAGE_ENTITY_TYPES.USER,
	STORAGE_ENTITY_TYPES.STAFF,
]);

export const STAFF_AVATAR_KEY_REGEX = /^restaurants\/[^/]+\/staff\/([^/]+)\//;

export const S3_ERROR_CODES = {
	NO_SUCH_KEY: "NoSuchKey",
} as const;
