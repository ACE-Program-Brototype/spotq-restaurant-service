export const MENU_ITEM_NAME_MAX_LENGTH = 255;
export const MENU_ITEM_DESCRIPTION_MAX_LENGTH = 1000;
export const MENU_ITEM_PRICE_MAX = 99999999.99;
export const MENU_ITEM_PREPARATION_TIME_MAX = 1440;
export const MENU_ITEM_CALORIES_MAX = 50000;

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;
export const DEFAULT_SORT_BY = "createdAt";
export const DEFAULT_SORT_ORDER = "desc";

export const ALLOWED_MENU_ITEM_SORT_FIELDS = [
	"name",
	"price",
	"preparationTime",
	"calories",
	"isAvailable",
	"createdAt",
	"updatedAt",
] as const;

export type MenuItemSortField = (typeof ALLOWED_MENU_ITEM_SORT_FIELDS)[number];

export const MENU_ITEM_SORT_ALIASES = {
	preparation_time: "preparationTime",
	is_available: "isAvailable",
	created_at: "createdAt",
	updated_at: "updatedAt",
} as const;

export type MenuItemSortAlias = keyof typeof MENU_ITEM_SORT_ALIASES;

export const MENU_ITEM_QUERY_SORT_FIELDS = [
	...ALLOWED_MENU_ITEM_SORT_FIELDS,
	"preparation_time",
	"is_available",
	"created_at",
	"updated_at",
] as const;

export type MenuItemQuerySortField =
	(typeof MENU_ITEM_QUERY_SORT_FIELDS)[number];

