import { z } from "zod";
import {
	ALLOWED_MENU_ITEM_SORT_FIELDS,
	DEFAULT_SORT_BY,
	DEFAULT_SORT_ORDER,
	MENU_ITEM_QUERY_SORT_FIELDS,
	MENU_ITEM_SORT_ALIASES,
	type MenuItemQuerySortField,
	type MenuItemSortField,
} from "@/domain/constants/menu-item.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";

export const MENU_ITEM_STATUSES = [
	"ALL",
	"AVAILABLE",
	"OUT_OF_STOCK",
	"all",
	"available",
	"out_of_stock",
] as const;

export const MENU_ITEM_SORT_FIELDS = MENU_ITEM_QUERY_SORT_FIELDS;

export const PRISMA_MENU_ITEM_SORT_MAP: Record<
	MenuItemQuerySortField,
	MenuItemSortField
> = {
	...ALLOWED_MENU_ITEM_SORT_FIELDS.reduce(
		(acc, field) => {
			acc[field] = field;
			return acc;
		},
		{} as Record<MenuItemSortField, MenuItemSortField>,
	),
	...MENU_ITEM_SORT_ALIASES,
};

export const listMenuItemsParamsSchema = z
	.object({
		restaurantId: z.uuid({ message: messages.INVALID_RESTAURANT_ID }),
	})
	.strict();

import {
	parseBooleanFilter,
	parseOptionalString,
} from "./utils/query-parser.util.ts";

export const listMenuItemsQuerySchema = z
	.object({
		page: z.preprocess(
			parseOptionalString,
			z.coerce.number().int().min(1).default(1),
		),
		limit: z.preprocess(
			parseOptionalString,
			z.coerce.number().int().min(1).max(100).default(10),
		),
		search: z
			.string()
			.trim()
			.transform((val) => (val === "" ? undefined : val))
			.optional(),
		categoryId: z.preprocess(
			parseOptionalString,
			z.string().uuid({ message: messages.INVALID_CATEGORY_ID }).optional(),
		),
		category_id: z.preprocess(
			parseOptionalString,
			z.string().uuid({ message: messages.INVALID_CATEGORY_ID }).optional(),
		),
		status: z
			.preprocess((val) => {
				if (val === undefined || val === null || val === "") return undefined;
				if (typeof val === "string") {
					const trimmed = val.trim();
					return trimmed === "" ? undefined : trimmed.toUpperCase();
				}
				return val;
			}, z.enum(["ALL", "AVAILABLE", "OUT_OF_STOCK"]).optional())
			.optional(),
		minPrice: z.preprocess(
			parseOptionalString,
			z.coerce.number().min(0).optional(),
		),
		min_price: z.preprocess(
			parseOptionalString,
			z.coerce.number().min(0).optional(),
		),
		maxPrice: z.preprocess(
			parseOptionalString,
			z.coerce.number().min(0).optional(),
		),
		max_price: z.preprocess(
			parseOptionalString,
			z.coerce.number().min(0).optional(),
		),
		isVegetarian: z.preprocess(parseBooleanFilter, z.boolean().optional()),
		is_vegetarian: z.preprocess(parseBooleanFilter, z.boolean().optional()),
		isFeatured: z.preprocess(parseBooleanFilter, z.boolean().optional()),
		is_featured: z.preprocess(parseBooleanFilter, z.boolean().optional()),
		sortBy: z.preprocess(
			parseOptionalString,
			z.enum(MENU_ITEM_SORT_FIELDS).optional(),
		),
		sort_by: z.preprocess(
			parseOptionalString,
			z.enum(MENU_ITEM_SORT_FIELDS).optional(),
		),
		sortOrder: z
			.preprocess((val) => {
				if (typeof val === "string") {
					const trimmed = val.trim().toLowerCase();
					return trimmed === "" ? undefined : trimmed;
				}
				return val;
			}, z.enum(["asc", "desc"]).optional())
			.optional(),
		sort_order: z
			.preprocess((val) => {
				if (typeof val === "string") {
					const trimmed = val.trim().toLowerCase();
					return trimmed === "" ? undefined : trimmed;
				}
				return val;
			}, z.enum(["asc", "desc"]).optional())
			.optional(),
	})
	.refine(
		(data) => {
			const min = data.minPrice ?? data.min_price;
			const max = data.maxPrice ?? data.max_price;
			if (min !== undefined && max !== undefined) {
				return min <= max;
			}
			return true;
		},
		{
			message: messages.MIN_PRICE_CANNOT_BE_GREATER_THAN_MAX_PRICE,
			path: ["minPrice"],
		},
	)
	.transform((data) => {
		const rawSortBy = data.sortBy ?? data.sort_by;
		const mappedSortBy = rawSortBy
			? PRISMA_MENU_ITEM_SORT_MAP[rawSortBy]
			: DEFAULT_SORT_BY;

		const rawSortOrder =
			data.sortOrder ?? data.sort_order ?? DEFAULT_SORT_ORDER;

		return {
			page: data.page,
			limit: data.limit,
			search: data.search,
			categoryId: data.categoryId ?? data.category_id,
			status: data.status,
			minPrice: data.minPrice ?? data.min_price,
			maxPrice: data.maxPrice ?? data.max_price,
			isVegetarian: data.isVegetarian ?? data.is_vegetarian,
			isFeatured: data.isFeatured ?? data.is_featured,
			sortBy: mappedSortBy,
			sortOrder: rawSortOrder as "asc" | "desc",
		};
	});

export type ListMenuItemsParams = z.infer<typeof listMenuItemsParamsSchema>;
export type ListMenuItemsQuery = z.infer<typeof listMenuItemsQuerySchema>;
