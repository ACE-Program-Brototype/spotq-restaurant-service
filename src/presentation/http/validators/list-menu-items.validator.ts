import { z } from "zod";
import { messages } from "@/shared/constants/message.constants.ts";

export const MENU_ITEM_STATUSES = [
	"ALL",
	"AVAILABLE",
	"OUT_OF_STOCK",
	"all",
	"available",
	"out_of_stock",
] as const;

export const MENU_ITEM_SORT_FIELDS = [
	"name",
	"price",
	"preparationTime",
	"preparation_time",
	"calories",
	"isAvailable",
	"is_available",
	"createdAt",
	"created_at",
	"updatedAt",
	"updated_at",
] as const;

export const PRISMA_MENU_ITEM_SORT_MAP: Record<
	(typeof MENU_ITEM_SORT_FIELDS)[number],
	| "name"
	| "price"
	| "preparationTime"
	| "calories"
	| "isAvailable"
	| "createdAt"
	| "updatedAt"
> = {
	name: "name",
	price: "price",
	preparationTime: "preparationTime",
	preparation_time: "preparationTime",
	calories: "calories",
	isAvailable: "isAvailable",
	is_available: "isAvailable",
	createdAt: "createdAt",
	created_at: "createdAt",
	updatedAt: "updatedAt",
	updated_at: "updatedAt",
};

export const listMenuItemsParamsSchema = z
	.object({
		restaurantId: z.uuid({ message: messages.INVALID_RESTAURANT_ID }),
	})
	.strict();

function parseBooleanFilter(val: unknown): boolean | undefined {
	if (val === undefined || val === null || val === "") return undefined;
	if (typeof val === "string") {
		const lower = val.trim().toLowerCase();
		if (lower === "true" || lower === "1") return true;
		if (lower === "false" || lower === "0") return false;
	}
	if (typeof val === "boolean") return val;
	return undefined;
}

export const listMenuItemsQuerySchema = z
	.object({
		page: z.coerce.number().int().min(1).default(1),
		limit: z.coerce.number().int().min(1).max(100).default(10),
		search: z
			.string()
			.trim()
			.transform((val) => (val === "" ? undefined : val))
			.optional(),
		categoryId: z.string().uuid().optional(),
		category_id: z.string().uuid().optional(),
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
		minPrice: z.coerce.number().min(0).optional(),
		min_price: z.coerce.number().min(0).optional(),
		maxPrice: z.coerce.number().min(0).optional(),
		max_price: z.coerce.number().min(0).optional(),
		isVegetarian: z.preprocess(parseBooleanFilter, z.boolean().optional()),
		is_vegetarian: z.preprocess(parseBooleanFilter, z.boolean().optional()),
		isFeatured: z.preprocess(parseBooleanFilter, z.boolean().optional()),
		is_featured: z.preprocess(parseBooleanFilter, z.boolean().optional()),
		sortBy: z.enum(MENU_ITEM_SORT_FIELDS).optional(),
		sort_by: z.enum(MENU_ITEM_SORT_FIELDS).optional(),
		sortOrder: z
			.preprocess((val) => {
				if (typeof val === "string") return val.trim().toLowerCase();
				return val;
			}, z.enum(["asc", "desc"]).optional())
			.optional(),
		sort_order: z
			.preprocess((val) => {
				if (typeof val === "string") return val.trim().toLowerCase();
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
			message: "minPrice cannot be greater than maxPrice",
			path: ["minPrice"],
		},
	)
	.transform((data) => {
		const rawSortBy = data.sortBy ?? data.sort_by;
		const mappedSortBy = rawSortBy
			? PRISMA_MENU_ITEM_SORT_MAP[rawSortBy]
			: "createdAt";

		const rawSortOrder = data.sortOrder ?? data.sort_order ?? "desc";

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
